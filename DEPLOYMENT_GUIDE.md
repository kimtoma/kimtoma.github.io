# Chat Logging System Deployment Guide

이 가이드는 chat.kimtoma.com에 D1 로깅 시스템을 배포하는 전체 과정을 설명합니다.

## 📋 개요

- **Cloudflare Worker**: Gemini API 프록시 + D1 로깅
- **D1 Database**: 대화 내용, 세션, 사용량 통계 저장
- **Admin Page**: 로그 조회 및 분석 대시보드
- **무료 티어 제한**: 일일 100K writes, 5M reads 강제

## 🚀 배포 단계

### 1. Cloudflare Worker 배포

#### 1.1 의존성 설치

```bash
cd cloudflare-worker
npm install
```

#### 1.2 Cloudflare 로그인

```bash
npx wrangler login
```

브라우저가 열리면 Cloudflare 계정으로 로그인합니다.

#### 1.3 D1 데이터베이스 생성

```bash
npx wrangler d1 create chat-logs-db
```

출력된 `database_id`를 복사하고 `wrangler.toml` 파일을 수정:

```toml
[[d1_databases]]
binding = "DB"
database_name = "chat-logs-db"
database_id = "YOUR_DATABASE_ID_HERE"  # 여기에 붙여넣기
```

#### 1.4 데이터베이스 스키마 초기화

```bash
npx wrangler d1 execute chat-logs-db --file=./src/schema.sql
```

성공하면 테이블이 생성됩니다:
- `chat_sessions`
- `chat_messages`
- `daily_usage`

#### 1.5 환경 변수 설정

**Gemini API Key 설정:**
```bash
npx wrangler secret put GEMINI_API_KEY
# 프롬프트가 나오면 Gemini API 키 입력
```

**Admin Token 생성 및 설정:**
```bash
# 안전한 랜덤 토큰 생성 (macOS/Linux)
openssl rand -hex 32

# 또는 온라인 생성기 사용: https://www.random.org/strings/

# 생성된 토큰을 저장
npx wrangler secret put ADMIN_TOKEN
# 프롬프트가 나오면 생성한 토큰 입력
```

**⚠️ 중요: Admin Token을 안전하게 저장하세요! 나중에 Admin 페이지 접속에 필요합니다.**

#### 1.6 Worker 배포

```bash
npm run deploy
```

배포가 완료되면 다음과 같은 URL이 출력됩니다:
```
Published gemini-proxy-with-logging (1.23s)
  https://gemini-proxy-with-logging.YOUR_SUBDOMAIN.workers.dev
```

이 URL을 복사해두세요!

### 2. Chat Client 업데이트

#### 2.1 API 엔드포인트 변경

`chat-app/src/components/Chat.tsx` 파일을 열고 13-15번 줄을 수정:

```typescript
// Before:
// const API_ENDPOINT = 'https://gemini-proxy.kimtoma.workers.dev/chat'

// After (Worker URL로 변경):
const API_ENDPOINT = 'https://gemini-proxy-with-logging.YOUR_SUBDOMAIN.workers.dev/chat'
```

#### 2.2 Chat App 빌드

```bash
cd chat-app
npm install  # 첫 번째 빌드인 경우
npm run build
```

빌드 결과물은 `chat-app/dist/` 폴더에 생성됩니다.

#### 2.3 빌드 파일을 chat 폴더로 복사

```bash
# chat-app 폴더에서 실행
cp -r dist/* ../chat/
```

### 3. Admin 페이지 설정

`chat/admin.html` 파일을 열고 Worker URL을 설정:

파일 내 78번 줄 근처:
```html
<input type="text" id="apiEndpoint" value="https://gemini-proxy-with-logging.YOUR_SUBDOMAIN.workers.dev" placeholder="Worker URL">
```

### 4. GitHub Pages 배포

#### 4.1 변경사항 커밋

```bash
# 프로젝트 루트에서
git add .
git commit -m "Add D1 chat logging system with admin dashboard"
git push origin master
```

#### 4.2 확인

- **Chat 페이지**: https://chat.kimtoma.com
- **Admin 페이지**: https://chat.kimtoma.com/admin.html

## 🔐 Admin 대시보드 접속

1. https://chat.kimtoma.com/admin.html 접속
2. **API Endpoint**: Worker URL 입력
3. **Admin Token**: 1.5 단계에서 설정한 토큰 입력
4. **Login** 클릭

### Admin 기능

- **통계 보기**: 총 메시지 수, 세션 수, 일일 사용량
- **로그 조회**: 세션별, 시간별 대화 내용 검색
- **데이터 정리**: 30일 이상 된 로그 삭제

## 📊 무료 티어 사용량 모니터링

### Cloudflare Dashboard에서 확인

