import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "../..");

/* The same pause switch the Dispatcher reads — one file stops every agent the
 * fast assistant could start, helpers included (Dispatcher.js's own comment). */
const OFF = path.join(process.env.LOCALAPPDATA || "", "lew42", "servex", "dispatch.off");

/* An id minted from a name, once, and frozen — `Live Board` -> `live-board`.
 * events.md's whole rename story rests on this: the label moves, the address
 * never does. */
const slug = text => String(text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "thing";

/* THE FAST ASSISTANT, living inside Servex.
 *
 * The owner dictates; `ux/Dictate` POSTs each finished sentence to
 * `/log/prompts`; Servex's single writer appends it and announces it; this
 * class puts those words in front of one always-alive Claude session, which
 * answers in seconds with a NAME for each thing named, a CARD for the idea and
 * a REFINED reading citing the sentence numbers. It never filters and never
 * builds — that is the whole posture, and it is written out in `assistant.md`
 * beside this file, which is handed to the session as its system prompt.
 *
 * It speaks through exactly ONE door: the MCP tool `append_prompt_event`, whose
 * handler is `append()` below. It has no file tools at all, so the only trace
 * it can leave on this machine is a line in the prompts log — and `by` and `re`
 * are stamped here, by us, never taken from what the model said. */
export default class Assistant {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return { id: "assistant-fast", role: "assistant", name: "fast", log: "prompts", current: null, minted: [], last_card: null,
			selected: null, card: null,
			root: path.join(HERE, "../../public/framework") };
	}

	/* Its posture, read from disk once. A plain string `systemPrompt` REPLACES
	 * the CLI's own, which is what keeps this session small and fast — it has
	 * one job and no need for the coding agent's whole preamble. */
	brief(){ return this.system ??= fs.readFileSync(path.join(HERE, "assistant.md"), "utf8"); }

	install(){ this.tool(); this.route(); this.listen(); return this; }

	live(){ const a = this.servex.agents.live.get(this.id); return a && a.state !== "stopped" ? a : null; }

	/* Idempotent: calling it when the assistant is already up hands back the
	 * same session. A STOPPED one still sits in the host's `live` map, and
	 * `Agents.name()` would dodge the collision by naming the replacement
	 * `assistant-fast-2` — an id nothing else here knows — so the corpse is
	 * cleared out first and the name stays the one constant in the system. */
	start(){
		const live = this.live();
		if (live) return live;
		this.servex.agents.live.delete(this.id);
		return this.servex.agents.spawn({
			role: this.role, name: this.name,
			system: this.brief(),
			/* An MCP tool call needs the same approval a Bash command does under
			 * acceptEdits, and nobody can give it to a session with no terminal
			 * (roles.js records the run where that silently stopped an agent
			 * dead). Safe here only because the tool list below is one tool. */
			permission_mode: "bypassPermissions",
			allowed_tools: ["mcp__servex__append_prompt_event"],
			prompt: "You are on duty. The next message will be the owner's words. Answer nothing now."
		});
	}

	/* THE HOOK — every line the single writer accepts is announced on the log
	 * itself (`Servex.Log`'s own `append`), and a `prompt` on our log is our
	 * cue. Nothing polls; nothing else in Servex has to know we exist. */
	listen(){
		this.servex.log.on("append", (name, entry) => {
			if (name === this.log && entry.type === "prompt") this.heard(entry);
		});
	}

	heard(prompt){
		this.current = prompt.id ?? this.current;
		this.minted = [];
		/* THE CARD IT WAS SPOKEN INTO — `selected` is `<slug>` or `<slug>/<sub>`;
		 * the log is always the root card's (`cards/<slug>`), the sub stays in
		 * `re`. Remembered for the whole turn, so the reply finds its way back. */
		this.selected = prompt.selected ?? (typeof prompt.re === "string" ? prompt.re : null);
		this.card = this.selected?.split("/")[0] ?? null;
		try { this.start().send(this.words(prompt), { from: "owner", reply_to: `log ${this.log}` }); }
		catch (e){ this.servex.say(`assistant could not hear a prompt: ${e.message || e}`); }
		// Started from here, not Servex.js: the fast assistant is already the one
		// thing wired to boot on the first real prompt, so the master listener rides
		// along instead of a second place in Servex.js needing to know it exists.
		// `install()` registers ITS OWN listener for every prompt from now on — this
		// one, the first, is fed by hand because that listener was not up in time
		// to hear it.
		if (!this.master){ this.master = new MasterAssistant({ servex: this.servex }).install(); this.master.heard(prompt); }
	}

	/* The sentences, numbered — those numbers ARE the citation vocabulary, so
	 * they are printed rather than described. */
	words(prompt){
		const lines = (prompt.sentences ?? [prompt.text ?? ""]).map((s, i) => `${i}. ${s}`).join("\n");
		const selected = prompt.selected ? `selected: ${prompt.selected}\n` : "";
		return `${selected}${this.live_state(prompt)}prompt ${prompt.id}, just spoken:\n${lines}\n\nName what was named, card the idea, then one refined reading citing those sentence numbers.`;
	}

	/* Spoken into the Live card, the question is usually "what is running?" —
	 * and the assistant has no tool to look. So the answer rides in with the
	 * words: every agent in this process, one line each. */
	live_state(prompt){
		if (prompt.selected?.split("/")[0] !== "live") return "";
		const rows = this.servex.agents.list().filter(a => a.state !== "stopped")
			.map(a => `- ${a.id}: ${a.state}${a.model ? ", " + a.model : ""}, ${a.turns} turns`);
		return `running right now (Servex's own list):\n${rows.join("\n") || "- nothing"}\n`;
	}

	tool(){
		this.servex.mcp.tool({
			name: "append_prompt_event",
			description: "Your voice. Appends one typed event to the owner's prompt log, where it appears on their"
				+ " screen within a second. `by` and `re` are stamped for you — say only what the event IS.",
			inputSchema: { type: "object", required: ["type"], properties: {
				type: { type: "string", description: "`name`, `card`, `task`, `refined`, `proposal`, `reply` or `help`." },
				id: { type: "string", description: "type `card`: reuse an id you minted earlier THIS conversation to evolve that card instead of starting a new one, when this sentence continues it." },
				re: { type: "string", description: "type `card`: only to file it under a DIFFERENT already-named id than the one just spoken — say why in `text`. type `reply`: the card id being answered, required. Leave unset otherwise." },
				name: { type: "string", description: "type `name`: what to call the thing. Two or three words, title case." },
				kind: { type: "string", description: "type `name`: `feature`, `page`, `tool`, `rule`, `problem`." },
				why: { type: "string", description: "type `name`: one short sentence." },
				route: { type: "string", description: "type `card`: `task` when the sentence asks for something built, fixed, changed or looked into; `note` for a remark; `question` for a question; `correction` when it amends something already carded." },
				title: { type: "string", description: "type `card`/`proposal`/`task`: five words or fewer." },
				text: { type: "string", description: "type `card`: two plain sentences. type `refined`: the cleaned reading." },
				icon: { type: "string", description: "type `card`: one Material Symbols name." },
				cites: { type: "array", items: { type: "number" }, description: "type `refined`: the sentence numbers it came from." },
				shape: { type: "array", items: { type: "string" }, description: "type `proposal`: three bullets, no class names." },
				stage: { type: "string", description: "type `proposal`: `pre` for a sketch." },
				brief: { type: "string", description: "type `task`: two sentences describing the work, in the owner's own words. type `help`: the question a helper should look into and answer." },
				state: { type: "string", description: "type `task`: always `queued` when you append it." }
			} },
			handler: args => this.append(args)
		});

		/* ANY AGENT'S VOICE INTO A CARD — the fast assistant, a helper it
		 * started, a task mastermind the Dispatcher started. One line on the
		 * card's own log, `cards/<slug>`, which is exactly what the card's chat
		 * on AI 2 streams, so it is on the owner's screen within a second. */
		this.servex.mcp.tool({
			name: "card_reply",
			description: "Say something into a card on the owner's AI 2 page — it appears in that card's chat within a second."
				+ " Two or three plain sentences; the reader is glancing, not reading code.",
			inputSchema: { type: "object", required: ["card", "text"], properties: {
				card: { type: "string", description: "The card id you were given — `topic-…`, `live`, or `<card>/<sub>` for a sub-card." },
				text: { type: "string", description: "What to say." },
				from: { type: "string", description: "Your own agent id, so the owner sees who is talking." }
			} },
			handler: args => this.card_reply(args)
		});
	}

	async card_reply({ card, text, from } = {}){
		if (!card || !text) return JSON.stringify({ ok: false, why: "card and text are both required" });
		try {
			const out = await this.servex.log.append(`cards/${String(card).split("/")[0]}`, { type: "reply", by: from || "agent", re: card, text });
			return JSON.stringify(out.ok ? { ok: true, id: out.entry.id, shown: true } : out);
		} catch (e){ return JSON.stringify({ ok: false, why: String(e.message || e) }); }
	}

	/* THE ASSISTANT'S OWN WORDS REACH THE CARD. Everything it says lands on
	 * `prompts`; a card's chat reads `cards/<slug>`. Until 2026-09-23 nothing
	 * copied one to the other, so every reply was written — and never shown on
	 * the card it answered (the owner: "the fast assistant isn't able to
	 * respond"). A `reply` aimed at the card being spoken into is copied there. */
	mirror(entry){
		if (entry.type !== "reply" || !this.card) return;
		const re = typeof entry.re === "string" ? entry.re : this.selected;
		if (re.split("/")[0] !== this.card) return;
		this.servex.log.append(`cards/${this.card}`, { ...entry, re }).catch(() => {});
	}

	/* A HELPER — one read-only Sonnet session for a question the fast assistant
	 * cannot answer without looking (it has no file tools). It reads the repo,
	 * answers into the card with `card_reply`, and is stopped after its first
	 * turn so nothing idles on. Paused by the same `dispatch.off` switch.
	 *
	 * ONE VOICE ABOUT HELPERS (2026-09-24, card topic-mufuomsy): the model used
	 * to say "a helper is looking" in its own reply, and a second later this
	 * method said "helpers are paused". Now only this method speaks about a
	 * helper, and only AFTER it knows: started, or paused. `assistant.md` tells
	 * the model never to announce one itself.
	 *
	 * The helper's PARENT is the fast assistant, so Servex wakes it with the
	 * helper's answer (`Agents.wake_parent`) — the assistant then knows what
	 * was found. The owner already saw it on the card; `assistant.md` says the
	 * wake is for the assistant's memory only, and it appends nothing. */
	help(args){
		const card = this.selected ?? "live";
		if (fs.existsSync(OFF)){
			this.card_reply({ card, from: this.id,
				text: "I would start a helper to look into that, but helpers are paused (dispatch.off exists). Delete that file and ask again." });
			return null;
		}
		const agent = this.servex.agents.spawn({
			role: "helper", name: slug(args.title ?? "help"), model: "claude-sonnet-5", effort: "low",
			parent: this.id,
			cwd: REPO, permission_mode: "bypassPermissions",
			allowed_tools: ["Read", "Grep", "Glob", "mcp__servex__card_reply"],
			prompt: `${args.brief ?? args.text ?? ""}

You are a helper: read the repo (read-only) and answer that. `
				+ `When you know, call card_reply({card: "${card}", from: "<your agent id>", text: <two to four plain sentences>}) once. `
				+ "Then end with the same answer in one or two sentences as your last words, and stop: those words go back to the fast assistant that asked. "
				+ "Never write the owner's name; say you."
		});
		const result = agent.result.bind(agent);
		agent.result = message => { result(message); if (!agent.queued) agent.stop(); };
		this.card_reply({ card, from: this.id, text: "A helper is looking into that now. Its answer will appear here." });
		return agent;
	}

	/* Found live (19:48, the owner's own diagnosis): the tool is sometimes called
	 * with one string field, `event`, holding the WHOLE call JSON-encoded, instead
	 * of the named fields the schema declares — every real `type`/`title`/`text`
	 * then sits unparsed and `mint()` reads `type: undefined`, so the id comes out
	 * `undefined-<junk>` and the board renders nothing. Unwrap that shape, reject
	 * (never write) whatever still has no `type` after unwrapping, and count it. */
	unwrap(args){
		if (args.type || typeof args.event !== "string") return args;
		try { return JSON.parse(args.event); } catch { return args; }
	}

	async append(raw = {}){
		const args = this.unwrap(raw);
		if (!args.type){
			this.bad_events = (this.bad_events ?? 0) + 1;
			return JSON.stringify({ ok: false, why: "no type — dropped, not written" });
		}
		if (args.type === "card" && args.title) args.title = this.linkify(args.title);
		if (args.type === "refined" && args.text) args.text = this.linkify(args.text);
		const out = await this.servex.log.append(this.log, this.entry(args));
		if (out.ok){
			this.minted.push(out.entry.id);
			if (out.entry.type === "card") this.last_card = out.entry.id;
			this.mirror(out.entry);
			if (out.entry.type === "help") try { out.helper = this.help(out.entry) ? "started" : "paused"; }
			catch (e){ out.helper = "failed"; this.servex.say(`assistant could not start a helper: ${e.message || e}`); }
		}
		return JSON.stringify(out.ok ? { ok: true, id: out.entry.id, shown: true, ...(out.helper ? { helper: out.helper } : {}) } : out);
	}

	/* Real, top-level module pages ONLY — `ext/<name>/page.js`, `ux/<name>/page.js`,
	 * plus `ai2/` and `ai/talk/` by name. Walked once from disk (not a fetch —
	 * Servex runs on this machine already) and cached for the process's life.
	 *
	 * ⚠ NOT a walk of the whole `framework/` tree — found live, the hard way:
	 * `core/`, `styles/` and the dated `ai/<date>/` task dirs are full of demo,
	 * pattern and old-build pages that reuse ordinary English words as titles
	 * ("Dashboard" names four different pages) or sit at a path a whole task's
	 * lifetime long — one such match ("Dashboard", the longer match, over the
	 * "AI 2" the owner actually said) minted a title so long it broke `Log.js`'s
	 * filename rule and crashed the agent host outright. Scoped to the handful
	 * of directories that are genuinely singular, named things. */
	titles(){
		if (this._titles) return this._titles;
		const out = [];
		const page = (dir, url) => {
			// `new Page({…title…` or `new Doc({…title…` (a module's own doc page,
			// `ext/Doc` — most `ext/*/page.js` files are one) specifically — a
			// page.js can have other `title:` keys deeper in it (a wizard's own
			// steps, a demo's config), and the FIRST one in the file is not
			// always the real page title.
			const title = fs.readFileSync(path.join(dir, "page.js"), "utf8")
				.match(/new (?:Page|Doc)\(\{[\s\S]{0,200}?title:\s*["']([^"']+)["']/)?.[1];
			if (title) out.push({ title, url });
		};
		const group = sub => { try {
			for (const f of fs.readdirSync(path.join(this.root, sub), { withFileTypes: true }))
				if (f.isDirectory()) try { page(path.join(this.root, sub, f.name), `/framework/${sub}/${f.name}/`); } catch {}
		} catch {} };
		try {
			group("ext"); group("ux");
			try { page(path.join(this.root, "ai2"), "/framework/ai2/"); } catch {}
			try { page(path.join(this.root, "ai/talk"), "/framework/ai/talk/"); } catch {}
		} catch (e){ this.servex.say(`assistant could not read page titles: ${e.message || e}`); }
		return this._titles = out.sort((a, b) => b.title.length - a.title.length);
	}

	/* Wraps ONE mention of a known page title in a markdown link — the LONGEST
	 * whole-word match anywhere in the ORIGINAL text, applied exactly once.
	 *
	 * ⚠ Found live, proving this: looping title-by-title and replacing INTO the
	 * growing string corrupts it, because one title's own url can contain
	 * ANOTHER shorter title as a whole word (`/ext/Ask/` contains the word
	 * "Ext"), so a later pass matches inside the link this function itself just
	 * inserted — `[Ask](/[Ext](/ext/)/Ask/)`. Scanning the untouched original
	 * once, and only ever writing one link, cannot do that to itself. Titles
	 * under four letters are skipped too — the site's own test fixtures name a
	 * page `"a"`, which as a whole word matches almost every sentence in
	 * English. */
	linkify(text){
		let best = null;
		for (const { title, url } of this.titles()){
			if (title.length < 4) continue;
			const m = new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").exec(text);
			if (m && (!best || m[0].length > best.match.length)) best = { match: m[0], index: m.index, title, url };
		}
		return best ? text.slice(0, best.index) + `[${best.title}](${best.url})` + text.slice(best.index + best.match.length) : text;
	}

	/* `by` is who we ARE, not who the model claims to be, and `re` points at the
	 * prompt this answer belongs to — that is what lets the board draw the whole
	 * thread under the sentence that started it. A CARD also points at every id
	 * minted since that prompt, because appending a card is the moment those
	 * names reach the owner's screen, and "seen" is exactly what the rename
	 * check reads (events.md, the naming rules). A TASK hangs off the CARD it
	 * answers, not the prompt, because that is the id the Dispatcher and the
	 * board's status strip both key on — `last_card` is the id of the card this
	 * same turn just appended. */
	entry({ type, id, ...rest }){
		const re = rest.re ?? (type === "card" ? [this.current, ...this.minted].filter(Boolean)
			: type === "task" ? this.last_card
			: this.current);
		const cites = type === "refined" && Array.isArray(rest.cites) && this.current
			? [{ prompt: this.current, sentences: rest.cites }] : rest.cites;
		// A task spoken into a card carries that card, so the Dispatcher can show
		// its progress there too (Dispatcher.js's `mirror()`).
		const card = type === "task" && this.card ? { card: this.card } : {};
		return { ...rest, ...(cites ? { cites } : {}), ...card, type, id: id ?? this.mint(type, rest), by: this.id, ...(re ? { re } : {}) };
	}

	mint(type, e){
		if (type === "name") return slug(e.name);
		if (type === "card") return `c-${slug(e.title)}`;
		if (type === "task") return `t-${this.last_card ?? slug(e.title ?? "")}`;
		if (type === "proposal") return `pr-${slug(e.title)}`;
		if (type === "refined") return `r-${this.current ?? Date.now().toString(36)}`;
		return `${type}-${Date.now().toString(36)}`;
	}

	/* Two doors for a page: start the assistant if it is not up, and say
	 * something to it. CORS for the same reason `/log/:name` answers it — the AI
	 * board is a tab on the site's origin, and `guard()` has already refused
	 * everything that is not loopback. */
	route(){
		const router = this.servex.dashboard.router;
		const cors = (req, res, next) => {
			res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" });
			next();
		};

		router.get("/api/assistant/start", cors, (req, res) => res.json(this.start().card()));
		router.get("/api/assistant", cors, (req, res) => res.json(this.live()?.card() ?? null));
		router.options("/api/assistant/message", cors, (req, res) => res.status(204).end());

		router.post("/api/assistant/message", cors, express.json({ limit: "64kb" }), (req, res) => {
			const { text, from = "board", re } = req.body ?? {};
			if (!text) return res.status(400).json({ error: "text is required" });
			if (re) { this.current = re; this.minted = []; }
			try { res.json(this.start().send(text, { from, reply_to: `log ${this.log}` }).card()); }
			catch (e){ res.status(500).json({ error: String(e.message || e) }); }
		});
	}
}

/* THE MASTER ASSISTANT — a second, slower opinion, alive alongside the fast one
 * (started from `Assistant.heard()`, not Servex.js — see the comment there).
 * Budget mode: `claude-sonnet-5` at `medium` effort, not the `claude-fable-5-1`
 * `roles.js` would otherwise pick for `master-assistant` — Opus/Fable are not
 * allowed in this run (decision `master-assistant-budget`, 2026-09-22).
 *
 * It stays SILENT — no tool call, no line, no cost — unless it disagrees with
 * the fast assistant's route or name (a `dispute`, which `Log.js`'s naming
 * checks already handle) or a whole thread earns one `refined` summary of its
 * own, at most once per five prompts (said in its own brief, not enforced here
 * — enforcing it would mean reading the fast assistant's own answer first,
 * which costs the very turn budget-mode is trying to save). Its own cost is
 * measured every ten prompts (`measure()`) against `agent.cost` — the SDK's
 * own cumulative total, the only cost Agents.js tracks — and above $0.10 per
 * ten it throttles itself to every other prompt, logging that it did. */
class MasterAssistant {
	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// ⚠ `id` MUST equal what `Agents.name()` actually mints (`<role>-<name>`)
	// or `live()` can never find the session it just spawned — found live: a
	// mismatch here spawned a BRAND NEW master session on every single prompt
	// (`master-assistant-master`, `-2`, `-3` … seven of them for twelve
	// prompts) instead of the one always-alive agent the brief asks for.
	defaults(){ return { id: "master-assistant-master", role: "master-assistant", name: "master",
		log: "prompts", current: null, count: 0, cost_at: 0, throttled: false }; }

	brief(){
		return "You are the master assistant — a slower second opinion beside a fast assistant"
			+ " that already answers every prompt first. You have one tool, `master_review`."
			+ " STAY SILENT — call nothing — unless: (a) you disagree with the fast assistant's"
			+ " route or name for this sentence, in which case call it once with `dispute` and"
			+ " one short, plain reason; or (b) a whole thread of several prompts has earned one"
			+ " `refined` summary of its own, at most once per five prompts. Never build, never"
			+ " plan, never ask a question back. Plain words — the reader is glancing at a"
			+ " screen, not reading code. Never write the owner's name; say *you*.";
	}

	install(){ this.tool(); this.listen(); return this; }
	live(){ const a = this.servex.agents.live.get(this.id); return a && a.state !== "stopped" ? a : null; }

	start(){
		const live = this.live();
		if (live) return live;
		this.servex.agents.live.delete(this.id);
		return this.servex.agents.spawn({
			role: this.role, name: this.name, model: "claude-sonnet-5", effort: "medium",
			system: this.brief(), permission_mode: "bypassPermissions",
			allowed_tools: ["mcp__servex__master_review"],
			prompt: "You are on duty. The next message is the owner's words. Answer nothing now."
		});
	}

	listen(){
		this.servex.log.on("append", (name, entry) => {
			if (name === this.log && entry.type === "prompt") this.heard(entry);
		});
	}

	heard(prompt){
		this.current = prompt.id ?? this.current;
		this.count++;
		if (this.throttled && this.count % 2 === 0) return;   // over budget — every other prompt only
		const agent = this.start();
		try { agent.send(`prompt ${prompt.id}, just spoken: "${(prompt.text ?? "").trim()}"`,
			{ from: "owner", reply_to: `log ${this.log}` }); }
		catch (e){ this.servex.say(`master assistant could not hear a prompt: ${e.message || e}`); }
		if (this.count % 10 === 0) this.measure(agent);
	}

	/* `agent.cost` is cumulative for the whole session (Agents.js's own
	 * `result()`) — the delta since the last check is this ten prompts' cost. */
	measure(agent){
		const spent = (agent.cost ?? 0) - this.cost_at;
		this.cost_at = agent.cost ?? 0;
		this.throttled = spent > 0.10;
		this.servex.log.append("servex", { type: "decision", by: this.id,
			text: `master assistant: $${spent.toFixed(3)} over the last 10 prompts`
				+ (this.throttled ? " — over $0.10, throttling to every other prompt" : "") });
	}

	tool(){
		this.servex.mcp.tool({
			name: "master_review",
			description: "Your voice — call it ONLY to disagree with the fast assistant's route or"
				+ " name, or to give one thread its own refined summary. `by`/`re` are stamped for you.",
			inputSchema: { type: "object", required: ["type", "text"], properties: {
				type: { type: "string", description: "`dispute` or `refined`." },
				text: { type: "string", description: "type `dispute`: why, one short sentence. type `refined`: the reading." },
				cites: { type: "array", items: { type: "number" }, description: "type `refined`: the sentence numbers it came from." }
			} },
			handler: args => this.append(args)
		});
	}

	async append(raw = {}){
		// Same defensive unwrap as the fast assistant's — see its `unwrap()`.
		const { type, text, cites } = raw.type || typeof raw.event !== "string" ? raw
			: (() => { try { return JSON.parse(raw.event); } catch { return raw; } })();
		if (!type) return JSON.stringify({ ok: false, why: "no type — dropped, not written" });
		const id = type === "refined" ? `mr-${this.current}` : `md-${this.current}-${Date.now().toString(36)}`;
		const out = await this.servex.log.append(this.log, { type, text, ...(cites ? { cites } : {}), id, by: this.id, re: this.current });
		return JSON.stringify(out.ok ? { ok: true, id: out.entry.id } : out);
	}
}
