// Usage: node trim.mjs  — moves named sections verbatim into doc/readme-full-2026-10-12.md, leaves one-line pointers, verifies sentences.
import fs from 'fs'; import path from 'path';
const jobs = [
 ['public/framework/core/Page/readme.md', ['Architecture','The sub-systems','Five ways to make a page']],
 ['public/framework/ai/sessions/readme.md', ['Use','Where the real dollars come from','Where the data comes from']],
 ['Servex/readme.md', ['The six parts','The Servex mastermind is always on','The voice pair','Limits we hit','Dev servers: Servex','Big text moves','Is the machine melting','The log is single-writer','Adding tools to the MCP','Watch out','Surviving a reboot']],
];
const slug = h => h.toLowerCase().replace(/[^a-z0-9 -]/g,'').trim().replace(/ /g,'-');
for (const [f, names] of jobs) {
  const orig = fs.readFileSync(f,'utf8'); const lines = orig.split('\n');
  const idx = lines.map((l,i)=>/^## /.test(l)?i:-1).filter(i=>i>=0);
  const out = [], moved = []; let i = 0;
  while (i < lines.length) {
    if (idx.includes(i)) {
      const end = idx.find(j=>j>i) ?? lines.length;
      const head = lines[i].slice(3);
      if (names.some(n=>head.startsWith(n))) {
        moved.push(lines.slice(i,end).join('\n').trimEnd());
        out.push(`- **${head.replace(/\s*\(.*$/,'')}** — moved to [doc/readme-full-2026-10-12.md](doc/readme-full-2026-10-12.md#${slug(head)}), verbatim.`); i = end; continue;
      }
    }
    out.push(lines[i]); i++;
  }
  const docf = path.join(path.dirname(f),'doc','readme-full-2026-10-12.md');
  fs.mkdirSync(path.dirname(docf),{recursive:true});
  const body = `# Full sections moved out of readme.md (2026-10-12)\n\nTrimmed to an index per CLAUDE.md; wording kept as it was.\n\n${moved.join('\n\n')}\n`;
  fs.appendFileSync(docf, (fs.existsSync(docf)?'\n':'')+body);
  fs.writeFileSync(f, out.join('\n'));
  const now = out.join('\n') + '\n' + fs.readFileSync(docf,'utf8');
  const sents = orig.split(/(?<=[.!?])\s+|\n/).map(s=>s.trim()).filter(s=>s.length>3);
  const miss = sents.filter(s=>!now.includes(s));
  console.log(f, 'lines', lines.length,'->',out.length, 'sentences', sents.length, 'missing', miss.length);
}
