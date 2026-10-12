import { Page, div, a, p } from "/app.js";
import { AITask } from "/framework/ext/AITask/AITask.js";

/* One folder of the sessions store, routed by its own path: /framework/ai/sessions/2026/10/12/<session>/<task>/.
   Tasks live here since 2026-10-12 (ai/doc/task-folders.md); the flat /framework/ai/sessions/<id>/ session route is untouched.
   A year, month or day lists the tasks under it; a folder with a task.jsonl opens as a task (AITask); a folder with its own
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

	/** A page that sends the browser on to `to` (old task and day addresses); a deeper old path keeps its tail. */
	static redirect(url, to){
		return new Page({ title: "Moved", icon: "move_up", url, content(){
			const tail = location.pathname.startsWith(url) ? location.pathname.slice(url.length) : "";
			p(() => a().href(to + tail).text("Moved to " + to + tail));
			location.replace(to + tail + location.search + location.hash);
		} });
	}

	route(name){
		if (name.includes(".")) return;
		const url = this.url + name + "/";
		if (this.segs.length >= 3 && AITask.has(url + "page.js")) return;   // a folder with its own page: Page.child() loads it
		if (this.segs.length >= 3 && AITask.has(url + "task.jsonl"))
			return new AITask({ title: name, icon: "receipt_long", url, src: url + "session.json" });
		return new StoreFolder({ home: this.home, segs: [...this.segs, name] });
	}

	content(){
		const name = this.segs.at(-1);
		if (this.segs.length === 4) p(() => a().href(this.home.url + name + "/").text("This session's page →"));
		const box = div.c("flow");   // captured now: the list fills in after the fetch (no DOM after an await)
		StoreFolder.urls().then(urls => {
			const mine = urls.filter(u => u.startsWith(this.url) && u !== this.url);
			box.append(() => {
				if (!mine.length) return p.c("muted", "No tasks recorded under this folder.");
				for (const u of mine) div(() => a().href(u).text(u.slice(this.url.length).replace(/\/$/, "")));
			});
		});
	}
}
