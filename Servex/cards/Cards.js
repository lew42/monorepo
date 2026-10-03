import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { stamp } from "../home.js";
import { parse_lines, fold_card, summary } from "../../public/framework/ai2/fold.js";
import { card_needs } from "../../public/framework/ai2/needs-rule.js";

/* CARDS — one folder per card, one append-only `page.jsonl` per folder.
 *
 *   ai/2026/page.jsonl                          {"title": "2026"}
 *   ai/2026/09/page.jsonl                       {"title": "September 2026"}
 *   ai/2026/09/24/page.jsonl                    {"title": "Thursday 24 September"}, then {"file": "my-card/page.jsonl"}
 *   ai/2026/09/24/my-card/page.jsonl            line 1 = the card's constructor, every later line one change
 *   ai/2026/09/24/my-card/a-sub-card/page.jsonl a sub-card, any depth
 *
 * A card's id is its path under `ai/`: `2026/09/24/my-card/a-sub-card`.
 * Every change is one appended line and the latest line wins, so turning a
 * question into a request is one `{"type": "request"}` line. This class is the
 * ONLY writer of these files — `create_card` is the only way a card is made. */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../public/framework/ai");
const CLASS = "/framework/ai2/card.js";
const OWNER = "owner";            // what ai2/compose.js and ux/Dictate stamp as `by` on the owner's words
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default class Cards {

	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.root ??= ROOT;
		setTimeout(() => this.index_soon(), 2000);   // boot: make sure the static index matches the folders
		this.base ??= "/framework/ai/";
		this.queues = new Map();          // file path -> promise chain: one writer per file
		this.legacies = null;             // legacy id -> card id, built on first use
		this.listeners = new Set();       // fn(cardId, line, info), told after every write
		// "This Servex has the card routes." AI 2 reads `/log/features` once and
		// only calls a card route when it finds `cards` there — an older Servex
		// answers that log with `[]`, so the page falls back without an error.
		if (this.log) this.log.append("features", { cards: 1 }).catch(() => {});
	}

	/* Hear every line written to ANY card. Returns a function that stops listening. */
	on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }

	/* A listener that throws must never break a write. */
	emit(id, line, info){
		for (const fn of [...this.listeners]) try { fn(id, line, info); } catch {}
	}

	/* The one shape a parent uses to list a child. Module A owns the listing
	 * format, so it lives here and nowhere else. */
	listing(slug){ return { file: `${slug}/page.jsonl` }; }

	/* ---------- ids and paths ---------- */

	/* An id is slash-joined slugs; anything else (`..`, `\`, capitals, empty
	 * segments) is refused, so an id can never walk out of the root. */
	valid(id){ return typeof id === "string" && id.length > 0 && id.split("/").every(s => SLUG.test(s)); }
	folder(id){ return path.join(this.root, ...id.split("/")); }
	file(id){ return path.join(this.folder(id), "page.jsonl"); }
	url(id){ return this.base + id + "/"; }
	exists(id){ return this.valid(id) && fs.existsSync(this.file(id)); }

	/* A card id (or any page id under the root, day folders included), or a
	 * legacy id a card answers to. Returns the card's CANONICAL id. */
	canonical(id){
		if (this.exists(id)) return id;
		const found = this.legacy_map().get(id);
		return found && this.exists(found) ? found : null;
	}

	resolve(id){
		const found = this.canonical(id);
		return found ? this.folder(found) : null;
	}

	/* ---------- dates ---------- */

	pad(n){ return String(n).padStart(2, "0"); }
	now(){ return new Date(); }
	day_id(d = this.now()){ return `${d.getFullYear()}/${this.pad(d.getMonth() + 1)}/${this.pad(d.getDate())}`; }

	/* The year, month and day folders are pages too; each is made on first use
	 * and listed in the one above it. `wx` makes creation a claim, so two
	 * creates racing for the same new day write its first line once. */
	async today(d = this.now()){
		const y = String(d.getFullYear()), m = this.pad(d.getMonth() + 1), dd = this.pad(d.getDate());
		await this.index(y, { title: y });
		await this.index(`${y}/${m}`, { title: `${MONTHS[d.getMonth()]} ${y}` }, y, m);
		await this.index(`${y}/${m}/${dd}`, { title: `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}` }, `${y}/${m}`, dd);
		return `${y}/${m}/${dd}`;
	}

	async index(id, head, parent, slug){
		await fs.promises.mkdir(this.folder(id), { recursive: true });
		try {
			await fs.promises.writeFile(this.file(id), JSON.stringify(head) + "\n", { flag: "wx" });
			if (parent) await this.write(parent, this.listing(slug));
		} catch (e){ if (e.code !== "EEXIST") throw e; }
	}

	/* ---------- writing ---------- */

	slugify(title){
		return String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+/, "").slice(0, 40).replace(/-+$/, "") || "card";
	}

	/* One line onto one file, behind every earlier line for that same file. */
	write(id, obj){
		const at = this.file(id);
		const next = (this.queues.get(at) ?? Promise.resolve()).then(() =>
			fs.promises.appendFile(at, JSON.stringify(obj) + "\n"));
		this.queues.set(at, next.catch(() => {}));
		next.then(() => this.index_soon()).catch(() => {});
		return next;
	}

	/* THE STATIC INDEX: `ai/cards.jsonl`, one summary per line, rewritten (debounced)
	 * after any card write. AI 2 reads it as a plain file, so the rail needs no
	 * Servex and no walk of 400 folders. Servex only KEEPS it fresh. */
	index_soon(){
		clearTimeout(this.index_timer);
		this.index_timer = setTimeout(async () => {
			try {
				const rows = await this.list({ view: "all" });
				const file = path.join(this.root, "cards.jsonl"), text = rows.map(r => JSON.stringify(r)).join("\n") + "\n";
				if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === text) return;   // unchanged: no write, no reload
				await fs.promises.writeFile(file, text);
			} catch {}
		}, 1000);
	}

	/* `mkdir` without `recursive` fails if the folder exists, which makes it an
	 * atomic claim on the slug — two creates with the same title get `x` and `x-2`. */
	async claim(parent, base){
		for (let n = 1; ; n++){
			const slug = n === 1 ? base : `${base}-${n}`;
			try { await fs.promises.mkdir(this.folder(`${parent}/${slug}`)); return slug; }
			catch (e){ if (e.code !== "EEXIST") throw e; }
		}
	}

	async create({ parent, title, type = "card", by = "agent", tags = [] } = {}){
		try {
			if (!title || !String(title).trim()) return { ok: false, why: "a card needs a title" };
			const home = !parent || parent === "today" ? await this.today() : this.canonical(parent);
			if (!home) return { ok: false, why: `no card "${parent}" — pass a card id like 2026/09/24/my-card, a legacy id, or "today"` };

			const slug = await this.claim(home, this.slugify(title));
			const id = `${home}/${slug}`;
			const head = { class: CLASS, title: String(title).trim(), type, id, created: stamp(), by, tags: [].concat(tags) };
			await fs.promises.writeFile(this.file(id), JSON.stringify(head) + "\n", { flag: "wx" });
			await this.write(home, this.listing(slug));
			this.emit(id, head, { created: true });
			return { ok: true, id, url: this.url(id), path: this.file(id) };
		} catch (e){ return { ok: false, why: String(e.message || e) }; }
	}

	/* ---------- ask → card, the iceberg tip (card-pipeline, 2026-10-02) ---------- */

	/* ONE SECTION, COMPUTED, NEVER TYPED BY AN AGENT (law 7): asked (the ask's own title),
	 * status (from the task's own task.jsonl — "landed" once it carries a landed line, else
	 * "building"), next step (the task's latest `log` line, or "landed"), and three links —
	 * the brief, the task dir, and the page it built when the landing line named one
	 * (the first entry of a `landed_at` line's own `links` array — review, 2026-10-02: checked
	 * against 33 recent task logs, every one uses `links`, none use a `highlight.url` field; this
	 * comment used to name that field instead, which never matched anything real). Returns a
	 * markdown string, or
	 * `null` when there is truly nothing to build one from (no task dir AND no ask title) — the
	 * caller (`create_for_ask`) refuses rather than make an empty card. Reads the task's
	 * `task.jsonl` straight off disk: this never needs a live Servex, so `mark.mjs`-style CLI
	 * scripts (and the audit scripts this task also ships) can call it cold. */
	async ask_tip(ask, task_dir){
		if (!task_dir && !ask?.title) return null;
		let status = "proposed", next_step = "not started yet", page_url = null;
		if (task_dir){
			let text = null;
			try { text = await fs.promises.readFile(path.join(this.root, task_dir, "task.jsonl"), "utf8"); } catch {}
			if (text){
				let landed = false, last_log = null;
				for (const raw of text.split("\n")){
					if (!raw.trim()) continue;
					let obj; try { obj = JSON.parse(raw); } catch { continue; }
					if (obj.assign?.landed_at) landed = true;
					if (obj.assign?.links?.length) page_url = obj.assign.links[0].url ?? page_url;
					if (obj.log?.msg) last_log = obj.log.msg;
				}
				status = landed ? "landed" : "building";
				next_step = landed ? "landed" : (last_log ?? "working — no log line yet");
			} else { status = "proposed"; next_step = "not started yet — no task.jsonl found"; }
		}
		const brief_url = ask?.words && !String(ask.words).startsWith(".claude/") ? "/framework/" + String(ask.words).replace(/^\/+/, "") : null;
		const task_url = task_dir ? this.base + task_dir + "/" : null;
		const links = [brief_url && `[brief](${brief_url})`, task_url && `[task dir](${task_url})`, page_url && `[page](${page_url})`].filter(Boolean).join(" · ");
		return [`**Asked:** ${ask?.title ?? "—"}`, `**Status:** ${status}`, `**Next step:** ${next_step}`, links].filter(Boolean).join("\n\n");
	}

	/* THE ONLY WAY AN ASK BECOMES A CARD (item 1–2): makes the card, THEN writes its first
	 * section (the tip above) as a `{"chat": {"level": "summary", ...}}` line — the exact shape
	 * `ai2/card.js`'s existing `chat()` method already understands and `refinements()` already
	 * draws FIRST on the card's own page (one-dictation, 2026-09-30) — so no change to that file
	 * was needed to put this section at the top; it reuses a mechanism the card page already had
	 * (law 6: one of everything). Refuses an empty card: with no task dir and no ask title,
	 * `ask_tip()` returns null and nothing is created. Kept SEPARATE from `create()` (never
	 * required there) — `create()` is called all over the app for a deliberately blank card
	 * ("+ New card"), and a dozen-plus existing callers rely on a title alone being enough,
	 * which CLAUDE.md's "ask before: major surgery… anything with a dozen callers" rules out
	 * changing just for this one pipeline. */
	async create_for_ask({ ask, task_dir } = {}){
		const tip = await this.ask_tip(ask, task_dir);
		if (!tip) return { ok: false, why: "no task dir and no ask title to build a card from — refusing an empty card" };
		const out = await this.create({ parent: "today", title: ask?.title, type: "request", by: "servex-asks", tags: ["ask"] });
		if (!out.ok) return out;
		await this.append(out.id, { chat: { level: "summary", text: tip, at: stamp(), from: { kind: "system", id: "servex-asks" } } });
		return out;
	}

	/* Any one-object line: `{type}`, `{tags}`, `{status}`, `{message}`,
	 * `{prompt}`, `{cites}`, `{attach}`, `{detach}`, `{legacy}` (readme.md
	 * defines them). A message without `at` gets one; a NEW prompt gets its id,
	 * `at`, `by` and `on` filled in; a prompt line whose id the card already has
	 * is a merge (a cleaned reading) and is written as given. `fresh` says which. */
	async append(id, obj){
		try {
			const card = this.canonical(id);
			if (!card) return { ok: false, why: `no card "${id}"` };
			if (!obj || typeof obj !== "object" || Array.isArray(obj)) return { ok: false, why: "a line is one JSON object" };
			let line = obj, fresh = false;
			if (obj.message && typeof obj.message === "object"){
				// A message gets an id the same way a prompt does (`id` + random suffix), so a
				// LATER reply can name this one as `re` and nest under it (card-threaded-replies,
				// 2026-10-01) — `read_card`'s transcript is where an agent sees the id to answer.
				const extra = {};
				if (!obj.message.at) extra.at = stamp();
				if (!obj.message.id) extra.id = "m-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 4).padEnd(2, "0");
				line = { ...line, message: { ...obj.message, ...extra } };
			}
			if (obj.prompt && typeof obj.prompt === "object"){
				const known = obj.prompt.id && (await this.fold(card)).prompts.some(p => p.id === obj.prompt.id);
				if (!known){ fresh = true; line = { ...line, prompt: this.prompt(card, obj.prompt) }; }
			}
			await this.write(card, line);
			if (line.legacy) this.legacy_map().set(line.legacy, card);
			this.emit(card, line, line.prompt ? { fresh } : {});
			const answering = line.chose?.decision ?? line.answer?.question ?? line.answer?.ask;
			return { ok: true, id: card, line, ...(line.prompt ? { fresh, ref: `${card}#${line.prompt.id}` } : {}),
				...(answering ? { woke: await this.wake(card, line) } : {}) };
		} catch (e){ return { ok: false, why: String(e.message || e) }; }
	}

	/* ---------- asking, and waking the asker (contract-v2 §2 and §3) ---------- */

	ask_id(prefix){ return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4).padEnd(2, "0")}`; }

	/* card_ask: ONE `place` line for the widget the card already draws and already knows how
	 * to answer — a Decision (`ux/Content/Decision`) when `options` is given, a Question
	 * (`ux/Content/Question`) when it is not. No new verb, no new datastore: the owner answers
	 * with the exact control already on the card, and `append()` below wakes the asker.
	 * Returns `{ok, id: <card>, ask: <the place line's own id>}`, or `{ok:false, why}`. */
	async ask({ card, question, options, title, from, kind } = {}){
		if (!question || !String(question).trim()) return { ok: false, why: "a card_ask needs a question" };
		const decision = Array.isArray(options) && options.length > 0;
		const id = this.ask_id(decision ? "d" : "q");
		const place = decision
			? { module: "/framework/ux/Content/Decision/Decision.js", id, ask: question, options, at: stamp() }
			: { module: "/framework/ux/Content/Question/Question.js", id, ask: question, at: stamp() };
		if (title) place.title = title;
		if (from) place.from = from;
		if (kind) place.kind = kind;   // e.g. "spend-gate": wake() acts on the answer itself instead of just texting it over
		const out = await this.append(card, { place });
		if (!out.ok) return out;
		return { ok: true, id: out.id, ask: id };
	}

	/* Any `chose`, `answer` (or legacy `answer.ask`) line just written wakes whoever the
	 * matching `place` (or legacy `ask`) line named as `from` — or, with no `from`, every
	 * attached, live, non-minion agent (the same door `forward()` uses). Returns the agent
	 * ids actually sent to. Never throws: one bad send must not break the append that woke it. */
	async wake(card, line){
		if (!this.agents) return [];
		const ask_id = line.chose?.decision ?? line.answer?.question ?? line.answer?.ask;
		if (!ask_id) return [];

		let found = null;
		for (const l of await this.read(card)){
			if (l.place?.id === ask_id) found = { ask: l.place.ask, from: l.place.from, kind: l.place.kind };
			else if (l.ask?.id === ask_id) found = { ask: l.ask.question ?? l.ask.title, from: l.ask.from, kind: l.ask.kind };
		}
		if (!found) return [];

		const answer = line.chose?.option ?? line.answer?.text;

		/* A spend-gate card (Agents.js's gate_check()) is answered by ACTING, not by texting
		 * the gated agent a generic "owner answered" line that no tool ever reads: Stop really
		 * stops it, Continue really raises its allowance by $5, with no extra model turn spent.
		 * This is the ONE special case — every other card_ask still falls through to the
		 * generic send below. */
		if (found.kind === "spend-gate" && found.from){
			if (/stop/i.test(String(answer))) this.agents.stop(found.from, { by: "owner" });
			else this.agents.grant(found.from, 5);
			return [found.from];
		}

		const text = `The owner answered your question on card ${card} ("${found.ask}"): ${answer}`;
		const note = { from: OWNER, reply_to: `card ${card}`, revive: true };   // the owner answering IS the reason to wake it (never one whose cwd is gone)
		const targets = found.from ? [found.from]
			: (await this.attached(card)).filter(a => { const live = this.live(a); return live && !this.minion(live); });

		const woke = [];
		for (const t of targets) try { this.agents.send(t, text, note); woke.push(t); } catch {}
		return woke;
	}

	/* ---------- waiting: contract-v2 §4 ---------- */

	/* Every open need across every non-done, non-archived card — the same `card_needs` rule the
	 * browser's "Needs you" tab and the rail's "Needs review" filter read, so they can never
	 * disagree with what Servex answers here. Ranked: blocker, then decision/question, then fyi;
	 * newest within each group. */
	async waiting(){
		const RANK = { blocker: 0, decision: 1, question: 1, fyi: 2 };
		const cards = (await this.list({ view: "all" })).filter(c => c.status !== "done" && c.status !== "archived");
		const rows = await Promise.all(cards.map(async c => card_needs(c.id, await this.read(c.id), c)));
		return rows.flat().sort((x, y) => (RANK[x.kind] ?? 3) - (RANK[y.kind] ?? 3) || Date.parse(y.at ?? 0) - Date.parse(x.at ?? 0));
	}

	/* A new owner prompt, with what the caller left out filled in. `text` is the
	 * raw words until a cleaned reading merges in over it. */
	prompt(card, p){
		const id = p.id || "p-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 4).padEnd(2, "0");
		return { id, at: stamp(), by: OWNER, on: card, ...p, id, text: p.text ?? p.raw };
	}

	/* ---------- reading ---------- */

	async read(id){
		const card = this.canonical(id);
		if (!card) return null;
		await this.queues.get(this.file(card));
		return this.parse(await fs.promises.readFile(this.file(card), "utf8"));
	}

	parse(text){ return parse_lines(text); }

	/* Latest wins, line by line — `ai2/fold.js` is the vocabulary, shared with the browser. */
	async fold(id){
		const lines = await this.read(id);
		return lines ? fold_card(this.canonical(id), lines) : null;
	}

	async attached(id){ return (await this.fold(id))?.attached ?? []; }

	/* Every card folder under the root: into the four-digit year folders, then
	 * down through any folder that has a page.jsonl. Index pages (no `class`)
	 * are walked through but not returned. */
	async walk(){
		const out = [];
		const visit = async (id) => {
			const dir = this.folder(id);
			let entries = [];
			try { entries = await fs.promises.readdir(dir, { withFileTypes: true }); } catch { return; }
			for (const e of entries) if (e.isDirectory() && SLUG.test(e.name)){
				const child = `${id}/${e.name}`;
				if (!fs.existsSync(this.file(child))) continue;
				const head = this.parse(await fs.promises.readFile(this.file(child), "utf8"))[0] ?? {};
				if (head.class) out.push(child);
				await visit(child);
			}
		};
		let years = [];
		try { years = (await fs.promises.readdir(this.root, { withFileTypes: true })).filter(e => e.isDirectory() && /^\d{4}$/.test(e.name)); } catch {}
		for (const y of years) await visit(y.name);
		return out;
	}

	/* The legacy map is built once by a synchronous walk (resolve() is sync),
	 * then kept current by append(). */
	legacy_map(){
		if (this.legacies) return this.legacies;
		this.legacies = new Map();
		const visit = (id) => {
			let entries = [];
			try { entries = fs.readdirSync(this.folder(id), { withFileTypes: true }); } catch { return; }
			for (const e of entries) if (e.isDirectory() && SLUG.test(e.name)){
				const child = `${id}/${e.name}`;
				let text;
				try { text = fs.readFileSync(this.file(child), "utf8"); } catch { continue; }
				for (const line of this.parse(text)) if (line.legacy) this.legacies.set(line.legacy, child);
				visit(child);
			}
		};
		try { for (const e of fs.readdirSync(this.root, { withFileTypes: true })) if (e.isDirectory() && /^\d{4}$/.test(e.name)) visit(e.name); } catch {}
		return this.legacies;
	}

	/* `today` = made or touched today; `open` = status not done; `all`; any
	 * other word, or `tag`, = cards carrying that tag. Newest activity first. */
	async list({ view = "today", tag } = {}){
		const day = this.day_id().replaceAll("/", "-");
		const out = [];
		for (const id of await this.walk()){
			const s = await this.fold(id);
			const row = summary(s);
			const want = tag ?? (["today", "open", "all"].includes(view) ? null : view);
			if (want ? s.tags.includes(want)
				: view === "open" ? s.status !== "done"
				: view === "today" ? [s.created, s.last].some(t => String(t ?? "").startsWith(day))
				: true) out.push(row);
		}
		return out.sort((a, b) => String(b.last).localeCompare(String(a.last)));
	}

	/* ---------- agents ---------- */

	attach(id, agent){ return this.append(id, { attach: agent }); }

	live(agent){
		const a = this.agents?.live?.get?.(agent);
		return a && a.state !== "stopped" ? a : null;
	}

	/* Minions are builders: a narrow brief and none of the chatter. */
	minion(a){ return a.role === "minion" || String(a.id ?? "").startsWith("minion-"); }

	/* An owner prompt reaches every live, non-minion agent on the card. A
	 * `prompt` line is the owner's by definition, so no `by` is checked. */
	async forward(id, prompt){
		const text = prompt?.text ?? prompt?.raw;
		if (!text || !this.agents) return [];
		const card = this.canonical(id) ?? id;
		const sent = [];
		for (const agent of await this.attached(card)){
			const a = this.live(agent);
			if (!a || this.minion(a)) continue;
			try { this.agents.send(agent, text, { from: OWNER, reply_to: `card ${card} (prompt ${card}#${prompt.id})` }); sent.push(agent); } catch {}
		}
		return sent;
	}

	/* The whole log as one message an agent can read cold. */
	async transcript(id){
		const lines = await this.read(id);
		if (!lines) return null;
		return `Card ${this.canonical(id)} — its whole log, ${lines.length} lines, oldest first:\n`
			+ lines.map(l => JSON.stringify(l)).join("\n");
	}

	/* ---------- HTTP and MCP ---------- */

	routes(router, cors = (req, res, next) => next()){
		const json = express.json({ limit: "1mb" });
		const reply = (res, out, bad = 400) => res.status(out && out.ok !== false ? 200 : bad).json(out ?? { ok: false, why: "not found" });

		for (const p of ["/cards", "/card", "/card/create", "/card/append", "/waiting"]) router.options(p, cors, (req, res) => res.status(204).end());
		router.get("/cards", cors, async (req, res) => res.json(await this.list({ view: req.query.view || "today", tag: req.query.tag || undefined })));
		router.get("/waiting", cors, async (req, res) => res.json(await this.waiting()));
		router.get("/card", cors, async (req, res) => reply(res, await this.fold(String(req.query.id ?? "")), 404));
		router.post("/card/create", cors, json, async (req, res) => reply(res, await this.create(req.body ?? {})));
		router.post("/card/append", cors, json, async (req, res) => {
			const out = await this.append(String(req.query.id ?? ""), req.body ?? {});
			if (out.ok && out.fresh) out.forwarded = await this.forward(out.id, out.line.prompt);
			reply(res, out);
		});
		return router;
	}

	tool(name, description, properties, required, handler){
		const inputSchema = { type: "object", required, properties };
		return { name, description, inputSchema, schema: inputSchema, handler };
	}

	tools(){
		const CARD = { type: "string", description: "The card's id, its path under ai/ — e.g. `2026/09/24/my-card` or `2026/09/24/my-card/a-sub-card`. An old card id it answers to also works." };
		const say = x => JSON.stringify(x, null, 2);
		return [
			this.tool("create_card",
				"The ONLY way to make a card. Never build a card folder or its page.jsonl by hand — this tool picks the"
				+ " folder, the slug and the day, writes the card's first line and lists it in its parent. A blank"
				+ " `question`/`note`/`card` is fine (that is what the owner's own \"+ New card\" makes, to talk into) —"
				+ " but a `request` or `task` card is work you are telling the owner about, so pass `summary` (what it is,"
				+ " in a sentence or two) or `task` (a task dir under `ai/`, whose own task.jsonl becomes the summary) and"
				+ " it becomes the card's first section; with neither, a `request`/`task` card is refused rather than"
				+ " left empty (item 4, card-pipeline 2026-10-02: an empty request card nobody ever filled in was the"
				+ " exact cause the audit found). Returns `{ok, id, url, path}`, or `{ok:false, why}`.",
				{
					parent: { type: "string", description: "Where it goes: omit (or `today`) for today's folder; a card id to make a sub-card inside that card, at any depth." },
					// A TITLE SAYS WHAT HAPPENED AND WHY IT MATTERS, IN WORDS A NON-PROGRAMMER READS
					// (the owner, 2026-10-03, on "Worktree pool stuck — 2 minions queued 40+ min":
					// "what does this mean? Which worktree, which pool? I don't know what a worktree
					// pool is."). Not a system's internal noun ("worktree pool", "the pool", a tool
					// name) — the EFFECT on the work: what got stuck, what it cost, what changed.
					title: { type: "string", description: "What happened and why it matters, in a few plain words a non-programmer reads — never a system's internal noun (\"worktree pool\", \"the inbox rail\"). The folder name is made from it." },
					type: { type: "string", description: "`question`, `request`, `task`, `note`, … Change it later with one `{\"type\": …}` line; the latest wins." },
					by: { type: "string", description: "Your own agent id." },
					tags: { type: "array", items: { type: "string" }, description: "Projects this card belongs to. A project is a tag, not a folder." },
					summary: { type: "string", description: "Required for `request`/`task` (optional otherwise): a sentence or two of what this card is about, written as its first section." },
					task: { type: "string", description: "An alternative to `summary` for `request`/`task`: a task dir under `ai/` (e.g. `2026-10-02/my-task`) — its own task.jsonl computes the first section (status, next step, links) instead of you writing one." }
				},
				["title"],
				async a => {
					if (["request", "task"].includes(a.type) && !a.summary && !a.task)
						return say({ ok: false, why: "a request or task card needs `summary` or `task` — never an empty one; omit `type` (or use `note`/`question`) for a blank card to talk into, like \"+ New card\" makes" });
					const out = await this.create(a);
					if (out.ok && (a.summary || a.task)){
						const tip = a.summary ?? await this.ask_tip({ title: a.title }, a.task);
						if (tip) await this.append(out.id, { chat: { level: "summary", text: tip, at: stamp(), from: { kind: "system", id: a.by ?? "agent" } } });
					}
					return say(out);
				}),

			this.tool("read_card",
				"A card's whole log, oldest line first — read it when you start work on a card, so you know everything said on it.",
				{ card: CARD }, ["card"],
				async ({ card }) => (await this.transcript(card)) ?? `No card "${card}".`),

			this.tool("attach_card",
				"Put an agent on a card: from now on the owner's new words on that card are forwarded to it (never to a"
				+ " minion). The agent is sent the card's whole log right now, as one message.",
				{ card: CARD, agent: { type: "string", description: "The agent's id, as `list_agents` gives it." } },
				["card", "agent"],
				async ({ card, agent }) => {
					const out = await this.attach(card, agent);
					if (!out.ok) return say(out);
					const live = this.live(agent);
					if (live) this.agents.send(agent, await this.transcript(out.id), { from: "cards", reply_to: `card ${out.id}` });
					return say({ ...out, sent: !!live, ...(live ? {} : { why: `agent "${agent}" is not live; attached, nothing sent` }) });
				}),

			this.tool("list_cards",
				"Cards as short summaries (id, title, type, status, tags, created, last), newest activity first.",
				{
					view: { type: "string", description: "`today` (default: made or touched today), `open` (not done), `all`, or a tag." },
					tag: { type: "string", description: "Only cards with this tag — a project." }
				},
				[],
				async a => say(await this.list(a ?? {}))),

			this.tool("card_ask",
				"Ask the owner something ON a card, with the widget the card already draws — a Decision (a row of"
				+ " buttons to pick from) when you pass `options`, a Question (a free-text box) when you don't. The"
				+ " owner answers it from the dashboard, same as any card; when they do, `from` (or, with none, every"
				+ " live, non-minion agent attached to the card) is sent the answer as a message. Returns"
				+ " `{ok, id: <card>, ask: <the place line's own id>}`, or `{ok:false, why}`.",
				{
					card: CARD,
					question: { type: "string", description: "What you're asking, in plain words." },
					options: { type: "array", items: { type: "string" }, description: "Pass this for a Decision — each a short thing the owner can pick, e.g. [\"close it\", \"keep chasing\"]. Omit it for a free-text Question." },
					title: { type: "string", description: "A short label for the ask, if the question text alone doesn't say enough." },
					from: { type: "string", description: "Your own agent id — who gets woken when the owner answers. Omit it and every live, non-minion agent attached to the card is woken instead." }
				},
				["card", "question"],
				async a => say(await this.ask(a))),

			this.tool("list_waiting",
				"Everything on the board waiting on the owner right now — a blocker, decision or question with no"
				+ " answer yet, ranked (blocker first) and newest first within each rank. The same list the"
				+ " dashboard's \"Needs you\" tab, and the rail's \"Needs review\" filter, show.",
				{}, [],
				async () => say(await this.waiting()))
		];
	}
}

Cards.OWNER = OWNER;
Cards.CLASS = CLASS;
