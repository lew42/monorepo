// LogLine — the one writer of a JSONL log line: validated, stamped, appended. Doc: Server/doc/log-line.md
// Callers: .claude/hooks/append.mjs (CLI), the `log` MCP tool (Servex/agents/tools.js), dir_log (Servex/agents/Sessions.js).
import { readFileSync, appendFileSync, existsSync, statSync, openSync, readSync, closeSync, mkdirSync } from "node:fs";
import { resolve as resolve_path, dirname, basename, join } from "node:path";
import { check, shape } from "../.claude/hooks/jsonl-schema.mjs";
import TaskDirs from "./TaskDirs.mjs";
import SessionRecord from "./SessionRecord.mjs";

const pad = n => String(n).padStart(2, "0");
const TIMED = ["finish", "complete", "stop", "start", "log", "decision"];

export default class LogLine {
	static CHECKLIST = `
BEFORE THIS TASK CLOSES (CLAUDE.md law 9), answer both:
  1. Did you update the readme of the module you worked in?
  2. If the parent readme references this module, did you update that line?
(A readme states what the thing is, its on-disk structure, which tool writes it and which class reads it: no history.)`;
	/** Keys a writer may put beside a line's verb (string values only: `session` as an OBJECT is a verb). */
	static META = ["by", "session", "origin"];
	/** The one writer of record files (data-shapes 1d): in Servex, page_tools.js sets it to record_lines (applies each line to the
	 *  file's live root, then appends). Elsewhere it is null and `append` writes the file itself; append.mjs posts instead (`prepare`). */
	static writer = null;
	static RECORD = /[\\/](task|session|page|improvements)\.jsonl$/;

