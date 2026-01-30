# Development Progress

## 2026-01-31: Dark Mode & UX Improvements

### ✅ Completed

#### 1. Full Dark Mode Support
- **All Widgets**: Clock, About, Blog List, Music, Whiteboard
- **All Views**: About, Archive (Blog), Projects, Experiments
- **Theme Toggle**: Sun/Moon icon in navigation dock
- **Persistence**: localStorage for theme preference
- **Color Palette**: Warm brown tones (`#2a2420`, `#1f1c1a`)

#### 2. Navigation Redesign (Apple Liquid Glass)
- **Glassmorphism**: Transparent blur effect with soft shadows
- **Hover Effects**: Scale + background change per item
- **Active Indicator**: Coral dot below active menu
- **Theme Adaptive**: Different opacity for dark/light modes

#### 3. Natural Light Animation
- **Replaced**: Grain texture overlay
- **New Effect**: 3 animated light orbs with smooth movement
- **Keyframes**: `naturalLight1`, `naturalLight2`, `naturalLight3`
- **Theme Aware**: Different colors for dark/light modes

#### 4. Widget Improvements
- **Chat Widget Merged**: Added "Chat with me" button to About widget
- **Removed**: Separate Chat widget (6 → 5 widgets)
- **Collision Avoidance**: Widgets don't overlap when randomly placed
- **Mobile Order**: Clock → About → Blog → Whiteboard → Music → Logo

#### 5. View Improvements
- **About View**: Removed tilt (rotate-1), full dark mode support
- **Archive/Projects**: Unified color palette matching Home dark mode
- **Profile Image**: Updated to github.com/kimtoma.png

#### 6. Files Modified
- `App.tsx` - Theme state, card templates factory, natural light animation
- `Dock.tsx` - Liquid glass style, hover effects, theme toggle
- `AboutWidget.tsx` - Chat button, dark mode colors
- `AboutView.tsx` - Dark mode, removed tilt
- `BlogView.tsx` - Dark mode colors
- `ProjectsView.tsx` - Dark mode colors
- `ClockWidget.tsx` - Dark mode clock face
- `BlogListWidget.tsx` - Dark mode text/borders
- `MusicWidget.tsx` - Dark mode player
- `WhiteboardWidget.tsx` - Dark mode canvas/toolbar
- `index.html` - Removed grain overlay CSS

#### 7. Removed Files
- `ChatWidget.tsx` - Merged into AboutWidget
- `GrainOverlay.tsx` - Replaced with natural light animation
- `LampWidget.tsx` - Replaced with simple theme toggle

---

## 2026-01-30: kimtoma O/S - Interactive Portfolio

### ✅ Completed

#### 1. "Her" Movie-Inspired Interactive Portfolio
- **Location**: `/os-landing/`
- **URL**: https://kimtoma.com (Cloudflare Pages)
- **Replaced**: Jekyll static site → React interactive portfolio
- **Features**:
  - 3D floating card UI with parallax effects
  - Drag-and-drop widget cards
  - Smooth animations and transitions
  - Dark/Light theme with circular reveal animation
  - Mobile-responsive design

#### 2. Widget Cards
- **Profile Widget**: kimtoma intro with GitHub profile image
- **Blog List Widget**: Recent 5 posts from kimtoma.com
- **Chat Widget**: Link to chat.kimtoma.com AI chatbot
- **Email Widget**: Contact via mailto link

#### 3. Full-Page Views
- **Archive (Blog)**: Year-grouped list (paulstamatiou.com style)
  - 27 posts from 2013-2023
  - Clean, minimal list design
- **Projects**: Section-grouped list with real data
  - Main Projects: PAIGE (iF 2021), Mossland (iF 2020), Wenzi
  - Side Projects: kimtoma O/S, chat.kimtoma.com, Momat Stickers, Playlisteem
  - Translations: 3 webactually.com articles

#### 4. Tech Stack
- React 19 + TypeScript
- Vite 6.4 (production build)
- Tailwind CSS 4 (CDN)
- Framer Motion (animations)
- Deployed via Cloudflare Pages

---

## 2026-01-30: Unified Design System

### ✅ Completed

#### 1. Unified Color Palette (wabi.ai inspired)
- **Warmer tones**: Pure grays → Warm-tinted grays (hue: 40)
- **Primary**: `hsl(211, 100%, 50%)` → `hsl(215, 85%, 55%)` (warmer blue)
- **Dark BG**: `hsl(0, 0%, 7%)` → `hsl(230, 15%, 8%)` (night sky tint)
- **Light BG**: `hsl(0, 0%, 100%)` → `hsl(40, 30%, 99%)` (warm cream)
- **Accent Coral**: `hsl(12, 85%, 62%)` for special moments

