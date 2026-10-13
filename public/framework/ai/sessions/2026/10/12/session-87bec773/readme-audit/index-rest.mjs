// For each readme with unindexed child modules, append one bullet per child: link + its own readme's first heading/line (computed).
import fs from 'fs'; import path from 'path';
const rows = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
for (const r of rows.filter(r=>r.missing.length)) {
  const dir = path.dirname(r.file); let t = fs.readFileSync(r.file,'utf8');
  const out = r.missing.map(k => {
    const rd = path.join(dir,k,'readme.md'); let d = '';
    if (fs.existsSync(rd)) { const l = fs.readFileSync(rd,'utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!/^(```|<)/.test(s)); d = (l.find(s=>/^#/.test(s))||l[0]||'').replace(/^#+\s*/,'').replace(/\s+/g,' ').slice(0,110); }
    return `- [${k}](./${k}/)${d?' — '+d:''}`; });
  if (!/## Also here/.test(t)) t = t.replace(/\n*$/,'\n') + '\n## Also here (readme audit, 2026-10-13)\n'; else t = t.replace(/\n*$/,'\n');
  fs.writeFileSync(r.file, t + out.join('\n') + '\n'); console.log(r.file, out.length);
}
