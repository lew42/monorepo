import { TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
import { resolve_card, today_str, plain, headline, first_sentence } from "./inbox.js";

/**
 * THE GROUPS — a few familiar names the work is filed under (the owner,
 * 2026-09-24: "the left list of previews should primarily be GROUPS, familiar
 * groups. If any new thing happens, instead of becoming its own card, it gets
 * added to one of those groups").
 *
 * `groups.json` names them; each is also a card (`card`), so a prompt can be
 * appended to it. MEMBERSHIP IS A LINE ON THE MEMBER, latest wins:
 *
 *   {"group": "system-design"}     ← appended to a task's task.jsonl, or to a card
 *
 * A GROUP RISES BY ITS MEMBERS, and that is computed here, in the view: its
 * time is the newest line of its own card or of any member, and its "latest
 * update" is that member's own words. Nothing is copied into the group's log.
 * doc/groups.md.
 */

export const GROUPS_URL = "/framework/ai2/groups.json";

/* ⚠ `{"group": …}` IS NOT `assign.group`. The older `assign.group` is a task's
   "effort" and replays onto the instance as a plain field, so a `group()`
   METHOD here would be overwritten by it and the next membership line would
   throw. The line is caught in `apply()` instead, before any verb runs. */
export class Member extends TaskJSONL {
	apply(entry){
		for (const v of Object.values(entry ?? {})){
			for (const at of [v?.at, v?.requested_at, v?.landed_at])
				if (at && (!this.last_at || Date.parse(at) > Date.parse(this.last_at))) this.last_at = at;
		}
		if (typeof entry?.group === "string" && Object.keys(entry).length === 1){
			this.member_of = entry.group;
			return this;
		}
		return super.apply(entry);
	}
	reset(){ this.member_of = null; this.last_at = null; return super.reset(); }
}

/** What a task says in a preview — never its slug. Landed: its landing
    headline. Running: its request's first sentence, and what it is doing now. */
export function task_words(m){
	if (m.landed_at && m.outcome) return { title: headline(m.outcome), words: "", landed: true };
	return { title: first_sentence(plain(m.request ?? "")) || "A task", words: plain(m.now ?? ""), landed: !!m.landed_at };
}

/** What a card says in a preview: its title, and the last thing said into it. */
function card_words(f){
	const last = [...(f.messages ?? []).map(m => ({ at: m.at, text: m.text ?? m.raw })),
		...(f.prompts ?? []).map(p => ({ at: p.at, text: p.text ?? p.raw }))]
		.filter(x => x.text).sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0)).at(-1);
	return { title: plain(f.title ?? ""), words: plain(last?.text ?? f.text ?? ""), said_at: last?.at };
}

