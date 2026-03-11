/**
 * Test Twilio SMS (emergency module).
 * Usage: node scripts/test-twilio-sms.js [destinationE164]
 * Or set TWILIO_TEST_TO (e.g. +52xxxxxxxxxx) in .env
 *
 * Twilio trial: "to" must be a verified number in Twilio console.
 */

const path = require('path');
const fs = require('fs');

// Load .env from project root
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const sid = process.env.TWILIO_SID;
const token = process.env.TWILIO_TOKEN;
const from = process.env.TWILIO_PHONE;
const to = process.env.TWILIO_TEST_TO || process.argv[2];

const message = '🚨 [SafeBox MX] Test de emergencia - Twilio OK. Este es un mensaje de prueba.';

function main() {
  if (!sid || !token) {
    console.error('Missing TWILIO_SID or TWILIO_TOKEN in .env');
    process.exit(1);
  }
  if (!from) {
    console.error('Missing TWILIO_PHONE (Twilio sender number) in .env');
    process.exit(1);
  }
  if (!to) {
    console.error('Missing destination. Set TWILIO_TEST_TO in .env or run: node scripts/test-twilio-sms.js +52xxxxxxxxxx');
    process.exit(1);
  }

  const twilio = require('twilio');
  const client = twilio(sid, token);
  const body = message.length > 320 ? message.substring(0, 317) + '...' : message;

  console.log('Sending test SMS via Twilio...');
  console.log('From:', from, 'To:', to);

  client.messages
    .create({ body, from, to })
    .then((msg) => {
      console.log('OK. SID:', msg.sid);
    })
    .catch((err) => {
      console.error('Twilio error:', err.message || err);
      process.exit(1);
    });
}

main();
