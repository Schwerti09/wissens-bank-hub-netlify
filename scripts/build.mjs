import fs from 'node:fs';
if (!fs.existsSync('site/index.html')) {
  console.error('site/index.html not found.');
  process.exit(1);
}
console.log('✅ Static site ready. No build step required.');
