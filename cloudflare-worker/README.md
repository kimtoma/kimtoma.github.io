# Chat Kimtoma Cloudflare Worker with D1 Logging

Cloudflare Worker that proxies Gemini API requests and logs all conversations to D1 database with free tier limits enforced.

## Features

- ✅ Gemini API proxy
- ✅ D1 database logging (conversations, sessions, usage)
- ✅ Free tier limits enforced (100K writes/day, 5M reads/day)
- ✅ Admin API for viewing logs and statistics
- ✅ Automatic cleanup of old data
- ✅ CORS enabled

## Free Tier Limits

- **D1 Storage**: 5GB
- **Daily Writes**: 100,000
- **Daily Reads**: 5,000,000
- **Databases**: 10

## Setup

### 1. Install Dependencies

```bash
cd cloudflare-worker
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create D1 Database

```bash
npx wrangler d1 create chat-logs-db
```

Copy the `database_id` from the output and update it in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "chat-logs-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

### 4. Initialize Database Schema

```bash
npx wrangler d1 execute chat-logs-db --file=./src/schema.sql
```

### 5. Set Environment Secrets

```bash
# Set your Gemini API key
npx wrangler secret put GEMINI_API_KEY
# Enter your Gemini API key when prompted

# Set admin token (generate a random secure token)
npx wrangler secret put ADMIN_TOKEN
# Enter a secure random token (e.g., use `openssl rand -hex 32`)
```

### 6. Deploy to Cloudflare

```bash
npm run deploy
```

The worker will be deployed to `https://gemini-proxy-with-logging.YOUR_SUBDOMAIN.workers.dev`

### 7. Update Chat Client

Update the API endpoint in `/chat/assets/chat.js`:

```javascript
const CONFIG = {
  API_ENDPOINT: 'https://gemini-proxy-with-logging.YOUR_SUBDOMAIN.workers.dev/chat',
  // ... rest of config
};
```

## API Endpoints

### Chat Endpoint

**POST** `/chat`

Request:
```json
{
  "message": "Hello!",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "ai", "content": "Previous response" }
  ],
  "sessionId": "optional-session-id"
}
```

Response:
```json
{
  "response": "AI response",
  "sessionId": "session_1234567890_abc123"
}
```

### Admin Endpoints (Requires Authorization Header)

All admin endpoints require:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**GET** `/admin/stats` - View statistics

Response:
```json
{
  "total_messages": 1234,
  "total_sessions": 567,
  "today_writes": 89,
  "today_reads": 345,
  "daily_write_limit": 100000,
  "daily_read_limit": 5000000,
  "write_limit_percentage": "0.09",
  "recent_sessions": [...]
}
```

**GET** `/admin/logs?limit=100&offset=0&session=SESSION_ID` - View logs

Query parameters:
- `limit`: Number of results (default: 100)
- `offset`: Offset for pagination (default: 0)
- `session`: Filter by session ID (optional)

**POST** `/admin/cleanup` - Delete data older than 30 days

Response:
```json
{
  "deleted_messages": 123,
  "message": "Cleanup completed successfully"
}
```

## Database Schema

### Tables

1. **chat_sessions** - User sessions
   - `id`: Session ID
   - `created_at`: Creation timestamp
   - `last_active`: Last activity timestamp
   - `user_ip`: User IP address
   - `user_agent`: User agent string
   - `message_count`: Number of messages in session

2. **chat_messages** - Individual messages
   - `id`: Auto-increment ID
   - `session_id`: Foreign key to sessions
   - `role`: 'user' or 'ai'
   - `content`: Message content
   - `timestamp`: Message timestamp
   - `token_count`: Token count (optional)

3. **daily_usage** - Usage tracking
   - `date`: Date (YYYY-MM-DD)
   - `write_count`: Number of writes
   - `read_count`: Number of reads
   - `created_at`: Creation timestamp

## Local Development

```bash
# Start local dev server
npm run dev

# View logs
npm run tail
```

## Database Queries

### View recent messages
```bash
npx wrangler d1 execute chat-logs-db --command "SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 10"
```

### View sessions
```bash
npx wrangler d1 execute chat-logs-db --command "SELECT * FROM chat_sessions ORDER BY last_active DESC LIMIT 10"
```

### View usage statistics
```bash
npx wrangler d1 execute chat-logs-db --command "SELECT * FROM daily_usage ORDER BY date DESC LIMIT 7"
```

### Manual cleanup (delete old data)
```bash
# Delete messages older than 30 days
npx wrangler d1 execute chat-logs-db --command "DELETE FROM chat_messages WHERE timestamp < $(date -d '30 days ago' +%s)000"
```

## Monitoring

1. **Cloudflare Dashboard**: Monitor requests, errors, and performance
2. **D1 Console**: View database size and query performance
3. **Admin API**: Check `/admin/stats` for usage statistics

## Cost Estimation (Free Tier)

With 100K writes/day limit:
- ~1,388 conversations/day (assuming 2 messages per conversation × 36 days of retention)
- ~46 conversations/hour
- Storage: Messages older than 30 days are auto-deleted

## Troubleshooting

### Rate limit exceeded
If you see "Daily write limit reached", the worker has hit the 100K writes/day limit. Wait until the next day (UTC) or increase limits with paid plan.

### Database not found
Make sure you've created the D1 database and updated `wrangler.toml` with the correct `database_id`.

### API errors
Check Cloudflare Workers logs:
```bash
npm run tail
```

## Security

- Admin endpoints are protected with Bearer token authentication
- User IP addresses are logged for analysis (consider privacy implications)
- Messages are stored in plaintext in D1 (consider encryption for sensitive data)

## License

MIT
