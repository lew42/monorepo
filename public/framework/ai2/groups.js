import { TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
import { resolve_card, plain, headline, first_sentence } from "./inbox.js";
import { total } from "/framework/ext/AITask/cost.js";
import { PageLog } from "/framework/core/Page/Log.js";
import { is_heartbeat_line } from "./needs-rule.js";

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
		// ITEM A, 2026-09-30: a servex-heartbeat check-in ("its agent is not running: it was
		// stopped on purpose") is Servex looking at itself, not real progress — it must never
		// move this task's `last_at`, which is what bumps a task to the top of the Log tab and
		// what every group's own `at()` reads (below). The line is still handed to `super.apply()`
		// further down, so a task-loop escalation inside it (`log.js`'s `task_status()`) is still
		// seen — only the ACTIVITY-TIME bump is skipped.
		for (const v of Object.values(entry ?? {})){
			if (is_heartbeat_line(v)) continue;
			for (const at of [v?.at, v?.requested_at, v?.landed_at])
				if (at && (!this.last_at || Date.parse(at) > Date.parse(this.last_at))) this.last_at = at;
		}
		// ⚠ An `assign` naming a verb (`{"assign":{"agent":…}}`, waiting-on-you, 2026-09-28) replays
		//   as a FIELD over that verb's method, and the next `{"agent":…}` line threw
		//   "this[verb] is not a function" on every AI 2 load. The method wins back.
		for (const verb of Object.keys(entry ?? {}))
			if (typeof this[verb] !== "function" && typeof this.constructor.prototype[verb] === "function") delete this[verb];
		// AN EVENT ON A PAGE: any line whose value names `"page": "/framework/…/"` (real.js).
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

/** A card's real last activity — the newest of its own messages and prompts, skipping a
 *  `servex-heartbeat` notice (item A, `is_heartbeat_line()`), or its `created` time when it
 *  has said nothing real yet. `Groups.real_at()` (above) is how a caller reaches this. */
function real_activity_at(fold){
	const real = [...(fold?.messages ?? []), ...(fold?.prompts ?? [])]
		.filter(m => !is_heartbeat_line(m)).map(m => m?.at).filter(Boolean).sort();
	return real.at(-1) ?? fold?.created ?? null;
}

/** What a task says in a preview — never its slug. Landed: its landing
    headline. Running: its request's first sentence, and what it is doing now. */
export function task_words(m){
	if (m.landed_at && m.outcome) return { title: m.title ?? headline(m.outcome), words: "", landed: true };
	return { title: m.title ?? (first_sentence(plain(m.request ?? "")) || "A task"), words: plain(m.now ?? ""), landed: !!m.landed_at };
}

/** What a card says in a preview: its title, and the last thing said into it. */
function card_words(f){
	const last = [...(f.messages ?? []).map(m => ({ at: m.at, text: m.text ?? m.raw })),
		...(f.prompts ?? []).map(p => ({ at: p.at, text: p.text ?? p.raw }))]
		.filter(x => x.text).sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0)).at(-1);
	return { title: plain(f.title ?? ""), words: plain(last?.text ?? f.text ?? ""), said_at: last?.at };
}

