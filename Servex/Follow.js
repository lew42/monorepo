import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { watch as chokidar_watch } from "chokidar";
import { place } from "./home.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* RESOLVE FIRST, THEN CHECK. `path.posix.normalize` collapses `.` and `..`
 * segments BEFORE the refuse rule ever looks at them — without this,
 * `public/framework/.` and `Servex/.` split into a harmless-looking extra
 * `.` segment that `path.join` later turns back into the whole framework
 * tree or the whole Servex folder, exactly what the rule exists to refuse. */
const norm = p => {
	const cleaned = path.posix.normalize(String(p ?? "").replace(/\\/g, "/")).replace(/^\/+|\/+$/g, "");
	return cleaned === "." ? "" : cleaned;
};
const abs = rel => path.join(ROOT, rel);
const rel_of = file => path.relative(ROOT, file).split(path.sep).join("/");
const covers = (sub, file) => file === sub || file.startsWith(sub + "/");

/* Refuses anything above `public/framework/<module>` or `Servex/<dir>` — the
 * whole tree, the repo root, and a path that escapes it — plus `node_modules`
 * and `.git` anywhere in it (a symlink or a dependency tree is never a log to
 * follow). Everything AT or BELOW those two roots is fine, file or directory. */
function refused(rel){
	if (!rel || typeof rel !== "string" || !rel.trim()) return "a path is required";
	const clean = norm(rel);
	const parts = clean ? clean.split("/") : [];
	if (parts.includes("..")) return `"${rel}" escapes the repo`;
	if (parts.includes("node_modules") || parts.includes(".git"))
		return `"${rel}" is refused — node_modules and .git are never followed`;
	const ok = (parts[0] === "public" && parts[1] === "framework" && !!parts[2])
		|| (parts[0] === "Servex" && !!parts[1]);
	return ok ? null : `"${rel}" is above public/framework/<module> or Servex/<dir> — refused`;
}

/* FOLLOW(PATH) — an agent cannot watch a file itself; it only sees what
 * arrives as a message. So Servex watches, and tells each subscribed agent
 * what changed, one message per burst. Servex/doc/follow.md is the whole
 * story; this file is the mechanism.
 *
 * ONE WATCHER for every followed path (chokidar), re-scoped as subscriptions
 * change — nothing followed, nothing watched. Subscriptions persist to one
 * small JSON file (`file`, same shape as Registry's) and reload on `start()`.
 *
 * `agents` is the host they get told through: `agents.send(id, text, note)` —
 * the same door `send_to_agent` uses, so a busy agent's turn just queues the
 * message behind it. Never `priority: now`. */
export default class Follow {

	/* At most this many jsonl lines per file in one message — a runaway burst
	 * gets a "… N more, read from byte X" note instead of paging the owner's
	 * agent through a whole log in one shot. */
	static CAP = 200;

