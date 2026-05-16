# tv-twilio

TradingView → Twilio voice-call relay. Receives a webhook from TradingView and triggers a phone call that reads the alert message out loud.

## Setup

### 1. Twilio
- Buy a phone number with Voice capability
- Grab Account SID and Auth Token from the Console

### 2. Deploy to Railway
- railway.app → New Project → Deploy from GitHub repo → pick this repo
- Add these environment variables in the Variables tab:

| Variable | Value |
| --- | --- |
| `TWILIO_ACCOUNT_SID` | from Twilio Console |
| `TWILIO_AUTH_TOKEN` | from Twilio Console |
| `TWILIO_FROM_NUMBER` | your Twilio number, E.164 (`+15551234567`) |
| `TO_NUMBER` | your phone, E.164 |
| `WEBHOOK_SECRET` | long random string |

- Settings → Networking → Generate Domain. Copy the URL.

### 3. Test
Replace `URL` and `SECRET`:

```bash
curl -X POST "https://YOUR-APP.up.railway.app/webhook/SECRET" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test alert from curl"}'
```

You should get `{"ok":true,"sid":"..."}` and a phone call within a few seconds.

### 4. TradingView
In an alert, set the Webhook URL to:

```
https://YOUR-APP.up.railway.app/webhook/SECRET
```

Message body (JSON):

```json
{"message":"{{ticker}} crossed {{close}}"}
```

## Endpoints
- `GET /health` — healthcheck
- `POST /webhook/:secret` — trigger a call; body `{ "message": "..." }`

## Local dev
```bash
npm install
TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM_NUMBER=+1... TO_NUMBER=+1... WEBHOOK_SECRET=test npm start
```
