# Gemini API Proxy Worker

Cloudflare Worker for proxying requests to Google Gemini API with rate limiting and persona.

## 기능

- Gemini API 프록시
- CORS 처리
- **Rate Limiting** (Cloudflare KV 사용)
  - IP당 분당 5건
  - IP당 일당 50건
  - 전체 일당 500건
- **System Prompt**: 김경수(kimtoma) 페르소나

## 배포된 URL

`https://gemini-proxy.kimtoma.workers.dev`

## 설정

### 환경 변수 (Secrets)

```bash
# Gemini API 키
wrangler secret put GEMINI_API_KEY

# 허용 도메인 (콤마로 구분)
wrangler secret put ALLOWED_ORIGINS
# 예: https://chat.kimtoma.com,http://localhost:8080
```

### KV Namespace

Rate limiting용 KV namespace가 `wrangler.toml`에 설정되어 있음:
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "5eae5cba427340469dae1664b6e076d6"
```

## 배포

```bash
cd workers/gemini-proxy
wrangler deploy
```

## Rate Limit 변경

`index.js`의 `RATE_LIMITS` 수정:
```javascript
const RATE_LIMITS = {
  perMinute: 5,      // IP당 분당
  perDay: 50,        // IP당 일당
  globalPerDay: 500, // 전체 일당
};
```

## System Prompt 변경

`index.js`의 `SYSTEM_PROMPT` 수정 후 배포

## 모니터링

```bash
# 실시간 로그
wrangler tail

# KV 데이터 확인
wrangler kv key list --namespace-id=5eae5cba427340469dae1664b6e076d6
```

## API 엔드포인트

### POST /chat

Request:
```json
{
  "message": "안녕하세요",
  "history": [
    {"role": "user", "content": "이전 메시지"},
    {"role": "assistant", "content": "이전 응답"}
  ]
}
```

Response:
```json
{
  "response": "AI 응답 텍스트",
  "rateLimit": {
    "perMinute": 4,
    "perDay": 49
  }
}
```

Rate Limit 초과 시 (429):
```json
{
  "error": "분당 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
}
```