export class Groups {
	/* How many days of task dirs to read, newest first. Every task log streams over
	   the dev socket: no HTTP request each, and a folder with no task.jsonl answers
	   quietly instead of a 404 (off localhost live() is a plain load()). */
	static days = 2;

	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.list ??= [];
		this.tasks = new Map();     // "<date>/<slug>" → Member
		this.folds = new Map();     // card id → { key, fold }
		this.readers = new Set();
		this.task_files = new Map();   // "<date>/<slug>" → the task folder's file names
		this.looking = new Map();      // base → "pending" | "done": task_at() asked for its listing
		// ⚠ MEMBERS() CACHE (ai2-hang, 2026-09-30) — `members(gid)` walks every task and
		// every fold and sorts the result; before this, ONE `paint()` called it 6-8 times
		// per group (once inside `ordered()`'s sort via `at()`→`latest()`, once from
		// `latest()` direct, once for `size`, once inside `cost()`, once more from the
		// `at_of` loop's own `at()` call) — a CPU profile of `/framework/ai2/` found
		// `groups.js`'s `at()`, its index array and `card_words()` among the top hand full
		// of self-time functions. `_rev` is bumped every time `changed()` fires — the one
		// place that always means "tasks, folds or task_files really changed" — so the
		// cache can never serve a stale answer, only skip re-doing work nothing asked to
		// change. Detail: ai/2026-09-30/inbox-ext/ai2-hang/profile.md.
		this._rev = 0;
		this._members_cache = new Map();   // group id → { rev, out }
	}

	on(fn){ this.readers.add(fn); return () => this.readers.delete(fn); }
	changed(){ this._rev++; clearTimeout(this.timer); this.timer = setTimeout(() => this.readers.forEach(fn => fn(this)), 50); }

	/** `folders` is AI 2's `CardList`; `socket` (optional) says when a new task dir appears. */
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

	/* Every task dir of the days shown. ONE request per day: the day folder's own
	   page.jsonl names its task folders, and each task's task.jsonl is loaded as
	   before (a folder with none fails quietly and is never shown). A task folder's
	   OWN listing is fetched only when a card shows that task (task_at()): on a phone
	   every extra request waits a whole round trip (the owner's measurement, 09-29).
	   directory.json is read only for a day with no page.jsonl. `fresh` (a day)
	   refetches that day's list: a task folder was added to it. */
	async read_tasks(fresh){
		const loads = [];
		const days = await Promise.all(this.dates().map(date => this.day(date, date === fresh)));
		days.flat().forEach(({ date, slug, files }) => {
			const key = date + "/" + slug;
			if (files) this.task_files.set(key, files);
			if (this.tasks.has(key)) return;
			const url = `/framework/ai/${key}/task.jsonl`, m = new Member({ url, date, slug, files });
			this.tasks.set(key, m);
			// `day()`'s own `no_task` guard can't always tell in advance (a dir's own listing
			// may not be loaded yet, voice-dir-404) — so this fetch is sometimes for a dir with
			// no task.jsonl at all, and gets a 404. `JSONL.load()` already swallows that quietly
			// (never throws, never logs), but the browser's own network log still notes the
			// failed request once; nothing in JS suppresses that. What IS this file's job: never
			// leave a phantom "task" behind, and never ask again. A `m` that never loaded ANY
			// line is no task — drop it from the map, and remember that folder as task-less in
			// the same cache `no_task()` reads, so a later `day()` call skips it without asking.
			loads.push(m.live(() => this.changed()).then(loaded => {
				if (loaded.loaded) return;
				this.tasks.delete(key);
				const at = `/framework/ai/${key}/`;
				// Shaped like `PageLog.Listing` (Log.js) — `.folder()` included — since anything
				// that later reads this same cache entry (a Page building its own child list)
				// expects that real shape, not just the two fields `no_task()` itself reads.
				if (!PageLog.loaded_listing(at)) (PageLog.loaded_listings ??= new Map()).set(at,
					{ dirs: [], pages: new Map(), files: files ?? [], folder(name){ return this.dirs.includes(name) || this.pages.has(name); } });
			}));
		});
		await Promise.all(loads);
		if (loads.length) this.changed();
	}

	/** One day's task folders: [{ date, slug, files? }]. `files` only from the fallback.
	    A dir whose own listing hasn't loaded yet (so `no_task` below can't say yet) still
	    gets included here, optimistically — its task.jsonl may 404 (a folder with files but
	    no task, e.g. a voice session's raw-dictation scratch notes, `voice-dir-404`).
	    `read_tasks()` is where that gets cleaned up: a fetch that comes back with nothing
	    drops the phantom task and remembers the folder as task-less, so this only ever
	    asks once. */
	async day(date, fresh){
		const listing = await PageLog.listing(`/framework/ai/${date}/`, fresh);
		if (!listing) return this.day_from_tree(date);
		// A folder whose own list is already in and names no task.jsonl is no task; nothing is fetched to ask.
		const no_task = slug => PageLog.loaded_listing(`/framework/ai/${date}/${slug}/`)?.files.includes("task.jsonl") === false;
		return [...listing.dirs, ...listing.pages.keys()].filter(slug => !no_task(slug)).map(slug => ({ date, slug }));
	}

	// A listing's entries as one list of names, files and folders alike.
	static names(listing){ return [...listing.files, ...listing.dirs, ...listing.pages.keys()]; }

	/* THE FALLBACK — the dev server's directory.json, read once, for a day or a
	   task with no page.jsonl. ⚠ The SPA fallback answers a miss with
	   index.html — the content-type is the 404. */
	tree(){
		// `priority: "low"` — this file is ~3.3MB. A browser only opens ~6 connections per
		// origin, and a slow, uncompressed 3.3MB download can occupy one of them long enough
		// to queue a page's own small requests behind it; this lets those go first when both
		// are in flight. See ai/2026-09-29/slow-card-fix/ for the measurement.
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
				this.folds.set(c.id, { key, fold, real_at: real_activity_at(fold) });
				any = true;
			}));
		}
		if (any) this.changed();
	}

	/** ITEM A, 2026-09-30: A CARD'S REAL LAST ACTIVITY — its own last message or prompt,
	 *  skipping any `servex-heartbeat` notice, or its `created` time when it has said nothing
	 *  else (`real_activity_at()`, below `read_cards()`'s own fold). Servex's own index
	 *  (`cards.jsonl`'s `last`, what `inbox.js`'s `items()` reads by default) folds a card the
	 *  same naive way `fold.js`'s `state.last` does — a heartbeat notice bumps it there too —
	 *  so this is the one place in the browser with the card's raw lines already in hand
	 *  (`read_cards()`'s own `want` filter fetches every card touched in the last two days,
	 *  which is every card that could plausibly be a hot Inbox row) to know better. `null` when
	 *  this card's fold has not been fetched yet — the caller falls back to the server's own
	 *  `last` exactly as before. */
	real_at(id){ return this.folds.get(id)?.real_at ?? null; }

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

	/** The task a card points at, as a member-shaped `{ base, files }` — or
	    nothing until the directory listing is in, so the task page is never
	    drawn without knowing which of its files exist. */
	task_at(base){
		if (!base) return [];
		const [date, slug] = base.split("/").filter(Boolean).slice(-2);
		const known = this.task_files.get(date + "/" + slug);
		if (known) return [{ base, files: known }];
		if (this.looking.get(base) !== "done"){
			this.look(base);
			return [];
		}

		// No page.jsonl there: the directory.json fallback look() read.
		const files = this.dir?.find(d => d.name === date)?.children?.find(k => k.name === slug)?.children?.map(k => k.name);
		return [{ base, files: files ?? [] }];
	}

	// A task folder's own page.jsonl, fetched when a card first shows it, and again
	// (`fresh`) when the socket says that log grew; then the view redraws.
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

	/** The loaded task a task-page url (`/framework/ai/<date>/<slug>/`) points at, or null —
	    null too for a task older than `days`, which is never read. */
	task_member(url){
		const [date, slug] = String(url ?? "").split("/").filter(Boolean).slice(-2);
		return this.tasks.get(date + "/" + slug) ?? null;
	}

	/** What a group cost: its member TASKS summed, each dollar once — `total()` is the
	    board's own sum (ext/AITask/cost.js), so AI 2 and the day page agree. Cards
	    carry no cost of their own; nothing measures them. */
	cost(gid){
		return total(this.members(gid).filter(m => m.kind === "task")
			.map(m => ({ url: m.base, m: this.task_member(m.base) })));
	}

	/** One group's newest member — its time and its own words — or null. */
	latest(gid){ return this.members(gid)[0] ?? null; }

	/** The groups, the one with the newest activity first. A group with none sorts by its card's own birth. */
	/** When a group was last updated: the newest of its members and of its own card's lines —
	    as the card index (`cards.jsonl`) has them, a sub-card counting as for any card.
	    ⚠ THE INDEX IS WHAT MAKES THIS KNOWN AT FIRST PAINT. Members are read one log at a
	    time; without it a group had no time for seconds after every (live-)reload and sorted
	    to the bottom of ~350 rows, then jumped back up — "it was there and then it wasn't…
	    a few seconds later it just popped back" (ai2-row-vanish, 2026-09-28). */
	at(g){
		// ITEM A: `real_at()` (above) — the fold-based recompute that skips a servex-heartbeat
		// notice — wins over the index's own `last` whenever this card's fold has already been
		// fetched; the index is still the fallback for a card `read_cards()` hasn't reached yet.
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
