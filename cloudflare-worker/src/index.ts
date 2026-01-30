/**
 * Cloudflare Worker for chat.kimtoma.com with D1 logging
 * Free tier limits enforced: 100K writes/day, 5M reads/day
 */

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  ADMIN_TOKEN: string;
  RESEND_API_KEY: string;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  STRAVA_CLIENT_ID: string;
  STRAVA_CLIENT_SECRET: string;
  GITHUB_TOKEN: string;
  YOUTUBE_API_KEY: string;
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

// Default system prompt (used as fallback if not set in DB)
const DEFAULT_SYSTEM_PROMPT = `당신은 kimtoma의 AI 어시스턴트입니다. 친근하고 자연스럽게 대화하세요.

## 대화 스타일
- 친근하고 자연스럽게 답변
- 기술적 질문에는 상세히 답변
- 모르는 건 솔직하게 인정
- 한국어로 대화`;


// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

      // System prompt management
      if (url.pathname === '/admin/system-prompt' && request.method === 'GET') {
        return await handleGetSystemPrompt(request, env);
      }

      if (url.pathname === '/admin/system-prompt' && request.method === 'PUT') {
        return await handleUpdateSystemPrompt(request, env);
      }

      // Memory management
      if (url.pathname === '/admin/memory' && request.method === 'GET') {
        return await handleGetMemory(request, env);
      }

      if (url.pathname === '/admin/memory' && request.method === 'DELETE') {
        return await handleClearMemory(request, env);
      }

      // Sentiment analysis
      if (url.pathname === '/admin/sentiment' && request.method === 'GET') {
        return await handleGetSentiment(request, env);
      }

      if (url.pathname === '/admin/sentiment/analyze' && request.method === 'POST') {
        return await handleAnalyzeSentiment(request, env);
      }

      // Feedback
      if (url.pathname === '/feedback' && request.method === 'POST') {
        return await handleSubmitFeedback(request, env);
      }

      if (url.pathname === '/admin/feedback' && request.method === 'GET') {
        return await handleGetFeedback(request, env);
      }

      // RAG - Blog indexing
      if (url.pathname === '/admin/index-blog' && request.method === 'POST') {
        return await handleIndexBlog(request, env);
      }

      if (url.pathname === '/admin/rag-stats' && request.method === 'GET') {
        return await handleRagStats(request, env);
      }

      // Strava OAuth
      if (url.pathname === '/strava/auth' && request.method === 'GET') {
        return handleStravaAuth(request, env);
      }

      if (url.pathname === '/strava/callback' && request.method === 'GET') {
        return await handleStravaCallback(request, env);
      }

      if (url.pathname === '/health') {
        return jsonResponse({ status: 'ok', timestamp: Date.now() });
      }

      // Debug endpoint for GitHub
      if (url.pathname === '/debug/github' && request.method === 'GET') {
        try {
          const activity = await getGitHubActivity(env);
          return jsonResponse({
            success: true,
            activity_length: activity.length,
            activity_preview: activity.substring(0, 500)
          });
        } catch (e) {
          return jsonResponse({ success: false, error: (e as Error).message });
        }
      }

      // Debug endpoint for YouTube
      if (url.pathname === '/debug/youtube' && request.method === 'GET') {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${env.YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=3&type=video`
          );
          const data = await response.json();
          const activity = await getYouTubeActivity(env);
          return jsonResponse({
            success: true,
            api_status: response.status,
            api_response: data,
            activity_length: activity.length,
            activity_preview: activity.substring(0, 500)
          });
        } catch (e) {
          return jsonResponse({ success: false, error: (e as Error).message });
        }
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

    // Get system prompt
    const systemPrompt = await getSystemPrompt(env);

    // RAG: Search for relevant blog context
    let ragContext = '';
    try {
      if (env.VECTORIZE && env.AI) {
        ragContext = await searchBlogContext(env, body.message);
        console.log('RAG context length:', ragContext.length);
      }
    } catch (e) {
      console.error('RAG search error:', e);
      // Continue without RAG on error
    }

    // Get social media activity
    let githubActivity = '';
    let stravaActivity = '';
    let youtubeActivity = '';

    try {
      [githubActivity, stravaActivity, youtubeActivity] = await Promise.all([
        getGitHubActivity(env),
        getStravaActivity(env),
        getYouTubeActivity(env),
      ]);
    } catch (e) {
      console.error('Social activity error:', e);
    }

    // Combine system prompt with RAG context and social activity
    let enhancedPrompt = systemPrompt;

    if (githubActivity) {
      enhancedPrompt += `\n\n${githubActivity}`;
    }

    if (stravaActivity) {
      enhancedPrompt += `\n\n${stravaActivity}`;
    }

    if (youtubeActivity) {
      enhancedPrompt += `\n\n${youtubeActivity}`;
    }

    if (ragContext) {
      enhancedPrompt += `\n\n## 참고할 수 있는 블로그 정보:\n${ragContext}\n\n위 정보가 질문과 관련있다면 참고해서 답변하고, 📎로 표시된 관련 글이 있으면 답변 마지막에 빈 줄을 넣고 별도 문단으로 포함해주세요.\n예시:\n답변 내용...\n\n📎 [글 제목](URL) ↗`;
    }

    // Call Groq API with enhanced prompt
    const groqResponse = await callGeminiAPI(env, body.message, body.history || [], enhancedPrompt);

    if (groqResponse.error) {
      return jsonResponse({ error: groqResponse.error }, 500);
    }

    // Save AI response to DB
    await saveMessage(env, sessionId, 'ai', groqResponse.response, Date.now(), userIp, userAgent);

    return jsonResponse({
      response: groqResponse.response,
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
 * Get system prompt from DB or return default
 */
async function getSystemPrompt(env: Env): Promise<string> {
  const result = await env.DB.prepare(
    'SELECT value FROM settings WHERE key = ?'
  ).bind('system_prompt').first() as any;

  const basePrompt = result?.value || DEFAULT_SYSTEM_PROMPT;

  // Add current date context
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Seoul'
  });

  const dateContext = `## 현재 날짜\n- 오늘: ${dateStr}\n- 이 정보를 바탕으로 나이, 개월 수 등을 정확하게 계산해서 답변하세요.\n\n`;

  return dateContext + basePrompt;
}

/**
 * Handle get system prompt
 */
async function handleGetSystemPrompt(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const systemPrompt = await getSystemPrompt(env);
  const result = await env.DB.prepare(
    'SELECT updated_at FROM settings WHERE key = ?'
  ).bind('system_prompt').first() as any;

  return jsonResponse({
    system_prompt: systemPrompt,
    is_default: !result,
    updated_at: result?.updated_at || null,
  });
}

/**
 * Handle update system prompt
 */
async function handleUpdateSystemPrompt(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const body = await request.json() as { system_prompt: string };

  if (!body.system_prompt?.trim()) {
    return jsonResponse({ error: 'system_prompt is required' }, 400);
  }

  const now = Date.now();
  await env.DB.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('system_prompt', ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `).bind(body.system_prompt.trim(), now).run();

  return jsonResponse({
    success: true,
    message: 'System prompt updated',
    updated_at: now,
  });
}

/**
 * Handle get memory (conversation statistics by session)
 */
async function handleGetMemory(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session');

  if (sessionId) {
    // Get specific session's messages
    const messages = await env.DB.prepare(`
      SELECT id, role, content, timestamp
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).bind(sessionId).all();

    const session = await env.DB.prepare(`
      SELECT * FROM chat_sessions WHERE id = ?
    `).bind(sessionId).first();

    return jsonResponse({
      session,
      messages: messages.results,
      message_count: messages.results?.length || 0,
    });
  } else {
    // Get all sessions with message counts
    const sessions = await env.DB.prepare(`
      SELECT
        s.id,
        s.created_at,
        s.last_active,
        s.message_count,
        s.user_ip,
        (SELECT content FROM chat_messages WHERE session_id = s.id ORDER BY timestamp ASC LIMIT 1) as first_message
      FROM chat_sessions s
      ORDER BY s.last_active DESC
      LIMIT 50
    `).all();

    return jsonResponse({
      sessions: sessions.results,
      total: sessions.results?.length || 0,
    });
  }
}

