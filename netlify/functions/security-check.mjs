import { badRequest, corsHeaders, json, checkTargetSchema } from './_utils.mjs';

function classifyTarget(target) {
  const t = target.trim();
  const isIP = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(t);
  const isDomain = /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.(?:[A-Za-z]{2,63})(?:\.[A-Za-z]{2,63})?$/.test(t);
  const isURL = /^https?:\/\//i.test(t);
  return { isIP, isDomain, isURL };
}

function riskScore(kind, target) {
  let score = 0;
  if (kind.isIP) score += 2;
  if (kind.isURL) score += 1;
  if (!kind.isDomain && !kind.isIP && !kind.isURL) score += 2;
  if (/\btest\b|\bstaging\b|\bdev\b/i.test(target)) score += 1;
  if (/\badmin\b|\blive\b/i.test(target)) score += 1;
  return Math.min(5, score);
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST only' });

  try {
    const body = JSON.parse(event.body || '{}');
    const parsed = checkTargetSchema.safeParse(body);
    if (!parsed.success) return badRequest('Bitte IP/Domain/URL eingeben', parsed.error.flatten());

    const target = parsed.data.target.trim();
    const kind = classifyTarget(target);
    const score = riskScore(kind, target);

    const vulnerable = score >= 3;
    const message = vulnerable
      ? '⚠️ Erhöhtes Risiko: Bitte sofort die Hardening-Checkliste abarbeiten.'
      : '✅ Kein akuter Hinweis in der Schnellprüfung. Trotzdem: Hardening ist Pflicht.';

    const checklist = [
      'API-Keys rotieren (OpenAI/Anthropic/etc.) und alte Keys deaktivieren',
      'Firewall aktivieren (nur benötigte Ports offen)',
      'SSH: Key-Auth, Root-Login aus, Fail2ban',
      'Automatische Updates + Reboots planen',
      'Secrets niemals im Repo/.env committed',
      'Reverse Proxy + HTTPS (HSTS), Rate-Limits',
      'Backups: täglich + Restore-Test',
      'Monitoring: Uptime + Logs + Alerts',
    ];

    return json(200, {
      ok: true,
      target,
      classification: kind,
      riskScore: score,
      vulnerable,
      message,
      checklist,
      timestamp: new Date().toISOString(),
      privacy: 'Wir speichern keine Targets (kein Logging in dieser Function).',
    });
  } catch (e) {
    return json(500, { ok: false, error: 'Internal error' });
  }
};
