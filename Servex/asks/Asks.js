import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stamp } from "../home.js";
import { fold_asks } from "../../public/framework/ai/asks/fold.js";
import { stalled } from "./stalled.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.resolve(HERE, "../../public/framework/ai/asks.jsonl");
const STATUSES = ["routed", "building", "landed", "stalled", "dropped", "parked", "queued"];
const TICK_MS = 60000;
const GRACE_MS = 10 * 60000;   // after a Servex boot, restart-survival revives agents; a "gone" row is not yet final
const BY_TICK = "servex-asks-tick";
const BY_CLOSE = "servex-asks-close_task";

/* THE ASKS LEDGER'S SERVEX SIDE — reads and appends to
 * public/framework/ai/asks.jsonl, and notices when a routed ask's owner goes
 * quiet, so nothing sits in limbo unseen (the owner, 2026-09-30).
 *
 * `new Asks({ servex })` — the real, running thing: every 60 s it folds the
 * ledger, checks every open ask's owner, and marks `stalled` or `building` as
 * the truth changes; it also wraps `servex.task_loop.close_task` so closing a
 * task lands the asks its agent owned. `new Asks({ file })` with no `servex`
 * — what `mark.mjs` and a test use — is read-only plumbing: `read()` and
 * `mark()` still work, but nothing ticks and nothing is wrapped. */