	static now(){
		const d = new Date(), off = -d.getTimezoneOffset(), a = Math.abs(off);
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off < 0 ? "-" : "+"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
	}
	static fill(v, t){
		if (v === "NOW") return t;
		if (Array.isArray(v)) return v.map(x => this.fill(x, t));
		if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, this.fill(x, t)]));
		return v;
	}
	/** An object body with no `at` gets one (ai-system/logging.md). */
	static stamp(o, t){
		const keys = Object.keys(o ?? {});
		const body = keys.length === 1 ? o[keys[0]] : null;
		if (body && typeof body === "object" && !Array.isArray(body) && !body.at && !body.landed_at && !body.requested_at && !o.at) return { [keys[0]]: { at: t, ...body } };
		if (keys.length > 1 && !o.at && !o.landed_at) return { at: t, ...o };
		return o;
	}

	/** Append `lines` (one object or an array) to `target`. Returns {file, appended, at, bad, total, notes, landing}.
	 *  Throws Error with .code 3 and the schema's reason on a refusal (nothing written). `by`/`session`/`origin` land beside each line's verb. */
	static append(target, lines, opts = {}){
		const p = this.prepare(target, lines, opts);
		const via = this.writer && this.RECORD.test(p.target) ? this.writer(p.target, p.filled) : null;
		if (via?.ok === false) throw Object.assign(new Error(via.refused.map(r => `REFUSED line ${r.i + 1}: ${r.why}`).join("\n") + `\nNothing was written to ${p.target}.`), { code: 3, notes: p.notes });
		if (!via) this.write(p);
		return this.report(p);
	}

	/** Everything before the write: the path followed, the lines filled and stamped, the schema checked (throws code 3, nothing written). */
	static prepare(target, lines, { by, session, origin, source = "the lines" } = {}){
		const notes = [], t = this.now();
		const abs = resolve_path(target);
		const m = /[\\/]public[\\/]framework[\\/]ai[\\/](\d{4}-\d{2}-\d{2})[\\/]day\.jsonl$/.exec(abs);
		let now;
		try { now = m ? join(TaskDirs.day_dir(m[1]), "day.jsonl") : existsSync(dirname(abs)) ? TaskDirs.follow(abs) : TaskDirs.refuse(abs); }
		catch (e){ throw Object.assign(new Error(e.message + "\nNothing was written."), { code: 3 }); }
		if (now !== abs){ mkdirSync(dirname(now), { recursive: true }); notes.push(`(old path followed: ${target} -> ${now})`); target = now; }

		const list = Array.isArray(lines) ? lines : [lines];
		if (basename(target) === "task.jsonl" && !existsSync(target)){
			const to = SessionRecord.start_file(dirname(resolve_path(target)), list[0]);
			if (basename(to) === "session.jsonl"){ notes.push(`(session record: ${target} -> ${to})`); target = to; }
		}
		const meta = Object.fromEntries(Object.entries({ by, session, origin }).filter(([, v]) => typeof v === "string" && v));
		// meta rides on the finished line, so the verb/`at` logic below sees only the bare line
		const bare = o => o && typeof o === "object" && !Array.isArray(o) ? Object.fromEntries(Object.entries(o).filter(([k, v]) => !(this.META.includes(k) && typeof v === "string"))) : o;
		const own = o => o && typeof o === "object" && !Array.isArray(o) ? Object.fromEntries(Object.entries(o).filter(([k, v]) => this.META.includes(k) && typeof v === "string")) : {};
		const fix_date = (o, i) => {
			const verb = Object.keys(o ?? {}).find(k => TIMED.includes(k));
			const body = verb && o[verb];
			if (!body || typeof body !== "object" || Array.isArray(body)) return o;
			if (body.at && !/^\d{4}-\d{2}-\d{2}$/.test(body.at)) return o;
			notes.push(`(line ${i + 1}: ${verb}.at was ${body.at ? `the bare date ${body.at}` : "missing"}; filled with ${t})`);
			return { ...o, [verb]: { ...body, at: t } };
		};
		// A page.jsonl line is an Item delta, where a top-level `at` is the old path key (Item.apply): stamp `ts`, as the item tool does.
		const page_log = basename(target) === "page.jsonl";
		const stamped = (o, i) => page_log
			? (o && typeof o === "object" && !Array.isArray(o) && !("at" in o) && !o.ts ? { ts: t, ...o } : o)
			: fix_date(this.stamp(o, t), i);
		const filled = list.map((o, i) => ({ ...stamped(this.fill(bare(o), t), i), ...own(o), ...meta }));

		const refused = filled.map((o, i) => [i, check(target, o)]).filter(([, why]) => why);
		if (refused.length){
			let msg = refused.map(([i, why]) => `REFUSED line ${i + 1} of ${source}: ${why}\n  ${JSON.stringify(list[i]).slice(0, 160)}`).join("\n");
			const s = shape(target);
			if (s) msg += `\nThe right shape — ${s}`;
			throw Object.assign(new Error(msg + `\nNothing was written to ${target}.`), { code: 3, notes });
		}

		return { target, list, filled, notes, t };
	}

	/** The raw append, newline-safe: used where no one writer is wired, and by append.mjs as the fallback when the entry point is down. */
	static write({ target, filled }){
		let out = filled.map(o => JSON.stringify(o)).join("\n") + "\n";
		if (existsSync(target) && statSync(target).size > 0){
			const size = statSync(target).size, fd = openSync(target, "r"), buf = Buffer.alloc(1);
			readSync(fd, buf, 0, 1, size - 1); closeSync(fd);
			if (buf[0] !== 0x0a) out = "\n" + out;
		}
		appendFileSync(target, out, "utf8");
	}

	/** What `append` answers, read back from the file: lines appended, the file's total, any unparsed line, a landing. */
	static report({ target, list, filled, notes, t }){
		const all = readFileSync(target, "utf8").split(/\r?\n/).filter(l => l.trim());
		let bad = 0;
		all.forEach((l, i) => { try { JSON.parse(l); } catch { bad++; notes.push(`BAD line ${i + 1}: ${l.slice(0, 100)}`); } });
		const landing = !bad && filled.some(o => o?.assign?.landed_at || o?.landed_at);
		return { file: target, appended: list.length, at: t, bad, total: all.length, notes, landing, lines: filled };
	}
}