/**
 * Handle clear memory (delete session or all sessions)
 */
async function handleClearMemory(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session');

  if (sessionId) {
    // Delete specific session
    await env.DB.prepare('DELETE FROM chat_messages WHERE session_id = ?').bind(sessionId).run();
    await env.DB.prepare('DELETE FROM chat_sessions WHERE id = ?').bind(sessionId).run();

    return jsonResponse({
      success: true,
      message: `Session ${sessionId} deleted`,
    });
  } else {
    // Delete all sessions (requires confirmation parameter)
    const confirm = url.searchParams.get('confirm');
    if (confirm !== 'true') {
      return jsonResponse({ error: 'Add ?confirm=true to delete all sessions' }, 400);
    }

    const msgResult = await env.DB.prepare('DELETE FROM chat_messages').run();
    const sessResult = await env.DB.prepare('DELETE FROM chat_sessions').run();

    return jsonResponse({
      success: true,
      message: 'All sessions deleted',
      deleted_messages: msgResult.meta.changes,
      deleted_sessions: sessResult.meta.changes,
    });
  }
}

/**
 * Handle submit feedback (like/dislike)
 */
async function handleSubmitFeedback(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      message_id: number;
      session_id: string;
      feedback: 'like' | 'dislike';
      comment?: string;
    };

    if (!body.message_id || !body.session_id || !body.feedback) {
      return jsonResponse({ error: 'message_id, session_id, and feedback are required' }, 400);
    }

    if (!['like', 'dislike'].includes(body.feedback)) {
      return jsonResponse({ error: 'feedback must be "like" or "dislike"' }, 400);
    }

    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO message_feedback (message_id, session_id, feedback, comment, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(message_id, session_id) DO UPDATE SET
        feedback = excluded.feedback,
        comment = excluded.comment,
        created_at = excluded.created_at
    `).bind(body.message_id, body.session_id, body.feedback, body.comment || null, now).run();

    await incrementWriteCount(env);

    return jsonResponse({
      success: true,
      message: 'Feedback submitted',
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
}

/**
 * Handle get feedback data (admin)
 */
async function handleGetFeedback(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  await incrementReadCount(env);

  const url = new URL(request.url);
  const filter = url.searchParams.get('filter'); // 'like', 'dislike', or null for all

  // Get feedback stats
  const stats = await env.DB.prepare(`
    SELECT
      feedback,
      COUNT(*) as count
    FROM message_feedback
    GROUP BY feedback
  `).all();

  // Get recent feedback with message content
  let feedbackQuery = `
    SELECT
      f.id,
      f.message_id,
      f.session_id,
      f.feedback,
      f.comment,
      f.created_at,
      m.content as message_content,
      m.timestamp as message_timestamp
    FROM message_feedback f
    JOIN chat_messages m ON f.message_id = m.id
  `;

  const params: any[] = [];
  if (filter && ['like', 'dislike'].includes(filter)) {
    feedbackQuery += ` WHERE f.feedback = ?`;
    params.push(filter);
  }

  feedbackQuery += ` ORDER BY f.created_at DESC LIMIT 100`;

  const feedback = await env.DB.prepare(feedbackQuery).bind(...params).all();

  const likeCount = (stats.results?.find((s: any) => s.feedback === 'like') as any)?.count || 0;
  const dislikeCount = (stats.results?.find((s: any) => s.feedback === 'dislike') as any)?.count || 0;
  const total = likeCount + dislikeCount;

  return jsonResponse({
    stats: {
      total,
      likes: likeCount,
      dislikes: dislikeCount,
      like_rate: total > 0 ? ((likeCount / total) * 100).toFixed(1) : 0,
    },
    feedback: feedback.results,
  });
}

/**
 * Handle get sentiment data
 */
async function handleGetSentiment(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  await incrementReadCount(env);

  // Get sessions with sentiment data
  const sessions = await env.DB.prepare(`
    SELECT
      s.id,
      s.created_at,
      s.last_active,
      s.message_count,
      s.user_ip,
      sa.sentiment,
      sa.sentiment_score,
      sa.summary,
      sa.analyzed_at
    FROM chat_sessions s
    LEFT JOIN session_sentiment sa ON s.id = sa.session_id
    ORDER BY s.last_active DESC
    LIMIT 50
  `).all();

  // Get sentiment distribution
  const distribution = await env.DB.prepare(`
    SELECT
      sentiment,
      COUNT(*) as count
    FROM session_sentiment
    GROUP BY sentiment
  `).all();

  // Get average sentiment score
  const avgScore = await env.DB.prepare(`
    SELECT AVG(sentiment_score) as avg_score
    FROM session_sentiment
  `).first() as any;

  return jsonResponse({
    sessions: sessions.results,
    distribution: distribution.results,
    average_score: avgScore?.avg_score || 0,
    total_analyzed: distribution.results?.reduce((sum: number, d: any) => sum + d.count, 0) || 0,
  });
}

/**
 * Handle analyze sentiment for a session
 */
async function handleAnalyzeSentiment(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const body = await request.json() as { session_id?: string; analyze_all?: boolean };

  if (body.analyze_all) {
    // Analyze all unanalyzed sessions (limit to 10 at a time to avoid timeout)
    const unanalyzed = await env.DB.prepare(`
      SELECT s.id
      FROM chat_sessions s
      LEFT JOIN session_sentiment sa ON s.id = sa.session_id
      WHERE sa.session_id IS NULL AND s.message_count >= 2
      ORDER BY s.last_active DESC
      LIMIT 10
    `).all();

    const results = [];
    for (const session of (unanalyzed.results || [])) {
      const result = await analyzeSessionSentiment(env, (session as any).id);
      results.push({ session_id: (session as any).id, ...result });
    }

    return jsonResponse({
      success: true,
      analyzed: results.length,
      results,
    });
  }

  if (!body.session_id) {
    return jsonResponse({ error: 'session_id or analyze_all required' }, 400);
  }

  const result = await analyzeSessionSentiment(env, body.session_id);

  if (result.error) {
    return jsonResponse({ error: result.error }, 500);
  }

  return jsonResponse({
    success: true,
    session_id: body.session_id,
    ...result,
  });
}

/**
 * Analyze sentiment for a specific session using Gemini
 */
async function analyzeSessionSentiment(env: Env, sessionId: string): Promise<{
  sentiment?: string;
  sentiment_score?: number;
  summary?: string;
  error?: string;
}> {
  try {
    // Get all messages for this session
    const messages = await env.DB.prepare(`
      SELECT role, content, timestamp
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).bind(sessionId).all();

    if (!messages.results || messages.results.length < 2) {
      return { error: 'Not enough messages to analyze' };
    }

    // Format conversation for analysis
    const conversation = messages.results.map((m: any) =>
      `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`
    ).join('\n\n');

    // Call Groq for sentiment analysis
    const prompt = `다음 대화를 분석해서 JSON 형식으로 응답해주세요.

대화:
${conversation}

다음 형식으로만 응답하세요 (다른 텍스트 없이 JSON만):
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "score": 0.0 ~ 1.0 (0=매우 부정, 0.5=중립, 1=매우 긍정),
  "summary": "대화 내용 한줄 요약 (20자 이내)",
  "topics": ["주요 토픽1", "토픽2"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Save to database
    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO session_sentiment (session_id, sentiment, sentiment_score, summary, topics, analyzed_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        sentiment = excluded.sentiment,
        sentiment_score = excluded.sentiment_score,
        summary = excluded.summary,
        topics = excluded.topics,
        analyzed_at = excluded.analyzed_at
    `).bind(
      sessionId,
      analysis.sentiment,
      analysis.score,
      analysis.summary,
      JSON.stringify(analysis.topics || []),
      now
    ).run();

    return {
      sentiment: analysis.sentiment,
      sentiment_score: analysis.score,
      summary: analysis.summary,
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { error: (error as Error).message };
  }
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
  history: Array<{ role: string; content: string }>,
  systemPrompt: string
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
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`);
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

// ============================================
// RAG Functions
// ============================================

/**
 * Search blog context using Vectorize
 */
async function searchBlogContext(env: Env, query: string): Promise<string> {
  try {
    // Generate embedding for the query using Workers AI
    const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: query,
    });

    if (!embedding.data?.[0]) {
      console.error('Failed to generate query embedding');
      return '';
    }

    // Search Vectorize for similar content
    const results = await env.VECTORIZE.query(embedding.data[0], {
      topK: 3,
      returnMetadata: 'all',
    });

    if (!results.matches || results.matches.length === 0) {
      return '';
    }

    // Format results as context with blog URLs
    const context = results.matches
      .filter(match => match.score > 0.5) // Only include relevant results
      .map(match => {
        const meta = match.metadata as any;
        let result = `### ${meta?.title || 'Blog Post'}\n${meta?.content || ''}`;

        // Add blog URL if it's a blog post
        if (meta?.type === 'blog' && meta?.slug && meta?.date) {
          const [year, month, day] = meta.date.split('-');
          const url = `https://kimtoma.com/${year}/${month}/${day}/${meta.slug}/`;
          result += `\n📎 관련 글: [${meta.title}](${url}) ↗`;
        }

        return result;
      })
      .join('\n\n');

    return context;
  } catch (error) {
    console.error('searchBlogContext error:', error);
    return '';
  }
}

