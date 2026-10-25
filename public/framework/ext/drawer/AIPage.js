// AIPage: `<path>/ai/`, the AI about the page at <path>. Page.child() mints one for any path that has no
// declared `ai` child (a declared one wins: /framework/ai/ stays the AI system). The phone shows it in the
// Sheet; wider screens show it in the page. Its views were DrawerTabs' rows. doc/sheet.md
import { Page } from "/framework/core/Page/Page.class.js";
import { div, span, p, a } from "/framework/core/View/View.js";
import drawer from "./drawer.js";
import tabs from "./tabs.js";

const VIEWS_CHAT = () => import("./tabs/ai.js");

export default class AIPage extends Page {

	// [name, label, the tab file that draws it]; chat is the default (`ai/` itself and `ai/chat/`).
	static VIEWS = [
		["chat", "Chat", () => import("./tabs/ai.js")],
		["live", "Live", null],                          // AIFeed, sheet step 7
		["sessions", "Sessions", () => import("./tabs/sessions.js")],
		["debug", "Debug", () => import("./tabs/debug.js")],             // dictation layer by layer (was Dictation, the playground, until 2026-10-24)
		["docs", "Docs", () => import("./tabs/docs.js")],                 // the ux/Dictate readme and docs, rendered in place
		["settings", "Settings", () => import("./tabs/settings.js")],
	];

	static ALIASES = { dictation: "debug" };   // an old view name: old_link() rewrites it once, before the Router reads the url
	static WIDE = new Set(["debug", "docs"]);   // views drawn across the page's wide track (two columns at 1920), not the reading column

	// The view a url names inside an AI page ("debug" for <path>/ai/debug/), "chat" for <path>/ai/ itself, null outside one.
	static view_of(pathname = location.pathname, ai = this.current){
		if (!ai?.url || !pathname.startsWith(ai.url)) return null;
		const name = pathname.slice(ai.url.length).split("/")[0];
		return name && this.VIEWS.some(v => v[0] === name) ? name : "chat";
	}

	// The AI page showing now, or null: Sheet.routed() reads it.
	static current = null;

	// ONE chat and ONE feed per tab (doc/sheet.md): holder() names the surface that mounts them. The other surfaces mount nothing.
	static SMALL = "(max-width: 52em)";
	static small(){ return !!globalThis.matchMedia?.(this.SMALL)?.matches; }
	static holder(){ return this.small() ? "sheet" : tabs.mine() && tabs.current?.name === "ai" ? "dock" : "page"; }
	static NOTES = { sheet: "The chat is in the sheet.", dock: "The chat is in the panel on the right." };

	static route(page){
		const ai = new this({ title: "AI", about: page.url, no_inbox: true, no_ai: true, classes: "standard drawer-ai-page" });
		ai.content = () => ai.body("chat");
		ai.declare(this.VIEWS.map(([name, title]) => ({ name, title, no_inbox: true, no_ai: true, classes: "standard drawer-ai-page", content: () => ai.body(name) })));
		return ai;
	}

	// One view: the row of views, then the tab's own drawing, handed what DrawerTabs handed it.
	body(name){
		const [, , load] = this.constructor.VIEWS.find(v => v[0] === name);
		div.c("drawer-ai-page-views flex wrap", () => {
			span.c("drawer-ai-page-about muted").append(() => { span("about "); a(this.about).href(this.about); });
			this.constructor.VIEWS.forEach(([n, label]) =>
				a.c("drawer-ai-page-view", label).ac(n === name && "on").href(this.url + (n === "chat" ? "" : n + "/")));
		});
		const $box = div.c("drawer-ai-page-body", () => { span.c("muted", "loading…"); }).ac(this.constructor.WIDE.has(name) && "wide");   // .wide: the page grid's own word for the wide track
		if (!load) return $box.empty(() => { p.c("muted", "The live feed (this page's events beside the chat) arrives with AIFeed, sheet step 7."); });
		if (name === "chat") this.chat_box = $box;
		this.fill($box, name, load);
	}

	// The chat view mounts the chat only when this page is the holder; otherwise the sheet or the dock already has it.
	fill($box, name, load){
		const holder = this.constructor.holder();
		if (name === "chat" && holder !== "page"){
			this.release();
			return $box.empty(() => { span.c("muted", this.constructor.NOTES[holder]); });
		}
		if (name === "chat" && this.held) return;
		load().then(m => $box.empty(() => {
			if (name !== "chat") return m.default(this.context());
			this.mounting = true;
			try { this.token = m.default(this.context()); } finally { this.mounting = false; }
			this.held = true;
		}))
			.catch(e => $box.empty(() => { span.c("muted", "This view could not load: " + e.message); }));
	}

	// Let go of the chat this page mounted (the tab's own ai.js remembers it).
	release(){
		if (!this.held) return;
		this.held = false;
		const token = this.token; this.token = null;
		import("./tabs/ai.js").then(m => m.release_chat(token));
	}

	// The dock mounted the chat after this page did (✦ at 1200): its ai() took the page's box; the page points to the dock.
	moved = () => {
		if (this.mounting || !this.held) return;
		this.held = false; this.token = null;
		this.chat_box?.el.isConnected && this.chat_box.empty(() => { span.c("muted", this.constructor.NOTES.dock); });
	};

	// The dock shut: the chat comes back to the page.
	shut = () => setTimeout(this.resized);

	// A window crossing 52em moves the chat between the sheet and the page; the page follows.
	resized = () => {
		const $box = this.chat_box;
		if ($box?.el.isConnected) this.fill($box, "chat", VIEWS_CHAT);
	};

	context(){ return { app: this.app, tabs, page: this.about, card: null }; }

	activated(){
		this.constructor.current = this;
		this.mq = globalThis.matchMedia?.(this.constructor.SMALL);
		this.mq?.addEventListener?.("change", this.resized);
		window.addEventListener("drawer-chat", this.moved);
		window.addEventListener("drawer-close", this.shut);
		drawer.page(this.about);
	}

	deactivated(){
		this.mq?.removeEventListener?.("change", this.resized);
		window.removeEventListener("drawer-chat", this.moved);
		window.removeEventListener("drawer-close", this.shut);
		this.release();
		if (this.constructor.current !== this) return;
		this.constructor.current = null;
		drawer.page(null);
	}

	// An old `?drawer=x` or `?sheet=…` link, or an old view name (`<path>/ai/dictation/`), as its `<path>/ai/x/` url, or null.
	// Rewritten once by the Sheet; the one place an old name is mapped (ALIASES).
	static old_link(href = location.href){
		const url = new URL(href), sheet = url.searchParams.get("sheet");
		const old = url.pathname.match(/\/ai\/(\w+)\/$/)?.[1], alias = this.ALIASES[old];
		let tab = url.searchParams.get("drawer");
		if (tab === null && sheet === null && !alias) return null;
		if (alias) url.pathname = url.pathname.replace(/\/ai\/\w+\/$/, "/ai/" + alias + "/");
		tab = this.ALIASES[tab] ?? tab;
		url.searchParams.delete("drawer");
		url.searchParams.delete("sheet");
		const view = this.VIEWS.some(v => v[0] === tab && tab !== "chat") ? tab + "/" : "";
		if (!/\/ai\/(\w+\/)?$/.test(url.pathname)) url.pathname = url.pathname.replace(/\/?$/, "/") + "ai/" + view;   // already an ai/ url: only the words go
		return url;
	}
}
