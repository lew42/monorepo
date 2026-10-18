#!/usr/bin/env node
// Server/Landed.mjs — what landed today, yesterday and this week, computed from every task.jsonl (never written from memory).
// Page: public/framework/ai/landed/ (reads landed.json). Doc: public/framework/ai/landed/readme.md
//   node Server/Landed.mjs            write public/framework/ai/landed/landed.json
//   node Server/Landed.mjs --print    print the same list to the terminal
//   node Server/Landed.mjs --days 14  widen the window (default 7)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PastWork from "./PastWork.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const OUT = path.join(REPO, "public", "framework", "ai", "landed", "landed.json");

export default class Landed {
	/** Local calendar day of an ISO stamp (the stamps carry their own offset). */
	static day(iso){ const d = String(iso || "").slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : ""; }

	/** Local calendar day and time of a Date, as the owner's clock shows them (toISOString would say UTC, a day ahead late at night). */
	static local(now){ const p = n => String(n).padStart(2, "0"); return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}`; }

	/** The brief's first heading, for a task whose log never got an assign.title. */
	static brief_title(dir){
		try { const m = fs.readFileSync(path.join(REPO, dir, "requirements.md"), "utf8").match(/^#\s+(.+)$/m); return m ? m[1].trim() : ""; } catch { return ""; }
	}

	/** Which session or module the task dir belongs to, for the grouping label. */
	static home(dir){
		const m = dir.match(/sessions\/\d{4}\/\d{2}\/\d{2}\/([^/]+)/); if (m) return m[1];
		const t = dir.match(/^public\/framework\/(.+?)\/tasks\//); if (t) return t[1];
		return dir.split("/").slice(-2, -1)[0] || "";
	}

	/** Every landed task in the window, newest first, grouped by day. */
	static collect(days = 7, now = new Date()){
		const since = this.local(new Date(now.getTime() - days * 86400e3)).slice(0, 10);
		const rows = PastWork.tasks().filter(r => r.landed && this.day(r.landed) && this.day(r.landed) >= since)
			.map(r => ({ at: r.landed, day: this.day(r.landed), title: r.title || this.brief_title(r.dir) || r.slug, url: r.url, home: this.home(r.dir), group: r.group || "" }))
			.sort((a, b) => a.at < b.at ? 1 : -1);
		const by_day = {};
		for (const r of rows) (by_day[r.day] ??= []).push(r);
		const today = this.local(now).slice(0, 10);
		return { written: this.local(now), days, since, today, total: rows.length, by_day };
	}

	static write(days){ const d = this.collect(days); fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(d, null, "\t") + "\n"); return d; }

	static print(d){
		for (const day of Object.keys(d.by_day).sort().reverse()){
			console.log(`\n## ${day} (${d.by_day[day].length})`);
			for (const r of d.by_day[day]) console.log(`${r.at.slice(11, 16)}  ${r.title}  — ${r.url}`);
		}
		console.log(`\n${d.total} landed since ${d.since}`);
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])){
	const args = process.argv.slice(2);
	const days = Number(args[args.indexOf("--days") + 1]) || 7;
	const d = args.includes("--print") ? Landed.collect(days) : Landed.write(days);
	if (args.includes("--print")) Landed.print(d); else console.log(`${d.total} landed since ${d.since} → public/framework/ai/landed/landed.json`);
}