/**
 * Handle blog indexing (batch processing to avoid subrequest limits)
 */
async function handleIndexBlog(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json() as { posts?: BlogPost[]; llms_content?: string; batch_index?: number };
    const batchIndex = body.batch_index || 0;
    const BATCH_SIZE = 5; // Process 5 items per request to stay under subrequest limit

    if (!body.posts && !body.llms_content) {
      return jsonResponse({ error: 'posts array or llms_content is required' }, 400);
    }

    // Prepare all text chunks with metadata
    const allChunks: { id: string; text: string; metadata: any }[] = [];

    // Process llms_content (for profile/about info)
    if (body.llms_content && batchIndex === 0) {
      const chunks = chunkText(body.llms_content, 500);
      chunks.forEach((chunk, i) => {
        allChunks.push({
          id: `llms_${i}`,
          text: chunk,
          metadata: {
            type: 'profile',
            title: 'About kimtoma',
            content: chunk,
            indexed_at: Date.now(),
          },
        });
      });
    }

    // Process blog posts
    if (body.posts) {
      for (const post of body.posts) {
        const chunks = chunkText(post.content, 500);
        chunks.forEach((chunk, i) => {
          allChunks.push({
            id: `${post.slug}_${i}`,
            text: `${post.title}\n\n${chunk}`,
            metadata: {
              type: 'blog',
              title: post.title,
              slug: post.slug,
              date: post.date,
              content: chunk,
              chunk_index: i,
              indexed_at: Date.now(),
            },
          });
        });
      }
    }

    // Get the batch to process
    const startIdx = batchIndex * BATCH_SIZE;
    const batchChunks = allChunks.slice(startIdx, startIdx + BATCH_SIZE);

    if (batchChunks.length === 0) {
      return jsonResponse({
        success: true,
        message: 'All batches processed',
        done: true,
        total_chunks: allChunks.length,
      });
    }

    // Generate embeddings for this batch (use batch API)
    const texts = batchChunks.map(c => c.text);
    const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: texts,
    });

    if (!embeddings.data || embeddings.data.length === 0) {
      return jsonResponse({ error: 'Failed to generate embeddings' }, 500);
    }

    // Create vectors
    const vectors: VectorizeVector[] = batchChunks.map((chunk, i) => ({
      id: chunk.id,
      values: embeddings.data[i],
      metadata: chunk.metadata,
    }));

    // Upsert to Vectorize
    await env.VECTORIZE.upsert(vectors);

    const hasMore = startIdx + BATCH_SIZE < allChunks.length;

    return jsonResponse({
      success: true,
      message: `Indexed batch ${batchIndex + 1}`,
      batch_index: batchIndex,
      indexed_count: vectors.length,
      total_chunks: allChunks.length,
      has_more: hasMore,
      next_batch: hasMore ? batchIndex + 1 : null,
    });
  } catch (error) {
    console.error('Index blog error:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
}

/**
 * Handle RAG stats
 */
async function handleRagStats(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get index info
    const described = await env.VECTORIZE.describe();

    return jsonResponse({
      index_name: 'blog-posts',
      vector_count: described.vectorCount,
      dimensions: described.dimensions,
    });
  } catch (error) {
    console.error('RAG stats error:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
}

/**
 * Split text into chunks
 */
function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';
  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

interface BlogPost {
  title: string;
  slug: string;
  date: string;
  content: string;
}

interface VectorizeVector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

// ============================================
// Social Media Integration - GitHub
// ============================================

const GITHUB_USERNAME = 'kimtoma';
const GITHUB_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// YouTube config
const YOUTUBE_CHANNEL_ID = 'UCJqcDKuaF5Swqzb3d6YnJIA';
const YOUTUBE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  repo_name?: string;
  repo_url?: string;
}

/**
 * Get GitHub activity with caching
 */
async function getGitHubActivity(env: Env): Promise<string> {
  try {
    // Check cache
    const cached = await env.DB.prepare(
      'SELECT value, updated_at FROM settings WHERE key = ?'
    ).bind('github_activity').first() as any;

    const now = Date.now();
    if (cached && (now - cached.updated_at) < GITHUB_CACHE_TTL) {
      return cached.value;
    }

    // Fetch from GitHub API with authentication
    const headers: Record<string, string> = {
      'User-Agent': 'kimtoma-chat-bot',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`;
    }

    // Get recent commits from main repos
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=3`,
      { headers }
    );

    if (!reposResponse.ok) {
      console.error('GitHub repos API error:', reposResponse.status);
      return cached?.value || '';
    }

    const repos = await reposResponse.json() as Array<{ name: string; full_name: string; html_url: string }>;

    // Get commits from each repo
    const allCommits: GitHubCommit[] = [];
    for (const repo of repos.slice(0, 2)) {
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${repo.full_name}/commits?per_page=3`,
        { headers }
      );
      if (commitsResponse.ok) {
        const commits = await commitsResponse.json() as GitHubCommit[];
        commits.forEach(c => {
          c.repo_name = repo.name;
          c.repo_url = repo.html_url;
        });
        allCommits.push(...commits);
      }
    }

    // Sort by date and take top 5
    allCommits.sort((a, b) =>
      new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
    );

    const activity = formatGitHubCommits(allCommits.slice(0, 5));

    // Save to cache
    await env.DB.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('github_activity', ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).bind(activity, now).run();

    return activity;
  } catch (error) {
    console.error('GitHub activity error:', error);
    return '';
  }
}

/**
 * Format GitHub commits into readable text with links (blog post style)
 */
function formatGitHubCommits(commits: GitHubCommit[]): string {
  if (!commits || commits.length === 0) return '';

  const formatted = commits.map(commit => {
    const date = new Date(commit.commit.author.date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    });
    const message = commit.commit.message.split('\n')[0]; // First line only
    const repoName = commit.repo_name || '';

    return `- ${date} (${repoName}): 📎 [${message}](${commit.html_url}) ↗`;
  });

  const profileUrl = `https://github.com/${GITHUB_USERNAME}`;
  return `## GitHub 최근 커밋\n프로필: [github.com/${GITHUB_USERNAME}](${profileUrl})\n\n${formatted.join('\n')}`;
}

// ============================================
// Social Media Integration - Strava
// ============================================

const STRAVA_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Handle Strava OAuth - redirect to Strava
 */
function handleStravaAuth(request: Request, env: Env): Response {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/strava/callback`;

  const stravaAuthUrl = new URL('https://www.strava.com/oauth/authorize');
  stravaAuthUrl.searchParams.set('client_id', env.STRAVA_CLIENT_ID);
  stravaAuthUrl.searchParams.set('redirect_uri', redirectUri);
  stravaAuthUrl.searchParams.set('response_type', 'code');
  stravaAuthUrl.searchParams.set('scope', 'activity:read_all');

  return Response.redirect(stravaAuthUrl.toString(), 302);
}

/**
 * Handle Strava OAuth callback
 */
async function handleStravaCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(`Strava 인증 실패: ${error}`, { status: 400 });
  }

  if (!code) {
    return new Response('인증 코드가 없습니다', { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Strava token error:', errorText);
      return new Response(`토큰 교환 실패: ${errorText}`, { status: 500 });
    }

    const tokens = await tokenResponse.json() as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
      athlete: { id: number; firstname: string; lastname: string };
    };

    // Save tokens to DB (including athlete ID for profile link)
    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('strava_tokens', ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).bind(JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      athlete_id: tokens.athlete.id,
    }), now).run();

    return new Response(`
      <html>
        <head><meta charset="utf-8"><title>Strava 연동 완료</title></head>
        <body style="font-family: -apple-system, sans-serif; text-align: center; padding: 50px;">
          <h1>✅ Strava 연동 완료!</h1>
          <p>${tokens.athlete.firstname} ${tokens.athlete.lastname}님의 계정이 연동되었습니다.</p>
          <p>이제 채팅에서 운동 기록을 물어볼 수 있어요.</p>
          <a href="https://chat.kimtoma.com">채팅으로 돌아가기</a>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Strava callback error:', error);
    return new Response(`오류: ${(error as Error).message}`, { status: 500 });
  }
}

/**
 * Refresh Strava access token
 */
async function refreshStravaToken(env: Env, refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Strava refresh error:', await response.text());
      return null;
    }

    const tokens = await response.json() as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };

    // Update tokens in DB
    await env.DB.prepare(`
      UPDATE settings SET value = ?, updated_at = ?
      WHERE key = 'strava_tokens'
    `).bind(JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
    }), Date.now()).run();

    return tokens.access_token;
  } catch (error) {
    console.error('Strava refresh error:', error);
    return null;
  }
}