1. Cloudflare Dashboard 로그인
2. **Workers & Pages** → `gemini-proxy-with-logging` 선택
3. **Metrics** 탭에서 요청 수, 오류율 확인
4. **D1** 메뉴에서 `chat-logs-db` 선택 → 저장 용량 확인

### Admin Dashboard에서 확인

Admin 페이지의 통계 섹션에서 실시간으로 확인 가능:
- Today's Writes: XX / 100,000 (X.XX%)
- Today's Reads: XX / 5,000,000

진행률 바가 색상으로 상태 표시:
- 🟦 파란색: 정상 (0-50%)
- 🟨 노란색: 주의 (50-80%)
- 🟥 빨간색: 경고 (80-100%)

## 🛠️ 데이터베이스 관리

### 직접 쿼리 실행

```bash
# 최근 메시지 10개 조회
npx wrangler d1 execute chat-logs-db --command \
  "SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 10"

# 세션 목록 조회
npx wrangler d1 execute chat-logs-db --command \
  "SELECT id, created_at, message_count FROM chat_sessions ORDER BY last_active DESC LIMIT 10"

# 일일 사용량 통계
npx wrangler d1 execute chat-logs-db --command \
  "SELECT * FROM daily_usage ORDER BY date DESC LIMIT 7"

# 전체 메시지 개수
npx wrangler d1 execute chat-logs-db --command \
  "SELECT COUNT(*) as total FROM chat_messages"
```

### 데이터 정리

**방법 1: Admin Dashboard 사용 (권장)**
1. Admin 페이지에서 "🗑️ Cleanup Old Data" 버튼 클릭
2. 30일 이상 된 데이터 자동 삭제

**방법 2: 수동 삭제**
```bash
# 30일 이상 된 메시지 삭제
npx wrangler d1 execute chat-logs-db --command \
  "DELETE FROM chat_messages WHERE timestamp < $(date -d '30 days ago' +%s)000"

# 30일 이상 된 세션 삭제
npx wrangler d1 execute chat-logs-db --command \
  "DELETE FROM chat_sessions WHERE last_active < $(date -d '30 days ago' +%s)000"
```

## 🚨 문제 해결

### Worker 배포 실패

**오류**: `Authentication error`
```bash
# 다시 로그인
npx wrangler logout
npx wrangler login
```

**오류**: `Database not found`
- `wrangler.toml`의 `database_id`가 올바른지 확인
- D1 데이터베이스가 생성되었는지 확인: `npx wrangler d1 list`

### API 요청 실패

**오류**: `Daily write limit reached`
- 일일 100,000 writes 한도 도달
- 다음 날(UTC 기준)까지 대기하거나 Cloudflare 유료 플랜 고려

**오류**: `Unauthorized` (Admin 페이지)
- Admin Token이 올바른지 확인
- Worker에 ADMIN_TOKEN이 설정되었는지 확인: `npx wrangler secret list`

### 로그 보기

Worker 실시간 로그 확인:
```bash
cd cloudflare-worker
npm run tail
```

## 💰 비용 추정 (무료 티어)

### Cloudflare 무료 티어 제한
- **Workers**: 일 100,000 요청
- **D1**: 5GB 저장, 일 100K writes, 일 5M reads
- **무료**: 위 한도 내에서 완전 무료

### 예상 사용량
- 대화 1회 = writes 4회 (session update + user message + AI response + usage update)
- 일 100K writes = 약 25,000 대화/일
- 30일 데이터 보관 시 약 750,000 대화 저장 가능

### 한도 초과 시
1. **임시 조치**: 한도 초과 시 서비스 일시 중단 (다음 날 자동 재개)
2. **장기 조치**:
   - 데이터 보관 기간 단축 (30일 → 7일)
   - Cloudflare Workers Paid 플랜 ($5/월) 고려

## 🔒 보안 고려사항

### 현재 구현
- ✅ Admin API는 Bearer Token으로 보호
- ✅ CORS 설정으로 허용된 도메인만 접근
- ✅ 사용자 IP 로깅 (분석용)

### 개선 가능 사항
- 대화 내용 암호화 (민감한 정보 처리 시)
- Rate limiting (특정 IP의 과도한 요청 차단)
- Admin 페이지 2FA 추가

## 📈 다음 단계

1. **데이터 분석**: 로그를 활용한 사용자 패턴 분석
2. **개선 사항 도출**: 자주 묻는 질문, 오류 패턴 파악
3. **모델 튜닝**: 대화 품질 개선
4. **통계 대시보드**: 더 상세한 분석 도구 추가

## 📚 참고 자료

- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 문서](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)
- [Gemini API 문서](https://ai.google.dev/docs)

## 💬 지원

문제가 발생하면:
1. Worker 로그 확인: `npm run tail`
2. D1 상태 확인: Cloudflare Dashboard
3. GitHub Issues에 문의

---

**구현 완료일**: 2026-01-28
**작성자**: Claude Code
