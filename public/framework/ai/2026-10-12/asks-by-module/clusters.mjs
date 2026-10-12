// Sonnet-merged clusters over the Haiku tags (ids refer to candidates.jsonl). Builds clusters.json with count, dates, sources.
import fs from "fs";
const d = import.meta.dirname;
const tags = fs.readFileSync(d + "/all-tags.jsonl", "utf8").trim().split("\n").map(l => JSON.parse(l));
const byId = new Map(); for (const t of tags) byId.set(t.id, t);
const C = [
// ---- page ----
["page","page-live-parts","Pages are streamed lists of parts: change them by small page.jsonl appends / page tools, and they update themselves while you watch (granular, not whole-file rewrites).",[28,34,57,68,70,71,85,214,89]],
["page","item-list-content-classes","Settle the Item / List / Content / Page class architecture: simple data structures, list not collection, view kept separate, hydration harmonised, drag-sortable items, documented in the readme with minimal syntax.",[72,73,74,75,76,77,78,79,80,81,82,83,63,212,117]],
["page","weight-importance","One weight/importance system usable on any object in the page system (card size follows module weight, filters by weight).",[67,84,217]],
["page","sidebar-tree-nav","Left sidebar navigation: an expandable tree for deep nesting, searchable index so unloaded pages are found, nav back on the homepage/hamburger, tree in the dev bar, right-hand related-topics sidebar.",[26,31,32,46,51,64,90,35,22,60]],
["page","layout-columns-spacing","Layouts that use 3440 well: N even columns auto-computed, multi-column sections that sometimes fill, padding via clamp and container queries, no padding gaps, responsive tabs on mobile.",[1,12,25,37,40,43,47,48,49,52,53,54,58,86,88,61,62]],
["page","layout-browser-and-rules","A layout browser/explorer: global layouts separate from component templates, approve/improve each layout, written rules for what never breaks, a minimal design system of padding tokens.",[15,16,23,24,27,50,65]],
["page","paging-mechanisms","The /imagine/paging/ program: stacks vs splits, transitions, URL bar, swap page, scroll fixes.",[7,10,13,21,23,20]],
["page","page-review-and-smoke","Never ship an untested page: smoke test and screenshot every changed page, monitor file changes and test dependent pages before the owner sees breakage.",[44,87,66,5,8]],
["page","page-context-on-page","Each page shows its own open tasks / AI activity, defines pages vs embedded cards, and keeps page.jsonl with directory data.",[59,69,57,191]],
// ---- ai ----
["ai","mastermind-assistant-relay","Mastermind/assistant roles: an assistant in front of any mastermind that relays every prompt, a per-directory/page mastermind, mastermind relays instead of executing, clear skills+roles explanation, review diffs before spawning reviewers.",[94,115,116,119,126,139,141,142,149,174,175,176,177,178,184,187,191,192,240,241,243]],
["ai","never-wait-pace","Mastermind decides and documents the alternative instead of waiting; stays under usage pace; permission mode lets it edit without approval prompts.",[103,104,108,132,145,204,211,269,271,275,276]],
["ai","reporting-style","Short chat replies; the report lives on a card/visual page; real tables not text tables; acknowledgements brief.",[105,131,150,106,109,110]],
["ai","inbox-dashboard-cards","Inbox/dashboard/cards: filter by importance (90+), clear items, search, Now card, child cards via directories, module cards and unread badges, Approve/Unclear buttons, plain categories blocking/review/fyi, merge AI2 into framework/ai.",[98,113,127,135,136,137,148,162,173,198,199,200,205,207,209,239,245,246,247,248,252,256,36,235]],
["ai","sessions-system","Sessions: one /ai/sessions/ hierarchy (year/month/day), JSONL index with snapshots, sessions tab grid with detail in the sidebar, MCP query tool, global namespace, tiered resumption, AISession class.",[114,249,251,257,263,264,274,280,281,282,285,286,287,288,289,292]],
["ai","models-openrouter-cost","Cheaper models: OpenRouter/local setup, tests with known answers comparing models and thinking levels, voice agents off Anthropic, real-dollar accounting for OpenRouter, token tracking per model.",[155,172,212,213,214,215,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,236,237,238,262,266,268,270,272,277,278,283,291]],
["ai","asks-prompts-refine","Never lose an ask: log every ask against its prompt, refine prompts into asks tagged by module with a confidence, importance/weight graph, approve-or-improve decision pages.",[100,101,102,153,253,255,261,290,293,258]],
["ai","docs-readmes-handover","Readmes as the cheap index, CLAUDE.md clarity/naming rules, documented AI process prompt-to-execution, handover kept current, every mastermind can find the docs.",[96,121,128,129,190,194,195,196,201,216,244,279,294,187]],
["ai","servex-infra-health","Servex/dev-server health: restartable dev server and MCP, phantom processes, hidden terminal popups, worktrees cleaned up, site crashes during transcription/reload, process list with memory.",[111,112,122,124,125,138,147,202,242,295]],
["ai","realtime-dictation-tasks","Tasks and the board update live while the owner dictates; fast assistant answers dictation; Opus overseer for voice sessions.",[106,109,123,265,273]],
["ai","oo-classes-ai-code","AI code as classes (Prompt, AISession, class cards with live properties, preview levels inline/card/detail).",[250,267,284,235,290,292]],
];
const dump = fs.readFileSync(d + "/dump.txt", "utf8").split("\n");
const lineTags = n => { const m = (dump[n - 1] || "").match(/^(\d+)\|/); return m ? tags.filter(t => t.id == +m[1] && dump[n - 1].includes(t.ask.slice(0, 40))) : []; };
const out = C.map(([module, name, ask, ids]) => {
  const idMode = r => r <= 18 || (name === "paging-mechanisms" && [20, 21, 23].includes(r));
  const rowsAll = ids.flatMap(r => idMode(r) ? tags.filter(t => t.id === r && t.module === module) : lineTags(r));
  const u = [...new Set(rowsAll.map(t => t.id))];
  const rows = rowsAll;
  const at = rows.map(r => r.at).sort();
  return { module, name, ask, count: u.length, first: at[0], last: at.at(-1), sources: [...new Set(rows.map(r => r.src))], missing: ids.filter(r => !(idMode(r) ? tags.some(t => t.id === r) : lineTags(r).length)) };
}).sort((a, b) => a.module.localeCompare(b.module) || b.count - a.count);
fs.writeFileSync(d + "/clusters.json", JSON.stringify(out, null, 1));
for (const o of out) console.log(o.module, o.name, o.count, o.first, o.last, o.missing.length ? "missing:" + o.missing : "");
console.log("clustered tags:", out.reduce((a,o)=>a+o.count,0));
console.log("clustered tags:", out.reduce((a, o) => a + o.count, 0));