/**
 * Get Strava activity with caching
 */
async function getStravaActivity(env: Env): Promise<string> {
  try {
    // Check activity cache first
    const cached = await env.DB.prepare(
      'SELECT value, updated_at FROM settings WHERE key = ?'
    ).bind('strava_activity').first() as any;

    const now = Date.now();
    if (cached && (now - cached.updated_at) < STRAVA_CACHE_TTL) {
      return cached.value;
    }

    // Get tokens
    const tokensRow = await env.DB.prepare(
      'SELECT value FROM settings WHERE key = ?'
    ).bind('strava_tokens').first() as any;

    if (!tokensRow) {
      return ''; // Not authenticated
    }

    let tokens = JSON.parse(tokensRow.value);

    // Check if token needs refresh
    if (tokens.expires_at * 1000 < now) {
      const newAccessToken = await refreshStravaToken(env, tokens.refresh_token);
      if (!newAccessToken) {
        return cached?.value || '';
      }
      tokens.access_token = newAccessToken;
    }

    // Fetch recent activities
    const response = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=5',
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Strava API error:', response.status);
      return cached?.value || '';
    }

    const activities = await response.json() as StravaActivity[];
    const activity = formatStravaActivity(activities, tokens.athlete_id);

    // Save to cache
    await env.DB.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('strava_activity', ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).bind(activity, now).run();

    return activity;
  } catch (error) {
    console.error('Strava activity error:', error);
    return '';
  }
}

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
}