export default class Asks {

	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.file ??= DEFAULT_FILE;
		this.queue = Promise.resolve();   // one write at a time, so two marks can never tear a line
		if (this.servex){
			this.wrap_close_task();
			this.start();
		}
	}

	start(){
		this.booted_at = Date.now();
		this.timer = setInterval(() => { this.tick(); }, TICK_MS);
		this.timer.unref?.();
		return this;
	}

	stop(){ if (this.timer) clearInterval(this.timer); }

	/* ---------- reading: fold_asks is the one vocabulary, shared with the browser ---------- */

	async read(){
		let text = "";
		try { text = await fs.promises.readFile(this.file, "utf8"); } catch {}
		const lines = text.split(/\r?\n/).filter(l => l.trim()).map(l => {
			try { return JSON.parse(l); } catch { return null; }
		});
		return fold_asks(lines);
	}

	/* ---------- writing: append-only, never a rewrite ---------- */

	/* Appends one `{"ask":{id,status,why,by,at}}` line. Refuses an id the
	 * ledger doesn't know, or a status that isn't one of the five the system
	 * understands — a typo in either would otherwise sit in the file forever,
	 * since nothing here ever rewrites a line. */
	async mark(id, status, why, by){
		if (!STATUSES.includes(status)) return { ok: false, why: `unknown status "${status}" — one of ${STATUSES.join(", ")}` };
		const folded = await this.read();
		if (!folded[id]) return { ok: false, why: `no ask "${id}"` };
		await this.append_line({ ask: { id, status, why: why ?? null, by: by ?? null, at: stamp() } });
		return { ok: true, id, status };
	}

	/* One writer, queued behind whatever this instance already has in flight —
	 * same shape as Cards.js's and TaskLoop.js's own per-file queues. Checks
	 * the file's last byte itself (no dependency on `.claude/hooks/append.mjs`,
	 * which only a CLI/agent context can run) so a file with no trailing
	 * newline still gets a clean line. */
	append_line(obj){
		const text = JSON.stringify(obj);
		const next = this.queue.then(async () => {
			let prefix = "";
			try {
				const st = await fs.promises.stat(this.file);
				if (st.size > 0){
					const fd = await fs.promises.open(this.file, "r");
					const buf = Buffer.alloc(1);
					await fd.read(buf, 0, 1, st.size - 1);
					await fd.close();
					if (buf[0] !== 0x0a) prefix = "\n";
				}
			} catch { await fs.promises.mkdir(path.dirname(this.file), { recursive: true }); }
			await fs.promises.appendFile(this.file, prefix + text + "\n", "utf8");
		});
		this.queue = next.catch(() => {});
		return next;
	}

	/* ---------- the tick: notice a stalled ask, a cleared one, or a landed one ---------- */

	async tick(){
		if (this.booted_at && Date.now() - this.booted_at < GRACE_MS) return;
		try {
			const folded = await this.read();
			const registry = this.servex?.agents?.registry_list?.() ?? [];
			for (const ask of Object.values(folded)) await this.check_one(ask, registry);
		} catch (e){
			try { await this.servex?.log?.append("servex", { type: "asks-tick-error", error: String(e?.message || e) }); } catch {}
		}
	}

	/* One ask, one judgment. A task that landed wins over a stall check — an
	 * owner who just landed its task is not "silent", it's done. Marking
	 * happens at most once per state change: `stalled` is only appended when
	 * the ask isn't already `stalled`, `building` only when it is — so a tick
	 * that finds nothing changed writes nothing. */
	async check_one(ask, registry){
		if (stalled.NOT_WATCHED.includes(ask.status)) return;   // closed, parked or queued: nobody owes a turn yet
		const row = this.owner_row(ask, registry);

		if (row?.task_landed){ await this.mark(ask.id, "landed", "owner's task.jsonl has a landed_at line", BY_TICK); return; }

		const verdict = stalled(ask, row, Date.now());
		if (verdict.stalled && ask.status !== "stalled") await this.mark(ask.id, "stalled", verdict.why, BY_TICK);
		else if (!verdict.stalled && ask.status === "stalled") await this.mark(ask.id, "building", "owner agent active again", BY_TICK);
	}

	/* The registry row for `ask.owner`, plus what the registry alone can't
	 * say: `last_task_line_at` and `task_landed` (its task dir's task.jsonl —
	 * `registry.js`'s own `task_dir` field names it), and `queued` (messages
	 * waiting in its live send queue; 0 for a stopped, gone or never-live
	 * agent). `null` when the agent never registered at all — `stalled()`
	 * treats that the same as gone. */
	owner_row(ask, registry){
		const row = registry.find(r => r.id === ask.owner) ?? null;
		if (!row) return null;
		const live = this.servex?.agents?.live?.get?.(ask.owner);
		const queued = live?.queue?.items?.length ?? 0;
		const dir = row.task_dir ?? this.servex?.agents?.task_dir_for?.(row) ?? null;
		const { last_at, landed } = dir ? this.task_state(dir) : { last_at: null, landed: false };
		return { ...row, last_task_line_at: last_at, task_landed: landed, queued };
	}

	/* A task dir's task.jsonl, read cold — Asks never writes here, only reads,
	 * so no write-queue is needed. Returns the last line's own timestamp
	 * (whatever shape wrote it: `assign`, `log`, `action`, `decision` — every
	 * line in this repo's task logs carries `at` somewhere) and whether a
	 * `finish-task` landing line is in it, same test `TaskLoop.read_task`
	 * already uses: a non-empty `outcome` alongside `landed_at`. */
	task_state(dir){
		let text;
		try { text = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8"); } catch { return { last_at: null, landed: false }; }
		const state = {};
		let last_at = null;
		for (const raw of text.split("\n")){
			if (!raw.trim()) continue;
			let obj; try { obj = JSON.parse(raw); } catch { continue; }
			if (obj.assign && typeof obj.assign === "object") Object.assign(state, obj.assign);
			// most task lines carry `at` at the top level ({"decision":{…},"at":…}); some nest it
			const at = obj.at ?? obj.assign?.at ?? obj.assign?.landed_at ?? obj.log?.at ?? obj.action?.at ?? obj.decision?.at;
			if (at) last_at = at;
		}
		return { last_at, landed: !!state.landed_at && !!String(state.outcome ?? "").trim() };
	}

	/* ---------- close_task wraps: landing a task lands the asks its agent owned ---------- */

	/* Wraps `servex.task_loop.close_task` once, keeping the original's return
	 * value untouched — the fence allows one line in Servex.js and nothing in
	 * TaskLoop.js, so this is the only way to hear "a task just closed"
	 * without editing that file. Safe to call twice (a re-construct in a
	 * test): the wrap marks itself and skips if it's already on. */
	wrap_close_task(){
		const tl = this.servex?.task_loop;
		if (!tl || typeof tl.close_task !== "function" || tl.close_task.__asks_wrapped) return;
		const original = tl.close_task.bind(tl);
		const wrapped = async (args) => {
			const out = await original(args);
			if (out?.ok) try { await this.task_closed(args); } catch {}
			return out;
		};
		wrapped.__asks_wrapped = true;
		tl.close_task = wrapped;
	}

	/* The dir's task.jsonl names its owning agent on an `{"assign":{"agent"}}`
	 * line, same field `TaskLoop.owning_agent_id` reads first. Every open ask
	 * that agent owns lands. */
	async task_closed({ dir } = {}){
		if (!dir) return;
		const root = this.servex?.task_loop?.root ?? process.cwd();
		const abs = path.isAbsolute(dir) ? dir : path.join(root, dir);
		let text;
		try { text = fs.readFileSync(path.join(abs, "task.jsonl"), "utf8"); } catch { return; }
		let agent = null;
		for (const raw of text.split("\n")){
			if (!raw.trim()) continue;
			let obj; try { obj = JSON.parse(raw); } catch { continue; }
			if (obj.assign?.agent) agent = obj.assign.agent;
		}
		if (!agent) return;
		const folded = await this.read();
		for (const ask of Object.values(folded))
			if (ask.owner === agent && !["landed", "dropped", "parked"].includes(ask.status))
				await this.mark(ask.id, "landed", "owner's task closed", BY_CLOSE);
	}
}

Asks.STATUSES = STATUSES;
Asks.DEFAULT_FILE = DEFAULT_FILE;
