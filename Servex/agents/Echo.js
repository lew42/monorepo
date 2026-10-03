import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { clean } from "../../public/framework/ext/Refine/engine.js";
import { structure } from "../../public/framework/ext/Refine/structure.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "../..");

/* THE ECHO ASSISTANT, one per owner session (minion-echo, 2026-10-02 — see that task's
 * requirements.md, which REPLACES the original plan for this piece; the owner's own words are
 * at public/framework/ai/2026-10-02/prompt-refine/requirements.md).
 *
 * A SIBLING of `Assistant.js`, not a rewrite: same shape (one door, one system prompt, writes
 * one log), reusing its own "fast assistant living inside Servex" idea — but where ONE
 * assistant hears every spoken sentence from everyone, Echo starts a FRESH, SEPARATE always-up
 * session PER owner session_id, because the whole point here is that it reads the owner's own
 * prompts and the coding assistant's own replies IN ORDER, so it can say "as I said 15 minutes
 * ago" the way a person who was actually listening the whole time could.
 *
 * HOW A PROMPT REACHES IT. `.claude/hooks/prompt-relay.mjs` (the owner's OWN interactive
 * session only — never a minion or mastermind, which never fires this) already adds the
 * prompt as one item, by hand, onto that session's own page — "a session is a page",
 * public/framework/ai/<day started>/sessions/<slug>-<id>/page.jsonl (storage retargeted
 * 2026-10-02, see this task's task.jsonl for the two corrections that got it here). It then
 * POSTs `{type:"prompt", session_id, page, item_id}` to `POST /log/echo` — a POSITION, never
 * the text — and `reply-relay.mjs` does the same for the coding assistant's own final reply.
 * `listen()` below hears both the moment they land (the exact same `Log.append` "append" event
 * `Assistant.listen()` already hangs off), and `heard()` reads the real text back off the page
 * itself. No agent ever retypes a prompt (Servex/readme.md, "big text moves by hook, never
 * through a tool call"). Writing its OWN steps back onto that same item reuses the exact same
 * tool a live tab would use (`page_set`, `Servex/agents/page_tools.js`), called in-process
 * through `this.servex.mcp.call()` rather than duplicating Store's append-and-validate logic a
 * third time (law 6).
 *
 * WHAT HAPPENS TO A PROMPT, two halves:
 *   1. MECHANICAL, in this file, no model judgment allowed — `clean()` and `structure()`
 *      (`public/framework/ext/Refine/engine.js` + `structure.js`, minion-core's engine, reused
 *      whole, not rebuilt — law 6). `clean()` enforces near-verbatim text by a code diff-check;
 *      `structure()` enforces that every sentence lands under a heading exactly once. Both are
 *      written straight to the log as their own `refine_step` lines the instant they're ready —
 *      no model ever gets a chance to quietly drop or reword something the owner actually said.
 *   2. JUDGMENT, by the one always-up Claude session THIS owner session gets — it is shown the
 *      already-clean, already-structured sentences and asked for the three things a machine
 *      check cannot decide: what to call this prompt (`topic`), which names/pages/agents it's
 *      really about (`references`), and what the owner is actually asking for, each with a size
 *      (`asks_flags`) — see `echo.md`, its whole system prompt.
 *
 * STEP BY STEP, NEVER ONE BIG BLOB (the owner via vscode-mastermind, 2026-10-02, amending the
 * original plan): every one of the five steps below — `clean`, `sections`, `references`,
 * `asks_flags`, `done` — is its OWN line, appended the instant it's known, so a page watching
 * this file can show the structure growing within seconds instead of waiting for one big write,
 * and a later fix is one more small line, never a rewrite of the whole record. `clean` and
 * `sections` are written by THIS CODE, not a tool call — deliberately: letting the model
 * "confirm" mechanically-checked output through a tool call would be a second, untrusted copy
 * of exactly the guarantee `clean()`/`structure()` already give for free, which is the one
 * thing deliverable 2 and 3 say must never depend on a model being faithful. `references`,
 * `asks_flags` and `done` are the model's own three tool calls — still few, still fast, per
 * `echo.md`'s own "speed is the job" rule, copied from `assistant.md`.
 *
 * EVERY STEP'S METADATA IS STAMPED HERE, NEVER BY THE MODEL (same amendment): `at`, `session_id`
 * and `prompt_at` are filled in by `write_step()` below from what THIS code already knows about
 * the call, exactly the way `Assistant.entry()` stamps `by` and `re` itself rather than trusting
 * what the model said it was.
 *
 * REPLIES are context only: `heard_reply()` just hands the assistant's own final reply to the
 * SAME per-session agent, for context ("did my own flag get answered a moment ago?") — it
 * appends nothing on its own. Only when a reply visibly answers an EARLIER flag does the model
 * call `refine_step` again, with `re` pointing at that earlier prompt's own `at`.
 *
 * REPLAY (deliverable 4/5) reuses every piece above unchanged: `replay_pairs()` below reads a
 * past session's own transcript file and returns its prompt+reply pairs in order; feeding them,
 * one at a time, to a FRESH echo agent (never a resumed/forked one — cheaper, and proves the
 * mechanism works stone cold) is driven from OUTSIDE this class, by whoever is running the
 * replay (a Servex tool call, or a human operator), using the exact same `heard()`/`heard_reply()`
 * entry points this live path uses — see `Servex/agents/echo-replay.mjs`. */
