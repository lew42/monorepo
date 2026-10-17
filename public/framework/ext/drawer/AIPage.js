// AIPage: `<path>/ai/`, the AI about the page at <path>. Page.child() mints one for any path that has no
// declared `ai` child (a declared one wins: /framework/ai/ stays the AI system). The phone shows it in the
// Sheet; wider screens show it in the page. Its views were DrawerTabs' rows. doc/sheet.md
import { Page } from "/framework/core/Page/Page.class.js";
import { div, span, p, a } from "/framework/core/View/View.js";
import drawer from "./drawer.js";
import tabs from "./tabs.js";

export default class AIPage extends Page {

	// [name, label, the tab file that draws it]; chat is the default (`ai/` itself and `ai/chat/`).
	static VIEWS = [
		["chat", "Chat", () => import("./tabs/ai.js")],
		["live", "Live", null],                          // AIFeed, sheet step 7
		["sessions", "Sessions", () => import("./tabs/sessions.js")],
		["dictation", "Dictation", () => import("./tabs/dictation.js")],
		["settings", "Settings", () => import("./tabs/settings.js")],
	];

	// The AI page showing now, or null: Sheet.routed() reads it.
	static current = null;

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
		const $box = div.c("drawer-ai-page-body", () => { span.c("muted", "loading…"); });
		if (!load) return $box.empty(() => { p.c("muted", "The live feed (this page's events beside the chat) arrives with AIFeed, sheet step 7."); });
		load().then(m => $box.empty(() => { m.default(this.context()); }))
			.catch(e => $box.empty(() => { span.c("muted", "This view could not load: " + e.message); }));
	}

	context(){ return { app: this.app, tabs, page: this.about, card: null }; }

	activated(){
		this.constructor.current = this;
		drawer.page(this.about);
	}

	deactivated(){
		if (this.constructor.current !== this) return;
		this.constructor.current = null;
		drawer.page(null);
	}

	// An old `?drawer=x` or `?sheet=…` link, as its `<path>/ai/x/` url, or null. Rewritten once by the Sheet.
	static old_link(href = location.href){
		const url = new URL(href), tab = url.searchParams.get("drawer"), sheet = url.searchParams.get("sheet");
		if (tab === null && sheet === null) return null;
		url.searchParams.delete("drawer");
		url.searchParams.delete("sheet");
		const view = this.VIEWS.some(v => v[0] === tab && tab !== "chat") ? tab + "/" : "";
		if (!/\/ai\/(\w+\/)?$/.test(url.pathname)) url.pathname = url.pathname.replace(/\/?$/, "/") + "ai/" + view;   // already an ai/ url: only the words go
		return url;
	}
}
