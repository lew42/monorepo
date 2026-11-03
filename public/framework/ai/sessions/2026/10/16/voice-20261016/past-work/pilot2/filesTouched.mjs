// node filesTouched.mjs — how many task logs have action.files, by day / week / month, and do they touch one module or scatter?
import fs from "node:fs"; import path from "node:path";
const here = import.meta.dirname.replace(/\\/g, "/"), AI = here.slice(0, here.indexOf("/public/framework/ai/") + "/public/framework/ai".length);
const rows = [];
(function walk(d) {
	let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
	for (const e of es) { const p = d + "/" + e.name; if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== ".git") walk(p); } else if (e.name === "task.jsonl") rows.push(p); }
})(AI);

// module = the directory a person would name: framework/<tier>/<Name>, ai, Server, Servex/<sub>, else the top segment
function module_of(f) {
	f = String(f).replace(/\\/g, "/").replace(/^.*?monorepo\//, "");
	let m = f.match(/^public\/framework\/ai\//); if (m) return "ai";
	m = f.match(/^public\/framework\/([^/]+)\/([^/.]+)(\/|$)/); if (m) return m[1] + "/" + m[2];
	m = f.match(/^public\/framework\/([^/]+)\/[^/]+$/); if (m) return m[1];            // a file sitting directly in a tier
	m = f.match(/^public\/framework\/[^/]+$/); if (m) return "framework";
	m = f.match(/^public\/(imagine|layouts|websites)\/([^/.]+)\//); if (m) return m[1] + "/" + m[2];
	m = f.match(/^Servex\/([^/.]+)\//); if (m) return "Servex/" + m[1];
	m = f.match(/^public\/([^/]+)\//); if (m) return "public/" + m[1];
	return f.split("/")[0];
}
const isoWeek = d => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + "-W" + String(Math.ceil(((t - y0) / 864e5 + 1) / 7)).padStart(2, "0"); };

const recs = [];
for (const f of rows) {
	const rel = f.slice(AI.length + 1); const m = rel.match(/sessions\/(\d{4})\/(\d\d)\/(\d\d)\//);
	const day = m ? `${m[1]}-${m[2]}-${m[3]}` : "undated";
	const files = new Set(); let lines = 0;
	for (const l of fs.readFileSync(f, "utf8").split("\n")) {
		if (!l.includes('"files"')) continue; let o; try { o = JSON.parse(l); } catch { continue; }
		if (Array.isArray(o.action?.files) && o.action.files.length) { lines++; for (const x of o.action.files) files.add(x); }
	}
	const mods = new Map(); for (const x of files) { const k = module_of(x); mods.set(k, (mods.get(k) || 0) + 1); }
	const real = new Map([...mods].filter(([k]) => k !== "ai"));   // ignoring the task's own log/brief files under ai/
	recs.push({ f, day, week: day === "undated" ? "undated" : isoWeek(new Date(day)), month: day.slice(0, 7), nfiles: files.size, mods, real });
}
const pct = (a, b) => b ? Math.round(100 * a / b) + "%" : "-";
function table(title, keyOf) {
	const g = new Map(); for (const r of recs) { const k = keyOf(r); (g.get(k) || g.set(k, []).get(k)).push(r); }
	console.log("\n" + title); console.log("period       tasks  with-files  none   share-with");
	for (const k of [...g.keys()].sort()) { const a = g.get(k), w = a.filter(r => r.nfiles > 0).length; console.log(k.padEnd(12), String(a.length).padStart(5), String(w).padStart(10), String(a.length - w).padStart(6), pct(w, a.length).padStart(9)); }
}
const withF = recs.filter(r => r.nfiles > 0);
console.log("task.jsonl files:", recs.length, "| with action.files:", withF.length, `(${pct(withF.length, recs.length)})`, "| none:", recs.length - withF.length);
table("BY MONTH", r => r.month); table("BY WEEK", r => r.week);
const days = [...new Set(recs.map(r => r.day))].sort().slice(-14); table("BY DAY (last 14 days)", r => days.includes(r.day) ? r.day : "~older");
// last 1 / 7 / 30 days relative to the newest day with a task
const newest = recs.map(r => r.day).filter(d => d !== "undated").sort().at(-1); const nd = new Date(newest);
console.log("\nWINDOWS (ending " + newest + ")");
for (const n of [1, 7, 30]) { const a = recs.filter(r => r.day !== "undated" && (nd - new Date(r.day)) / 864e5 < n); const w = a.filter(r => r.nfiles > 0).length; console.log(`last ${String(n).padStart(2)} day(s): ${a.length} tasks, ${w} with files (${pct(w, a.length)}), ${a.length - w} none`); }

function dist(title, list, mapKey) {
	const b = { "1 module": 0, "2": 0, "3-5": 0, "6+": 0, "files only under ai/": 0 };
	const dom = []; let share90 = 0;
	for (const r of list) {
		const m = r[mapKey]; if (!m.size) { b["files only under ai/"]++; continue; }
		const n = m.size; if (n === 1) b["1 module"]++; else if (n === 2) b["2"]++; else if (n <= 5) b["3-5"]++; else b["6+"]++;
		const tot = [...m.values()].reduce((s, x) => s + x, 0), top = Math.max(...m.values()); dom.push(top / tot); if (top / tot >= .8) share90++;
	}
	dom.sort((a, b) => a - b); const med = dom.length ? dom[Math.floor(dom.length / 2)] : 0;
	console.log("\n" + title + " (" + list.length + " tasks)"); for (const [k, v] of Object.entries(b)) console.log("  " + k.padEnd(24), String(v).padStart(5), pct(v, list.length).padStart(5));
	console.log("  dominant module holds >=80% of the files in", share90, `of ${dom.length} (${pct(share90, dom.length)}); median dominant share`, Math.round(med * 100) + "%");
}
dist("MODULES TOUCHED, counting ai/ as a module", withF, "mods"); dist("MODULES TOUCHED, ignoring ai/ (the task's own log and brief)", withF, "real");
const cnt = new Map(); for (const r of withF) for (const k of r.real.keys()) cnt.set(k, (cnt.get(k) || 0) + 1);
console.log("\nTOP MODULES by tasks that touch them:", [...cnt].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => k + ":" + v).join("  "));
const nf = withF.map(r => r.nfiles).sort((a, b) => a - b); console.log("files per task (those with files): median", nf[nf.length >> 1], "p90", nf[Math.floor(nf.length * .9)], "max", nf.at(-1));
