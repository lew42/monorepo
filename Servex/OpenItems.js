import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Task from "../public/framework/core/Task/Task.js";
import Session from "../public/framework/core/Session/Session.js";

/* NO SILENT ENDINGS: the Servex side of Task#closeout_line (core/Task/Task.js, where the rule lives).
 * After ANY line is appended to a record (session.jsonl / task.jsonl), `after_write` checks whether it closed a session or task
 * (stop, complete, finish, unclosed, closed_by, landed_at). If a node became settled and its score is under 1, the node's own
 * closeout_line() is appended too: ONE task waiting on the owner that lists what stayed open. The check is replay-before vs
 * replay-after, so a replayed or doubled close, or a line that did not change the state, files nothing, and the deterministic
 * id (open-items, open-items-2 …) means a second filing is only possible once the first one is settled.
 * It is called from the two low-level append functions of Servex (page_tools write_line, TaskLoop write_line): every closing path
 * (item tool, append.mjs, the log tool, StaleClose, Unclose, PromptRecords, CloseLoop, TaskLoop.close_task, Dropped) goes through one of them. */
export default class OpenItems {
	static CLOSING = /"(stop|complete|finish|unclosed|closed_by|landed_at)"\s*:/;
	static FILES = /(^|[\\/])(session|task)\.jsonl$/;

	/** The public tree a child's own record is looked up in (a test points it at a scratch tree). */
	static public_root = process.env.SERVEX_PUBLIC ? path.resolve(process.env.SERVEX_PUBLIC) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

	static read_lines(file){
		let text;
		try { text = fs.readFileSync(file, "utf8"); } catch { return []; }
		return text.split("\n").filter(l => l.trim()).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
	}

	/** Replay the lines the way the record is read: a tab's or a spawned agent's record is a Session, a bare task folder a Task. */
	static replay(lines){
		const keep = [Task.resolver, console.warn, Task.clock];
		Task.resolver = ref => { const ls = ["task.jsonl", "session.jsonl"].map(n => this.read_lines(path.join(this.public_root, String(ref).replace(/^\//, ""), n))).find(l => l.length); return ls ?? null; };
		console.warn = () => {};
		try { return (lines[0]?.session || lines[0]?.assign || lines.some(Task.spawned) ? Session : Task).replay(lines); }
		finally { [Task.resolver, console.warn, Task.clock] = keep; }
	}

	/** Every node written in THIS file, root first: [{node, ids}]. A child that has a record of its own is that file's business, not this one's. */
	static nodes(root){
		const out = [], walk = (node, ids) => {
			out.push({ node, ids });
			for (const k of node._tasks ?? []){
				const p = k.get_one("path");
				if (p && ["task.jsonl", "session.jsonl"].some(n => fs.existsSync(path.join(this.public_root, String(p).replace(/^\//, ""), n)))) continue;
				walk(k, [...ids, k.id]);
			}
		};
		walk(root, []);
		return out;
	}

	/** The line, wrapped to reach the node at `ids` from the root; tried in both nesting forms, and kept only if it replays into a waiting task there. */
	static reach(lines, ids, line){
		const forms = [
			ids.reduceRight((inner, id) => ({ [id]: inner }), line),
			ids.reduceRight((inner, id) => ({ tasks: { [id]: inner } }), line),
		];
		if (!ids.length) return line;
		for (const f of forms){
			try {
				let n = this.replay([...lines, f]);
				for (const id of ids) n = [...(n._tasks ?? [])].find(t => t.id === id);
				const made = n && [...(n._tasks ?? [])].find(t => Task.is_closeout(t) && t.state === "waiting");
				if (made) return f;
			} catch {}
		}
		return null;
	}

	/** Call right after `line` was appended to `file`. Returns the closeout tasks it filed (their ids), [] for the usual no-op. Never throws: a failure here must not undo the write it follows. */
	static after_write(file, line){
		try {
			if (!this.FILES.test(String(file)) || !this.CLOSING.test(JSON.stringify(line))) return [];
			const all = this.read_lines(file);
			if (!all.length) return [];
			const before = this.replay(all.slice(0, -1)), after = this.replay(all);
			const was = new Map(this.nodes(before).map(n => [n.ids.join("/"), n.node]));
			const filed = [];
			let lines = all;
			for (const { node, ids } of this.nodes(after)){
				if (Task.is_closeout(node) || !Task.settled(node)) continue;
				const old = was.get(ids.join("/"));
				if (old && Task.settled(old)) continue;
				const own = node.closeout_line(line.at ?? line.ts ?? new Date().toISOString());
				if (!own) continue;
				const wrapped = this.reach(lines, ids, own);
				if (!wrapped) continue;
				fs.appendFileSync(file, JSON.stringify(wrapped) + "\n");
				lines = [...lines, wrapped];
				filed.push([...ids, own.tasks.add.id].join("/"));
			}
			return filed;
		} catch (e){ console.error("OpenItems.after_write:", e.message); return []; }
	}
}
