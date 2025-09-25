import fs from 'fs';
const files = ['./scripts/check-inngest.mjs','./scripts/check-route.mjs'];
for (const f of files) {
  try { if (fs.existsSync(f)) fs.unlinkSync(f); console.log('removed',f);} catch(e){console.error('failed to remove',f,e)}
}