export default class Echo {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return {
			log: "echo",           // the Servex Log name hooks POST to: POST /log/echo
			role: "echo",
			pending: new Map(),    // session_id -> {page, item_id, sections, coverage, flags, misheard, strikes}
			page_of: new Map(),    // session_id -> its page url, kept even after `pending` clears on "done"
			by_id: new Map(),      // echo agent id -> session_id, so a tool call (ctx.caller) finds its session
			parent_of: new Map(),  // session_id -> a Servex agent id to wake on every turn (optional, see start())
		};
	}

	/* `echo.md`, read once — a plain-text system prompt that REPLACES the CLI's own, exactly
	 * like `Assistant.brief()`, for the same reason: this session has one job and no need for
	 * the coding agent's whole preamble. */
	brief(){
		this.base ??= fs.readFileSync(path.join(HERE, "echo.md"), "utf8");
		return this.base;
	}

	install(){ this.tool(); this.listen(); return this; }

	/* Deterministic from the session_id alone, so two different calls about the SAME owner
	 * session always name the SAME agent, with no map lookup needed to find it again. Hex
	 * only (a session_id already is), lowercased, first 8 characters — short enough to read on
	 * the Servex agent list, long enough that two different sessions never collide by accident. */
	id_for(session_id){ return `echo-${String(session_id).replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase()}`; }

	live(session_id){
		const a = this.servex.agents.live.get(this.id_for(session_id));
		return a && a.state !== "stopped" ? a : null;
	}

	/* Idempotent, like `Assistant.start()`: a session that is already being echoed gets the
	 * same agent back. `parent`, if given, is handed straight to `spawn()` — Servex's own
	 * `wake_parent` (Agents.js) then tells that agent every time THIS turn ends, with no extra
	 * code here at all (point 2a of the owner's amendment, 2026-10-02: "spawn/attach the echo
	 * with `parent` set so Servex wakes the parent agent"). Nothing calls this with a `parent`
	 * yet — the live hook path never has one to offer — so it is a plug for the next caller
	 * that wants to be told, documented here rather than built against a guess. */
	start(session_id, { parent } = {}){
		const id = this.id_for(session_id);
		const live = this.live(session_id);
		if (live) return live;
		this.servex.agents.live.delete(id);
		this.by_id.set(id, session_id);
		if (parent) this.parent_of.set(session_id, parent);
		return this.servex.agents.spawn({
			id, role: this.role, name: session_id.slice(0, 8),
			system: this.brief(),
			parent: parent ?? this.parent_of.get(session_id),
			// Same reasoning as Assistant.js's own identical line: an MCP tool call needs an
			// approver under acceptEdits, and nothing can approve a headless session — safe here
			// only because the tool list is exactly one tool.
			permission_mode: "bypassPermissions",
			allowed_tools: ["mcp__servex__refine_step"],
			prompt: "You are on duty for one owner session. The next messages are that session's own prompts and replies, in order. Answer nothing now.",
		});
	}

	/* THE HOOK — the exact seam `Assistant.listen()` already hangs off (`Log.append`'s own
	 * "append" event), just on the "echo" log instead of "prompts". A worktree page's own test
	 * post is stamped `via: "worktree:<name>"` (Servex.via()) and wakes nobody, same guard
	 * Assistant.js uses. */
	listen(){
		this.servex.log.on("append", (name, entry) => {
			if (name !== this.log) return;
			if (String(entry.via ?? "").startsWith("worktree:")) return;
			if (entry.type === "prompt") this.heard(entry);
			else if (entry.type === "reply") this.heard_reply(entry);
		});
	}

	/* Reads the ONE item the hook pointed at, straight off that session's page.jsonl, right
	 * now — never duplicated in the position notice itself (prompt-relay.mjs's own doc
	 * comment). Only the item's own `add` line is read (its text never changes after that),
	 * never a full page replay — `page` is relative to `public/`, exactly as the hook sent it. */
	read_item(page, item_id){
		let text;
		try { text = fs.readFileSync(path.join(REPO, "public", page.replace(/^\/+/, ""), "page.jsonl"), "utf8"); } catch { return null; }
		for (const raw of text.split("\n")){
			if (!raw.trim()) continue;
			let line;
			try { line = JSON.parse(raw); } catch { continue; }
			if (line.at === "content" && line.add?.id === item_id) return line.add;
		}
		return null;
	}

	/* The in-process door onto `page_tools.js`'s own `page_set` (Servex/MCP.js's `call()`) —
	 * the exact function a live tab's own edit, or any agent's tool call, writes through, so an
	 * item Echo enriches and an item a person edited by hand are indistinguishable on disk. */
	async page_set(page, id, delta, as){
		try {
			const raw = await this.servex.mcp.call("page_set", { path: page, id, delta }, { caller: as });
			const text = raw?.content?.[0]?.text;
			return text ? JSON.parse(text) : { ok: false, why: "no answer" };
		} catch (e){ return { ok: false, why: String(e.message || e) }; }
	}

	heard(evt){
		if (!evt?.session_id || !evt?.page || !evt.item_id) return;
		const item = this.read_item(evt.page, evt.item_id);
		if (!item?.text) return;
		this.process(evt.session_id, evt.page, evt.item_id, item.ts, item.text)
			.catch(e => this.servex.say(`echo could not process a prompt: ${e.message || e}`));
	}

	/* Context only (this file's own top comment) — a live reply never gets its own echo agent
	 * started for it; if nothing has heard a PROMPT for this session yet, there is no agent and
	 * nothing useful to tell it, so this is a quiet no-op rather than starting one just to hand
	 * it a reply with no prompt behind it. */
	heard_reply(evt){
		if (!evt?.session_id || !evt?.page || !evt.item_id) return;
		const live = this.live(evt.session_id);
		if (!live) return;
		const item = this.read_item(evt.page, evt.item_id);
		if (!item?.text) return;
		try { live.send(this.reply_words(item.text, item.ts), { from: "owner", reply_to: `log ${this.log}` }); }
		catch (e){ this.servex.say(`echo could not forward a reply: ${e.message || e}`); }
	}

	/* THE MECHANICAL HALF — never throws into the caller's event handler; a clean()/structure()
	 * failure (a down model provider, mostly) is logged and the prompt is simply not refined
	 * this time, same "best-effort, never blocks" posture every hook in this task follows. */
	async process(session_id, page, item_id, at, text){
		// minion-core's own litmus test picked haiku as "cheapest," but timed it at 123s/call
		// against deepseek/deepseek-v4.1-flash's 8s (both passed the mechanical check) --
		// task-mastermind-prompt-refine's call, 2026-10-02: on a live, watched path, a 15x
		// latency win is worth far more than the ~22-cent/call cost gap, so this is pinned
		// explicitly rather than left to clean()'s own default.
		const { sentences, strikes, misheard, flags } = await clean(text, { model: "deepseek/deepseek-v4.1-flash" });
		const built = await structure(sentences);
		const sections = this.sections_with_ids(this.parse_sections(built.md));
		const cited = [...new Set(sections.flatMap(s => s.items.flatMap(i => i.cites)))].sort((a, b) => a - b);
		const coverage = { total: sentences.length, cited, missing: built.missing ?? [], duplicated: built.duplicated ?? [] };

		// Written in the owner's own stated order (361c4d18, reply at 2026-10-03T02:21) --
		// "clean -> names and references -> sections -> asks and flags -> done" -- so `sections`
		// is held back and written by `step()` right after the model's `references` call lands,
		// even though it's computed here, mechanically, well before the model is even sent
		// anything. `sections`/`coverage` ride on `pending` until then.
		await this.page_set(page, item_id, { sentences, strikes, misheard, flags }, this.id_for(session_id));

		this.page_of.set(session_id, page);
		this.pending.set(session_id, { page, item_id, sections, coverage, flags, misheard, strikes });
		this.start(session_id).send(this.words({ sentences, sections, flags, misheard, at, session_id }),
			{ from: "owner", reply_to: `log ${this.log}` });
	}

	/* structure()'s `md` is the exact "## Heading" / "- bullet [S1, S2]" shape
	 * `ext/Refine/refine.js`'s own `parse_structured`/`parse_cites` already decode for the
	 * viewer — duplicated here in miniature (not imported: that file is a browser View module,
	 * `View.stylesheet(...)` at its own top level, which has no business loading inside Servex's
	 * Node process) rather than built fresh, the same "small, local, duplicated on purpose"
	 * choice `engine.js`'s own comment makes for the same reason. */
	parse_sections(md){
		const sections = [];
		let current = null;
		const start_default = () => { current = { heading: "", items: [] }; sections.push(current); };
		for (const line of String(md || "").split(/\r?\n/)){
			const h = line.match(/^##\s+(.+)$/);
			if (h){ current = { heading: h[1].trim(), items: [] }; sections.push(current); continue; }
			const b = line.match(/^[-*]\s+(.+)$/);
			if (b){
				if (!current) start_default();
				current.items.push(this.parse_cites(b[1]));
			}
		}
		return sections;
	}

	parse_cites(text){
		const m = text.match(/\[(S\d+(?:\s*[-–]\s*S?\d+)?(?:\s*,\s*S?\d+(?:\s*[-–]\s*S?\d+)?)*)\]\s*$/);
		if (!m) return { text: text.trim(), cites: [] };
		const cites = [];
		m[1].split(",").forEach(part => {
			const range = part.trim().match(/^S?(\d+)\s*[-–]\s*S?(\d+)$/);
			if (range){ const [lo, hi] = [Number(range[1]), Number(range[2])].sort((a, b) => a - b); for (let n = lo; n <= hi; n++) cites.push(n); return; }
			const single = part.trim().match(/^S?(\d+)$/);
			if (single) cites.push(Number(single[1]));
		});
		return { text: text.slice(0, m.index).trim(), cites };
	}

	sections_with_ids(sections){
		return sections.map((s, i) => ({
			id: `sec${i + 1}`, heading: s.heading,
			items: s.items.map((it, j) => ({ id: `sec${i + 1}-i${j + 1}`, text: it.text, cites: it.cites })),
		}));
	}

	/* What the per-session agent is actually shown — the already-clean, already-grouped
	 * reading, never the raw text twice over (it was just written in the `clean` step; the
	 * model reads the SAME sentences here so its `topic`/`references`/`asks_flags` calls are
	 * grounded in exactly what the owner said, not a paraphrase of it). */
	words({ sentences, sections, flags, misheard, at, session_id }){
		const lines = sentences.map(s => `S${s.n}. ${s.text}`).join("\n");
		const grouped = sections.length
			? sections.map(s => `${s.heading ? `## ${s.heading}\n` : ""}${s.items.map(i => `- ${i.text}${i.cites.length ? ` [${i.cites.map(n => "S" + n).join(", ")}]` : ""}`).join("\n")}`).join("\n\n")
			: "(one plain section, no headings)";
		const flagLines = flags.length ? `\nFlags already caught mechanically:\n${flags.map(f => `S${f.sentence_n}: ${f.question}`).join("\n")}` : "";
		const mishLines = misheard?.length ? `\nMisheard, already fixed: ${misheard.map(m => `"${m.from}" -> "${m.to}"`).join(", ")}` : "";
		return `PROMPT at ${at}, session ${session_id}:\n\n${lines}\n\nGrouped:\n${grouped}${flagLines}${mishLines}\n\nCall refine_step three times: references, then asks_flags, then done.`;
	}

	reply_words(text, at){
		return `REPLY (the coding assistant's own answer, just said) at ${at}:\n\n${text}\n\n`
			+ `Context only -- append nothing, unless this plainly answers a clarification question you flagged on an EARLIER prompt THIS session. If it does, call refine_step once more with step "asks_flags", re set to that earlier prompt's own "at", and resolves describing what answered it.`;
	}

	/* ONE DOOR (the owner's amendment, 2026-10-02: "write through tool calls, step by step").
	 * Only the three JUDGMENT steps are callable — `clean` and `sections` are written by this
	 * code itself, in `process()` above, specifically so a model can never quietly restate (and
	 * possibly corrupt) output that is supposed to be mechanically guaranteed. */
	tool(){
		this.servex.mcp.tool({
			name: "refine_step",
			description: "Your voice, one step at a time. Call it once per step, in order: references, then"
				+ " asks_flags, then done. `at`, `session_id` and which prompt this belongs to are filled in"
				+ " for you -- say only what the step IS.",
			inputSchema: { type: "object", required: ["step"], properties: {
				step: { type: "string", description: "`references`, `asks_flags`, or `done` -- call all three, in this order, once each." },
				topic: { type: "string", description: "step `references`: the most concrete name for THIS ONE prompt, 3 to 6 words -- e.g. \"Prompt refinement\" or \"core/Page: Page extends Item\"." },
				refs: { type: "array", items: { type: "string" }, description: "step `references`: every #Page, @agent or /path this prompt is really about, using the system's own names (CLAUDE.md, the module readmes) to fix a misheard one." },
				asks: { type: "array", items: { type: "object", required: ["text", "size", "place"], properties: {
					text: { type: "string" },
					size: { type: "string", description: "quick | small | task | big -- your honest guess, so whoever reads `done` can start the small ones without asking." },
					place: { type: "object", required: ["path", "form"], properties: {
						path: { type: "string", description: "the page this belongs under, or an existing/new issue id under /framework/servex/issues/." },
						form: { type: "string", description: "subpage | post | comment | issue | issue+1 -- pick by weight: an important idea gets its own subpage/post; an anecdote gets a comment; a system problem is a +1 on a matching existing issue, or a new issue if none matches." } },
						description: "where this ask should land for the owner to see later, so the consumer (a mastermind) acts on it directly instead of guessing." } } },
					description: "step `asks_flags`: one per concrete thing the owner is asking for here. Empty if this prompt is just a remark." },
				flags: { type: "array", items: { type: "object", required: ["sentence_n", "question"], properties: {
					sentence_n: { type: "number" }, question: { type: "string" } } },
					description: "step `asks_flags`: any further unclear passage, beyond what was already caught mechanically." },
				re: { type: "string", description: "only when a REPLY you were just shown resolves an EARLIER prompt's flag: that earlier prompt's own `at`, so this call updates THAT record instead of starting a new one." },
				resolves: { type: "string", description: "only with `re` set: one short sentence saying what in the reply answered the flag." },
				summary: { type: "string", description: "step `done`: one plain sentence, what's ready to read." },
			} },
			handler: (args = {}, ctx = {}) => this.step(args, ctx),
		});
	}

	/* Every `page_set` delta, whichever of the three model steps it is, lands on the SAME
	 * item the hook's `page_add` created — `sections`/`coverage` (also `page_set`, but written
	 * by this code, not a tool call — see `process()`'s own comment) merge on top of the same
	 * fields. `page_set` itself stamps `by`/`ts`, never the model (the owner's amendment: "the
	 * TOOL stamps time/author/session/prompt id -- not the model"). */
	async step(args = {}, ctx = {}){
		const fail = why => JSON.stringify({ ok: false, why });
		const session_id = this.by_id.get(ctx.caller);
		if (!session_id) return fail(`unknown caller "${ctx.caller}" -- not a registered echo session`);
		if (!["references", "asks_flags", "done"].includes(args.step)) return fail("step must be references, asks_flags or done");
		const pending = this.pending.get(session_id);
		const page = pending?.page ?? this.page_of.get(session_id);
		// `re`, when set, is an EARLIER prompt's own item id (a reply resolving an old flag) --
		// everything else targets the CURRENTLY open prompt's item.
		const target_id = args.re || pending?.item_id;
		if (!page || !target_id) return fail("no open prompt for this session -- nothing to attach this step to");
		try {
			// `done`'s asks/flags count is copied from what `asks_flags` already stored on
			// `pending`, never retyped by the model on this call — the one thing a reader of
			// `done` alone (prompt-relay.mjs's own context line) needs is guaranteed accurate.
			if (args.step === "asks_flags" && pending){
				pending.asks = Array.isArray(args.asks) ? args.asks : [];
				pending.flags_count = (pending.flags?.length ?? 0) + (Array.isArray(args.flags) ? args.flags.length : 0);
			}
			const { step: _s, re: _r, ...rest } = args;
			const delta = args.step === "done" && pending
				? { ...rest, asks: pending.asks ?? [], flags_count: pending.flags_count ?? (pending.flags?.length ?? 0), done: true }
				: rest;
			const out = await this.page_set(page, target_id, delta, ctx.caller);
			// `sections` rides on `pending` from `process()` (computed mechanically, well before
			// the model said anything) but is written to disk HERE, right after `references`,
			// to match the owner's own stated order -- see `process()`'s comment on why.
			if (args.step === "references" && !args.re && pending){
				await this.page_set(page, target_id, { sections: pending.sections, coverage: pending.coverage }, ctx.caller);
			}
			if (args.step === "done") this.pending.delete(session_id);
			return JSON.stringify(out.ok ? { ok: true, id: out.id } : out);
		} catch (e){ return fail(String(e.message || e)); }
	}
}
