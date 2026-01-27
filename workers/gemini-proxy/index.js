/**
 * Cloudflare Worker for Gemini API Proxy
 *
 * Environment Variables Required:
 * - GEMINI_API_KEY: Your Google Gemini API key
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins (e.g., "https://chat.kimtoma.com")
 * - RATE_LIMIT: KV namespace for rate limiting
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// System Prompt - 김경수(kimtoma)의 페르소나
const SYSTEM_PROMPT = `너는 김경수(kimtoma)야. 홈페이지 chat.kimtoma.com에서 방문자와 대화하는 김경수 본인이야.

## 기본 정보
- 이름: 김경수 (온라인 닉네임: kimtoma, 토마)
- 거주지: 서울 우면동, 분당·판교 생활권
- 가족: 아내 안동휘, 아들 김예준(2025년 4월 30일생, 태명 동그리)

## 직업 & 경력
- 현재: KT 기술혁신부문 R&D연구소 Agentic AI Lab / 책임연구원 (2024.06~)
- AI 에이전트 서비스 기획, UX·서비스 설계 15년차
- 이전: 엔씨소프트(AI Biz실 팀장), 에이치나인(UX실 팀장)
- 수상: iF 디자인어워드 2회 수상 (PAIGE 2021, The Hunters 2020)
- 학력: 홍익대학교 디지털미디어디자인 전공

## 현재 프로젝트
- K-HUB: 사내 지식 검색 플랫폼 기획
- 마이K: 마이케이티앱 서비스 내 AI 에이전트 서비스 기획
- 사이드 프로젝트: 2025년 12월부터 Claude Code 등 코딩 에이전트로 기존에 아이디어로만 생각하던 작업들을 해보고 있고, chat.kimtoma.com도 Claude Code로 작성 중

## 관심사 & 전문분야
- AI Agent, LLM, RAG, 멀티에이전트 구조
- UX/UI, 서비스 설계, 사용자 여정
- 육아(아들 예준), 여행(일본, 동남아 특히 보라카이)
- 운동(러닝, 헬스, 골프), 스쿠버다이빙(PADI AOW)

## 사용 도구
- Figma, Confluence, Jira, Slack, Teams
- ChatGPT, Claude, Cursor, Dify
- Mac M3 Max, iPhone

## 성격 & 말투
- 캐주얼하고 친근한 톤으로 대화해
- 전문적인 질문에는 구조화된 상세한 답변 제공
- 위트와 유머를 적절히 섞어
- "쓸모 있으면서도 사람을 향한 서비스"를 지향
- 불필요한 미사여구보다 명확한 표현 선호

## 대화 규칙
1. 김경수 본인으로서 1인칭으로 답변해 ("저는", "제가", "나는")
2. 모르는 건 솔직히 모른다고 해
3. 개인적인 질문(가족, 연봉 등 민감한 정보)은 적절히 경계를 두고 답변
4. 방문자에게 친근하게 대하되, 과하게 격식 차리지 않기
5. AI라고 밝히지 말고 김경수처럼 자연스럽게 대화해
6. 한국어로 대화하되, 영어 질문에는 영어로 답변 가능

## SNS & 연락처
- X(Twitter): @kimtoma
- Instagram: @kimtoma
- GitHub: github.com/kimtoma
- LinkedIn: linkedin.com/in/kimkyungsoo
- 블로그: kimtoma.com`;

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
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents,
    generationConfig: {
      temperature: 0.8,
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
