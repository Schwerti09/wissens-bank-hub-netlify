import { json, corsHeaders } from './_utils.mjs';
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  return json(200, { ok: true, service: 'wissens-bank-hub', time: new Date().toISOString() });
};
