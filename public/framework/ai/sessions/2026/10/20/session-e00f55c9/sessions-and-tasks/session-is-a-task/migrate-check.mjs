// Every session record (line 1 {session:{…}} or class "Session") under ai/sessions/, replayed by the OLD Session (michael/dev) and the NEW
// one (worktree qf-4); compares what callers read. Writes one JSON line per difference to stdout, then a summary.
import fs from "node:fs"; import path from "node:path";
const OLD = "file:///C:/Code/lew42/monorepo/public/framework/core/Session/Session.js", NEW = "file:///C:/Code/lew42/worktrees/qf-4/public/framework/core/Session/Session.js";
const { default: SOld } = await import(OLD), { default: SNew } = await import(NEW);
const ROOT = "C:/Code/lew42/monorepo/public/framework/ai/sessions";
const files = [];
const walk = (d, depth) => { if (depth > 7) return; let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
	for (const e of es){ const p = path.join(d, e.name); if (e.isDirectory()) walk(p, depth + 1); else if (e.name === "session.jsonl" || e.name === "task.jsonl") files.push(p); } };
walk(ROOT, 0);
const parse = f => fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const silence = fn => { const w = console.warn; console.warn = () => {}; try { return fn(); } finally { console.warn = w; } };
const view = s => ({ id: s.id, tasks: s.tasks.length, ids: [...s.tasks].map(t => t.id).join(","), states: [...s.tasks].map(t => t.state).join(","),
	progress: JSON.stringify(s.progress()), completion: +s.completion.toFixed(4), first_at: s.first_at, last_at: s.last_at, state: s.get_one?.("state") ?? s.data?.state ?? null, settings: JSON.stringify(s.settings) });
let n = 0, same = 0, diffs = 0, errs = 0; const keys = {};
for (const f of files){
	const lines = parse(f); if (!lines.length) continue;
	const first = lines[0]; if (!(first?.session && typeof first.session === "object") && first?.class !== "Session") continue;
	n++;
	let a, b; try { a = view(silence(() => SOld.replay(lines))); } catch (e){ a = { error: e.message }; }
	try { b = view(silence(() => SNew.replay(lines))); } catch (e){ b = { error: e.message }; errs++; }
	const differ = Object.keys({ ...a, ...b }).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
	if (!differ.length){ same++; continue; }
	diffs++; differ.forEach(k => keys[k] = (keys[k] ?? 0) + 1);
	if (diffs <= 12) console.log(JSON.stringify({ file: path.relative(ROOT, f).replaceAll("\\", "/"), differ, old: Object.fromEntries(differ.map(k => [k, a[k]])), new: Object.fromEntries(differ.map(k => [k, b[k]])) }).slice(0, 600));
}
console.log(JSON.stringify({ session_records: n, same, differ: diffs, new_errors: errs, by_field: keys }));
process.exit(0);
