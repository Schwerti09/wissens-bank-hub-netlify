# Wissens-Bank Hub (Netlify) — minimalistisch & deploy-sicher

Static site (HTML/CSS/JS) + Netlify Functions:
- Security-Quickcheck (heuristisch, kein Scanning)
- optional Lead-Speicherung in Neon PostgreSQL (nur mit Consent)

## Deploy (Netlify)
- Build command: `npm run build`
- Publish directory: `site`
- Functions: `netlify/functions` (via netlify.toml)

### Optional: Neon
1) In Neon `database/schema.sql` ausführen  
2) Netlify env var setzen: `NEON_DATABASE_URL`

## Local dev
```bash
npm install
npx netlify dev
```

## API
- POST /api/security-check
- POST /api/lead
- GET  /api/health
