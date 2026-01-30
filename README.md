# kimtoma.github.io

[한국어](#한국어) | [English](#english)

---

## 한국어

### 소개

**kimtoma.com** - 서비스 기획자 김경수의 개인 블로그 및 포트폴리오 사이트입니다.

UX/UI 디자인, 서비스 기획, AI, 그리고 기술 트렌드에 대한 생각을 기록합니다.

### 사이트

| URL | 설명 |
|-----|------|
| [kimtoma.com](https://kimtoma.com) | 인터랙티브 포트폴리오 ("Her" 영화 영감) |
| [chat.kimtoma.com](https://chat.kimtoma.com) | AI 챗봇 (Gemini 기반) |
| [chat.kimtoma.com/admin.html](https://chat.kimtoma.com/admin.html) | 챗봇 관리자 대시보드 |

### 주요 프로젝트

| 프로젝트 | 설명 | 수상 |
|---------|------|------|
| [PAIGE](https://paige.kr.nc.com/) | AI 기반 KBO 야구 팬 앱 | iF Design Award 2021 |
| [The Hunters](https://ifdesign.com/en/winner-ranking/project/mossland-the-hunters/274510) | 블록체인 기반 리워드 게임 | iF Design Award 2020 |

### 기술 스택

**포트폴리오 (kimtoma.com)**
- React 19 + TypeScript + Vite
- Tailwind CSS 4 (CDN) + Framer Motion
- "Her" 영화 영감 3D 플로팅 카드 UI
- Dark/Light 테마 (원형 reveal 애니메이션)
- Cloudflare Pages

**AI 챗봇 (chat.kimtoma.com)**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- 통합 디자인 시스템 (kimtoma.com과 동일)
- Cloudflare Workers (Gemini API 프록시)
- Cloudflare D1 (대화 로그 저장)
- Cloudflare Vectorize + Workers AI (블로그 RAG)
- iMessage 스타일 UI + 타이핑 효과
- 피드백 기능 (좋아요/싫어요)

**관리자 대시보드**
- 대화 로그 조회 및 분석
- 시스템 프롬프트 관리
- 감정 분석 (Gemini 기반)
- 이메일 알림 (Resend API)

**Responsible AI**
- AI 응답 신뢰성 안내 문구 표시
- 사용자에게 응답 재확인 권장

### 로컬 실행

```bash
# 포트폴리오 실행 (http://localhost:3000)
cd os-landing
npm install
npm run dev

# 챗봇 실행 (http://localhost:5173)
cd chat-app
npm install
npm run dev
```

### 라이선스

MIT License - 테마 원작자: [Mark Otto](https://github.com/mdo)

---

## English

### About

**kimtoma.com** - Personal blog and portfolio of Kyungsoo Kim, a Service Planner & Product Designer.

Writing about UX/UI design, service planning, AI, and technology trends.

### Sites

| URL | Description |
|-----|-------------|
| [kimtoma.com](https://kimtoma.com) | Interactive Portfolio ("Her" movie inspired) |
| [chat.kimtoma.com](https://chat.kimtoma.com) | AI Chatbot (Gemini-powered) |
| [chat.kimtoma.com/admin.html](https://chat.kimtoma.com/admin.html) | Chatbot admin dashboard |

### Featured Projects

| Project | Description | Award |
|---------|-------------|-------|
| [PAIGE](https://paige.kr.nc.com/) | AI-powered app for KBO Baseball fans | iF Design Award 2021 |
| [The Hunters](https://ifdesign.com/en/winner-ranking/project/mossland-the-hunters/274510) | Blockchain-based reward game | iF Design Award 2020 |

### Tech Stack

**Portfolio (kimtoma.com)**
- React 19 + TypeScript + Vite
- Tailwind CSS 4 (CDN) + Framer Motion
- "Her" movie inspired 3D floating card UI
- Dark/Light theme (circular reveal animation)
- Cloudflare Pages

**AI Chatbot (chat.kimtoma.com)**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Unified Design System (matching kimtoma.com)
- Cloudflare Workers (Gemini API proxy)
- Cloudflare D1 (conversation logging)
- Cloudflare Vectorize + Workers AI (Blog RAG)
- iMessage-style UI + typing effect
- Feedback feature (like/dislike)

**Admin Dashboard**
- Conversation logs viewer & analytics
- System prompt management
- Sentiment analysis (Gemini-powered)
- Email alerts (Resend API)

**Responsible AI**
- AI response reliability disclaimer
- Encourages users to verify responses

### Local Development

```bash
# Run portfolio (http://localhost:3000)
cd os-landing
npm install
npm run dev

# Run chatbot (http://localhost:5173)
cd chat-app
npm install
npm run dev
```

### License

MIT License - Theme by [Mark Otto](https://github.com/mdo)