/**
 * Format Strava activities into readable text with links (blog post style)
 */
function formatStravaActivity(activities: StravaActivity[], athleteId?: number): string {
  if (!activities || activities.length === 0) return '';

  const formatted = activities.map(activity => {
    const date = new Date(activity.start_date_local).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    });

    const distance = (activity.distance / 1000).toFixed(1);
    const duration = Math.floor(activity.moving_time / 60);
    const elevation = Math.round(activity.total_elevation_gain);
    const activityUrl = `https://www.strava.com/activities/${activity.id}`;

    const typeKo: Record<string, string> = {
      'Run': '🏃 러닝',
      'Ride': '🚴 라이딩',
      'Swim': '🏊 수영',
      'Walk': '🚶 걷기',
      'Hike': '🥾 하이킹',
      'WeightTraining': '🏋️ 웨이트',
      'Yoga': '🧘 요가',
    };

    const type = typeKo[activity.sport_type] || activity.sport_type;
    const details = `${distance}km, ${duration}분${elevation > 0 ? `, 고도 ${elevation}m` : ''}`;

    return `- ${date}: ${type} 📎 [${activity.name}](${activityUrl}) ↗ (${details})`;
  });

  const profileUrl = athleteId ? `https://www.strava.com/athletes/${athleteId}` : 'https://www.strava.com';
  return `## Strava 최근 운동 기록\n프로필: [Strava 프로필](${profileUrl})\n\n${formatted.join('\n')}`;
}

