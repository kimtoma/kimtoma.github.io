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
| [kimtoma.com](https://kimtoma.com) | 개인 블로그 |
| [chat.kimtoma.com](https://chat.kimtoma.com) | AI 챗봇 (Gemini 기반) |
| [chat.kimtoma.com/admin.html](https://chat.kimtoma.com/admin.html) | 챗봇 관리자 대시보드 |

### 주요 프로젝트

| 프로젝트 | 설명 | 수상 |
|---------|------|------|
| [PAIGE](https://paige.kr.nc.com/) | AI 기반 KBO 야구 팬 앱 | iF Design Award 2021 |
| [The Hunters](https://ifdesign.com/en/winner-ranking/project/mossland-the-hunters/274510) | 블록체인 기반 리워드 게임 | iF Design Award 2020 |

### 기술 스택

**블로그 (kimtoma.com)**
- Jekyll 4.1 + Poole 테마
- SCSS + CSS Variables
- Dark/Light 테마 지원
- GitHub Pages + Cloudflare CDN

**AI 챗봇 (chat.kimtoma.com)**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Cloudflare Workers (Gemini API 프록시)
- Cloudflare D1 (대화 로그 저장)
- iMessage 스타일 UI + 타이핑 효과

**관리자 대시보드**
- 대화 로그 조회 및 분석
- 시스템 프롬프트 관리
- 감정 분석 (Gemini 기반)
- 이메일 알림 (Resend API)

### 로컬 실행

```bash
# 블로그 실행 (http://localhost:4000)
bundle install
bundle exec jekyll serve

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
| [kimtoma.com](https://kimtoma.com) | Personal blog |
| [chat.kimtoma.com](https://chat.kimtoma.com) | AI Chatbot (Gemini-powered) |
| [chat.kimtoma.com/admin.html](https://chat.kimtoma.com/admin.html) | Chatbot admin dashboard |

### Featured Projects

| Project | Description | Award |
|---------|-------------|-------|
| [PAIGE](https://paige.kr.nc.com/) | AI-powered app for KBO Baseball fans | iF Design Award 2021 |
| [The Hunters](https://ifdesign.com/en/winner-ranking/project/mossland-the-hunters/274510) | Blockchain-based reward game | iF Design Award 2020 |

### Tech Stack

**Blog (kimtoma.com)**
- Jekyll 4.1 + Poole theme
- SCSS + CSS Variables
- Dark/Light theme support
- GitHub Pages + Cloudflare CDN

**AI Chatbot (chat.kimtoma.com)**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Cloudflare Workers (Gemini API proxy)
- Cloudflare D1 (conversation logging)
- iMessage-style UI + typing effect

**Admin Dashboard**
- Conversation logs viewer & analytics
- System prompt management
- Sentiment analysis (Gemini-powered)
- Email alerts (Resend API)

### Local Development

```bash
# Run blog (http://localhost:4000)
bundle install
bundle exec jekyll serve

# Run chatbot (http://localhost:5173)
cd chat-app
npm install
npm run dev
```

### License

MIT License - Theme by [Mark Otto](https://github.com/mdo)
