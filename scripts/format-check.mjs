import fs from 'node:fs';
const mustExist = [
  'site/index.html',
  'netlify/functions/security-check.mjs',
  'site/impressum/index.html',
  'site/datenschutz/index.html',
  'site/agb/index.html'
];
let ok = true;
for (const p of mustExist) {
  if (!fs.existsSync(p)) { console.error('Missing:', p); ok = false; }
}
if (!ok) process.exit(1);
console.log('✅ Files present.');
