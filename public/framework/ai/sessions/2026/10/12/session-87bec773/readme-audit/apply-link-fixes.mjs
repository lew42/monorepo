import fs from 'fs';
const fx = [
 ['public/framework/ux/Dictate/readme.md','./playground/doc/Playground-notes.md','./playground/doc/decisions.md'],
 ['public/framework/styles/rules/readme.md','[`doc/file/`](./doc/file/) one note per file in this directory','`doc/files.jsonl` lists the files in this directory'],
 ['public/framework/ui/scale/readme.md','/framework/ai2/2026/09/28/figma-sept-2026/','/framework/ai/2026/09/28/figma-sept-2026/'],
 ['public/framework/ext/Refine/readme.md','(/framework/servex/doc/echo.md)','(../../../../Servex/doc/echo.md)'],
 ['public/framework/ai/archive/ai2/readme.md','../../2026-10-09/ai2-merge/manifest.json','../../sessions/2026/10/09/session-6784f3f5/ai2-merge/manifest.json'],
 ['public/framework/ai/doc/readme.md','../2026-10-12/claude-md-consolidate/review.md','../sessions/2026/10/12/session-3b391f22/claude-md-consolidate/review.md'],
 ['public/framework/design/readme.md','[new-page skill](/framework/ai/skills/new-page/)','new-page skill (`.claude/skills/new-page/SKILL.md`)'],
];
for (const [f,a,b] of fx){const t=fs.readFileSync(f,'utf8'); if(!t.includes(a)){console.log('MISS',f);continue} fs.writeFileSync(f,t.split(a).join(b));}
