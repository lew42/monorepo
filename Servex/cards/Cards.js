import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { stamp } from "../home.js";

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
const CLASS = "/framework/ai2/Card.js";
const OWNER = "owner";            // what ai2/compose.js and ux/Dictate stamp as `by` on the owner's words
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default class Cards {

	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.root ??= ROOT;
		this.base ??= "/framework/ai/";
		this.queues = new Map();          // file path -> promise chain: one writer per file
		this.legacies = null;             // legacy id -> card id, built on first use
		this.listeners = new Set();       // fn(cardId, line, info), told after every write
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
		return next;
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
			if (obj.message && typeof obj.message === "object" && !obj.message.at)
				line = { ...line, message: { ...obj.message, at: stamp() } };
			if (obj.prompt && typeof obj.prompt === "object"){
				const known = obj.prompt.id && (await this.fold(card)).prompts.some(p => p.id === obj.prompt.id);
				if (!known){ fresh = true; line = { ...line, prompt: this.prompt(card, obj.prompt) }; }
			}
			await this.write(card, line);
			if (line.legacy) this.legacy_map().set(line.legacy, card);
			this.emit(card, line, line.prompt ? { fresh } : {});
			return { ok: true, id: card, line, ...(line.prompt ? { fresh, ref: `${card}#${line.prompt.id}` } : {}) };
		} catch (e){ return { ok: false, why: String(e.message || e) }; }
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

	parse(text){
		return text.split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return { bad: l }; } });
	}

	/* Latest wins, line by line. `absorb` is the vocabulary; a key it does not
	 * know is kept as plain data, latest wins, so a new line shape never breaks a read. */
	async fold(id){
		const lines = await this.read(id);
		if (!lines) return null;
		const state = { id: this.canonical(id), title: "", type: "card", tags: [], status: "open", created: null, by: null,
			messages: [], prompts: [], cites: [], attached: [], children: [], legacy: [] };
		for (const line of lines) this.absorb(state, line);
		state.last = [state.created, state.messages.at(-1)?.at, state.prompts.at(-1)?.at].filter(Boolean).sort().at(-1) ?? null;
		return state;
	}

	absorb(state, line){
		for (const [key, value] of Object.entries(line)){
			if (key === "message") state.messages.push(value);
			else if (key === "prompt"){
				const had = state.prompts.find(p => p.id === value?.id);
				had ? Object.assign(had, value) : state.prompts.push({ ...value });
			}
			else if (key === "cites"){ for (const ref of [].concat(value)) if (!state.cites.includes(ref)) state.cites.push(ref); }
			else if (key === "attach"){ if (!state.attached.includes(value)) state.attached.push(value); }
			else if (key === "detach") state.attached = state.attached.filter(a => a !== value);
			else if (key === "legacy") state.legacy.push(value);
			else if (key === "file"){
				const child = `${state.id}/${String(value).replace(/\/page\.jsonl$/, "")}`;
				if (!state.children.includes(child)) state.children.push(child);
			}
			else if (key === "class" || key === "id") continue;
			else state[key] = value;
		}
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
			const summary = { id, title: s.title, type: s.type, status: s.status, tags: s.tags, created: s.created, last: s.last };
			const want = tag ?? (["today", "open", "all"].includes(view) ? null : view);
			if (want ? s.tags.includes(want)
				: view === "open" ? s.status !== "done"
				: view === "today" ? [s.created, s.last].some(t => String(t ?? "").startsWith(day))
				: true) out.push(summary);
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

		for (const p of ["/cards", "/card", "/card/create", "/card/append"]) router.options(p, cors, (req, res) => res.status(204).end());
		router.get("/cards", cors, async (req, res) => res.json(await this.list({ view: req.query.view || "today", tag: req.query.tag || undefined })));
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
				+ " folder, the slug and the day, writes the card's first line and lists it in its parent. Returns"
				+ " `{ok, id, url, path}`, or `{ok:false, why}`.",
				{
					parent: { type: "string", description: "Where it goes: omit (or `today`) for today's folder; a card id to make a sub-card inside that card, at any depth." },
					title: { type: "string", description: "What the card is, in a few plain words. The folder name is made from it." },
					type: { type: "string", description: "`question`, `request`, `task`, `note`, … Change it later with one `{\"type\": …}` line; the latest wins." },
					by: { type: "string", description: "Your own agent id." },
					tags: { type: "array", items: { type: "string" }, description: "Projects this card belongs to. A project is a tag, not a folder." }
				},
				["title"],
				async a => say(await this.create(a))),

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
				async a => say(await this.list(a ?? {})))
		];
	}
}

Cards.OWNER = OWNER;
Cards.CLASS = CLASS;
