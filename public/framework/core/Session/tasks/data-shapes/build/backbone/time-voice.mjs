import fs from "node:fs";
import { register } from "node:module";
import { pathToFileURL } from "node:url";
const root = process.argv[2];
register(pathToFileURL(root + "/Servex/agents/site-hooks.mjs").href, import.meta.url);
const { default: Session } = await import(pathToFileURL(root + "/public/framework/core/Session/Session.js").href);
const lines = fs.readFileSync("C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl", "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const ms = []; let s;
for (let i = 0; i < 7; i++){ const t = performance.now(); s = Session.replay(lines); ms.push(performance.now() - t); }
console.log(JSON.stringify({ ms: ms.map(m => Math.round(m)), progress: s.progress?.() }));
