import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { corsHeaders, json, badRequest } from './_utils.mjs';

const schema = z.object({
  email: z.string().email(),
  topic: z.string().max(80).optional(),
  consent: z.boolean(),
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST only' });

  const conn = process.env.NEON_DATABASE_URL;
  if (!conn) return badRequest('NEON_DATABASE_URL fehlt (Netlify env var).');

  try {
    const body = JSON.parse(event.body || '{}');
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest('Bad payload', parsed.error.flatten());
    if (!parsed.data.consent) return badRequest('Einwilligung erforderlich (DSGVO).');

    const sql = neon(conn);
    const topic = parsed.data.topic || 'general';

    await sql`
      INSERT INTO leads (email, topic, consent)
      VALUES (${parsed.data.email}, ${topic}, ${parsed.data.consent})
      ON CONFLICT (email, topic) DO NOTHING;
    `;

    return json(200, { ok: true, message: 'Danke! Wir melden uns.' });
  } catch (e) {
    console.error(e);
    return json(500, { ok: false, error: 'Internal error' });
  }
};
