# Chat Application - chat.kimtoma.com

Gemini API 기반 대화형 AI 채팅 애플리케이션

## 구조

```
chat/
├── index.html      # 메인 HTML 페이지
├── chat.js         # 채팅 로직
└── README.md       # 이 파일

workers/
└── gemini-proxy/   # Cloudflare Worker 백엔드
    ├── index.js
    ├── wrangler.toml
    └── README.md
```

## 기능

- ✅ Dark/Light 테마 토글 (블로그와 동일한 디자인)
- ✅ 마크다운 렌더링 (marked.js)
- ✅ 코드 구문 강조 (highlight.js)
- ✅ 대화 기록 localStorage 저장
- ✅ 대화 초기화 기능
- ✅ 반응형 디자인

## 배포 가이드

### 1. Cloudflare Worker 배포

먼저 백엔드를 배포합니다. [workers/gemini-proxy/README.md](../workers/gemini-proxy/README.md) 참고

```bash
cd workers/gemini-proxy
wrangler login
wrangler secret put GEMINI_API_KEY  # Gemini API 키 입력
wrangler secret put ALLOWED_ORIGINS # https://chat.kimtoma.com 입력
wrangler deploy
```

배포 후 Worker URL을 복사합니다 (예: `https://gemini-proxy.xxx.workers.dev`)

### 2. Frontend 설정

`chat/chat.js` 파일의 API 엔드포인트를 업데이트:

```javascript
const CONFIG = {
  API_ENDPOINT: 'https://gemini-proxy.YOUR_SUBDOMAIN.workers.dev/chat',
  // ...
};
```

### 3. GitHub Pages 배포

이 저장소는 이미 GitHub Pages로 배포되어 있으므로, 파일을 커밋하고 푸시하면 자동으로 배포됩니다:

```bash
git add chat/ workers/
git commit -m "Add chat application with Gemini API"
git push origin master
```

### 4. 서브도메인 설정

#### 옵션 A: Cloudflare Pages로 별도 배포 (권장)

1. Cloudflare Dashboard → Pages → Create a project
2. Connect to Git → 이 저장소 선택
3. Build settings:
   - Build command: (비워두기)
   - Build output directory: `/chat`
4. Deploy
5. Custom domains → Add custom domain → `chat.kimtoma.com`

#### 옵션 B: GitHub Pages 서브디렉토리 사용

현재 GitHub Pages가 `kimtoma.com`으로 설정되어 있다면:

1. Cloudflare DNS에서 CNAME 레코드 추가:
   - Type: CNAME
   - Name: `chat`
   - Target: `kimtoma.github.io`
   - Proxy: On

2. 접속: `https://chat.kimtoma.com` 또는 `https://kimtoma.com/chat/`

#### 옵션 C: CNAME 파일 사용 (별도 저장소)

`chat` 전용 저장소를 만들고 싶다면:

1. 새 저장소 생성: `chat-kimtoma`
2. chat/ 폴더 내용을 새 저장소로 이동
3. GitHub Pages 설정 활성화
4. Cloudflare DNS CNAME: `chat` → `YOUR_USERNAME.github.io`
5. 저장소에 `CNAME` 파일 추가 (내용: `chat.kimtoma.com`)

## 로컬 테스트

### Backend (Worker)

```bash
cd workers/gemini-proxy
wrangler dev
```

### Frontend

간단한 HTTP 서버 실행:

```bash
cd chat
python3 -m http.server 8080
# 또는
npx serve .
```

브라우저에서 `http://localhost:8080` 접속

`chat.js`의 API_ENDPOINT를 임시로 변경:
```javascript
API_ENDPOINT: 'http://localhost:8787/chat'
```

## 커스터마이징

### 스타일 변경

`index.html`의 `<style>` 섹션에서 CSS 변수를 수정:

```css
:root {
  --blue: #228be6;  /* 메인 색상 */
  --border-radius: 0.5rem;  /* 모서리 둥글기 */
  /* ... */
}
```

### Gemini 모델 변경

`workers/gemini-proxy/index.js`에서 모델 변경:

```javascript
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
// 또는
// 'gemini-1.5-pro:generateContent'
// 'gemini-1.5-flash:generateContent'
```

### Temperature 조정

`workers/gemini-proxy/index.js`의 `generationConfig`:

```javascript
generationConfig: {
  temperature: 0.7,  // 0.0 (결정적) ~ 1.0 (창의적)
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
}
```

## 문제 해결

### CORS 오류

Worker의 `ALLOWED_ORIGINS` 환경 변수가 올바르게 설정되었는지 확인:

```bash
wrangler secret put ALLOWED_ORIGINS
# 입력: https://chat.kimtoma.com
```

### API 키 오류

Gemini API 키가 올바르게 설정되었는지 확인:

```bash
wrangler secret put GEMINI_API_KEY
```

### Worker 로그 확인

```bash
cd workers/gemini-proxy
wrangler tail
```

## 비용

- **Gemini API**: 무료 티어 (월 60 requests/분)
- **Cloudflare Workers**: 무료 티어 (일 100,000 requests)
- **Cloudflare Pages**: 무료
- **GitHub Pages**: 무료

개인 사용 목적이라면 완전 무료로 운영 가능합니다!

## 라이선스

MIT License
