// AIIndexStream: the day stream of the AI index. One line is appended to ai/sessions/YYYY/MM/DD/index.jsonl each time a task or session
// is created or changes state, so a browser tails today's file and patches one row instead of refetching ai/index.json. Doc: Server/doc/ai-index.md
//   {"task":{"id","path","url","title","state","landed_at","line","at"}}     written by AIIndex.refresh (a changed task log)
//   {"session":{"id","path","url","title","state","at"}}                    written by AISessionIndex (a new or changed transcript session)
// A pointer, never a copy of the log: `path` names the folder the row came from. Derived and rebuildable, so the files are gitignored.
import fs from "node:fs";
import path from "node:path";
import Day from "../public/framework/core/Session/Day.js";

export default class AIIndexStream {
	static KINDS = ["task", "session", "project"];

	/** The day's stream file under a sessions store: sessions/YYYY/MM/DD/index.jsonl. */
	static file(sess, at){ return path.join(sess, ...Day.of(at).split("-"), "index.jsonl"); }

	/** Append `{[kind]: {...row, at}}` to the stream of the day `at` falls on (now by default). Returns the written line. */
	static append(sess, kind, row, at = new Date().toISOString()){
		if (!this.KINDS.includes(kind)) throw new Error(`AIIndexStream: unknown kind ${kind}`);
		const file = this.file(sess, at), line = JSON.stringify({ [kind]: { ...row, at } });
		fs.mkdirSync(path.dirname(file), { recursive: true });
		const first = !fs.existsSync(file) || fs.statSync(file).size === 0;
		fs.appendFileSync(file, line + "\n");
		if (first) this.scopes(sess, Day.of(at));
		return line;
	}

	/** The scope lists: month/index.jsonl lists its days, year/index.jsonl its months, sessions/index.jsonl its years, one line each ({"day":"2026/10/24"}, {"month":"2026/10"}, {"year":"2026"}). It climbs only while the list below was empty, and never repeats a line. */
	static scopes(sess, day){
		const [y, m, d] = day.split("-"), levels = [[path.join(sess, y, m, "index.jsonl"), "day", `${y}/${m}/${d}`], [path.join(sess, y, "index.jsonl"), "month", `${y}/${m}`], [path.join(sess, "index.jsonl"), "year", y]];
		for (const [file, key, value] of levels){
			const had = fs.existsSync(file) && fs.statSync(file).size > 0;
			if (!this.scope_has(file, key, value)) fs.appendFileSync(file, JSON.stringify({ [key]: value }) + "\n");
			if (had) break;
		}
	}

	static scope_has(file, key, value){
		try { return fs.readFileSync(file, "utf8").split(/\r?\n/).some(l => { try { return JSON.parse(l)[key] === value; } catch { return false; } }); } catch { return false; }
	}

	/** The fields of a task row that go on the stream; null when nothing the reader shows has changed since `prev`. */
	static task_line(prev, row){
		const keys = ["state", "title", "landed_at", "line"];
		if (prev && keys.every(k => (prev[k] ?? null) === (row[k] ?? null))) return null;
		return { id: row.id, path: row.dir, url: row.url, title: row.title, state: row.state, landed_at: row.landed_at ?? null, line: row.line ?? "" };
	}

	/** Read a day's stream back: the lines in order, bad lines skipped. */
	static read(sess, day){
		try { return fs.readFileSync(this.file(sess, day), "utf8").split(/\r?\n/).filter(l => l.startsWith("{")).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
		catch { return []; }
	}
}