	constructor(...args){ this.assign({
		subs: [], file: place("follow.json"), watcher: null, watched: [],
		sizes: new Map(), offsets: new Map(), pending: new Map(), timers: new Map()
	}, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	start(){ this.load(); this.rescope(); return this; }

	stop(){
		for (const t of this.timers.values()) clearTimeout(t);
		this.timers.clear();
		this.pending.clear();
		if (this.watcher) this.watcher.close();
		this.watcher = null;
		this.watched = [];
		this.sizes.clear();
		this.offsets.clear();
	}

	/* ── the three verbs ──────────────────────────────────────────────── */

	follow({ agent, path: rel, gather_ms = 2000 } = {}){
		if (!agent) throw new Error("follow needs an agent (or a caller Servex already knows).");
		const why = refused(rel);
		if (why) throw new Error(why);
		const clean = norm(rel);
		if (!this.subs.some(s => s.agent === agent && s.path === clean))
			this.subs.push({ agent, path: clean, gather_ms });
		this.save();
		this.rescope();
		return this.list(agent);
	}

	unfollow({ agent, path: rel } = {}){
		const clean = norm(rel);
		this.subs = this.subs.filter(s => !(s.agent === agent && s.path === clean));
		this.save();
		this.rescope();
		return this.list(agent);
	}

	list(agent){ return agent ? this.subs.filter(s => s.agent === agent) : this.subs.slice(); }

	/* Called from Agents.js `register()`, the same place Lifecycle's
	 * `agent_ended` is called, when an agent's state becomes "stopped".
	 *
	 * SKIPPED WHILE THE HOST IS CLOSING (`this.agents.closing`, set by
	 * `Servex.js`'s `shutdown()` before it stops every live agent) — a
	 * graceful exit would otherwise call this once per agent on the way
	 * down and erase every subscription, so `follow.json` would never
	 * actually survive a restart, only a hard kill.
	 *
	 * Otherwise: drop the subscriptions, AND the agent's own pending burst
	 * and its flush timer — left in place, that timer still fires after
	 * `gather_ms` and calls `agents.send()`, which REVIVES the very agent
	 * that just stopped. */
	agent_ended(agent){
		if (this.agents?.closing) return;
		const id = agent?.id ?? agent;
		clearTimeout(this.timers.get(id));
		this.timers.delete(id);
		this.pending.delete(id);
		if (!this.subs.some(s => s.agent === id)) return;
		this.subs = this.subs.filter(s => s.agent !== id);
		this.save();
		this.rescope();
	}

	/* ── persistence ──────────────────────────────────────────────────── */

	load(){ try { this.subs = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { this.subs = []; } }
	save(){ try { fs.writeFileSync(this.file, JSON.stringify(this.subs, null, 2)); } catch {} }

	/* ── the watcher ──────────────────────────────────────────────────── */

	/* One chokidar covering the union of followed paths. `unwatch`/`add` move
	 * an already-running watcher instead of tearing it down, so an event
	 * mid-flight is never lost to a restart nobody asked for. */
	rescope(){
		const need = [...new Set(this.subs.map(s => abs(s.path)))];
		if (!need.length) return this.stop();
		if (!this.watcher){
			this.watcher = chokidar_watch(need, { ignoreInitial: true, followSymlinks: false });
			this.watcher.on("all", (event, file) => this.changed(event, file));
			this.watcher.on("error", () => {});
			for (const p of need) this.prime(p);
		} else {
			const gone = this.watched.filter(p => !need.includes(p));
			const fresh = need.filter(p => !this.watched.includes(p));
			if (gone.length){ this.watcher.unwatch(gone); this.prune(need); }
			if (fresh.length){ this.watcher.add(fresh); for (const p of fresh) this.prime(p); }
		}
		this.watched = need;
	}

	/* Drop a `sizes`/`offsets` entry for any file no longer covered by ANY
	 * currently watched path — otherwise both maps keep one entry forever
	 * for every file ever seen under a directory that was later unfollowed. */
	prune(need){
		const kept = file => need.some(p => file === p || file.startsWith(p + path.sep));
		for (const file of this.sizes.keys()) if (!kept(file)) this.sizes.delete(file);
		for (const file of this.offsets.keys()) if (!kept(file)) this.offsets.delete(file);
	}

	/* PRIME — the moment a path starts being watched (a fresh watcher, a path
	 * just added, or a subscription just reloaded at boot), every file already
	 * there gets its current size/mtime and byte offset recorded as a
	 * baseline. Without this, the FIRST real change after `follow()` compared
	 * against an empty `sizes`/`offsets` map looks like the file went from
	 * nothing to everything, and the whole file — years of an existing log —
	 * goes out as "new". A file that does not exist yet is left unprimed on
	 * purpose: its first `add` event starts at offset 0, so it is caught from
	 * birth, which is exactly what should happen. */
	prime(p){
		let stat;
		try { stat = fs.statSync(p); } catch { return; }
		for (const file of stat.isDirectory() ? this.walk(p) : [p]) this.baseline(file);
	}

	baseline(file){
		let stat;
		try { stat = fs.statSync(file); } catch { return; }
		this.sizes.set(file, `${stat.size}:${stat.mtimeMs}`);
		if (file.endsWith(".jsonl")) this.offsets.set(file, stat.size);
	}

	/* Every file under a directory, bounded — never node_modules or .git. */
	walk(dir){
		const out = [], stack = [dir];
		while (stack.length){
			const at = stack.pop();
			let entries; try { entries = fs.readdirSync(at, { withFileTypes: true }); } catch { continue; }
			for (const e of entries){
				if (e.name === "node_modules" || e.name === ".git") continue;
				const full = path.join(at, e.name);
				if (e.isDirectory()) stack.push(full); else out.push(full);
			}
		}
		return out;
	}

	/* WINDOWS TRAP: a plain read fires a "change" event too (last-access
	 * tracking). Nothing goes out unless the file's size or mtime actually
	 * moved — a read never changes either. */
	changed(event, file){
		if (!["add", "change", "unlink"].includes(event)) return;
		const rel = rel_of(file);
		const subs = this.subs.filter(s => covers(s.path, rel));
		if (!subs.length) return;

		let stat;
		try { stat = fs.statSync(file); } catch { this.sizes.delete(file); this.offsets.delete(file); return; }
		const sig = `${stat.size}:${stat.mtimeMs}`;
		if (this.sizes.get(file) === sig) return;
		this.sizes.set(file, sig);

		const item = file.endsWith(".jsonl") ? { file: rel, lines: this.new_lines(file) } : { file: rel };
		if (item.lines && !item.lines.length) return;

		/* ONE DELIVERY PER AGENT. An agent following both a directory and a
		 * file inside it has two subscription rows matching this same
		 * change — queueing once per ROW would deliver every line twice.
		 * Keep only the first matching row per agent. */
		const by_agent = new Map();
		for (const s of subs) if (!by_agent.has(s.agent)) by_agent.set(s.agent, s);
		for (const s of by_agent.values()) this.queue(s, item);
	}

	/* A `.jsonl`: remember the byte offset, hand back only the new COMPLETE
	 * lines (a half-written trailing line is left for next time), verbatim. */
	new_lines(file){
		const from = this.offsets.get(file) ?? 0;
		let size; try { size = fs.statSync(file).size; } catch { return []; }
		if (size <= from){ this.offsets.set(file, size); return []; }   // truncated/rewritten: catch up, resend nothing
		const buf = Buffer.alloc(size - from), fd = fs.openSync(file, "r");
		try { fs.readSync(fd, buf, 0, buf.length, from); } finally { fs.closeSync(fd); }
		const end = buf.lastIndexOf(10) + 1;
		this.offsets.set(file, from + end);
		return buf.subarray(0, end).toString("utf8").split("\n").filter(Boolean);
	}

	/* ── bursts, one message per agent ───────────────────────────────── */

	queue(sub, item){
		const bucket = this.pending.get(sub.agent) ?? this.pending.set(sub.agent, []).get(sub.agent);
		bucket.push({ ...item, under: sub.path });
		if (!this.timers.has(sub.agent))
			this.timers.set(sub.agent, setTimeout(() => this.flush(sub.agent), sub.gather_ms ?? 2000));
	}

	flush(agent){
		this.timers.delete(agent);
		const items = this.pending.get(agent) ?? [];
		this.pending.delete(agent);
		if (!items.length) return;
		/* WINDOWS TRAP: chokidar can swallow the "change" event for the very
		 * LAST write of a fast burst — it only surfaces combined with the
		 * NEXT write's event, which may not come until long after this flush
		 * was scheduled. Those bytes are already on disk, so before building
		 * the message, re-read every jsonl file already queued for this
		 * agent: `new_lines` hands back whatever is new since its last
		 * recorded offset. A burst usually queues SEVERAL items for the same
		 * file (one per change event), so this must land on the LAST one —
		 * appending to an earlier item would put the recovered line in the
		 * middle of the message instead of at the end. Walking `items`
		 * backwards and re-reading only the first (= last in order) item
		 * seen per file does that; `new_lines` returns `[]` for every
		 * earlier item since the offset has already moved on. Without this,
		 * a log that goes quiet right after a burst never delivers its own
		 * last line. */
		const done = new Set();
		for (let i = items.length - 1; i >= 0; i--){
			const item = items[i];
			if (!item.lines || done.has(item.file)) continue;
			done.add(item.file);
			const more = this.new_lines(abs(item.file));
			if (more.length) item.lines.push(...more);
		}
		/* An id that is not a live Claude session and not a registered
		 * external one (a VS Code tab, a terminal) is not somebody to send
		 * to — it is a dead subscription (an agent `revive()` buried as
		 * "gone" without ever calling `register(stopped)`, or a made-up
		 * id), and `agents.send()` would REVIVE it: reopen a paid session
		 * nobody asked for, just to deliver a file-change note. Drop the
		 * subscription instead of sending. */
		if (!this.live(agent)){
			this.subs = this.subs.filter(s => s.agent !== agent);
			this.save();
			this.rescope();
			return;
		}
		try { this.agents.send(agent, this.message(items), { from: "servex-follow" }); } catch {}
	}

	live(agent){
		const row = this.agents?.live?.get?.(agent);
		return (!!row && row.state !== "stopped") || !!this.agents?.external?.has?.(agent);
	}

	/* Header, then jsonl lines grouped per file (capped — see CAP below), then
	 * the other changed paths. */
	message(items){
		const jsonl = new Map(), other = new Set();
		for (const i of items){
			if (i.lines) (jsonl.get(i.file) ?? jsonl.set(i.file, []).get(i.file)).push(...i.lines);
			else other.add(i.file);
		}
		const under = [...new Set(items.map(i => i.under))].join(", ");
		let n = other.size;
		const body = [];
		for (const [file, all] of jsonl){
			n += all.length;
			body.push(`${file}:`, ...all.slice(0, this.constructor.CAP));
			if (all.length > this.constructor.CAP) body.push(...this.overflow(file, all));
		}
		if (other.size) body.push(`changed: ${[...other].join(", ")}`);
		return [`follow: ${n} change${n === 1 ? "" : "s"} under ${under}`, ...body].join("\n");
	}

	/* A burst bigger than CAP lines for one file is not sent in full — a
	 * runaway append should not turn one follow message into the whole log.
	 * The dropped lines' byte length, subtracted from that file's current
	 * (fully-advanced) offset, is exactly where they start, so the note tells
	 * the agent where to read the rest itself. */
	overflow(file, all){
		const dropped = all.slice(this.constructor.CAP);
		const bytes = dropped.reduce((sum, l) => sum + Buffer.byteLength(l, "utf8") + 1, 0);
		const end = this.offsets.get(abs(file));
		return [`… ${dropped.length} more line(s) — read ${file} from byte ${end != null ? end - bytes : "?"}`];
	}

	/* ── MCP tools ────────────────────────────────────────────────────── */

	tools(){
		const AGENT = { type: "string", description: "Whose subscription. Defaults to you." };
		const PATH = { type: "string", description: "Repo-relative file or directory, e.g. `public/framework/ux/Dictate` or `Servex/proof`. Refused above module/dir level." };
		return [
			{ name: "follow",
				description: "Watch a file or directory and get told what changes, one message per burst (default"
					+ " every 2s). A .jsonl file's new complete lines arrive verbatim; anything else arrives as its path.",
				inputSchema: { type: "object", required: ["path"], properties: { agent: AGENT, path: PATH,
					gather_ms: { type: "number", description: "Collect changes this long after the first one, then send one message. Default 2000." } } },
				handler: (args = {}, ctx = {}) => JSON.stringify(this.follow({ ...args, agent: args.agent ?? ctx.caller }), null, 2) },
			{ name: "unfollow",
				description: "Stop watching a path.",
				inputSchema: { type: "object", required: ["path"], properties: { agent: AGENT, path: PATH } },
				handler: (args = {}, ctx = {}) => JSON.stringify(this.unfollow({ ...args, agent: args.agent ?? ctx.caller }), null, 2) },
			{ name: "list_follows",
				description: "Every follow subscription, or just one agent's.",
				inputSchema: { type: "object", properties: { agent: AGENT } },
				handler: (args = {}) => JSON.stringify(this.list(args.agent), null, 2) }
		];
	}
}
