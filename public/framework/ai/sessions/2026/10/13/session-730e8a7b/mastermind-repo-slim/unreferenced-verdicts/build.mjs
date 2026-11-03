import fs from "node:fs"; import path from "node:path";
const D = path.dirname(new URL(import.meta.url).pathname.replace(/^\//,""));
let a = [1,2,3,4,5,6].flatMap(i => JSON.parse(fs.readFileSync(`${D}/verdicts-${i}.json`,"utf8")));
const sizes = Object.fromEntries(JSON.parse(fs.readFileSync(`${D}/candidates.json`,"utf8")).map(r => [r.file, r.size]));
// sonnet spot-check overrides (evidence read in the files)
const OV = {
 "public/framework/core/Page/card/card.css": ["runtime-loaded","core/Page/card/page.js:7 View.stylesheet(import.meta, \"card.css\")"],
 "public/framework/core/Page/card/doc/inventory.md": ["record","listed in card/doc/files.jsonl; linked from doc/system.md:11; the card module is superseded but its history is the record"],
 "public/framework/core/Page/card/doc/system.md": ["record","listed in card/doc/files.jsonl; cited by card/depth.js:8; the owner's 2026-09-29 card decision"],
 "public/framework/ext/Ask/mic.js": ["record","ext/Ask/page.js:14 lists it in files:; its header says it is kept on purpose as the smaller reference"],
};
a = a.map(x => OV[x.file] ? {...x, verdict: OV[x.file][0], evidence: OV[x.file][1], spot_checked: "changed"} : x);
fs.writeFileSync(`${D}/verdicts.json`, JSON.stringify(a,null,1));
const c = {}; a.forEach(x => c[x.verdict] = (c[x.verdict]||0)+1);
const short = f => f.replace("public/framework/","");
const dead = a.filter(x => x.verdict==="dead"), bytes = a.reduce((s,x)=>s+sizes[x.file],0);
const L = [`# Unreferenced files: a verdict for each`, "",
`**Of ${a.length} candidates, ${dead.length} are dead.** ${c["runtime-loaded"]} are loaded in a way the census cannot see (almost all a stylesheet or fixture named in code), ${c.record} are notes worth keeping where they are, ${c.misplaced||0} are misplaced. Nothing was moved or deleted. Census: [unreferenced.md](unreferenced.md).`, "",
`## Your list: dead files`, "",
dead.length ? "Ticked = proposed to retire; untick to keep. `node Server/retire-files.mjs --plan` shows the moves, `--apply` does them (into `ai/archive/retired/2026-10-13/`), `--undo` puts them back." : "None. The scripted mover, `Server/retire-files.mjs` (`--plan`, `--apply`, `--undo`), is ready and reads this checklist, so it has nothing to move. Dead files, if the census finds more later, are listed here as `- [x] \`path\`` lines.", "",
...dead.map(x => `- [x] \`${x.file}\` (${sizes[x.file]} B) — ${x.reason}`), "",
`## Why so few`, "",
`The census matches a bare file name only when no other file shares it, so \`card.css\`, \`shell.css\`, \`clean.md\` and every \`page.css\` look unreferenced even when code loads them with \`View.stylesheet(import.meta, "card.css")\`. Haiku found those loads; the Sonnet spot-check below caught four "dead" calls that were wrong. A next census pass should count a quoted bare name in the same folder's \`.js\` as a reference.`, "",
`Spot-check (Sonnet, 15 verdicts read against the files): 11 agreed, 4 changed (the 3 \`core/Page/card\` files and \`ext/Ask/mic.js\`, all "dead" to "runtime-loaded" or "record"). Haiku was too eager only on "dead"; its "runtime-loaded" calls checked out 8 of 8 (Layout.css, baseline.css, timeline.css, shell.css, Refine \`clean.md\` ×3, Part.js shim).`, "",
`Census diff against the 10-13 list: 126 then, ${a.length} now. The ${a.length-126} extra are not isolated: modules moved today (ext/AITask to ai/AITask, the one-tree apply) changed which paths resolve, so some references no longer match. The table below is the current truth. Total size of all candidates: ${bytes} B.`, "",
`## Every file`, "", "| file | verdict | reason | evidence |", "|---|---|---|---|",
...a.map(x => `| \`${short(x.file)}\` | ${x.verdict} | ${x.reason.replace(/\|/g,"/")} | ${String(x.evidence).replace(/\|/g,"/").slice(0,110)} |`), ""];
fs.writeFileSync("public/framework/ai/doc/unreferenced-verdicts.md", L.join("\n"));
console.log(c, bytes);
