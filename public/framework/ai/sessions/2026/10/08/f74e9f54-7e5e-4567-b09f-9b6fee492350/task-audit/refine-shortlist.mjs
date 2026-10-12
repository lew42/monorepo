// Script-only search for prompt-refinement work: asks, todo, tasks, owner-prompt candidates, ext/Refine state. Writes one inline file for a Haiku minion.
import fs from "fs"; import path from "path";
const ai = path.resolve(import.meta.dirname, "../.."), fw = path.resolve(ai, "..");
const re = /refin|clean transcript|raw prompt|whisper|prompt card|clean(ed)? prompt|dictat|coverage|numbered sentence/i;
const out = [];
const asks = fs.readFileSync(path.join(ai, "asks.jsonl"), "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l).ask } catch { } }).filter(Boolean);
out.push("## ASKS (asks.jsonl) matching refinement terms");
for (const a of asks) if (re.test(a.title || "")) out.push(`- [${a.at?.slice(0, 10)}] ${a.title} | status ${a.status} | owner ${a.owner} | card ${a.card}`);
out.push("\n## TODO.md lines");
for (const l of fs.readFileSync(path.join(ai, "todo.md"), "utf8").split("\n")) if (re.test(l) && /^- /.test(l)) out.push(l.slice(0, 260));
out.push("\n## TASKS (task dirs, landed or not) matching terms in dir name or title");
const items = JSON.parse(fs.readFileSync(process.argv[2] + "/items.json", "utf8"));
for (const x of items) if (re.test(x.dir + x.title)) out.push(`- ${x.dir} | started ${x.started} | state "${x.now}" | commits ${x.commits} | files ${x.files}`);
out.push("\n## OWNER PROMPTS (unmatched session-file candidates) mentioning refinement, newest 25");
const cands = fs.readFileSync(path.join(ai, "2026-10-08/mastermind-cheap-models/ask-ledger/ask-ledger.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)).filter(c => re.test(c.text) && c.text.length > 60);
out.push(`(${cands.length} total)`);
for (const c of cands.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 25)) out.push(`- [${c.at.slice(0, 10)}] ${c.text.replace(/\s+/g, " ").slice(0, 230)} | delivered:${c.delivered}`);
out.push("\n## BUILT STATE: ext/Refine");
const rd = p => { try { return fs.readFileSync(path.join(fw, p), "utf8").replace(/\s+/g, " ").slice(0, 900) } catch { return "(missing)" } };
out.push("readme: " + rd("ext/Refine/readme.md")); out.push("refine-engine.md: " + rd("ext/Refine/doc/refine-engine.md")); out.push("raw-match.md: " + rd("ext/Refine/doc/raw-match.md"));
for (const f of ["Refine.js", "engine.js", "structure.js", "prompt-card.js"]) { let s = ""; try { s = fs.readFileSync(path.join(fw, "ext/Refine", f), "utf8") } catch { } out.push(`file ${f}: ${s.split("\n").length} lines; exports/functions: ${[...s.matchAll(/^(?:export )?(?:async )?(?:function|class) (\w+)/gm)].map(m => m[1]).join(", ").slice(0, 200)}`) }
out.push("grep: files mentioning 'sentence' numbering or 'coverage': " + ["ext/Refine/engine.js", "ext/Refine/structure.js", "ext/Refine/Refine.js", "ux/Dictate/chat.js"].map(f => { try { const s = fs.readFileSync(path.join(fw, f), "utf8"); return f + ":" + (/coverage/i.test(s) ? "coverage" : "-") + "/" + (/sentence/i.test(s) ? "sentence" : "-") + "/" + (/confidence/i.test(s) ? "confidence" : "-") } catch { return f + ":missing" } }).join(" "));
out.push("\n## VISION (the target)\n" + fs.readFileSync(path.join(fw, "ext/Refine/doc/vision-2026-10-08.md"), "utf8").replace(/\n+/g, "\n"));
fs.writeFileSync(process.argv[3], out.join("\n")); console.log(out.join("\n").length, "chars");