export class Groups {
	/* How many days of task dirs to read, newest first: today's stream live,
	   the earlier ones are read once. */
	static days = 2;

	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.list ??= [];
		this.tasks = new Map();     // "<date>/<slug>" → Member
		this.folds = new Map();     // card id → { key, fold }
		this.readers = new Set();
	}

	on(fn){ this.readers.add(fn); return () => this.readers.delete(fn); }
	changed(){ clearTimeout(this.timer); this.timer = setTimeout(() => this.readers.forEach(fn => fn(this)), 50); }

	/** `folders` is AI 2's `CardList`; `socket` (optional) says when a new task dir appears. */
	async start({ folders, socket } = {}){
		this.folders = folders;
		const res = await fetch(GROUPS_URL).catch(() => null);
		this.list = res?.ok ? await res.json().catch(() => []) : [];
		this.by_id = new Map(this.list.map(g => [g.id, g]));
		this.by_card = new Map(this.list.map(g => [g.card, g]));
		folders?.on(() => this.read_cards());
		socket?.on?.("data", path => { if (String(path).endsWith("/directory.json")) this.read_tasks(); });
		await Promise.all([this.read_tasks(), this.read_cards()]);
		this.changed();
		return this;
	}

	/* ── the members ──────────────────────────────────────────────────── */

	dates(){
		const out = [];
		for (let i = 0; i < this.constructor.days; i++){
			const d = new Date(Date.now() - i * 864e5), pad = n => String(n).padStart(2, "0");
			out.push(d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()));
		}
		return out;
	}

	/* Every task dir with a task.jsonl, from the dev server's directory listing
	   (the same one the task board reads). ⚠ The SPA fallback answers a miss
	   with index.html — the content-type is the 404. */
	async read_tasks(){
		const res = await fetch("/framework/directory.json").catch(() => null);
		const dir = res?.ok && !(res.headers.get("content-type") ?? "").includes("html") ? await res.json().catch(() => null) : null;
		const ai = dir?.files?.find(f => f.name === "ai")?.children ?? [];
		this.dir = ai;
		const today = today_str();
		const loads = [];
		for (const date of this.dates()){
			const day = ai.find(d => d.name === date);
			for (const kid of day?.children ?? []){
				if (kid.type !== "dir" || !kid.children?.some(k => k.name === "task.jsonl")) continue;
				const key = date + "/" + kid.name;
				if (this.tasks.has(key)) continue;
				const m = new Member({ url: `/framework/ai/${key}/task.jsonl`, date, slug: kid.name, files: kid.children.map(k => k.name) });
				this.tasks.set(key, m);
				loads.push(date === today ? m.live(() => this.changed()) : m.load());
			}
		}
		await Promise.all(loads);
		if (loads.length) this.changed();
	}

	/* A card's `group` line is only in its own log, so the folds of the cards
	   touched lately are read through Servex, once per change of their `last`.
	   The group cards are always read: a prompt filed into one moves it. */
	async read_cards(){
		const cards = this.folders?.cards ?? [];
		const days = this.dates();
		const want = cards.filter(c => c.type === "group" || this.by_card?.has(c.id)
			|| days.some(d => String(c.last ?? c.created ?? "").startsWith(d)));
		let any = false;
		for (let i = 0; i < want.length; i += 6){
			await Promise.all(want.slice(i, i + 6).map(async c => {
				const key = c.last ?? c.created;
				if (this.folds.get(c.id)?.key === key) return;
				const fold = await resolve_card(c.id);
				if (!fold) return;
				this.folds.set(c.id, { key, fold });
				any = true;
			}));
		}
		if (any) this.changed();
	}

	/* ── what the view asks ───────────────────────────────────────────── */

	/** The group a thing is filed under, or null. `kind` is "task" (id = slug or "<date>/<slug>") or "card". */
	group_of(kind, id){
		if (kind === "card"){
			if (this.by_card?.has(id)) return this.by_card.get(id);
			return this.by_id?.get(this.folds.get(id)?.fold?.group) ?? null;
		}
		const m = this.tasks.get(id) ?? [...this.tasks.values()].find(t => t.slug === id);
		return this.by_id?.get(m?.member_of) ?? null;
	}

	/** Is a rail item already inside a group? Then it is not "not filed". */
	filed(it){
		if (it.folder || /^\d{4}\//.test(String(it.id))) return !!this.group_of("card", it.id);
		if (it.kind === "landed") return !!this.group_of("task", it.id);
		return false;
	}

	/** Everything in one group, newest first: its tasks, its cards, and what was said into the group card itself. */
	members(gid){
		const g = this.by_id?.get(gid);
		if (!g) return [];
		const out = [];
		for (const m of this.tasks.values()) if (m.member_of === gid && m.loaded)
			out.push({ kind: "task", id: m.slug, base: `/framework/ai/${m.date}/${m.slug}/`, files: m.files, at: m.last_at, ...task_words(m) });
		for (const [id, { fold }] of this.folds){
			if (id === g.card || fold.group !== gid) continue;
			out.push({ kind: "card", id, at: fold.last, ...card_words(fold) });
		}
		const own = this.folds.get(g.card)?.fold;
		if (own){
			const w = card_words(own);
			if (w.said_at) out.push({ kind: "said", id: g.card, at: w.said_at, title: "", words: w.words });
		}
		return out.sort((a, b) => Date.parse(b.at ?? 0) - Date.parse(a.at ?? 0));
	}

	/** The task a card points at, as a member-shaped `{ base, files }` — or
	    nothing until the directory listing is in, so the task page is never
	    drawn without knowing which of its files exist. */
	task_at(base){
		if (!base || !this.dir) return [];
		const [date, slug] = base.split("/").filter(Boolean).slice(-2);
		const files = this.dir.find(d => d.name === date)?.children?.find(k => k.name === slug)?.children?.map(k => k.name);
		return [{ base, files: files ?? [] }];
	}

	/** One group's newest member — its time and its own words — or null. */
	latest(gid){ return this.members(gid)[0] ?? null; }

	/** The groups, the one with the newest activity first. A group with none sorts by its card's own birth. */
	ordered(){
		const at = g => Date.parse(this.latest(g.id)?.at ?? this.folds.get(g.card)?.fold?.created ?? 0) || 0;
		return [...this.list].sort((a, b) => at(b) - at(a));
	}
}
