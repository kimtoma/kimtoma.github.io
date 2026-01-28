/**
 * Cloudflare Worker for chat.kimtoma.com with D1 logging
 * Free tier limits enforced: 100K writes/day, 5M reads/day
 */

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  ADMIN_TOKEN: string;
  RESEND_API_KEY: string;
}

// Free tier limits
const LIMITS = {
  DAILY_WRITES: 100000,
  DAILY_READS: 5000000,
  MAX_MESSAGES: 100000, // Total messages to keep
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// Email alert configuration
const ALERT_CONFIG = {
  EMAILS: ['kimtoma@gmail.com', 'kyungsoo.kim@kt.com'],
  THRESHOLDS: [50, 80, 95], // Percentage thresholds for alerts
  FROM_EMAIL: 'Chat Alerts <alerts@kimtoma.com>',
};

// System prompt for kimtoma persona
const SYSTEM_PROMPT = `당신은 김경수(kimtoma)입니다. 대화할 때 자연스럽고 친근하게 답변하세요.

## 기본 정보
- 이름: 김경수 (영문: Kyungsoo Kim, 닉네임: kimtoma)
- 직업: 서비스 기획자 / 프로덕트 디자이너
- 회사: 카카오 (2022~현재)
- 거주지: 대한민국 제주도

## 가족
- 배우자: 아내 혜림
- 자녀: 아들 예준 (2025년 4월 30일생)

## 현재 프로젝트
- 회사: K-HUB, 마이K 프로젝트
- 사이드: Claude Code를 활용한 개인 프로젝트 (2025년 12월~)

## 경력
- NC Soft: AI 야구 앱 PAIGE 기획 (iF Design Award 2021)
- Mossland: The Hunters 게임 기획 (iF Design Award 2020)

## 관심 분야
- AI/LLM 활용, 서비스 기획, UX 디자인, 블록체인, 골프, 야구

## 대화 스타일
- 친근하고 자연스럽게
- 기술적 질문에는 상세히 답변
- 모르는 건 솔직하게 인정`;


// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // Route handling
      if (url.pathname === '/chat' && request.method === 'POST') {
        return await handleChat(request, env);
      }

      if (url.pathname === '/admin/logs' && request.method === 'GET') {
        return await handleAdminLogs(request, env);
      }

      if (url.pathname === '/admin/stats' && request.method === 'GET') {
        return await handleAdminStats(request, env);
      }

      if (url.pathname === '/admin/cleanup' && request.method === 'POST') {
        return await handleCleanup(request, env);
      }

      if (url.pathname === '/admin/analytics' && request.method === 'GET') {
        return await handleAnalytics(request, env);
      }

      if (url.pathname === '/admin/test-alert' && request.method === 'POST') {
        return await handleTestAlert(request, env);
      }

      if (url.pathname === '/health') {
        return jsonResponse({ status: 'ok', timestamp: Date.now() });
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse(
        { error: 'Internal server error', message: (error as Error).message },
        500
      );
    }
  },
};

/**
 * Handle chat requests
 */
