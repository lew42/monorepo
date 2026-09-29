import { Page, Doc, div, span, small, p, a, drawer } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { when, news_bar } from "./faces.js";
import { who_word, unseen, mark_seen } from "./activity.js";
import { plain } from "./inbox.js";

/**
 * A REAL PAGE IN THE INBOX (the owner, 2026-09-28: "we could render the actual page
 * class right there in the inbox… it's the exact same page as the framework core
 * page. It's just a different way to jump there").
 *
 * `/framework/ai2/framework/core/Page/` shows the page that lives at
 * `/framework/core/Page/` — the SAME Page object and the SAME view, found by the
 * Router's own walk (`load_segments`) and moved into this box. Nothing is copied and
 * the real page keeps its own parent, url and children, so it is unchanged when you
 * open it directly. Leave and it stays mounted here, hidden; come back and only the
 * marks change.
 *
 * Every link inside it that goes to another `/framework/` page stays in the inbox
 * (its tabs included); the drawer is told which page is showing (`drawer.page()`).
 */
export class RealPage extends Page {

	// I present myself, not my children — no row per visited path in the site's nav.
	leaf = true;

	// `/framework/ai2/framework/core/` → `/framework/ai2/framework/core/Page/`. A name
	// with a dot is a file and never a page.
	route(name){
		if (name.includes(".")) return undefined;
		return new this.constructor({ path: this.path + name + "/", title: name, shell: this.shell });
	}

	// The Router awaits every page's `loading` before it shows the chain, so the real
	// page is found (and its own subtree loaded) before this one is activated.
	load_all_children(){
		this.loading ??= this.find();
		return this;
	}

	async find(){
		const router = this.app?.router;
		const real = await router?.load_segments(this.path).catch(() => null);
		if (real) await Promise.allSettled(real.chain().map(p => p.loading));
		this.real = real ?? null;
		if (real?.title) this.title = real.title;
		if (real) RealPage.known.set(this.path, { title: real.title, icon: real.icon });
	}

	render(){
		if (this.view) return this.view;
		this.view = div.c("page ai2-real");
		Page.views.set(this.view.el, this);
		this.view.el.addEventListener("click", e => this.click(e));
		return this.view;
	}

	/* A link inside the real page to another site page opens THAT page here too — a
	   tab, a member, a related page. Files, `.md` and anything outside `/framework/`
	   go to the Router as usual. Caught here, before the Router's own listener. */
	click(e){
		const router = this.app?.router;
		const link = router?.link_clicked(e);
		const path = link?.pathname ?? "";
		if (!link || !path.startsWith("/framework/") || path.startsWith(this.shell.url) || /\.\w+$/.test(path)) return;
		e.preventDefault();
		e.stopPropagation();
		router.go(this.shell.url + path.slice(1) + link.search + link.hash);
	}

	// Once per navigation, after the Router has finished: every RealPage in the chain asks.
	activated(){ RealPage.soon(this.app?.router); }
	deactivated(){ RealPage.soon(this.app?.router); }

	/* ── showing the real page ─────────────────────────────────────────── */

	/* The page this box holds: the real page itself, or — when the real page is a tab
	   of a Doc (`…/Page/api/`) — the Doc that owns the tab bar, so the tabs are there. */
	top(real){
		let top = real;
		while (top.parent instanceof Doc){
			top.parent.render();
			if (!top.parent.regions?.has(top.name)) break;
			top = top.parent;
		}
		return top;
	}

	show(){
		const real = this.real;
		RealPage.release(this);
		// The inbox's own chain (the site root, /framework/, AI 2) can never be moved in here.
		if (!real || this.chain().includes(real) || real.url.startsWith(this.shell.url)){
			this.view.el.replaceChildren();
			this.view.append(() => {
				p.c("ai2-real-none muted", real ? "This page is the inbox itself." : "There is no page at " + this.path);
				a.c("page-link").href(this.path).attr("target", "_self").text("Open " + this.path + " on its own");
			});
			drawer.page?.(null);
			return;
		}

		const top = this.top(real);
		const chain = real.chain();
		const mine = chain.slice(chain.indexOf(top));
		const $top = top.render().ac("ai2-real-top");
		if (this.view.el.firstChild !== $top.el || this.view.el.childNodes.length !== 1) this.view.el.replaceChildren($top.el);

		// The tab pages below the top mount where the real site mounts them: their parent's region.
		mine.slice(1).forEach(p => p.activate());
		mine.forEach(p => p.view.ac(p === real ? "active-page" : "active-ancestor"));
		RealPage.shown = this;
		this.marked = mine;

		document.title = real.title ?? document.title;
		this.mark_links();
		drawer.page?.(real.url);
		// Opening it is seeing what bumped it: the row's bar clears, like a card's.
		const newest = RealPage.events.get(real.url)?.[0]?.at;
		if (newest && mark_seen("page:" + real.url, newest)) this.shell.ai2?.repaint?.();
	}

