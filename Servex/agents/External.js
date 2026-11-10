import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { place, stamp } from "../home.js";
import Follow from "../Follow.js";

// Servex/agents/External.js -> up two is the repo root (where public/ and Servex/ live)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/* EXTERNAL AGENTS — a VS Code tab, a terminal, or any Claude session Servex
 * did not spawn can become an agent other agents can message, even though
 * Servex holds no process for it and cannot steer it the way it steers its
 * own (Agents.js's `live` Map).
 *
 * `register_session({id, session_id})` — called by the outside session
 * itself — writes one row to the SAME shared registry every real agent
 * writes to (`Registry.js`, `registry.json`), with `kind: "external"`. From
 * then on:
 *
 *   - `list_agents` shows it beside every real agent (`registry_list()`
 *     already just reads every row back — no change needed there).
 *   - `send_to_agent` to that id, and the owner's words on any card it
 *     created (`create_card`'s `by`, which was already recorded before this
 *     file existed), do not try to find a live session — there is none —
 *     they append one line to the id's own INBOX FILE instead:
 *     `logs/inbox/<id>.jsonl`, under Servex's own log dir (`home.js`'s
 *     `place()`, so `SERVEX_HOME` moves it with everything else Servex owns).
 *   - the outside session reads its inbox with one `Monitor` tailing it (a
 *     tail, never a poll). A Monitor always expires: 30 minutes
 *     (`timeout_ms: 1800000`) is the most the tool allows, so the tab re-arms
 *     it at the start of each turn and on each expiry notice
 *     (`.claude/skills/servex-mastermind/SKILL.md`, `every-prompt/SKILL.md` — this
 *     is the VS Code tab's own doorstep, not a spawned assistant's, so it moved
 *     out of `every-prompt/page-assistant.md` (fresh-eyes review, finding 4)).
 *
 * Plain code, no Claude session of its own — the same shape as `Layers.js`
 * and `Cards.js`: one module `Servex.js` installs once, that adds its own MCP
 * tool and subscribes to the one event it needs (`servex.cards.on`).
 *
 * ⚠ NOT COVERED HERE: a Servex restart. `Agents.revive()` (outside this
 * file's fence — Agents.js may only be touched on its send path) walks every
 * registry row with no matching live agent and, finding no `agent-<id>.jsonl`
 * log for an external row (there is none — its lines go to `inbox/`, not
 * `logs/agent-<id>.jsonl`), buries it as "gone". The row still carries its
 * `session_id` and `kind: "external"`, so calling `register_session` again
 * after a restart fully restores it — the tab already re-arms its Monitor at
 * the start of every turn, so re-registering there too is one more line, not
 * a new habit. Not needed for this task's proof, which never restarts Servex
 * mid-run; left for whichever task next opens `revive()`. */
export default class External {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	install(){
		this.servex.agents.external = this;   // Agents.send()'s one new branch reaches back here
		this.tool();
		this.listen_cards();
		return this;
	}

	// ── the registry row ─────────────────────────────────────────────────

	reg(){ return this.servex.agents.reg(); }

	/* The row for `id`, only if it was registered here — `undefined` for
	 * every ordinary agent's row, so `has()` never mistakes one for external. */
	row(id){
		const row = this.reg().read()[id];
		return row?.kind === "external" ? row : null;
	}

	has(id){ return !!this.row(id); }

	register({ id, session_id } = {}){
		if (!id || typeof id !== "string") throw new Error("register_session needs an `id` — a short, readable word, never a uuid.");
		/* `id` becomes a filename (`file()` below, `logs/inbox/<id>.jsonl`): anything else lets
		 * an id like "../../x" write outside that directory (fresh-eyes review, finding 3). */
		if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error(`register_session refused: "${id}" is not a valid id — lowercase letters, digits and hyphens only, starting with a letter or digit (such as vscode-<your task>).`);
		if (!session_id) throw new Error("register_session needs `session_id` — this session's own Claude session uuid (in a terminal, $CLAUDE_CODE_SESSION_ID).");
		const rows = this.reg().read();
		/* An id that already belongs to one of Servex's own agents is refused: its row
		 * would turn into an inbox, and a message to it would land in a file instead of
		 * waking that agent (fresh-eyes review, finding 5). */
		const taken = rows[id] && rows[id].kind !== "external" ? "the registry"
			: this.servex.agents.live?.has?.(id) ? "the running agents"
			: this.servex.agents.layers?.owner?.(id) ? "the page pairs (layers.json)" : null;
		if (taken) throw new Error(`register_session refused: "${id}" already belongs to one of Servex's own agents (found in ${taken}). Pick another id, such as vscode-<your task>.`);
		const row = {
			...(rows[id] ?? {}),
			id, kind: "external", state: "external", session_id,
			registered_at: rows[id]?.registered_at ?? stamp(),
			last_at: stamp()
		};
		rows[id] = row;
		this.reg().save(rows);
		this.servex.log?.append?.("servex", { type: "external", event: "registered", id, session_id }).catch?.(() => {});
		return row;
	}

	// ── the inbox ────────────────────────────────────────────────────────

	file(id){ return place("logs", "inbox", `${id}.jsonl`); }

	/* One line: `from`, `text`, `reply_to`, `at`. A synchronous append —
	 * Servex is one process and this is the only thing that ever writes this
	 * file, so there is no second writer to race, the same guarantee
	 * `Registry.js`'s own `save()` (a synchronous whole-file rewrite) already
	 * relies on. Returns an agent-shaped stand-in so `send_to_agent`'s
	 * `card(agents.send(...))` has a `.card()` to call, same as a real one. */
	deliver(id, text, note = {}){
		this.rotate(id);
		const line = { from: note.from ?? null, text, reply_to: note.reply_to ?? null, at: stamp() };
		fs.appendFileSync(this.file(id), JSON.stringify(line) + "\n");
		this.touch(id);
		const card = { id, kind: "external", state: "external", ok: true, delivered_to: `the inbox of the VS Code tab ${id} (logs/inbox/${id}.jsonl)`, note: "Delivered. A tab is not a running agent, so it will not answer in this call: it reads its inbox on its next turn.", delivered: line };
		return { id, state: "external", delivered: line, card: () => card };
	}

	/* Make `id` addressable if it is not yet (the remote door's caller, "voice-app", has no tab to register itself). */
	ensure(id){ if (!this.has(id)) this.register({ id, session_id: id }); return this; }

	// legacy single-cursor file, kept so a caller with no `conversation` key reads where it always did
	cursor_file(id){ return place("logs", "inbox", `${id}.cursor`); }
	// one place per caller, one entry per conversation key: {key: {offset, at, follows: {<file>: offset}}} —
	// beside the legacy cursor file (not `place()` directly), so a test that overrides `cursor_file`/`file` to
	// a scratch dir gets this redirected too, with no second override to remember.
	cursors_file(id){ return path.join(path.dirname(this.cursor_file(id)), `${id}.cursors.json`); }

	load_cursors(id){ try { return JSON.parse(fs.readFileSync(this.cursors_file(id), "utf8")); } catch { return {}; } }
	save_cursors(id, map){ const f = this.cursors_file(id); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(map, null, 1)); }

	legacy_offset(id){ try { return Number(fs.readFileSync(this.cursor_file(id), "utf8")) || 0; } catch { return 0; } }

	/* One row per sender: its latest line and how many arrived — the "digest" shape `updates` returns by default
	 * (catch-up.md, "Not built" item 1). `from` for an inbox line, `agent` for a followed one. */
	digest(events){
		const by = new Map();
		for (const e of events){
			const who = e.from ?? e.agent ?? "unknown";
			const row = by.get(who) ?? { from: who, count: 0, latest: null };
			row.count++;
			row.latest = e.text !== undefined ? { text: e.text, at: e.at ?? null } : { line: e.line ?? e, at: e.line?.at ?? null };
			by.set(who, row);
		}
		return [...by.values()];
	}

	// every .jsonl file at `rel` (a file) or under it (a directory), never node_modules/.git — a WALK, only used as the
	// fallback below when there is no live Follow to ask instead (fix C: a directory walked on every `updates` call,
	// for a module with thousands of files, was the actual cost this was built to cut)
	walk_jsonl_files(rel){
		const abs = path.join(ROOT, rel);
		let stat; try { stat = fs.statSync(abs); } catch { return []; }
		if (stat.isFile()) return abs.endsWith(".jsonl") ? [abs] : [];
		const out = [], stack = [abs];
		while (stack.length){
			const at = stack.pop();
			let entries; try { entries = fs.readdirSync(at, { withFileTypes: true }); } catch { continue; }
			for (const e of entries){
				if (e.name === "node_modules" || e.name === ".git") continue;
				const full = path.join(at, e.name);
				if (e.isDirectory()) stack.push(full);
				else if (e.name.endsWith(".jsonl")) out.push(full);
			}
		}
		return out;
	}

	/* The files one `follow` subscription covers, WITHOUT walking the tree again: a single file is just itself
	 * (cheap either way); a directory reuses the `.jsonl` files `Follow` already tracks under it (`follow.offsets`,
	 * populated as Follow's own chokidar watcher sees each file — the SAME set `follow.js`'s own burst delivery
	 * reads from). Only a test double with no live `Follow` (no `.offsets` map) falls back to a real walk. */
	followed_files(sub){
		const abs = path.join(ROOT, sub.path);
		let stat; try { stat = fs.statSync(abs); } catch { return []; }
		if (stat.isFile()) return abs.endsWith(".jsonl") ? [abs] : [];
		const offsets = this.servex.follow?.offsets;
		if (!(offsets instanceof Map)) return this.walk_jsonl_files(sub.path);
		const prefix = abs + path.sep;
		return [...offsets.keys()].filter(f => f === abs || f.startsWith(prefix));
	}

	// one followed line passes a sub's own filters (fix B): `of` (a parent tailing a child) keeps only state/pointer
	// lines, `skip_by`/`heard` drop the agent's own lines — the SAME static helpers Follow.flush applies to a pushed burst
	passes_filters(sub, raw_text){
		if (sub.of && !Follow.worth_waking([raw_text]).length) return false;
		if ((sub.skip_by || sub.heard) && !Follow.without([raw_text], sub.skip_by, sub.heard).length) return false;
		return true;
	}

	rel_path(abs){ return path.relative(ROOT, abs).split(path.sep).join("/"); }

	// best-effort: a session id folder name out of a sessions/YYYY/MM/DD/<folder>/... path; null for anything else
	session_of_path(rel){ return /sessions\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\//.exec(rel)?.[1] ?? null; }

	/* STEP 2 — follows read the logs, not the inbox. For an external caller, `follow` still records the
	 * subscription (Follow.js), but delivers nothing to the inbox (Follow.flush's own external check); the
	 * lines live only in the followed files themselves. Here, at `updates` time, each followed file is read
	 * from THIS conversation key's own byte offset (`state.follows[rel]`), independent of Follow's own
	 * change-detection offsets. A key's first read of a file starts at the file's CURRENT END (no backlog
	 * replay), same rule as a brand-new conversation key over the inbox itself.
	 *
	 * `budget` (fix A) caps how many EVENTS this call returns — never how many bytes it reads: inside one file
	 * it reads line by line and stops exactly at a line boundary once the budget is spent, so the per-file
	 * offset only ever advances past lines actually handed back. Without this, a 60-line burst with a 50-line
	 * budget would have `jsonl_files`' old whole-file read move the offset past all 60 while returning only 50
	 * — the other 10 gone forever, never re-read. Returns `{events, more}`; `more` is true when this file (or a
	 * later one, once the budget is spent) still has bytes this key has not read.
	 *
	 * `state` is mutated in place (its `follows` map advances) — a peek passes a disposable copy instead of
	 * the real cursor state, so a peek never moves anything, here or in the inbox offset above. */
	followed_lines(id, state, budget = Infinity){
		const follow = this.servex.follow;
		if (typeof follow?.list !== "function" || budget <= 0) return { events: [], more: false };
		state.follows ??= {};
		const out = [];
		let more = false;
		for (const sub of follow.list(id)){
			for (const file of this.followed_files(sub)){
				const rel = this.rel_path(file);
				let size; try { size = fs.statSync(file).size; } catch { continue; }
				let prev = state.follows[rel];
				if (prev == null){ state.follows[rel] = size; continue; }   // first read of this file for this key: starts at now
				if (size < prev){ state.follows[rel] = size; continue; }    // the file was truncated/replaced: catch up, resend nothing
				if (size === prev) continue;                                // nothing new here
				if (out.length >= budget){ more = true; continue; }         // budget already spent this call: note there is more, read it next time
				const buf = Buffer.alloc(size - prev), fd = fs.openSync(file, "r");
				try { fs.readSync(fd, buf, 0, buf.length, prev); } finally { fs.closeSync(fd); }
				let pos = 0, consumed = 0;
				while (pos < buf.length && out.length < budget){
					const nl = buf.indexOf(10, pos);
					if (nl === -1) break;   // an unfinished trailing line waits for next time
					const raw_text = buf.toString("utf8", pos, nl).trim();
					pos = nl + 1;
					consumed = pos;
					if (!raw_text) continue;
					if (!this.passes_filters(sub, raw_text)) continue;   // filtered out, but its bytes are still consumed — never re-delivered
					let line; try { line = JSON.parse(raw_text); } catch { line = { raw: raw_text }; }
					out.push({ agent: sub.of ?? line.by ?? null, session: this.session_of_path(rel), path: rel, line, at: line.at ?? null });
				}
				state.follows[rel] = prev + consumed;
				if (pos < buf.length) more = true;   // bytes left unread in this file: the budget ran out, or the last line was unfinished
			}
		}
		return { events: out, more };
	}

	/* The `updates` tool: everything that arrived for this caller/conversation since its own cursor, oldest
	 * first, at most `cap`. `peek` leaves the cursor in place.
	 *
	 * ONE PLACE PER CONVERSATION (the owner, 2026-11-09): the cursor key is `conversation` (a claude.ai
	 * conversation id, passed by RemoteMCP as the tool call's `ctx.session.id`) or, with none, the caller
	 * itself — today's behaviour. Every key's place is one entry in `<id>.cursors.json`; the OLD single
	 * `<id>.cursor` file is still read as the caller-key's own entry, so nothing already in flight jumps.
	 * A BRAND NEW key starts at "now" (the inbox's current end), not at the backlog: it gets `missed`, a
	 * digest of what happened between the caller's own shared cursor and now, capped to the last 24h — so a
	 * second mastermind that only just started talking to this voice session is told what it missed, without
	 * replaying raw lines it never subscribed to.
	 *
	 * By default the return is a DIGEST (catch-up.md, "Not built" item 1): `updates` holds the latest line per
	 * sender, and `digest` lists every sender with its count and latest line — so hundreds of repeated "done,
	 * idle" lines from one agent cost one row, not one line each. `raw: true` returns every line, as before. */
	updates(id, { peek = false, cap = 50, conversation = null, raw = false } = {}){
		const key = conversation || id, file = this.file(id);
		let buf = Buffer.alloc(0); try { buf = fs.readFileSync(file); } catch {}
		const end = buf.lastIndexOf(10) + 1;   // only complete lines
		const map = this.load_cursors(id);
		let state = map[key], missed;
		if (!state){
			if (key === id) state = { offset: this.legacy_offset(id) };   // the caller's own key: pick up the legacy single cursor
			else {
				const shared = Math.min(map[id]?.offset ?? this.legacy_offset(id), end);
				const between = this.read_range(buf, shared, end).filter(l => { const t = Date.parse(l.at ?? ""); return !Number.isFinite(t) || Date.now() - t < 86400000; });
				missed = this.digest(between);   // a brand new key gets what it missed, even an empty list, so its shape never surprises a reader
				state = { offset: end };   // and starts reading fresh from now, not the backlog
			}
		}
		if ((state.offset ?? 0) > buf.length) state.offset = 0;   // the inbox was replaced; start over
		const all_new = this.read_range(buf, state.offset ?? 0, end);   // every unread inbox line, uncapped, so `more` can be exact
		const lines = all_new.slice(0, cap);
		// a peek must not move ANY cursor, including the per-file ones `followed_lines` advances — read against a disposable copy
		const follow_state = peek ? { follows: { ...(state.follows ?? {}) } } : state;
		// the remaining budget after the inbox's own share (fix A) — followed_lines stops at a line boundary once it is spent, so nothing it reads is ever dropped
		const { events: followed, more: followed_more } = this.followed_lines(id, follow_state, Math.max(0, cap - lines.length));
		const events = [...lines, ...followed];
		const more = all_new.length > lines.length || followed_more;
		if (!peek){
			state.offset = this.advance(buf, state.offset ?? 0, lines.length);
			state.at = stamp();
			map[key] = state;
			this.save_cursors(id, map);
		}
		const result = { count: events.length, more, updates: raw ? events : this.latest_per_sender(events) };
		if (!raw) result.digest = this.digest(events);
		if (missed) result.missed = missed;
		return result;
	}

	// every complete line between two byte offsets, parsed; `cap` stops early (used for the live read, not `missed`, which wants them all within 24h)
	read_range(buf, from, to, cap = Infinity){
		const lines = [];
		let pos = from;
		while (pos < to && lines.length < cap){
			const nl = buf.indexOf(10, pos), text = buf.toString("utf8", pos, nl).trim();
			pos = nl + 1;
			if (!text) continue;
			try { lines.push(JSON.parse(text)); } catch { lines.push({ raw: text }); }
		}
		return lines;
	}

	// the byte offset after reading `count` lines starting at `from` — re-walks the buffer so partial pages (cap) advance exactly as far as they read
	advance(buf, from, count){
		let pos = from, seen = 0;
		while (seen < count){
			const nl = buf.indexOf(10, pos);
			if (nl === -1) break;
			const text = buf.toString("utf8", pos, nl).trim();
			pos = nl + 1;
			if (text) seen++;
		}
		return pos;
	}

	// `updates` without `raw` holds only the newest line per sender, so a reader using `updates[].text` the old way still works
	latest_per_sender(events){
		const by = new Map();
		for (const e of events) by.set(e.from ?? e.agent ?? "unknown", e);
		return [...by.values()];
	}

	/* How many events (inbox + followed) sit after this key's cursor (the "N new updates" hint). */
	pending(id, conversation = null){ return this.updates(id, { peek: true, cap: Infinity, conversation }).count; }

	// the first line of a file, without reading the whole thing (fix D) — grows its read window only as far as it needs to find a newline
	first_line(file){
		let fd, size;
		try { size = fs.statSync(file).size; if (!size) return null; fd = fs.openSync(file, "r"); } catch { return null; }
		try {
			for (let want = 4096; ; want *= 4){
				const n = Math.min(want, size), buf = Buffer.alloc(n);
				fs.readSync(fd, buf, 0, n, 0);
				const nl = buf.indexOf(10);
				if (nl !== -1) return buf.toString("utf8", 0, nl).trim();
				if (n >= size) return buf.toString("utf8").trim();   // the whole file is one line (or has none)
			}
		} finally { try { fs.closeSync(fd); } catch {} }
	}

	// ms since `at` was last updated — Infinity (always "stale") for a cursor with no timestamp at all
	age_ms(at){ const t = Date.parse(at ?? ""); return Number.isFinite(t) ? Date.now() - t : Infinity; }

	/* STEP 5 — rotation. Called before every append: when the inbox's first line is from an earlier calendar
	 * month than now, the already-read portion moves to `logs/inbox/archive/<id>-<YYYY-MM>.jsonl` (appended,
	 * never overwritten), and every cursor is rebased to the shorter file. Only reads the whole file once it
	 * has already decided, from the first line alone, that a rotation is actually due (fix D) — the common
	 * case (every other call, all month) costs one small read, not the whole inbox.
	 *
	 * A STALE cursor (fix D) — one `updates()` has not touched in 7+ days, the legacy `.cursor` file counted
	 * by its own mtime — does not PIN the rotation: it is rebased to 0 instead of to its true remaining
	 * distance, so a conversation nobody has resumed in a week cannot hold the whole inbox hostage forever.
	 * Whatever that stale cursor had not read yet is still in the archive, not lost, just no longer live;
	 * [catch-up.md](ext/remote/doc/catch-up.md) says so. */
	rotate(id){
		const STALE_MS = 7 * 86400000;
		const file = this.file(id);
		let parsed; try { parsed = JSON.parse(this.first_line(file) ?? ""); } catch { return; }
		const at = Date.parse(parsed?.at ?? "");
		if (!Number.isFinite(at)) return;
		const first_date = new Date(at), now = new Date();
		if (first_date.getUTCFullYear() === now.getUTCFullYear() && first_date.getUTCMonth() === now.getUTCMonth()) return;
		let buf; try { buf = fs.readFileSync(file); } catch { return; }   // a rotation is actually due: now the whole file is read, once
		if (!buf.length) return;
		const map = this.load_cursors(id);
		const fresh = [];
		// the legacy key only still matters for a caller that has never gone through `updates()` yet (no entry in `map`)
		if (!map[id]){
			let mtime = 0; try { mtime = fs.statSync(this.cursor_file(id)).mtimeMs; } catch {}
			if (Date.now() - mtime < STALE_MS) fresh.push(this.legacy_offset(id));
		}
		for (const s of Object.values(map)) if (this.age_ms(s.at) < STALE_MS) fresh.push(s.offset ?? 0);
		const keep_from = fresh.length ? Math.min(buf.length, ...fresh) : buf.length;   // nobody fresh is reading: archive everything
		if (keep_from <= 0) return;
		const ym = `${first_date.getUTCFullYear()}-${String(first_date.getUTCMonth() + 1).padStart(2, "0")}`;
		const archive = path.join(path.dirname(file), "archive", `${id}-${ym}.jsonl`);
		fs.mkdirSync(path.dirname(archive), { recursive: true });
		fs.appendFileSync(archive, buf.subarray(0, keep_from));
		fs.writeFileSync(file, buf.subarray(keep_from));
		fs.writeFileSync(this.cursor_file(id), String(Math.max(0, this.legacy_offset(id) - keep_from)));
		for (const k of Object.keys(map)) map[k].offset = Math.max(0, (map[k].offset ?? 0) - keep_from);
		this.save_cursors(id, map);
	}

	touch(id){
		const rows = this.reg().read();
		if (!rows[id]) return;
		rows[id].last_at = stamp();
		this.reg().save(rows);
	}

	// ── a card's owner prompt reaches its creator ───────────────────────

	/* `create_card` already stamps `by` on the card's first line (Cards.js —
	 * checked, nothing to add there). A fresh owner prompt on that card goes
	 * to the creator's inbox when the creator registered as external.
	 * Subscribed here, not in Layers.js: that file is the card assistant/
	 * manager pair, a different minion's fence, and its own `listen()`
	 * already does the analogous thing for THOSE two agents — this is the
	 * same pattern, for a third kind of listener. */
	listen_cards(){
		this.servex.cards.on((id, line, info) => {
			if (!line?.prompt || !info?.fresh) return;
			this.route(id, line.prompt).catch(() => {});
		});
	}

	async route(id, prompt){
		const card = this.servex.cards.canonical(id) ?? id;
		const state = await this.servex.cards.fold(card).catch(() => null);
		const creator = state?.by;
		if (!creator || !this.has(creator)) return;
		this.deliver(creator, prompt.text ?? prompt.raw ?? "", { from: "owner", reply_to: `card ${card}` });
	}

	// ── the MCP tool ─────────────────────────────────────────────────────

	tool(){
		this.servex.mcp.tool({
			name: "updates",
			description: "What arrived for you since your last call: a digest (one row per sender — agent messages, follow deltas, the owner's notes — with its latest line and how many arrived), oldest change first, at most 50 senders (`more: true` means call again). Call it at the start of nearly every turn. `peek: true` reads without moving your place. `raw: true` returns every line instead of the digest. Pass your claude.ai conversation id as `conversation` so your own place is kept separately from any other conversation reading the same inbox. Subscribe to a log with `follow({path, agent: \"<your id>\"})` — its lines are read here too, not pushed to your inbox.",
			inputSchema: { type: "object", properties: {
				peek: { type: "boolean", description: "Read without marking the lines as seen." },
				raw: { type: "boolean", description: "Every line instead of the one-per-sender digest." },
				conversation: { type: "string", description: "Your claude.ai conversation id, if you know it: keeps your own place separate from any other conversation calling as the same agent." }
			} },
			handler: (args = {}, ctx = {}) => {
				if (!ctx.caller) return JSON.stringify({ ok: false, error: "updates needs a caller" });
				try {
					this.ensure(ctx.caller);
					return JSON.stringify(this.updates(ctx.caller, { peek: !!args.peek, raw: !!args.raw, conversation: args.conversation || ctx.session?.id || null }));
				} catch (e){ return JSON.stringify({ ok: false, error: String(e.message || e) }); }
			}
		});
		this.servex.mcp.tool({
			name: "register_session",
			description: "Register THIS Claude session — a VS Code tab, a terminal, anything Servex did not spawn — as"
				+ " an agent other agents can address. Call it once, near the start. After this, `list_agents` lists you"
				+ " (`kind: \"external\"`); `send_to_agent` to your id, and the owner's words on any card you create with"
				+ " `create_card` (its `by` is you), are appended to your own inbox file instead of trying to reach a live"
				+ " process — there is none, you already are one. Read the inbox with one `Monitor` tailing"
				+ " `logs/inbox/<your id>.jsonl` under Servex's home, with `timeout_ms: 1800000` (30 minutes, the most a Monitor"
				+ " allows; it cannot run forever). Re-arm it at the start of every turn and whenever it expires. Returns the registry row Servex now holds for you.",
			inputSchema: { type: "object", required: ["id", "session_id"], properties: {
				id: { type: "string", description: "The id you want to be addressed by from now on — a short, readable word, e.g. `vscode-recursive-pairs`. Never a uuid." },
				session_id: { type: "string", description: "This session's own Claude session uuid, so a resume can still find you. In a terminal, $CLAUDE_CODE_SESSION_ID." }
			} },
			handler: (args = {}) => { try { return JSON.stringify(this.register(args), null, 2); } catch (e){ return JSON.stringify({ ok: false, error: String(e.message || e) }); } }
		});
	}
}