#### 2. Typography Updates
- **Font size**: 18px → 16px (cleaner look)
- **Heading letter-spacing**: `-0.025em` (tighter)
- **Heading weight**: 700 → 600 (semibold)

#### 3. Unified Border Radius
- **All components**: 12px (`--radius-lg`)
- **Chat bubbles**: 24px (kept for messaging feel)

#### 4. Unified Interactions
- **Nav links**: Padding + border-radius + hover background
- **Hover effect**: Secondary background + primary text color
- **Active effect**: `scale(0.98)` on click
- **Focus**: `outline: 2px solid primary`

#### 5. Files Modified
**Jekyll (kimtoma.com)**:
- `_sass/_variables.scss` - Color palette, typography tokens
- `_sass/_base.scss` - Link styles, scrollbar, selection
- `_sass/_type.scss` - Heading letter-spacing
- `_sass/_masthead.scss` - Nav hover effects

**Chat App (chat.kimtoma.com)**:
- `src/index.css` - CSS variables, hover states
- `src/components/ui/button.tsx` - Ghost button hover, active states
- `tailwind.config.js` - Color tokens, spacing scale

---

## 2026-01-30: Social Media Integration

### ✅ Completed

#### 1. GitHub Activity Integration
- **API**: GitHub REST API (Commits API)
- **Authentication**: Personal Access Token (avoids rate limits)
- **Features**:
  - Fetches recent commits from public repositories
  - Shows commit message, date, and repository name
  - 1-hour caching in D1 settings table
- **Format**: `📎 [커밋 메시지](URL) ↗`
- **Debug Endpoint**: `GET /debug/github`

#### 2. Strava Activity Integration
- **API**: Strava API v3 with OAuth 2.0
- **Authentication Flow**:
  - `GET /strava/auth` - Redirect to Strava authorization
  - `GET /strava/callback` - Handle OAuth callback, store tokens
- **Features**:
  - Fetches recent activities (runs, rides, walks, etc.)
  - Shows activity name, type, distance, duration
  - Auto token refresh when expired
  - Links to Strava activity pages
- **Format**: `📎 [활동명](URL) ↗ (거리, 시간)`
- **Storage**: D1 settings table (access_token, refresh_token, athlete_id)

#### 3. YouTube Activity Integration
- **API**: YouTube Data API v3
- **Authentication**: API Key
- **Features**:
  - Fetches recent uploads from channel
  - Shows video title and upload date
  - 1-hour caching in D1 settings table
- **Channel**: 김경수 원본 박물관 (UCJqcDKuaF5Swqzb3d6YnJIA)
- **Format**: `🎬 📎 [영상 제목](URL) ↗`
- **Debug Endpoint**: `GET /debug/youtube`

#### 4. Environment Variables
New secrets added to Cloudflare Worker:
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `STRAVA_CLIENT_ID` - Strava OAuth App Client ID
- `STRAVA_CLIENT_SECRET` - Strava OAuth App Client Secret
- `YOUTUBE_API_KEY` - YouTube Data API Key

#### 5. Theme Toggle Animation (kimtoma.com)
- **Effect**: Circular reveal animation when switching dark/light mode
- **Technology**: View Transition API
- **Animation**: Circle expands from toggle button position
- **Fallback**: Instant switch for browsers without API support
- **Reference**: paulstamatiou.com style

---

## 2026-01-29: Chat UX Improvements & Smart Features

### ✅ Completed (Session 3)

#### 1. Smart Chat Bubble Splitting
- **Paragraph Grouping**: Short paragraphs grouped together (min 100 chars per bubble)
- **Natural Flow**: Single bubble during typing, split after completion
- **Better Readability**: Long responses split into digestible chunks

#### 2. Dynamic Date Context
- **Auto-injection**: Current date added to system prompt (Korean timezone)
- **Accurate Calculations**: AI can calculate ages, months correctly
- **Format**: "2026년 1월 29일 수요일"

#### 3. Response Quality Control
- **Length Limit**: `maxOutputTokens: 500` for concise answers
- **No Self-questioning**: AI prohibited from asking follow-up questions
- **Style**: 2-3 sentences, to the point

#### 4. Blog Link Integration
- **Related Posts**: AI includes relevant blog links in responses
- **Format**: `📎 [글 제목](URL) ↗`
- **Separate Bubble**: Links displayed in distinct bubble for clarity

#### 5. Family Info in System Prompt
- Added spouse and child information
- AI can answer personal questions accurately

---