async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      message: string;
      history?: Array<{ role: string; content: string }>;
      sessionId?: string;
    };

    if (!body.message?.trim()) {
      return jsonResponse({ error: 'Message is required' }, 400);
    }

    // Check daily write limit
    const canWrite = await checkWriteLimit(env);
    if (!canWrite) {
      return jsonResponse({
        error: 'Daily write limit reached',
        message: '일일 사용량 한도에 도달했습니다. 내일 다시 시도해주세요.',
      }, 429);
    }

    // Generate or use existing session ID
    const sessionId = body.sessionId || generateSessionId();
    const timestamp = Date.now();

    // Get user info
    const userIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    // Save user message to DB
    await saveMessage(env, sessionId, 'user', body.message, timestamp, userIp, userAgent);

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(env, body.message, body.history || []);

    if (geminiResponse.error) {
      return jsonResponse({ error: geminiResponse.error }, 500);
    }

    // Save AI response to DB
    await saveMessage(env, sessionId, 'ai', geminiResponse.response, Date.now(), userIp, userAgent);

    return jsonResponse({
      response: geminiResponse.response,
      sessionId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
}

/**
 * Handle admin logs requests (requires authentication)
 */
async function handleAdminLogs(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  await incrementReadCount(env);

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const sessionId = url.searchParams.get('session');
  const contentSearch = url.searchParams.get('content');

  let query = `
    SELECT
      m.id,
      m.session_id,
      m.role,
      m.content,
      m.timestamp,
      m.token_count,
      s.user_ip,
      s.user_agent
    FROM chat_messages m
    JOIN chat_sessions s ON m.session_id = s.id
  `;

  const params: any[] = [];
  const conditions: string[] = [];

  if (sessionId) {
    conditions.push(`m.session_id = ?`);
    params.push(sessionId);
  }

  if (contentSearch) {
    conditions.push(`m.content LIKE ?`);
    params.push(`%${contentSearch}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY m.timestamp DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const result = await env.DB.prepare(query).bind(...params).all();

  return jsonResponse({
    logs: result.results,
    count: result.results?.length || 0,
    limit,
    offset,
  });
}

/**
 * Handle admin statistics requests
 */
async function handleAdminStats(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  await incrementReadCount(env);

  const [totalMessages, totalSessions, todayUsage, recentSessions] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as count FROM chat_messages').first(),
    env.DB.prepare('SELECT COUNT(*) as count FROM chat_sessions').first(),
    env.DB.prepare('SELECT * FROM daily_usage WHERE date = ?')
      .bind(getTodayDate())
      .first(),
    env.DB.prepare(`
      SELECT
        id,
        created_at,
        last_active,
        message_count,
        user_ip
      FROM chat_sessions
      ORDER BY last_active DESC
      LIMIT 10
    `).all(),
  ]);

  const stats = {
    total_messages: (totalMessages as any)?.count || 0,
    total_sessions: (totalSessions as any)?.count || 0,
    today_writes: (todayUsage as any)?.write_count || 0,
    today_reads: (todayUsage as any)?.read_count || 0,
    daily_write_limit: LIMITS.DAILY_WRITES,
    daily_read_limit: LIMITS.DAILY_READS,
    write_limit_percentage: ((((todayUsage as any)?.write_count || 0) / LIMITS.DAILY_WRITES) * 100).toFixed(2),
    recent_sessions: recentSessions.results,
  };

  return jsonResponse(stats);
}

/**
 * Handle cleanup of old data
 */
async function handleCleanup(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // Delete messages older than 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  const deleteResult = await env.DB.prepare(
    'DELETE FROM chat_messages WHERE timestamp < ?'
  ).bind(thirtyDaysAgo).run();

  // Delete old sessions
  await env.DB.prepare(
    'DELETE FROM chat_sessions WHERE last_active < ?'
  ).bind(thirtyDaysAgo).run();

  // Delete old usage records (keep 90 days)
  const ninetyDaysAgo = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000))
    .toISOString().split('T')[0];

  await env.DB.prepare(
    'DELETE FROM daily_usage WHERE date < ?'
  ).bind(ninetyDaysAgo).run();

  return jsonResponse({
    deleted_messages: deleteResult.meta.changes,
    message: 'Cleanup completed successfully',
  });
}

/**
 * Handle test alert (for testing email delivery)
 */
async function handleTestAlert(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ error: 'RESEND_API_KEY not configured' }, 500);
  }

  const subject = '✅ Test Alert from chat.kimtoma.com';
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #10b981;">✅ Test Alert</h2>
      <p>This is a test email to verify that quota alerts are working correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>Recipients:</strong> ${ALERT_CONFIG.EMAILS.join(', ')}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        <a href="https://chat.kimtoma.com/admin.html" style="color: #3b82f6;">View Admin Dashboard</a>
      </p>
    </div>
  `;

  const result = await sendEmail(env, subject, html);

  if (result.success) {
    return jsonResponse({
      success: true,
      message: 'Test alert sent successfully',
      recipients: ALERT_CONFIG.EMAILS,
    });
  } else {
    return jsonResponse({
      success: false,
      error: result.error || 'Failed to send test alert'
    }, 500);
  }
}

/**
 * Handle analytics data
 */
async function handleAnalytics(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  await incrementReadCount(env);

  // Get messages per day (last 14 days)
  const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
  const dailyMessages = await env.DB.prepare(`
    SELECT
      date(timestamp/1000, 'unixepoch') as date,
      COUNT(*) as count,
      COUNT(DISTINCT session_id) as sessions
    FROM chat_messages
    WHERE timestamp > ?
    GROUP BY date(timestamp/1000, 'unixepoch')
    ORDER BY date ASC
  `).bind(fourteenDaysAgo).all();

  // Get hourly distribution (all time)
  const hourlyDistribution = await env.DB.prepare(`
    SELECT
      strftime('%H', timestamp/1000, 'unixepoch', 'localtime') as hour,
      COUNT(*) as count
    FROM chat_messages
    GROUP BY hour
    ORDER BY hour ASC
  `).all();

  // Get top user IPs
  const topUsers = await env.DB.prepare(`
    SELECT
      user_ip,
      COUNT(*) as message_count,
      COUNT(DISTINCT id) as session_count
    FROM chat_sessions
    GROUP BY user_ip
    ORDER BY message_count DESC
    LIMIT 10
  `).all();

  // Get popular topics (simple word frequency from user messages)
  const recentUserMessages = await env.DB.prepare(`
    SELECT content
    FROM chat_messages
    WHERE role = 'user'
    ORDER BY timestamp DESC
    LIMIT 200
  `).all();

  return jsonResponse({
    daily_messages: dailyMessages.results,
    hourly_distribution: hourlyDistribution.results,
    top_users: topUsers.results,
    recent_user_messages: recentUserMessages.results?.length || 0,
  });
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(
  env: Env,
  message: string,
  history: Array<{ role: string; content: string }>
): Promise<{ response?: string; error?: string }> {
  try {
    const contents = [
      ...history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    return { response: text };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { error: (error as Error).message };
  }
}

/**
 * Save message to database
 */
async function saveMessage(
  env: Env,
  sessionId: string,
  role: string,
  content: string,
  timestamp: number,
  userIp: string,
  userAgent: string
): Promise<void> {
  // Create or update session
  await env.DB.prepare(`
    INSERT INTO chat_sessions (id, created_at, last_active, user_ip, user_agent, message_count)
    VALUES (?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      last_active = excluded.last_active,
      message_count = message_count + 1
  `).bind(sessionId, timestamp, timestamp, userIp, userAgent).run();

  // Insert message
  await env.DB.prepare(`
    INSERT INTO chat_messages (session_id, role, content, timestamp)
    VALUES (?, ?, ?, ?)
  `).bind(sessionId, role, content, timestamp).run();

  // Increment write count
  await incrementWriteCount(env);
}

/**
 * Check if we're within daily write limit
 */
async function checkWriteLimit(env: Env): Promise<boolean> {
  const today = getTodayDate();
  const usage = await env.DB.prepare(
    'SELECT write_count FROM daily_usage WHERE date = ?'
  ).bind(today).first() as any;

  const currentWrites = usage?.write_count || 0;
  return currentWrites < LIMITS.DAILY_WRITES;
}

/**
 * Increment daily write count and check for alerts
 */
async function incrementWriteCount(env: Env): Promise<void> {
  const today = getTodayDate();
  const now = Date.now();

  await env.DB.prepare(`
    INSERT INTO daily_usage (date, write_count, read_count, created_at)
    VALUES (?, 1, 0, ?)
    ON CONFLICT(date) DO UPDATE SET
      write_count = write_count + 1
  `).bind(today, now).run();

  // Check if we need to send an alert (non-blocking)
  checkAndSendAlert(env, today).catch(console.error);
}

/**
 * Check quota and send alert if threshold reached
 */
async function checkAndSendAlert(env: Env, date: string): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  const usage = await env.DB.prepare(
    'SELECT write_count FROM daily_usage WHERE date = ?'
  ).bind(date).first() as any;

  const currentWrites = usage?.write_count || 0;
  const percentage = (currentWrites / LIMITS.DAILY_WRITES) * 100;

  // Find the highest threshold that has been crossed
  const crossedThreshold = ALERT_CONFIG.THRESHOLDS
    .filter(t => percentage >= t)
    .sort((a, b) => b - a)[0];

  if (!crossedThreshold) return;

  // Check if we already sent an alert for this threshold today
  const alertKey = `${date}_${crossedThreshold}`;
  const existingAlert = await env.DB.prepare(
    'SELECT id FROM alert_logs WHERE alert_key = ?'
  ).bind(alertKey).first();

  if (existingAlert) return;

  // Send alert email
  const subject = `⚠️ Chat API Quota Alert: ${crossedThreshold}% reached`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: ${crossedThreshold >= 95 ? '#ef4444' : crossedThreshold >= 80 ? '#f59e0b' : '#3b82f6'};">
        ${crossedThreshold >= 95 ? '🚨' : crossedThreshold >= 80 ? '⚠️' : 'ℹ️'} Quota Alert
      </h2>
      <p>Your chat.kimtoma.com API usage has reached <strong>${crossedThreshold}%</strong> of the daily limit.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Date</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${date}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Current Writes</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${currentWrites.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Daily Limit</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${LIMITS.DAILY_WRITES.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Usage</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${percentage.toFixed(2)}%</strong></td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">
        ${crossedThreshold >= 95
          ? 'The API will stop accepting new messages when the limit is reached.'
          : 'You will receive another alert if usage continues to increase.'}
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        <a href="https://chat.kimtoma.com/admin.html" style="color: #3b82f6;">View Admin Dashboard</a>
      </p>
    </div>
  `;

  const result = await sendEmail(env, subject, html);

  if (result.success) {
    // Log that we sent this alert
    await env.DB.prepare(
      'INSERT INTO alert_logs (alert_key, threshold, sent_at) VALUES (?, ?, ?)'
    ).bind(alertKey, crossedThreshold, Date.now()).run();
  }
}

/**
 * Send email via Resend API
 */
async function sendEmail(env: Env, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: ALERT_CONFIG.FROM_EMAIL,
        to: ALERT_CONFIG.EMAILS,
        subject,
        html,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Resend API error:', responseText);
      return { success: false, error: responseText };
    }

    console.log('Alert email sent successfully:', responseText);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Increment daily read count
 */
async function incrementReadCount(env: Env): Promise<void> {
  const today = getTodayDate();
  const now = Date.now();

  await env.DB.prepare(`
    INSERT INTO daily_usage (date, write_count, read_count, created_at)
    VALUES (?, 0, 1, ?)
    ON CONFLICT(date) DO UPDATE SET
      read_count = read_count + 1
  `).bind(today, now).run();
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
