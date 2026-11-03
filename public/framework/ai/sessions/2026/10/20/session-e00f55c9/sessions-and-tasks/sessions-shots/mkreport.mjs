import fs from "node:fs";
const r=JSON.parse(fs.readFileSync("results.json"));const r2=JSON.parse(fs.readFileSync("results2.json"));
for(const x of r2){const i=r.findIndex(y=>y.p===x.p&&y.w===x.w);r[i]=x;}
const S="/framework/ai/sessions/2026/10/20/session-e00f55c9/";
const label=p=>p.replace(S,"S/").replace("/framework/ai/sessions/","")||"sessions/";
const cols=p=>p.startsWith(S)||/session-00324b25|voice-2026|cloud-voice/.test(p);
let rows=[],failPages=new Set();
for(const x of r){
  const why=[],c=[];
  if(x.errs||x.f404){why.push(`${x.errs} console errors (first: ${x.err1?.replace(/Failed to load resource: the server responded with a status of /,"")}), ${x.f404} failed requests (first: ${x.f1})`);c.push("A");}
  if(x.w==400){why.push("tab bar clipped (SESSIONS touches edge, TESTS unreachable)");c.push("C");}
  if(cols(x.p)&&x.w>=1200&&x.w<3440){why.push("first column clipped under the sidebar; tab label cut (\"Sessior\")");c.push("B");}
  if(cols(x.p)&&x.w==3440){why.push("empty first column, wasted space");c.push("B");}
  if(x.p=="/framework/ai/sessions/"&&x.w==1920){why.push("table names ellipsized (\"Session and task sy…\"), cost column wide");c.push("D");}
  if(x.p==S){why.push("report tab empty: \"Cost: not tracked\", all-dash table, 0 agents");c.push("E");}
  if(/^\/framework\/ai\/sessions\/2026\/(10\/)?$/.test(x.p)&&x.w>=1200){why.push("side columns list task folders (08/12/apps) not sessions");c.push("E");}
  const f=why.length;if(f){failPages.add(x.p);}
  rows.push(`| ${label(x.p)} | ${x.w} | ${f?"FAIL":"pass"} | ${f?why.join("; ")+" ["+[...new Set(c)].join(",")+"]":"no errors, no horizontal scroll"} | [shot](${x.file}) |`);
}
const fails=rows.filter(l=>l.includes("| FAIL |")).length;
const nPages=new Set(r.map(x=>x.p)).size;
const md=`# Sessions pages: shots at 400, 1200, 1920, 3440

Main site, headless, 2026-10-23. ${failPages.size} of ${nPages} pages fail at at least one width; ${fails} of ${r.length} page × width rows fail. No page scrolls horizontally (document width = viewport at every row). Console errors and 404s are counted by script (\`shoot.mjs\`, \`results.json\`); layout reasons are from reading the shots (rows of the same page structure follow the shots I opened; every shot is linked).

## Worst problems first (cause letters in the table)
- **A. 404s on every deep page** (60–110 console errors per page, 200–350 failed requests): day \`files\` and \`page\` streams, \`session-e00f55c9/page.js\`, each task's \`task\` log, \`requirements.md\`, for every task in the column tree. Covered by **mastermind-deputy** (Store.js 404s). Year and month pages: 6–12 errors at 1920/3440 only (\`2026/files\`, \`10/page\` streams).
- **B. Column layout**: the first column is cut off under the sidebar at 1200 and 1920 (its text starts mid-word: "01/card-…" shows as "/card-…"), tab labels are cut ("Sessior"), and at 3440 the first column is empty. Covered by **mastermind-page** (column layout).
- **C. 400 px header**: the AI tab bar runs to the screen edge (SESSIONS touching it, TESTS not reachable); routine chips and detail tables are cut at the right. Not covered by either owner.
- **D. Sessions table at 1920**: names ellipsized while the cost column has spare width. Not covered.
- **E. Wrong or empty content**: the session-e00f55c9 report tab shows nothing but "Cost: not tracked" and a table of dashes; the 2026 and 2026/10 side columns list task folders (08/12/apps, 01/chat-autoscroll) instead of sessions. Not covered.
- One timeout: \`session-e00f55c9/sessions-and-tasks/\` never reached network-idle at 1920 and 3440 in the first run (30 s); it loaded with a plain load wait (those two rows are from that second run). Live streams keep that page busy; counted under A.

## Every page × width

| page (S = ${S}) | width | result | reason | shots |
|---|---|---|---|---|
${rows.join("\n")}
`;
fs.writeFileSync("report.md",md);console.log(failPages.size,nPages,fails,r.length);
