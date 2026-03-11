/**
 * Test OPENAI_API_KEY for chatbot.
 * Usage: node scripts/test-openai-key.js
 * Loads .env and sends one minimal request to OpenAI.
 */

const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function main() {
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in .env');
    process.exit(1);
  }

  console.log('Testing OpenAI API key (model:', model, ')...');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Di solo: OK' }],
      max_tokens: 10,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('OpenAI request failed:', res.status, err.error?.message || res.statusText);
    if (res.status === 401) console.error('→ Invalid or expired API key.');
    if (res.status === 429) console.error('→ Rate limit or quota exceeded.');
    process.exit(1);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? '(no content)';
  console.log('OK. OpenAI key is valid. Reply:', reply.trim());
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
