/**
 * Cloudflare Worker for chat.kimtoma.com with D1 logging
 * Free tier limits enforced: 100K writes/day, 5M reads/day
 */

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  ADMIN_TOKEN: string;
}

// Free tier limits
const LIMITS = {
  DAILY_WRITES: 100000,
  DAILY_READS: 5000000,
  MAX_MESSAGES: 100000, // Total messages to keep
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
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

  if (sessionId) {
    query += ` WHERE m.session_id = ?`;
    params.push(sessionId);
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
 * Increment daily write count
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