## 2026-01-29: Blog RAG, Feedback Feature & UI Improvements

### ✅ Completed (Session 2)

#### 1. User Feedback Feature (Like/Dislike)
- **Chat UI**: Added thumbs up/down buttons on AI responses
- **Copy Button**: One-click copy AI responses to clipboard
- **API Endpoints**:
  - `POST /feedback` - Submit feedback (like/dislike)
  - `GET /admin/feedback` - View feedback stats and list
- **Admin Dashboard**: New Feedback page with stats and table
- **Storage**: D1 `message_feedback` table

#### 2. Blog RAG (Retrieval-Augmented Generation)
- **Purpose**: AI references blog posts and profile info for personalized answers
- **Infrastructure**:
  - Cloudflare Vectorize (vector database, free tier)
  - Cloudflare Workers AI (bge-base-en-v1.5 embeddings)
- **Indexed Content**:
  - 27 blog posts from `_posts/`
  - Profile info from `llms-full.txt`
  - 149 vector chunks total
- **API Endpoints**:
  - `POST /admin/index-blog` - Index blog posts (batch processing)
  - `GET /admin/rag-stats` - View vector index stats
- **Indexing Script**: `cloudflare-worker/scripts/index-blog.js`

#### 3. GitHub Profile Image Integration
- **Header**: Profile image in top-left corner
- **Empty State**: Profile image on welcome screen
- **AI Responses**: Profile thumbnail next to each response
- **Loading/Typing States**: Consistent profile image display
- **Source**: `https://github.com/kimtoma.png`

#### 4. Asset Path Fix
- Changed from absolute (`/assets/`) to relative (`./assets/`) paths
- Fixed white screen issue on `kimtoma.com/chat/`
- Updated `vite.config.ts` with `base: './'`

---

## 2026-01-29: Admin Dashboard Redesign & System Prompt Management

### ✅ Completed (Session 1)

### ✅ Completed