// ============================================
// Social Media Integration - YouTube
// ============================================

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: { default: { url: string } };
  };
}

/**
 * Get YouTube activity with caching
 */
async function getYouTubeActivity(env: Env): Promise<string> {
  if (!env.YOUTUBE_API_KEY) return '';

  try {
    // Check cache
    const cached = await env.DB.prepare(
      'SELECT value, updated_at FROM settings WHERE key = ?'
    ).bind('youtube_activity').first() as any;

    const now = Date.now();
    if (cached && (now - cached.updated_at) < YOUTUBE_CACHE_TTL) {
      return cached.value;
    }

    // Fetch recent videos from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${env.YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=5&type=video`
    );

    if (!response.ok) {
      console.error('YouTube API error:', response.status);
      return cached?.value || '';
    }

    const data = await response.json() as { items: YouTubeVideo[] };
    const activity = formatYouTubeActivity(data.items);

    // Save to cache
    await env.DB.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('youtube_activity', ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).bind(activity, now).run();

    return activity;
  } catch (error) {
    console.error('YouTube activity error:', error);
    return '';
  }
}

/**
 * Format YouTube videos into readable text with links (blog post style)
 */
function formatYouTubeActivity(videos: YouTubeVideo[]): string {
  if (!videos || videos.length === 0) return '';

  const formatted = videos.map(video => {
    const date = new Date(video.snippet.publishedAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    });
    const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
    const title = video.snippet.title;

    return `- ${date}: 🎬 📎 [${title}](${videoUrl}) ↗`;
  });

  const channelUrl = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`;
  return `## YouTube 최근 영상\n채널: [YouTube 채널](${channelUrl})\n\n${formatted.join('\n')}`;
}
