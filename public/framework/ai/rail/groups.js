import { TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
import { resolve_card, plain, headline, first_sentence } from "./inbox.js";
import { total } from "/framework/ai/AITask/cost.js";
import { PageLog } from "/framework/core/Page/Log.js";
import { NeedsRule } from "./NeedsRule.js";

// history and reasons: doc/groups-notes.md

export const GROUPS_URL = "/framework/ai/rail/groups.json";

// ⚠ `{"group": …}` IS NOT `assign.group` — the older `assign.group` replays as a field and would overwrite a method; caught in apply() before any verb runs.
export class Member extends TaskJSONL {
	apply(entry){
		for (const v of Object.values(entry ?? {})){
			if (NeedsRule.is_heartbeat_line(v)) continue;
			for (const at of [v?.at, v?.requested_at, v?.landed_at])
				if (at && (!this.last_at || Date.parse(at) > Date.parse(this.last_at))) this.last_at = at;
		}
		for (const verb of Object.keys(entry ?? {}))
			if (typeof this[verb] !== "function" && typeof this.constructor.prototype[verb] === "function") delete this[verb];
		for (const [verb, v] of Object.entries(entry ?? {})){
			if (typeof v?.page === "string") (this.pages ??= []).push({ path: v.page, at: v.at ?? this.last_at, by: v.by, task: this.date + "/" + this.slug,
				what: v.msg ?? v.text ?? v.question ?? v.about ?? v.summary ?? v.title ?? verb });
		}
		if (typeof entry?.group === "string" && Object.keys(entry).length === 1){
			this.member_of = entry.group;
			return this;
		}
		return super.apply(entry);
	}
	reset(){ this.member_of = null; this.last_at = null; this.pages = []; return super.reset(); }
}

function real_activity_at(fold){
	const real = [...(fold?.messages ?? []), ...(fold?.prompts ?? [])]
		.filter(m => !NeedsRule.is_heartbeat_line(m)).map(m => m?.at).filter(Boolean).sort();
	return real.at(-1) ?? fold?.created ?? null;
}

export function task_words(m){
	if (m.landed_at && m.outcome) return { title: m.title ?? headline(m.outcome), words: "", landed: true };
	return { title: m.title ?? (first_sentence(plain(m.request ?? "")) || "A task"), words: plain(m.now ?? ""), landed: !!m.landed_at };
}

function card_words(f){
	const last = [...(f.messages ?? []).map(m => ({ at: m.at, text: m.text ?? m.raw })),
		...(f.prompts ?? []).map(p => ({ at: p.at, text: p.text ?? p.raw }))]
		.filter(x => x.text).sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0)).at(-1);
	return { title: plain(f.title ?? ""), words: plain(last?.text ?? f.text ?? ""), said_at: last?.at };
}