#### 1. Admin Dashboard with Sidebar Navigation
- **Location**: `/chat/admin.html`
- **URL**: `https://chat.kimtoma.com/admin.html`
- **Layout**:
  - Left sidebar navigation (Dashboard / System Prompt)
  - Responsive design with mobile hamburger menu
  - shadcn/ui design system matching chat.kimtoma.com
  - HSL color variables (--primary: 211 100% 50% = #0080ff)
- **Dashboard Page**:
  - Stats cards (total messages, sessions, daily usage with percentage)
  - Recent conversations table with session details
  - Click-to-copy Session ID
  - Conversation replay modal
- **System Prompt Page**:
  - Full-page editor for AI persona configuration
  - Real-time save to D1 database
  - Character count display

#### 2. System Prompt Management
- **Storage**: D1 `settings` table (key-value store)
- **API Endpoints**:
  - `GET /admin/system-prompt` - Retrieve current prompt
  - `PUT /admin/system-prompt` - Update prompt
- **Features**:
  - Dynamic system prompt loading per chat request
  - Prevents hallucination by centralizing AI persona config
  - Updated with correct user info from about.md

#### 3. Email Alerts for Quota Warnings
- **Service**: Resend (free tier: 3,000 emails/month)
- **Thresholds**: 50%, 80%, 95% of daily write limit
- **Features**:
  - HTML formatted alert emails with usage statistics
  - Duplicate prevention via alert_logs table in D1
  - Test alert endpoint: `POST /admin/test-alert`
  - Color-coded alerts (blue/yellow/red by severity)
- **Recipients**: kimtoma@gmail.com, kyungsoo.kim@kt.com
- **From**: alerts@kimtoma.com (verified domain)

#### 4. Sentiment Analysis
- **Location**: Admin Dashboard → Sentiment page
- **API Endpoints**:
  - `GET /admin/sentiment` - Get sentiment data and stats
  - `POST /admin/sentiment/analyze` - Analyze sessions
- **Features**:
  - Gemini-powered conversation mood analysis
  - Sentiment categories: positive, negative, neutral, mixed
  - Score: 0.0 (negative) to 1.0 (positive)
  - Auto-generated conversation summary
  - Batch analysis for unanalyzed sessions
- **Storage**: D1 `session_sentiment` table

#### 5. kimtoma.com SVG Icons
- Replaced emoji theme toggle (🌞/🌚) with SVG icons
- Matching minimal style from chat.kimtoma.com

---

## 2026-01-28: Chat Logging System with Cloudflare D1

### ✅ Completed

#### 1. Cloudflare Worker with D1 Database Logging
- **Location**: `/cloudflare-worker/`
- **URL**: `https://gemini-proxy-with-logging.kimtoma.workers.dev`
- **Features**:
  - Gemini API proxy (gemini-2.0-flash model)
  - kimtoma persona via System Prompt
  - D1 SQLite database integration
  - Session management (track conversations by user)
  - Free tier limits enforcement (100K writes/day, 5M reads/day)
  - Auto-cleanup for data older than 30 days
  - CORS enabled for web access

#### 2. Admin Dashboard (Initial Version)
- **Location**: `/chat/admin.html`
- **URL**: `https://chat.kimtoma.com/admin.html`
- **Features**:
  - Real-time statistics (messages, sessions, daily usage)
  - Conversation logs viewer with pagination
  - Filter by Session ID and Content (keyword search)
  - Export to CSV (Google Sheets compatible)
  - Conversation Replay (chat-style modal)
  - Click-to-copy Session ID
  - Cleanup old data (30+ days)
  - Token-based authentication
  - Dark/Light theme
- **Note**: Redesigned with sidebar navigation on 2026-01-29

#### 3. Chat Client
- **Location**: `/chat-app/`
- **URL**: `https://chat.kimtoma.com`
- **Features**:
  - React + TypeScript + Vite
  - Tailwind CSS + shadcn/ui
  - iMessage-style UI
  - Typing effect (character by character)
  - Session ID generation and persistence
  - Dark/Light theme toggle
  - Mobile-responsive (iOS safe area)
  - Favicon matching kimtoma.com

### 📋 Database Schema

```sql
-- Sessions: Track unique conversations
chat_sessions (id, created_at, last_active, user_ip, user_agent, message_count)

-- Messages: Store all chat messages
chat_messages (id, session_id, role, content, timestamp, token_count)

-- Usage: Track daily API usage for limits
daily_usage (date, write_count, read_count, created_at)

-- Settings: Key-value store for system config (added 2026-01-29)
settings (key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER)

-- Alert Logs: Prevent duplicate email alerts (added 2026-01-29)
alert_logs (id, alert_key TEXT UNIQUE, threshold INTEGER, sent_at INTEGER)

-- Session Sentiment: AI-analyzed conversation mood (added 2026-01-29)
session_sentiment (id, session_id TEXT UNIQUE, sentiment TEXT, sentiment_score REAL, summary TEXT, topics TEXT, analyzed_at INTEGER)

-- Message Feedback: User feedback on AI responses (added 2026-01-29)
message_feedback (id, message_id INTEGER, session_id TEXT, feedback TEXT, comment TEXT, created_at INTEGER, UNIQUE(message_id, session_id))
```

### 🔒 Security

- Admin API protected with Bearer token
- CORS configured for allowed origins
- Rate limiting via daily usage tracking
- IP logging for analytics (partially masked in UI)

### 💰 Free Tier Capacity

**Cloudflare D1 Limits**:
- Storage: 5GB
- Daily writes: 100,000
- Daily reads: 5,000,000

**Estimated Capacity**:
- ~25,000 conversations/day (4 writes per conversation)
- ~750,000 conversations stored (30-day retention)

---

## Previous Work

### 2026-01-27: Chat Interface Styling
- Applied kimtoma.com styling to chat.kimtoma.com
- Added mobile-responsive input positioning
- Updated favicon to match main site

### 2026-01-26: Initial Chat Setup
- Created React + TypeScript chat application
- Integrated Gemini API via Cloudflare Worker
- Implemented iMessage-style UI with typing effects

---

## Future Enhancements

- [x] ~~Email alerts for quota warnings~~ (Completed 2026-01-29)
- [x] ~~System prompt management~~ (Completed 2026-01-29)
- [x] ~~Admin sidebar navigation~~ (Completed 2026-01-29)
- [x] ~~Sentiment analysis on conversations~~ (Completed 2026-01-29)
- [x] ~~User feedback (like/dislike)~~ (Completed 2026-01-29)
- [x] ~~Blog RAG for personalized answers~~ (Completed 2026-01-29)
- [x] ~~GitHub profile image integration~~ (Completed 2026-01-29)
- [x] ~~Smart chat bubble splitting~~ (Completed 2026-01-29)
- [x] ~~Dynamic date context for AI~~ (Completed 2026-01-29)
- [x] ~~Blog post links in responses~~ (Completed 2026-01-29)
- [x] ~~SNS integration~~ (GitHub, Strava, YouTube - Completed 2026-01-30)
- [ ] Conversation statistics per session
- [ ] Advanced filtering (date range, role)
- [ ] Multi-language support for admin panel

---

**Last Updated**: 2026-01-30
**Status**: Active
