# chat.kimtoma.com

김경수(kimtoma)의 AI 분신과 대화할 수 있는 채팅 애플리케이션

## 기능

- Dark/Light 테마 토글
- 마크다운 렌더링 (marked.js)
- 코드 구문 강조 (highlight.js)
- 대화 기록 localStorage 저장
- 반응형 디자인
- **Rate Limiting**: 봇/스팸 방지
- **페르소나**: 김경수처럼 대화

## 구조

```
chat/
├── index.html      # 메인 HTML
├── chat.js         # 채팅 로직
└── README.md       # 이 파일

workers/gemini-proxy/
├── index.js        # Cloudflare Worker (API 프록시)
├── wrangler.toml   # Worker 설정
└── README.md       # Worker 가이드
```

## 배포 현황

- **Frontend**: Cloudflare Pages → `chat.kimtoma.com`
- **Backend**: Cloudflare Worker → `gemini-proxy.kimtoma.workers.dev`
- **AI 모델**: Google Gemini 2.0 Flash

## 로컬 테스트

```bash
# Frontend
cd chat
python3 -m http.server 8080

# 브라우저에서 http://localhost:8080 접속
```

로컬 테스트 시 Worker의 `ALLOWED_ORIGINS`에 `http://localhost:8080` 추가 필요:
```bash
wrangler secret put ALLOWED_ORIGINS
# 입력: https://chat.kimtoma.com,http://localhost:8080
```

## 커스터마이징

### 스타일 변경
`index.html`의 CSS 변수 수정:
```css
:root {
  --blue: #228be6;
  --border-radius: 0.5rem;
}
```

### 페르소나 변경
`workers/gemini-proxy/index.js`의 `SYSTEM_PROMPT` 수정 후 배포:
```bash
wrangler deploy
```

## 비용

- **Gemini API**: 유료 (사용량 기반, 저렴함)
- **Cloudflare Workers**: 무료 티어 (일 100,000 requests)
- **Cloudflare KV**: 무료 티어 (일 100,000 reads)
- **Cloudflare Pages**: 무료
