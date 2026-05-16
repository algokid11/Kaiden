const express = require('express');
const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  TO_NUMBER,
  WEBHOOK_SECRET,
  PORT = 3000,
} = process.env;

const required = {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  TO_NUMBER,
  WEBHOOK_SECRET,
};
for (const [k, v] of Object.entries(required)) {
  if (!v) {
    console.error(`Missing required env var: ${k}`);
    process.exit(1);
  }
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const app = express();
app.use(express.json());
app.use(express.text({ type: '*/*' }));

app.get('/', (_req, res) => res.send('ok'));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/webhook/:secret', async (req, res) => {
  if (req.params.secret !== WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { payload = { message: payload }; }
  }
  const message = (payload && (payload.message || payload.alert || payload.text)) || 'TradingView alert';
  const safeMessage = String(message).replace(/[<&>]/g, '').slice(0, 400);

  try {
    const call = await client.calls.create({
      to: TO_NUMBER,
      from: TWILIO_FROM_NUMBER,
      twiml: `<Response><Say voice="alice" loop="2">${safeMessage}</Say></Response>`,
    });
    console.log(`Call placed: ${call.sid} | message="${safeMessage}"`);
    res.json({ ok: true, sid: call.sid });
  } catch (err) {
    console.error('Twilio error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