export class Groups {
	static days = 2;

	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.list ??= [];
		this.tasks = new Map();
		this.folds = new Map();
		this.readers = new Set();
		this.task_files = new Map();
		this.looking = new Map();
		this._rev = 0;
		this._members_cache = new Map();
	}

	on(fn){ this.readers.add(fn); return () => this.readers.delete(fn); }
	changed(){ this._rev++; clearTimeout(this.timer); this.timer = setTimeout(() => this.readers.forEach(fn => fn(this)), 50); }

	async start({ folders, socket } = {}){
		this.folders = folders;
		const res = await fetch(GROUPS_URL).catch(() => null);
		this.list = res?.ok ? await res.json().catch(() => []) : [];
		this.by_id = new Map(this.list.map(g => [g.id, g]));
		this.by_card = new Map(this.list.map(g => [g.card, g]));
		folders?.on(() => this.read_cards());
		socket?.on?.("data", path => {
			const day = String(path).match(/\/framework\/ai\/(\d{4}-\d\d-\d\d)\/page\.jsonl$/)?.[1];
			const task = String(path).match(/^(\/framework\/ai\/\d{4}-\d\d-\d\d\/[^/]+\/)page\.jsonl$/)?.[1];
			if (day && this.dates().includes(day)) this.read_tasks(day);
			else if (task && this.looking.has(task)) this.look(task, true);
			else if (String(path).endsWith("/directory.json") && this.dir){ this.reading = null; this.read_tasks(); }
		});
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

	async read_tasks(fresh){
		const loads = [];
		const days = await Promise.all(this.dates().map(date => this.day(date, date === fresh)));
		days.flat().forEach(({ date, slug, files }) => {
			const key = date + "/" + slug;
			if (files) this.task_files.set(key, files);
			if (this.tasks.has(key)) return;
			const url = `/framework/ai/${key}/task.jsonl`, m = new Member({ url, date, slug, files });
			this.tasks.set(key, m);
			loads.push(m.live(() => this.changed()).then(loaded => {
				if (loaded.loaded) return;
				this.tasks.delete(key);
				const at = `/framework/ai/${key}/`;
				if (!PageLog.loaded_listing(at)) (PageLog.loaded_listings ??= new Map()).set(at,
					{ dirs: [], pages: new Map(), files: files ?? [], folder(name){ return this.dirs.includes(name) || this.pages.has(name); } });
			}));
		});
		await Promise.all(loads);
		if (loads.length) this.changed();
	}

	async day(date, fresh){
		const root = await PageLog.listing("/framework/ai/");
		if (root && !root.folder(date)) return [];
		const listing = await PageLog.listing(`/framework/ai/${date}/`, fresh);
		if (!listing) return this.day_from_tree(date);
		const no_task = slug => PageLog.loaded_listing(`/framework/ai/${date}/${slug}/`)?.files.includes("task.jsonl") === false;
		return [...listing.dirs, ...listing.pages.keys()].filter(slug => !no_task(slug)).map(slug => ({ date, slug }));
	}

	static names(listing){ return [...listing.files, ...listing.dirs, ...listing.pages.keys()]; }

	tree(){
		return this.reading ??= fetch("/framework/directory.json", { priority: "low" })
			.then(res => res?.ok && !(res.headers.get("content-type") ?? "").includes("html") ? res.json() : null)
			.catch(() => null)
			.then(dir => this.dir = dir?.files?.find(f => f.name === "ai")?.children ?? []);
	}

	async day_from_tree(date){
		const day = (await this.tree()).find(d => d.name === date);
		return (day?.children ?? [])
			.filter(kid => kid.type === "dir" && kid.children?.some(k => k.name === "task.jsonl"))
			.map(kid => ({ date, slug: kid.name, files: kid.children.map(k => k.name) }));
	}

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
				this.folds.set(c.id, { key, fold, real_at: real_activity_at(fold) });
				any = true;
			}));
		}
		if (any) this.changed();
	}

	real_at(id){ return this.folds.get(id)?.real_at ?? null; }

	/* ── what the view asks ───────────────────────────────────────────── */

	group_of(kind, id){
		if (kind === "card"){
			if (this.by_card?.has(id)) return this.by_card.get(id);
			return this.by_id?.get(this.folds.get(id)?.fold?.group) ?? null;
		}
		const m = this.tasks.get(id) ?? [...this.tasks.values()].find(t => t.slug === id);
		return this.by_id?.get(m?.member_of) ?? null;
	}

	filed(it){
		if (it.folder || /^\d{4}\//.test(String(it.id))) return !!this.group_of("card", it.id);
		if (it.kind === "landed") return !!this.group_of("task", it.id);
		return false;
	}

	members(gid){
		const g = this.by_id?.get(gid);
		if (!g) return [];
		const cached = this._members_cache.get(gid);
		if (cached && cached.rev === this._rev) return cached.out;
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
		out.sort((a, b) => Date.parse(b.at ?? 0) - Date.parse(a.at ?? 0));
		this._members_cache.set(gid, { rev: this._rev, out });
		return out;
	}

	task_at(base){
		if (!base) return [];
		const [date, slug] = base.split("/").filter(Boolean).slice(-2);
		const known = this.task_files.get(date + "/" + slug);
		if (known) return [{ base, files: known }];
		if (this.looking.get(base) !== "done"){
			this.look(base);
			return [];
		}
		const files = this.dir?.find(d => d.name === date)?.children?.find(k => k.name === slug)?.children?.map(k => k.name);
		return [{ base, files: files ?? [] }];
	}

	look(base, fresh){
		if (this.looking.has(base) && !fresh) return;
		const [date, slug] = base.split("/").filter(Boolean).slice(-2), key = date + "/" + slug;
		if (!fresh) this.looking.set(base, "pending");
		PageLog.listing(base, fresh).then(async listing => {
			if (listing) this.task_files.set(key, this.constructor.names(listing));
			else await this.tree();
			this.looking.set(base, "done");
			this.changed();
		});
	}

	task_member(url){
		const [date, slug] = String(url ?? "").split("/").filter(Boolean).slice(-2);
		return this.tasks.get(date + "/" + slug) ?? null;
	}

	cost(gid){
		return total(this.members(gid).filter(m => m.kind === "task")
			.map(m => ({ url: m.base, m: this.task_member(m.base) })));
	}

	latest(gid){ return this.members(gid)[0] ?? null; }

	at(g){
		const index = (this.folders?.cards ?? []).filter(c => c.id === g.card || c.id.startsWith(g.card + "/"))
			.map(c => this.real_at(c.id) ?? c.last ?? c.created);
		const times = [this.latest(g.id)?.at, this.real_at(g.card) ?? this.folds.get(g.card)?.fold?.created, ...index].filter(Boolean);
		return times.sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
	}

	ordered(){
		const at = g => Date.parse(this.at(g) ?? 0) || 0;
		return [...this.list].sort((a, b) => at(b) - at(a));
	}
}