	/* The real page's own links, marked against the REAL url — the Router marks the
	   inbox's url, which none of them point at. */
	mark_links(){
		const here = this.real?.url;
		if (!here) return;
		this.view.el.querySelectorAll("a[href]").forEach(link => {
			if (link.origin !== location.origin || link.getAttribute("href")?.startsWith("#")) return;
			link.classList.toggle("active", link.pathname === here);
			link.classList.toggle("in-path", link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}

	/* ── one showing at a time ─────────────────────────────────────────── */

	// After every navigation: the active page is a RealPage → show it; otherwise hand
	// the real page back (marks off) and the drawer back to the address bar.
	static soon(router){
		if (RealPage.queued) return;
		RealPage.queued = true;
		queueMicrotask(() => { RealPage.queued = false; RealPage.sync(router); });
	}

	static sync(router){
		if (!router) return;
		RealPage.wire(router);
		const active = router.active;
		if (active instanceof RealPage) return active.show();
		if (RealPage.shown){ RealPage.release(); drawer.page?.(null); }
	}

	// Take my marks off the real pages, deepest first, the way the Router leaves a chain.
	static release(next){
		const was = RealPage.shown;
		if (!was) return;
		// ⚠ A page the Router itself now shows (you went from here straight to the real
		//   /framework/core/Page/) is the Router's again — its marks are not mine to take off.
		const routed = new Set(was.app?.router?.chain() ?? []);
		[...was.marked ?? []].reverse().forEach(p => {
			if (routed.has(p)) return void p.view?.rc(was.app.router.active === p ? "active-ancestor" : "active-page");
			if (p !== was.marked[0]) p.deactivate();
			p.view?.rc("active-page active-ancestor");
		});
		if (next !== was) was.marked = null;
		RealPage.shown = null;
	}

	// The Router re-marks links after late renders (a tab bar filling, the rail
	// flushing); each pass would strip the real page's own marks, so it re-marks them.
	static wire(router){
		if (router.ai2_real_wired) return;
		router.ai2_real_wired = true;
		const base = router.mark_links;
		router.mark_links = function(here){
			const out = base.call(this, here);
			RealPage.shown?.mark_links();
			return out;
		};
	}
}

RealPage.known = new Map();    // path → { title, icon }, once the real page has loaded
RealPage.events = new Map();   // path → its events, newest first (page_events())

/* ── the rail: which pages have something new ───────────────────────────── */

/** `/framework/core/Page` or a full url → `/framework/core/Page/`. */
export const page_path = p => {
	try { return new URL(String(p), location.origin).pathname.replace(/\/?$/, "/"); } catch { return null; }
};

const words = slug => String(slug ?? "").replace(/^\d{4}-\d\d-\d\d\//, "").replace(/-/g, " ");

/**
 * THE EVENTS KEYED BY A PAGE'S PATH — any line in a log the rail already streams
 * that carries `"page": "/framework/core/Page/"`: today's `day.jsonl` (`Day.pages`)
 * and the task logs of the last two days (`Member.pages`). A task, a decision, a
 * note — whatever the line is, it bumps that page. Newest first, per path.
 */
export function page_events(day, groups){
	const out = new Map();
	const add = e => {
		const path = page_path(e.path);
		if (!path || !e.at) return;
		if (!out.has(path)) out.set(path, []);
		out.get(path).push({ ...e, path, who: who_word(e.by) ?? (e.task ? words(e.task) : null), what: plain(e.what ?? "") || "Something changed here." });
	};
	(day?.pages ?? []).forEach(add);
	for (const m of groups?.tasks?.values() ?? []) (m.pages ?? []).forEach(add);
	out.forEach(list => list.sort((x, y) => Date.parse(y.at) - Date.parse(x.at)));
	RealPage.events = out;
	return out;
}

/** The page's own title and icon, read once off the real page (the Router's walk). */
export function real_title(path, router, then){
	if (RealPage.known.has(path) || RealPage.asking?.has(path)) return RealPage.known.get(path);
	(RealPage.asking ??= new Set()).add(path);
	router?.load_segments(path).then(real => {
		if (real) RealPage.known.set(path, { title: real.title, icon: real.icon });
		then?.();
	}).catch(() => {});
	return null;
}

/** A page's row in the rail: its icon and own title, when it last moved, its path,
    and — while it is new to you — the "what happened" bar from its newest event. */
export function page_face(path, evs){
	const known = RealPage.known.get(path);
	const top = evs[0];
	div.c("ai2-row-head flex gap-25", () => {
		icon(known?.icon || "description");
		span.c("ai2-row-title").text(known?.title || path.split("/").filter(Boolean).at(-1));
		small.c("ai2-row-when muted").text(when(top?.at));
	});
	small.c("ai2-real-path muted").text(path);
	if (top && unseen("page:" + path, top.at)) news_bar({ who: top.who, what: top.what });
}
