/**
 * Cloudflare Worker for Gemini API Proxy
 *
 * Environment Variables Required:
 * - GEMINI_API_KEY: Your Google Gemini API key
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins (e.g., "https://chat.kimtoma.com")
 * - RATE_LIMIT: KV namespace for rate limiting
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Rate limit settings
const RATE_LIMITS = {
  perMinute: 5,      // IP당 분당 최대 요청 수
  perDay: 50,        // IP당 일당 최대 요청 수
  globalPerDay: 500, // 전체 사이트 일당 최대 요청 수
};

// CORS headers
function getCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle OPTIONS request
function handleOptions(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [];

  if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    return new Response(null, {
      headers: getCorsHeaders(origin),
    });
  }

  return new Response('Forbidden', { status: 403 });
}

// Get client IP
function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For')?.split(',')[0] ||
         'unknown';
}

// Get current date key (YYYY-MM-DD)
function getDateKey() {
  return new Date().toISOString().split('T')[0];
}

// Get current minute key (YYYY-MM-DD-HH-MM)
function getMinuteKey() {
  const now = new Date();
  return `${now.toISOString().split('T')[0]}-${String(now.getUTCHours()).padStart(2, '0')}-${String(now.getUTCMinutes()).padStart(2, '0')}`;
}

// Check and update rate limit
async function checkRateLimit(env, clientIP) {
  if (!env.RATE_LIMIT) {
    // KV not configured, skip rate limiting
    return { allowed: true };
  }

  const dateKey = getDateKey();
  const minuteKey = getMinuteKey();

  // Keys for rate limiting
  const ipMinuteKey = `ip:${clientIP}:min:${minuteKey}`;
  const ipDayKey = `ip:${clientIP}:day:${dateKey}`;
  const globalDayKey = `global:day:${dateKey}`;

  // Get current counts
  const [ipMinuteCount, ipDayCount, globalDayCount] = await Promise.all([
    env.RATE_LIMIT.get(ipMinuteKey).then(v => parseInt(v) || 0),
    env.RATE_LIMIT.get(ipDayKey).then(v => parseInt(v) || 0),
    env.RATE_LIMIT.get(globalDayKey).then(v => parseInt(v) || 0),
  ]);

  // Check limits
  if (ipMinuteCount >= RATE_LIMITS.perMinute) {
    return {
      allowed: false,
      reason: '분당 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      retryAfter: 60
    };
  }

  if (ipDayCount >= RATE_LIMITS.perDay) {
    return {
      allowed: false,
      reason: '일일 요청 한도를 초과했습니다. 내일 다시 시도해주세요.',
      retryAfter: 86400
    };
  }

  if (globalDayCount >= RATE_LIMITS.globalPerDay) {
    return {
      allowed: false,
      reason: '서비스 일일 한도에 도달했습니다. 내일 다시 시도해주세요.',
      retryAfter: 86400
    };
  }

  // Increment counts
  await Promise.all([
    env.RATE_LIMIT.put(ipMinuteKey, String(ipMinuteCount + 1), { expirationTtl: 60 }),
    env.RATE_LIMIT.put(ipDayKey, String(ipDayCount + 1), { expirationTtl: 86400 }),
    env.RATE_LIMIT.put(globalDayKey, String(globalDayCount + 1), { expirationTtl: 86400 }),
  ]);

  return {
    allowed: true,
    remaining: {
      perMinute: RATE_LIMITS.perMinute - ipMinuteCount - 1,
      perDay: RATE_LIMITS.perDay - ipDayCount - 1,
    }
  };
}

// Convert chat history to Gemini format
function formatHistory(history) {
  if (!history || !Array.isArray(history)) {
    return [];
  }

  return history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
}

// Call Gemini API
async function callGeminiAPI(apiKey, message, history) {
  const contents = [
    ...formatHistory(history),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  };

  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Extract response text
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API');
  }

  const candidate = data.candidates[0];
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new Error('Invalid response structure from Gemini API');
  }

  return candidate.content.parts[0].text;
}

// Main handler
async function handleChat(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [];

  // Check CORS
  if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Check rate limit
  const clientIP = getClientIP(request);
  const rateLimitResult = await checkRateLimit(env, clientIP);

  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({
      error: rateLimitResult.reason
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimitResult.retryAfter),
        ...getCorsHeaders(origin),
      },
    });
  }

  // Check API key
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin),
      },
    });
  }

  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid message' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin),
        },
      });
    }

    // Call Gemini API
    const responseText = await callGeminiAPI(env.GEMINI_API_KEY, message, history);

    return new Response(JSON.stringify({
      response: responseText,
      rateLimit: rateLimitResult.remaining
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin),
      },
    });

  } catch (error) {
    console.error('Error:', error);

    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin),
      },
    });
  }
}

// Worker entry point
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    // Handle chat endpoint
    if (url.pathname === '/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    // Default response
    return new Response('Not Found', { status: 404 });
  },
};
