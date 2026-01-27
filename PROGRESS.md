# chat.kimtoma.com

**마지막 업데이트**: 2026-01-28
**상태**: 완료

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
- 모바일 입력창 하단 고정 (iOS safe area 지원)
- Favicon (kimtoma.com과 동일)
- 빌드 결과물 → `chat/` 폴더로 복사

### Jekyll 블로그 스타일 통일 (kimtoma.com)
- chat.kimtoma.com과 동일한 디자인 스타일 적용
- Light/Dark 테마 지원 (시스템 설정 자동 감지)
- Primary 컬러: `#0080ff`
- GitHub 스타일 구문 강조 (양쪽 테마)
- 모던 UI 컴포넌트 (카드, 페이지네이션, TOC 등)
- 부드러운 테마 전환 애니메이션

---

## 파일 구조

```
kimtoma.github.io/
├── _sass/                   # Jekyll SCSS 스타일
│   ├── _variables.scss      # CSS 변수 (컬러, 폰트 등)
│   ├── _base.scss           # 기본 스타일
│   ├── _masthead.scss       # 헤더 스타일
│   ├── _layout.scss         # 레이아웃
│   ├── _posts.scss          # 포스트 스타일
│   ├── _type.scss           # 타이포그래피
│   ├── _code.scss           # 코드 블록
│   ├── _syntax.scss         # 구문 강조
│   ├── _pagination.scss     # 페이지네이션
│   ├── _message.scss        # 메시지 박스
│   └── _toc.scss            # 목차
├── chat/                    # 빌드된 정적 파일 (배포용)
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── chat-app/                # React 소스코드
│   ├── src/
│   │   ├── components/
│   │   │   └── Chat.tsx     # 메인 채팅 컴포넌트
│   │   ├── lib/
│   │   │   └── utils.ts     # cn 유틸리티
│   │   ├── App.tsx
│   │   └── index.css        # Tailwind + 커스텀 스타일
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── favicon-16x16.png
│   │   └── favicon-32x32.png
│   ├── package.json
│   └── vite.config.ts
├── workers/
│   └── gemini-proxy/
│       ├── index.js         # Worker 코드
│       └── wrangler.toml
└── progress.md              # 이 파일
```

---

## 개발 명령어

```bash
# Jekyll 로컬 개발
bundle exec jekyll serve

# Chat 앱 로컬 개발
cd chat-app
npm run dev

# Chat 앱 빌드
npm run build

# 빌드 결과물 chat 폴더로 복사
cp -r dist/* ../chat/

# Worker 배포
cd workers/gemini-proxy
wrangler deploy
```

---

## 향후 개선 아이디어

- 코드 복사 버튼
- 메시지 재생성 버튼
- 대화 내보내기
- 스트리밍 응답 (Gemini API streamGenerateContent)

---

## 참고 링크

- 블로그: https://kimtoma.com
- AI 챗봇: https://chat.kimtoma.com
- Worker 대시보드: https://dash.cloudflare.com
- shadcn/ui: https://ui.shadcn.com
