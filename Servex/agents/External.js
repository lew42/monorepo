import fs from "node:fs";
import { place, stamp } from "../home.js";

/* EXTERNAL AGENTS — a VS Code tab, a terminal, or any Claude session Servex
 * did not spawn can become an agent other agents can message, even though
 * Servex holds no process for it and cannot steer it the way it steers its
 * own (Agents.js's `live` Map).
 *
 * `register_session({id, session_id})` — called by the outside session
 * itself — writes one row to the SAME shared registry every real agent
 * writes to (`registry.js`, `registry.json`), with `kind: "external"`. From
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
 *     (`.claude/skills/servex-mastermind/SKILL.md`, `every-prompt/page-assistant.md`).
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
	 * `registry.js`'s own `save()` (a synchronous whole-file rewrite) already
	 * relies on. Returns an agent-shaped stand-in so `send_to_agent`'s
	 * `card(agents.send(...))` has a `.card()` to call, same as a real one. */
	deliver(id, text, note = {}){
		const line = { from: note.from ?? null, text, reply_to: note.reply_to ?? null, at: stamp() };
		fs.appendFileSync(this.file(id), JSON.stringify(line) + "\n");
		this.touch(id);
		return { id, state: "external", delivered: line, card: () => ({ id, kind: "external", state: "external", delivered: line }) };
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
