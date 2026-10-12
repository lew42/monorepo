// Builds core/Page/doc/asks.md and ai/doc/asks.md from clusters.json + verdicts-*.json. Rerunnable.
import fs from "fs";
const d = import.meta.dirname, root = d + "/../../../../..";
const cl = JSON.parse(fs.readFileSync(d + "/clusters.json", "utf8"));
const V = { page: JSON.parse(fs.readFileSync(d + "/verdicts-page.json", "utf8")), ai: JSON.parse(fs.readFileSync(d + "/verdicts-ai.json", "utf8")) };
const ROUTE = { "page-content-unify": "@mastermind-page-content-unify", "page-ai-api": "@mastermind-page-ai-api" };
const skip = new Set(["inbox-dashboard-cards", "oo-classes-ai-code", "asks-prompts-refine"]); // verifier route not a fit; stays in the doc
const tw = { page: "public/framework/core/Page/doc/asks.md", ai: "public/framework/ai/doc/asks.md" };
const title = { page: "Page system", ai: "AI system" };
const rel = { page: "../../../ai/2026-10-12/asks-by-module/", ai: "../2026-10-12/asks-by-module/" };
const ev = p => p.startsWith("public/") ? p.replace(/^public\/framework\//, "") : null;
for (const m of ["page", "ai"]) {
  const rows = cl.filter(c => c.module === m).map(c => ({ ...c, v: V[m].find(v => v.name === c.name) || {} }));
  const open = rows.filter(r => r.v.status !== "done").sort((a, b) => b.count - a.count);
  const done = rows.filter(r => r.v.status === "done");
  const link = (r) => (r.v.evidence || []).filter(e => e.endsWith(".md") && e.startsWith("public/") && fs.existsSync(root + "/" + e)).slice(0, 2).map(e => `[${e.split("/").slice(-2).join("/")}](/${e.replace(/^public\//, "")})`).join(", ");
  const route = r => { const x = r.v.route; return ROUTE[x] && !skip.has(r.name) ? ` Routed to ${ROUTE[x]}.` : x === "voice" && r.name === "realtime-dictation-tasks" ? " Routed to @mastermind-voice-to-session-page." : ""; };
  let t = `# ${title[m]}: the owner's asks, merged (2026-10-12)\n\nThe owner's own prompts that touch the ${title[m].toLowerCase()}, tagged by Haiku, folded into one ask each, then checked against the code by Sonnet. **Open asks first**, most-repeated first; done asks at the bottom. The count is how many separate prompts asked it. Method, accuracy numbers and the rerunnable scripts: [asks-by-module](${rel[m]}STATE.md).\n\n## Open or partly done\n\n`;
  open.forEach((r, i) => { t += `${i + 1}. **${r.name}** (${r.count}x, ${r.first.slice(0, 10)} to ${r.last.slice(0, 10)}, ${r.v.status}): ${r.ask} *Open:* ${r.v.open || "unchecked"} *Unblocks:* ${r.v.unblocks || "-"}${route(r)} ${link(r)}\n`; });
  t += `\n## Done\n\n`;
  t += done.map(r => `- **${r.name}** (${r.count}x): ${r.v.done}`).join("\n") + "\n";
  t += `\n## Not covered\n\nAbout 58 one-off tags were left unclustered. The \`.claude/prompts\` log only runs 2026-09-25 to 10-02; later days come from the session logs only. Voice and transcription asks (38 tags) are handed to @mastermind-voice-to-session-page. Source per ask: [clusters.json](${rel[m]}clusters.json).\n`;
  fs.writeFileSync(root + "/" + tw[m], t);
  console.log(m, open.length, done.length);
}
