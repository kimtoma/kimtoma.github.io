# chat.kimtoma.com

**마지막 업데이트**: 2026-01-28
**상태**: React UI 리팩토링 진행 중

## 완료된 작업

### Backend (Cloudflare Worker)
- Gemini API 프록시 (`workers/gemini-proxy/`)
- Rate Limiting (IP당 분당 5건, 일당 50건 / 전체 일당 500건)
- System Prompt: 김경수(kimtoma) 페르소나
- Worker URL: `https://gemini-proxy.kimtoma.workers.dev`

### Frontend (React + shadcn/ui)
- Vite + React + TypeScript 프로젝트 (`chat-app/`)
- Tailwind CSS + shadcn/ui 스타일
- iMessage 스타일 채팅 UI
- Dark/Light 테마 토글
- localStorage 대화 기록 저장
- 타이핑 효과 (문자 단위로 표시)
- 빌드 결과물 → `chat/` 폴더로 복사

---

## 현재 진행 중

### 타이핑 효과 구현 완료
- 응답을 받은 후 문자 단위로 타이핑 효과
- 헤더에 "생각 중...", "입력 중..." 상태 표시
- 타이핑 중 입력 비활성화

### 테스트 필요
- http://localhost:8080 에서 타이핑 효과 테스트
- 이상하면 스트리밍 방식(2번)으로 전환 검토

---

## 파일 구조

```
kimtoma.github.io/
├── chat/                    # 빌드된 정적 파일 (배포용)
│   ├── index.html
│   └── assets/
├── chat-app/                # React 소스코드
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.tsx     # 메인 채팅 컴포넌트
│   │   │   └── ui/
│   │   │       └── button.tsx
│   │   ├── lib/
│   │   │   └── utils.ts     # cn 유틸리티
│   │   ├── App.tsx
│   │   └── index.css        # Tailwind + 커스텀 스타일
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.app.json
├── chat-backup/             # 이전 HTML 버전 백업
├── workers/
│   └── gemini-proxy/
│       ├── index.js         # Worker 코드
│       └── wrangler.toml
└── progress.md              # 이 파일
```

---

## 다음에 할 일

1. **타이핑 효과 테스트**
   - 로컬에서 테스트: http://localhost:8080
   - 타이핑 속도, UX 확인

2. **필요시 스트리밍 방식으로 전환**
   - Gemini API streamGenerateContent 사용
   - Worker + Frontend 모두 수정 필요

3. **배포**
   - Cloudflare Pages 빌드 설정 업데이트
   - Build command: `cd chat-app && npm install && npm run build`
   - Build output: `chat-app/dist`

4. **추가 개선 아이디어**
   - 코드 복사 버튼
   - 메시지 재생성 버튼
   - 대화 내보내기

---

## 개발 명령어

```bash
# 로컬 개발
cd chat-app
npm run dev

# 빌드
npm run build

# 빌드 결과물 chat 폴더로 복사
cp -r dist/* ../chat/

# Worker 배포
cd workers/gemini-proxy
wrangler deploy

# System Prompt 수정 후 배포
# workers/gemini-proxy/index.js의 SYSTEM_PROMPT 수정 후
wrangler deploy
```

---

## 참고 링크

- 사이트: https://chat.kimtoma.com
- Worker 대시보드: https://dash.cloudflare.com
- shadcn/ui: https://ui.shadcn.com
