// Server/SessionDays.mjs — the partitioned session index, on disk. Doc: public/framework/ai/sessions/doc/realtime.md
//
//   sessions/YYYY/MM/DD/index.jsonl   the DAY index: one line per session that changed that day, { id, at, ...fields }.
//                                     The first line of a session in a day is a KEYFRAME (every field), so a day stands alone.
//   sessions/YYYY/MM/index.json       the MONTH roll-up: which days exist, and per day { count, usd, flagged }.
//   sessions/YYYY/index.json          the YEAR roll-up: which months exist, and per month { days, count, usd, flagged }.
//
// The day index is append-only. The month and year files are small, DERIVED, and rebuilt from the days (`roll`); `check` rebuilds
// them in memory and reports any difference, which is how the audit knows they can be trusted. A year or a month folder can be
// moved or archived on its own: nothing outside it is needed to read it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default class SessionDays {

	static SESSIONS_DIR = path.join(here, "..", "public", "framework", "ai", "sessions");
	static r4 = n => Math.round(n * 1e4) / 1e4;

	/** The UTC day of an ISO timestamp as ["2026", "10", "08"]. */
	static ymd(iso){ return new Date(iso).toISOString().slice(0, 10).split("-"); }

	static day_dir(iso, root = SessionDays.SESSIONS_DIR){ return path.join(root, ...SessionDays.ymd(iso)); }
	static day_file(iso, root){ return path.join(SessionDays.day_dir(iso, root), "index.jsonl"); }

	/** Append one line to a day's index, making the folder if it is the day's first. */
	static append(iso, line, root){
		const dir = SessionDays.day_dir(iso, root);
		fs.mkdirSync(dir, { recursive: true });
		fs.appendFileSync(path.join(dir, "index.jsonl"), JSON.stringify(line) + "\n");
	}

	/** A day file's lines, parsed; a missing file or a torn line is skipped. */
	static lines(file){
		try { return fs.readFileSync(file, "utf8").split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; }
	}

	/** Fold a day's lines to one object per session: later lines win, field by field. */
	static fold(lines){
		const by = new Map();
		for (const l of lines) by.set(l.id, { ...by.get(l.id), ...l });
		return by;
	}

	static numbered(dir, width){
		try { return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory() && new RegExp(`^\\d{${width}}$`).test(d.name)).map(d => d.name).sort(); } catch { return []; }
	}

	/** Every day that has an index, oldest first: [{ y, m, d, file }]. */
	static all_days(root = SessionDays.SESSIONS_DIR){
		const out = [];
		for (const y of SessionDays.numbered(root, 4)) for (const m of SessionDays.numbered(path.join(root, y), 2)) for (const d of SessionDays.numbered(path.join(root, y, m), 2)){
			const file = path.join(root, y, m, d, "index.jsonl");
			if (fs.existsSync(file)) out.push({ y, m, d, file });
		}
		return out;
	}

	/** The roll-ups, computed from the day files. A day's cost is what its sessions SPENT that day: each session's usd now minus its usd at the end of the last day it appeared. */
	static compute(root = SessionDays.SESSIONS_DIR){
		const { r4 } = SessionDays, seen = new Map(), months = {}, years = {};
		for (const { y, m, d, file } of SessionDays.all_days(root)){
			const day = SessionDays.fold(SessionDays.lines(file));
			let usd = 0, flagged = 0;
			for (const [id, s] of day){
				if (typeof s.usd === "number"){ usd += Math.max(0, s.usd - (seen.get(id) ?? 0)); seen.set(id, s.usd); }
				if (s.flags > 0) flagged++;
			}
			const roll = { count: day.size, usd: r4(usd), flagged };
			(months[`${y}/${m}`] ??= {})[d] = roll;
		}
		for (const [ym, days] of Object.entries(months)){
			const [y, m] = ym.split("/"), all = Object.values(days);
			(years[y] ??= {})[m] = { days: all.length, count: all.reduce((n, x) => n + x.count, 0), usd: r4(all.reduce((n, x) => n + x.usd, 0)), flagged: all.reduce((n, x) => n + x.flagged, 0) };
		}
		return { months, years };
	}

	/** The files `compute` implies: path -> JSON text (without the generated_at stamp, so two runs of the same data are identical). */
	static files(computed, root = SessionDays.SESSIONS_DIR){
		const out = new Map();
		for (const [ym, days] of Object.entries(computed.months)) out.set(path.join(root, ...ym.split("/"), "index.json"), JSON.stringify({ days }));
		for (const [y, months] of Object.entries(computed.years)) out.set(path.join(root, y, "index.json"), JSON.stringify({ months }));
		return out;
	}

	/** Write the month and year roll-ups that changed. Returns how many files were written. */
	static roll(root = SessionDays.SESSIONS_DIR){
		let n = 0;
		for (const [file, text] of SessionDays.files(SessionDays.compute(root), root)){
			let old = null; try { old = fs.readFileSync(file, "utf8"); } catch {}
			if (old !== text){ fs.writeFileSync(file, text); n++; }
		}
		return n;
	}

	/** The audit: rebuild the roll-ups in memory and name every file that is missing or differs. An empty list means the indexes are true. */
	static check(root = SessionDays.SESSIONS_DIR){
		const bad = [];
		for (const [file, text] of SessionDays.files(SessionDays.compute(root), root)){
			let old = null; try { old = fs.readFileSync(file, "utf8"); } catch {}
			if (old !== text) bad.push(path.relative(root, file) + (old === null ? " (missing)" : " (differs)"));
		}
		return bad;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	// node Server/SessionDays.mjs [--check]     rebuild the month and year roll-ups (or just audit them)
	if (process.argv.includes("--check")){ const bad = SessionDays.check(); console.log(bad.length ? "roll-ups out of date:\n  " + bad.join("\n  ") : "roll-ups match the day indexes"); process.exit(bad.length ? 3 : 0); }
	console.log(`wrote ${SessionDays.roll()} roll-up file(s) from ${SessionDays.all_days().length} day indexes`);
}
