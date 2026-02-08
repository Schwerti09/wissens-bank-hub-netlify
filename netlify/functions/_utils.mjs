import { z } from 'zod';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

export function json(statusCode, obj) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(obj) };
}

export function badRequest(message, details) {
  return json(400, { ok: false, error: message, details });
}

export const checkTargetSchema = z.object({
  target: z.string().min(3).max(255),
});
