import { Page, div, a, p, small } from "/app.js";
import { AITask } from "/framework/ai/AITask/AITask.js";
import CardDir from "/framework/ai/cards/CardDir.js";

/* One folder of the sessions store, routed by its own path: /framework/ai/sessions/2026/10/12/<session>/<task>/.
   Tasks live here since 2026-10-12 (ai/doc/task-folders.md); the flat /framework/ai/sessions/<id>/ session route is untouched.
   A year lists its months, a month its days and a day its sessions (StoreFolder.sessions); a folder with a task.jsonl opens as a task (AITask); a folder with its own
   page.js is left to Page.child()'s probe; any other folder (a session's) lists its tasks and links the session page. */
export default class StoreFolder extends Page {

	constructor({ home, segs }){
		super({ home, segs, title: segs.at(-1), icon: segs.length < 4 ? "calendar_month" : "folder", url: home.url + segs.join("/") + "/" });
	}

	/** Every known task folder's url: the move manifest (all older tasks) + Servex's tasks.json (the last 7 days, dev only). Loaded once. */
	static urls(){
		return this._urls ??= Promise.all([
			fetch("/framework/ai/sessions/task-moves.jsonl").then(r => r.ok ? r.text() : "", () => "")
				.then(t => t.split("\n").flatMap(l => { try { const e = JSON.parse(l); return ["task", "rename", "redirect"].includes(e.kind) ? [e.to] : []; } catch { return []; } })),
			fetch("/framework/ai/tasks.json").then(r => r.ok ? r.json() : null, () => null).then(j => (j?.tasks ?? []).map(t => t.dir)),
		]).then(([a, b]) => [...new Set([...a, ...b])].filter(Boolean).map(d => "/" + d.replace(/^public\//, "") + "/").sort());
	}

	/** OLD ADDRESSES: /framework/ai/2026-10-12/<task>/… -> its url in the store, or null. Read synchronously once from the move
	    log (Server/TaskMove.mjs writes it; Server/TaskDirs.mjs redirect() is the node twin), because route() must answer now. */
	static moved(url){
		if (!this._moves){
			this._moves = new Map();
			const x = new XMLHttpRequest();
			x.open("GET", "/framework/ai/sessions/task-moves.jsonl", false);
			try { x.send(); } catch {}
			if (x.status === 200 && !(x.getResponseHeader("content-type") ?? "").includes("html"))
				for (const l of x.responseText.split("\n")) try { const e = JSON.parse(l); if (e.from && e.to && !e.undone && e.kind !== "stub") this._moves.set("/" + e.from.replace(/^public\//, ""), "/" + e.to.replace(/^public\//, "")); } catch {}
		}
		const m = /^(\/framework\/ai\/\d{4}-\d{2}-\d{2})(\/[^/]+)?/.exec(url);
		if (!m) return null;
		if (!m[2]) return [...this._moves.keys()].some(k => k.startsWith(m[1] + "/")) ? m[1].replace(/(\d{4})-(\d{2})-(\d{2})$/, "sessions/$1/$2/$3") + "/" : null;
		let to = this._moves.get(m[1] + m[2]);
		for (let n = 0; to && this._moves.has(to) && n < 9; n++) to = this._moves.get(to);
		return to ? to + url.slice(m[0].length) : null;
	}

	/** A `cards/` folder of the store, or anything under it (one tree, 2026-10-13): a card's page is the Inbox route,
	    /framework/ai/<id>/, so the folder's url forwards there (CardDir.id is the inverse of CardDir.rel). */
	static cards(url){
		const to = CardDir.page(CardDir.id(url));
		return new Page({ title: "Card", icon: "move_up", url,
			route(name){ return name.includes(".") ? undefined : StoreFolder.cards(url + name + "/"); },
			content(){ p(() => a().href(to).text("This card's page → " + to)); location.replace(to + location.search + location.hash); } });
	}

	/** A page that sends the browser on to `to` (old task and day addresses); a deeper old path keeps its tail. */
	static redirect(url, to){
		return new Page({ title: "Moved", icon: "move_up", url, content(){
			const tail = location.pathname.startsWith(url) ? location.pathname.slice(url.length) : "";
			p(() => a().href(to + tail).text("Moved to " + to + tail));
			location.replace(to + tail + location.search + location.hash);
		} });
	}

	/** An old-shaped /framework/ai/<day>/<slug>/ that no move ever recorded (a reader guessed it from a day log line):
	    find the slug in that day of the store through the task index (ext/Query `tasks`, dev), and go there; with no
	    index (the static site) or no hit, link the store's day folder, which lists its tasks. Node twin: TaskDirs.locate(). */
	static lookup(url, day, slug){
		const store = "/framework/ai/sessions/" + day.replaceAll("-", "/") + "/";
		return new Page({ title: slug, icon: "move_up", url, content(){
			const tail = location.pathname.startsWith(url) ? location.pathname.slice(url.length) : "";
			const box = p("Finding " + slug + " in the sessions store…");   // captured now; filled after the query (no DOM after an await)
			import("/framework/ext/Query/QueryClient.js")
				.then(({ default: QueryClient }) => new QueryClient("tasks").ask({ where: [{ field: "day", op: "eq", value: day }, { field: "slug", op: "eq", value: slug }], limit: 5 }, { timeout: 3000 }))
				.catch(() => null)
				.then(res => {
					const hit = res?.rows?.map(r => r.url ?? (r.dir && "/" + r.dir.replace(/^public\//, "") + "/")).find(Boolean);
					if (hit) return location.replace(hit + tail + location.search + location.hash);
					box.empty().append(() => a().href(store).text(`${slug} is not in the index; the ${day} tasks are in the sessions store →`));
				});
		} });
	}

	/** What the move log already knows, so a known folder routes without a probe (a 404 probe is a console error):
	    the moved task urls, and the ones with their own page.js (ai/sessions/task-pages.json, Server/TaskMove.mjs --pages). */
	static known(){
		if (!this._known){
			StoreFolder.moved("/");   // loads the move log
			const x = new XMLHttpRequest();
			x.open("GET", "/framework/ai/sessions/task-pages.json", false);
			try { x.send(); } catch {}
			let pages = [];
			if (x.status === 200 && !(x.getResponseHeader("content-type") ?? "").includes("html")) try { pages = JSON.parse(x.responseText).pages ?? []; } catch {}
			this._known = { tasks: new Set(this._moves.values()), pages: new Set(pages.map(u => u.replace(/\/$/, ""))) };
		}
		return this._known;
	}

	route(name){
		if (name.includes(".")) return;
		const url = this.url + name + "/", bare = url.slice(0, -1), next = () => new StoreFolder({ home: this.home, segs: [...this.segs, name] });
		const task = () => new AITask({ title: name, icon: "receipt_long", url, src: url + "session.json" });
		if (name === "cards") return StoreFolder.cards(url);   // a day's Inbox cards: their pages are the Inbox's
		if (this.segs.length < 3) return next();
		const { tasks, pages } = StoreFolder.known();
		if (tasks.has(bare)) return pages.has(bare) ? undefined : task();   // undefined: Page.child() loads the folder's own page.js
		for (const t of tasks) if (t.startsWith(url)) return next();        // a session folder holding moved tasks
		if (AITask.has(url + "page.js")) return;                             // unknown (a task made after the move): probe
		if (AITask.has(url + "session.jsonl") || AITask.has(url + "task.jsonl")) return task();   // session.jsonl first: it is the one record now, so a new folder never 404s on the old name
		return next();
	}

	content(){
		const name = this.segs.at(-1);
		if (this.segs.length === 4) p(() => a().href(this.home.url + name + "/").text("This session's page →"));
		if (this.segs.length === 3) p(() => a().href("/framework/ai/" + this.segs.join("-") + "/").text("This day's dashboard →"));
		const box = div.c("flow");   // captured now: the list fills in after the fetch (no DOM after an await)
		if (this.segs.length < 4) return this.sessions(box);
		StoreFolder.urls().then(urls => {
			const mine = urls.filter(u => u.startsWith(this.url) && u !== this.url);
			box.append(() => {
				if (!mine.length) return p.c("muted", "No tasks recorded under this folder.");
				for (const u of mine) div(() => a().href(u).text(u.slice(this.url.length).replace(/\/$/, "")));
			});
		});
	}

	static usd(n){ return "$" + (n >= 100 ? n.toFixed(0) : n.toFixed(2)); }

	/** A year lists its months, a month its days (both from the rolled-up index.json, with session counts and cost), a day lists its sessions (the day's index.json snapshots). */
	sessions(box){
		const level = this.segs.length, base = this.url, pad = n => String(n).padStart(2, "0");
		const day_index = fetch(base + "index.json").then(r => r.ok ? r.json() : null, () => null);
		const tasks = level < 3 ? StoreFolder.urls() : Promise.resolve([]);
		Promise.all([day_index, tasks]).then(([ix, urls]) => box.append(() => {
			if (level === 3){
				const rows = [...(ix?.snapshots ?? [])].sort((x, y) => (x.first_at ?? "").localeCompare(y.first_at ?? ""));
				if (!rows.length) return p.c("muted", "No sessions are recorded for this day.");
				p.c("muted", `${rows.length} sessions, in the order they started.`);
				for (const r of rows) div.c("flex gap-50", () => {
					a().href(this.home.url + r.folder + "/").text(r.title || r.agent || r.folder);
					small.c("muted", [r.agent && r.agent !== r.title ? r.agent : "", StoreFolder.usd(r.tree_usd ?? r.usd ?? 0), r.state].filter(Boolean).join(" · "));
				});
				return;
			}
			const known = level === 1 ? ix?.months : ix?.days;
			const seen = new Set(Object.keys(known ?? {}));
			for (const u of urls) { const seg = u.slice(base.length).split("/")[0]; if (u.startsWith(base) && /^\d\d$/.test(seg)) seen.add(seg); }
			if (!seen.size) return p.c("muted", "No sessions are recorded under this folder.");
			for (const k of [...seen].sort().reverse()) div.c("flex gap-50", () => {
				const row = known?.[k];
				a().href(base + k + "/").text(level === 1 ? `${this.segs[0]}-${pad(k)}` : `${this.segs[0]}-${this.segs[1]}-${pad(k)}`);
				small.c("muted", row ? `${row.count} sessions · ${StoreFolder.usd(row.usd ?? 0)}${row.flagged ? " · " + row.flagged + " flagged" : ""}` : "no summary has been rolled up for it yet");
			});
		}));
	}
}
