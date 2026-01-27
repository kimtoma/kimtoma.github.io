# Gemini API Proxy Worker

Cloudflare Worker for proxying requests to Google Gemini API.

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Set Environment Variables

```bash
# Set your Gemini API key
wrangler secret put GEMINI_API_KEY

# Set allowed origins (your chat domain)
wrangler secret put ALLOWED_ORIGINS
# Enter: https://chat.kimtoma.com
```

### 4. Deploy Worker

```bash
cd workers/gemini-proxy
wrangler deploy
```

After deployment, you'll get a worker URL like:
`https://gemini-proxy.YOUR_SUBDOMAIN.workers.dev`

### 5. Update Frontend Configuration

Edit `/chat/chat.js` and update the API endpoint:

```javascript
const CONFIG = {
  API_ENDPOINT: 'https://gemini-proxy.YOUR_SUBDOMAIN.workers.dev/chat',
  // ...
};
```

## Custom Domain (Optional)

To use a custom domain like `api.kimtoma.com`:

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker (`gemini-proxy`)
3. Go to Settings → Triggers → Add Custom Domain
4. Enter your domain: `api.kimtoma.com`
5. Update `API_ENDPOINT` in chat.js accordingly

## Testing

Test the worker locally:

```bash
wrangler dev
```

Then update chat.js temporarily:
```javascript
API_ENDPOINT: 'http://localhost:8787/chat'
```

## Monitoring

View logs:
```bash
wrangler tail
```

## Security Notes

- Never commit your API key to git
- Always use `wrangler secret` to set sensitive data
- Update `ALLOWED_ORIGINS` to restrict access to your domain only
- Consider adding rate limiting for production use
