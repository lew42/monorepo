// Sheet: the phone's bottom strip (Home, ✦ AI, ☰ Menu) and the voice sheet it raises; was rail.js / DrawerRail (renamed 2026-10-16). Notes: doc/rail-notes.md
import { View, div, span, button, a, img } from "/framework/core/View/View.js";
import grip from "/framework/ext/grip/grip.js";
import MicIndicator from "/framework/ux/Dictate/MicIndicator.js";
import chat, { new_session_button as chat_new_session_button } from "/framework/ux/Dictate/chat.js";
import Inbox from "./inbox.js";
import tabs from "./tabs.js";
import drawer from "./drawer.js";
import AIPage from "./AIPage.js";
import AIFeed from "./AIFeed.js";
import DictationBar from "/framework/ux/Dictate/DictationBar.js";

View.stylesheet(import.meta, "rail.css");


// ⚠ see doc/rail-notes.md#c4-export-class-drawerrail-extends-view
export default class Sheet extends View {

	// The one Sheet per page (was rail.js's default function). menu.js calls it once, from app.js's render.
	static of(app){ return $one ??= new this({ app }); }
	static navigated(){ $one?.navigated?.(); }

	// ⚠ see doc/rail-notes.md#c5-render
	render(){
		this.ac(this.compact === false ? "drawer-rail-full" : "drawer-rail-compact");
		this.home_button();
		this.ai_button();
		this.menu_button();
		this.watch_breakpoint();
		this.watch_history();
		this.watch_nav();
		this.restore();
	}

	watch_breakpoint(){
		const mq = globalThis.matchMedia?.("(max-width: 52em)");
		mq?.addEventListener?.("change", e => e.matches ? this.apply(this.routed()) : this.$sheet?.release());   // wider: the page or the dock holds the chat now
	}

	small(){ return AIPage.small(); }

	static KEY = "sheet";   // history.state's size word; the url says only open (<path>/ai/) or closed (<path>)

	// Open while an AIPage (<path>/ai/…) is the page showing, at history's size (split on a fresh arrival).
	// A page whose own ai/ is a real page (/framework/ai/) opens in place: same url, the size in history only.
	routed(){
		const ai = AIPage.current, st = history.state ?? {}, m = st[this.constructor.KEY];
		const open = ai?.url && location.pathname.startsWith(ai.url) || st.here === location.pathname;
		if (!open) return "closed";
		const view = AIPage.view_of();
		if (view && view !== "chat") return "full";   // a tab's own url (<path>/ai/debug/): its body shows only in the full sheet
		return m in this.constructor.Size.RANK && m !== "closed" ? m : "split";
	}

	// depth = how many sheet entries sit above the closed one, so a step down is a history.back().
	push(mode){
		const st = history.state ?? {};
		history.pushState({ ...st, sheet: mode, depth: st.depth ? st.depth + 1 : null }, "", location.href);
	}

	replace(mode){
		history.replaceState({ ...(history.state ?? {}), sheet: mode, depth: null }, "", location.href);
	}

	watch_history(){
		window.addEventListener("popstate", () => this.apply(this.routed()));
	}

	// An old ?drawer=x or ?sheet=… link becomes <path>/ai/x/ once, before the Router's first load reads the path.
	restore(){
		const url = AIPage.old_link();
		if (url) history.replaceState(history.state, "", url);
	}

	to(mode, { listen = false } = {}){
		const from = this.mode ?? "closed";
		if (mode === from){ this.apply(mode, listen); return Promise.resolve(); }
		if (from === "closed") return this.open_at(mode, listen);
		const Size = this.constructor.Size, R = Size.RANK, st = history.state ?? {};
		const steps = R[from] - R[mode];
		if (mode === "closed") return st.depth ? this.back(st.depth) : this.leave();
		if (steps > 0 && st.depth === R[from]) return this.back(steps);
		// up: one history entry per size, so the phone's back button steps down one size
		steps < 0 ? Size.between(from, mode).forEach(m => this.push(m)) : this.replace(mode);
		this.apply(mode, listen);
		return Promise.resolve();
	}

	// From closed: go to <path>/ai/ (arrive() then writes the sizes into history). A real ai/ child opens in place.
	open_at(mode, listen){
		const router = this.app?.router, here = router?.active;
		const real = here?.children?.has("ai") && !(here.children.get("ai") instanceof AIPage);
		// The phone opens in place (same url, the size in history), so the page behind stays visible (the owner, 2026-10-20).
		// <path>/ai/ still opens the sheet from a link or a reload. Alternative kept: route to <path>/ai/ and draw the page behind it (doc/sheet.md).
		if (real || !router || this.small()){
			const sizes = this.constructor.Size.between("closed", mode);
			sizes.forEach((m, i) => history.pushState({ ...(history.state ?? {}), sheet: m, depth: i + 1, here: location.pathname }, "", location.href));
			this.apply(mode, listen);
			return Promise.resolve();
		}
		this.pending = { mode, listen };
		return router.go(drawer.page().replace(/\/?$/, "/") + "ai/");
	}

	// Closed with no history to step back through: go to the page the sheet was about.
	leave(){
		const ai = AIPage.current;
		if (!ai || !this.app?.router){ this.replace("closed"); this.apply("closed"); return Promise.resolve(); }
		return this.app.router.go(ai.about);
	}

	// The first time history reaches <path>/ai/ (✦, a reload, a link): one entry over <path>, so back closes.
	arrive(){
		const ai = AIPage.current, st = history.state ?? {};
		if (!ai?.url || !location.pathname.startsWith(ai.url) || st.sheet) return;
		const pending = this.pending; this.pending = null;
		if (!pending && this.mode && this.mode !== "closed") return this.replace(this.mode);   // a link inside the open sheet (ai/ → ai/live/)
		const mode = pending?.mode ?? "split";
		if (pending) history.replaceState({ ...st, sheet: mode, depth: 1 }, "", location.href);
		else {
			const here = location.href;
			history.replaceState({}, "", ai.about);   // a reload or a link: <path> goes underneath
			history.pushState({ sheet: mode, depth: 1 }, "", here);
		}
		this.listen_next = !!pending?.listen;
	}

	back(steps){
		return new Promise(done => {
			const t = setTimeout(() => { this.apply(this.routed()); done(); }, 800);
			window.addEventListener("popstate", () => { clearTimeout(t); done(); }, { once: true });
			history.go(-steps);
		});
	}

	apply(mode, listen = false){
		this.mode = mode;
		if (mode === "closed" || !this.small()){ this.$sheet?.hide({ keep_mic: mode === "closed" }); return; }
		const sheet = this.sheet();
		if (!sheet.showing()) sheet.show({ listen });
		sheet.state(mode);
		const view = mode === "full" && AIPage.view_of();
		if (view && view !== "chat" && sheet.tab_name !== view) sheet.choose(view);   // a reload on <path>/ai/debug/ comes back to that tab
	}

	// Router → app.navigated → here, after the Router's own pushState (hence the timeout).
	navigated(){
		this.$sheet?.update_path?.();
		this.$sheet?.navigated?.();
		setTimeout(() => {
			this.arrive();
			const listen = this.listen_next; this.listen_next = false;
			this.apply(this.routed(), listen);
		});
	}

	/* Home (owner, 2026-10-16): from /live there was no way to the web root and the framework
	 * pages. A plain link, the sidebar's M logo (public/assets/img/m_svg.svg), far left by
	 * CSS `order` like the other two. */
	home_button(){
		return a.c("drawer-rail-home").href("/")
			.attr("title", "Home").attr("aria-label", "Home")
			.append(() => {
				span.c("drawer-rail-home-icon").append(() => img().attr("src", "/assets/img/m_svg.svg").attr("alt", ""));
				span.c("drawer-rail-home-label", "Home");
			});
	}

	ai_button(){
		return button.c("drawer-rail-ai").attr("type", "button")
			.attr("aria-label", "Ask, by voice — opens a listening sheet")
			.append(() => {
				span.c("drawer-rail-ai-icon").append(() => { span("✦"); new MicIndicator({ compact: true }); });   // the dot: mic open while the sheet is collapsed
				span.c("drawer-rail-ai-label", "AI");
			})
			.click(() => this.open_sheet());
	}

	menu_button(){
		return button.c("drawer-rail-menu").attr("type", "button")
			.attr("title", this.menu_title).attr("aria-label", this.menu_title)
			.append(() => {
				span.c("drawer-rail-menu-icon", this.menu_icon);
				span.c("drawer-rail-menu-label", this.menu_label);
			})
			.click(() => this.open_nav());
	}

	// ☰ = navigation, ✦ = AI (doc/owner-2026-10-16-sheet.md): the page's Sidebar tree opens from the bottom, in thumb reach (rail.css).
	open_nav(){
		const sb = [...document.querySelectorAll(".sidebar")].find(s => s.offsetHeight);   // the visible one: a page can hold a hidden second
		if (!sb) return;
		const on = !sb.classList.contains("open");
		sb.style.setProperty("--strip-h", this.el.offsetHeight + "px");
		sb.classList.toggle("sidebar-from-strip", on);
		sb.classList.toggle("open", on);
		sb.querySelector(".sidebar-toggle")?.setAttribute("aria-expanded", String(on));
	}

	// The Sidebar's own top ☰ opens the menu in its usual place, under its bar.
	watch_nav(){
		document.addEventListener("click", e => e.target.closest?.(".sidebar-toggle")?.closest(".sidebar")?.classList.remove("sidebar-from-strip"), true);
	}

	sheet(){
		if (!this.$sheet) this.append(() => { this.$sheet = new this.constructor.Panel({ rail: this }); });
		return this.$sheet;
	}

	// ✦ opens the strip, listening (doc/owner-2026-10-16-sheet.md); an open sheet just starts listening.
	open_sheet(){
		if (this.mode && this.mode !== "closed") this.sheet().show({ listen: true });
		else this.to("split", { listen: true });   // the full wall of text is the mode now (the owner, 2026-10-20); drag down for the compact strip
		return this.$sheet;
	}
}

// Sheet.Panel: the sheet the ✦ button raises — head (AI · path, New, More, ✕), grip, inbox line, the global chat() mount, folded links; full = the drawer's tabs below.
// One class since 2026-10-16 (was DrawerRailSheetV1 → DrawerRailSheet → DrawerRailSheetPanel → DrawerRailSheetChat, now in archive/sheet-chain-2026-10-16.js).
export class SheetPanel extends View {

	render(){
		this.head();
		this.handle();
		new Inbox.Compact({ page: drawer.page() }).view();
		this.$slot = div.c("drawer-rail-sheet-panel");
		this.$links = this.links().ac("drawer-rail-sheet-links-folded");
	}

	// One layout at every height (the owner, 2026-10-20): head, well, mic footer. The strip is the same three rows with the well at 0 px.
	said(){}

	to(mode){ return this.rail ? this.rail.to(mode) : Promise.resolve(this.state(mode)); }

	// A drag down on the head steps one size down: full → split → strip.
	head_drag($head){
		let y = null;
		$head.on("pointerdown", e => { if (e.target.closest("button")) return; y = e.clientY; $head.el.setPointerCapture?.(e.pointerId); });   // captured: the release lands below the head
		$head.on("pointerup", e => {
			if (y === null) return;
			const dy = e.clientY - y; y = null;
			if (dy > 30 && this.mode !== "strip") this.to(this.constructor.Size.down(this.mode));
		});
		$head.on("pointercancel", () => { y = null; });
	}

	head(){
		const $head = this.head_row();
		this.head_drag($head);
		return $head;
	}

	// The title is the tab menu: "AI ▾" opens Dictation / Settings (the drawer's own tabs); New session sits right after it, ✕ at the far right.
	head_row(){
		return div.c("drawer-rail-sheet-head flex v-center", () => {
			div.c("drawer-rail-sheet-heading flex v-center", () => {
				this.$title = button.c("drawer-rail-sheet-title", this.title + " ▾").attr("type", "button").attr("aria-haspopup", "menu").attr("aria-expanded", "false")
					.click(e => { e.stopPropagation(); this.toggle_menu(); });
				this.new_session_button();   // one tap, as in the desktop AI tab (voice-e2e-review 2026-10-13)
				this.$path = span.c("drawer-rail-sheet-path muted");
			});
			this.$menu = div.c("drawer-rail-sheet-menu").attr("role", "menu");
			this.$reconnect = button.c("drawer-rail-sheet-reconnect", "Reconnect").attr("type", "button").attr("hidden", "")
				.click(() => this.mount?.reconnect());
			button.c("drawer-x", "✕").attr("type", "button").attr("title", "Close").click(() => this.close());
		});
	}

	toggle_menu(on = !this.$menu.el.classList.contains("on")){
		this.$menu.el.classList.toggle("on", on);
		this.$title.attr("aria-expanded", String(on));
		if (!on) return;
		this.$menu.empty(() => {
			tabs.shown().forEach(t => button.c("drawer-rail-sheet-menu-item", t.name === "ai" ? "AI (chat)" : t.label).attr("type", "button").attr("role", "menuitem")
				.ac(t.name === (this.tab_name ?? "ai") && "on").click(() => this.choose(t.name)));
		});
		const away = e => { if (!e.target.closest(".drawer-rail-sheet-menu")) { this.toggle_menu(false); document.removeEventListener("pointerdown", away, true); } };
		document.addEventListener("pointerdown", away, true);
	}

	// A menu pick: the chat is the AI tab; any other tab opens its body in the sheet (the sheet goes full to give it room).
	choose(name){
		this.toggle_menu(false);
		const go = () => { if (!this.$tabs?.el.isConnected) this.mount_tabs(name); else this.pick(name); };
		if (name === "ai" || this.mode === "full") return go();
		return this.to("full").then(go);
	}

	more_button(){
		const $more = button.c("drawer-rail-sheet-more", "More").attr("type", "button")
			.attr("aria-expanded", "false")
			.attr("title", "Debug, settings, the full AI")
			.click(() => {
				const open = this.$links.el.classList.toggle("drawer-rail-sheet-links-folded") === false;
				$more.attr("aria-expanded", String(open));
			});
		return $more;
	}

	links(){
		return div.c("drawer-rail-sheet-links flex wrap", () => {
			this.link("Debug", "debug");
			this.link("Settings", "settings");
			this.link("Open full AI", "ai");
		});
	}

	link(label, tab){
		return button.c("drawer-rail-sheet-link", label).attr("type", "button")
			.click(() => this.close().then(() => tabs.open(tab)));
	}

	// The one New session button: ux/Dictate/chat.js's (doc/chat.md).
	new_session_button(){
		return chat_new_session_button(() => this.mount ?? chat)
			.ac("drawer-rail-sheet-link drawer-rail-sheet-new")
			.attr("title", "Clear this sheet and start a fresh conversation");
	}

	update_path(){
		this.$path?.text(" · " + drawer.page());
		this.feed?.follow(drawer.page());
	}

	// ⚠ see doc/rail-notes.md#c26-handle
	handle(){
		return grip({
			axis: "y",
			write: px => {
				const Size = this.constructor.Size, h = Math.min(Math.max(px, 0), innerHeight);   // below half the strip closes (settle gets the raw h)
				this.size_to(Math.max(h, Size.STRIP) + "px");   // never under the head + footer, so neither is clipped mid-drag; only the height changes (doc/sheet.md)
				return h;
			},
			done: h => this.settle(h),
		});
	}

	// Where a released drag lands is Sheet.Size's call; a split height is remembered. The state is
	// re-applied after: a drag that ends on the size it started from still has to snap.
	settle(h){
		const mode = this.constructor.Size.settle(h, innerHeight);
		if (mode === "split") this.remember_height(this.clamp_height(h));
		return this.to(mode).then(() => { if (mode !== "closed" && this.showing()) this.state(mode); });
	}

	size_to(h){
		this.ac("drawer-rail-sheet-sized");
		this.style("--sheet-h", h);
	}

	// Full state = the whole sidebar: the chat above stays mounted (mic keeps running), the drawer's own tab row and tab body sit below it.
	state(mode){
		this.mode = mode;
		this.el.classList.toggle("drawer-rail-sheet-full", mode === "full");
		this.el.classList.toggle("drawer-rail-sheet-strip", mode === "strip");
		this.style("--rail-bar-h", (this.rail?.el.offsetHeight ?? 0) + "px");   // the strip sits above the bottom bar
		if (mode === "full") this.size_to("100dvh");
		else if (mode === "strip") this.size_to(this.constructor.Size.STRIP + "px");
		else this.size();
		if (mode !== "full") this.unmount_tabs();   // a tab body shows only when picked from the AI ▾ menu (choose())
		return this;
	}

	showing(){ return this.el.classList.contains("on"); }

	close(){
		return this.rail ? this.rail.to("closed") : Promise.resolve(this.hide({ keep_mic: true }));
	}

	clamp_height(px){ return this.constructor.Size.clamp(px, innerHeight); }

	sheet_height_key(){ return "lew42-drawer-rail-sheet-h-2"; }

	read_height(){
		try {
			const v = parseFloat(localStorage.getItem(this.sheet_height_key()));
			return v > 0 ? v : null;
		} catch { return null; }
	}

	remember_height(px){
		try { localStorage.setItem(this.sheet_height_key(), String(Math.round(px))); }
		catch {}
	}

	size(){
		const saved = this.read_height();
		if (saved){ this.size_to(this.clamp_height(saved) + "px"); return; }
		this.size_to("60dvh");   // a real default height, about four bubbles (dictate-next-4)
	}

	active_card(){
		const active = this.rail?.app?.router?.active;
		return active?.shell?.ai2 && active.id && typeof active.subs === "function" ? active : null;
	}

	ensure_mount(){
		if (this.mount) return this.mount;
		this.card_ref = this.active_card();
		this.mount = chat(this.$slot.el, {
			path: drawer.page(),
			card: this.card_ref?.id,
			placeholder: this.card_ref ? "talk into this card" : "say something",
		});
		this.panel = this.mount.panel;
		DictationBar.mount(this.panel);   // the sheet's mic footer (doc: ux/Dictate/doc/refine-dictate-tasks.md#the-bar)
		this.mount.on_link?.(({ state, why }) => {   // the live wire to Servex: a Reconnect button only while it is down
			const down = state === "down";
			this.$reconnect.el.hidden = !down;
			this.$reconnect.attr("title", down ? (why ?? "not connected") + ". Retrying by itself; press to try now. Log: /framework/audio/Whisper/log/" : "");
		});
		const heard = this.panel.on_text;
		this.panel.on_text = text => { heard?.(text); this.said(text); };   // the strip's last line said
		this.feed = AIFeed.on(this.$slot.el, drawer.page());   // this page's events among the bubbles (step 7)
		return this.mount;
	}

	show({ listen = true } = {}){
		this.quiet = !listen;
		this.ac("on");
		this.update_path();
		this.ensure_mount();
		this.sync_card();
		this.start_mic();
		return this;
	}

	hide({ keep_mic = false } = {}){
		if (!keep_mic) this.stop_mic();
		this.rc("on");
		return this;
	}

	// Hide, and give the chat, the feed and the dictation bars back: the sheet keeps none while the page or the dock holds the chat.
	release(){
		this.hide();
		this.mount?.remove();
		this.feed?.stop();
		this.$slot?.empty();
		this.mount = this.panel = this.feed = null;
		return this;
	}

	stop_mic(){ this.panel?.stop_mic(); }

	start_mic(){
		if (this.quiet) return;
		this.panel?.start_mic();
	}

	sync_card(){
		this.card_ref = this.active_card();
		this.mount?.nav(drawer.page(), this.card_ref?.id ?? null);
	}

	navigated(){
		setTimeout(() => this.mount?.nav(drawer.page(), this.active_card()?.id ?? null));
	}

	mount_tabs(name){
		if (this.$tabs?.el.isConnected) return;
		this.$tabs = div.c("drawer-rail-sheet-tabs flex v");
		this.$tabbody = div.c("drawer-rail-sheet-tabbody");
		this.$tabs.el.append(this.$tabbody.el);
		this.el.append(this.$tabs.el);
		this.pick(name ?? this.tab_name ?? tabs.current?.name ?? "ai");
	}

	unmount_tabs(){
		this.$tabs?.el.remove();
		this.$tabs = null;
		if (this.tab_name) this.route_tab(null);
		this.tab_name = null;
		this.$title?.text(this.title + " ▾");
	}

	pick(name){
		const shown = tabs.shown();
		const tab = shown.find(t => t.name === name) ?? shown[0];
		this.tab_name = tab.name;
		this.route_tab(tab.name);
		this.$title.text((tab.name === "ai" ? this.title : tab.label) + " ▾");   // the title says which tab is showing
		if (tab.name === "ai"){ this.$tabbody.empty(); this.ac("drawer-rail-sheet-chat-only"); return; }   // the chat above IS the AI tab
		this.rc("drawer-rail-sheet-chat-only");
		const ctx = tabs.context(), body = this.$tabbody;
		body.empty(() => { span.c("drawer-wait muted", "loading…"); });
		tab.load().then(m => { if (this.$tabbody === body) body.empty(() => { m.default(ctx); }); })
			.catch(e => body.empty(() => { span.c("drawer-wait muted", "This tab could not load: " + e.message); }));
	}
}

/* THE TAB IS ROUTED (2026-10-24): a picked tab is the url <path>/ai/<tab>/, the AIPage view url every width
 * already has, written with replaceState so the size steps in history are untouched; a reload on it
 * opens the full sheet on that tab (Sheet.routed/apply). The chat, or a smaller sheet, gives the url
 * back. Why a subpath and not a peer path (<path>/debug/): ux/Dictate/doc/debug-tab.md#routed. */
SheetPanel.prototype.route_tab = function(name){
	const about = drawer.page().replace(/\/?$/, "/"), ai = about + "ai/", here = location.pathname;
	const want = name && name !== "ai" ? ai + name + "/" : (AIPage.view_of(here) && AIPage.view_of(here) !== "chat" ? (this.url_before ?? ai) : null);   // no url_before: opened straight at the view url, so <page>/ai/ (still open on a reload)
	if (!want || want === here) return;
	if (name && name !== "ai" && !AIPage.view_of(here)) this.url_before = here;   // opened in place: the page's own url comes back after
	history.replaceState(history.state, "", want + location.search + location.hash);
};

SheetPanel.prototype.title = "AI";   // the ✦ AI button's own word
// The old chain's stamped names, kept so the DOM is unchanged (rail.css keys on drawer-rail-sheet; nothing keys on the other three).
SheetPanel.prototype.classes = "drawer-rail-sheet drawer-rail-sheet-v1 drawer-rail-sheet-panel drawer-rail-sheet-chat";

// Sheet.Size: the one size machine, closed | strip | split | full (replaces 84 px / 28% / 85%). doc/owner-2026-10-16-sheet.md
export class SheetSize {
	static RANK = { closed: 0, strip: 1, split: 2, full: 3 };
	static MODES = ["closed", "strip", "split", "full"];
	static STRIP = 110;                       // px: the strip = the head (57) + the mic footer (51), the well at 0 (measured 2026-10-20)
	static FULL_AT = 0.9;                     // a drag released past 90% of the screen snaps to full
	static SPLIT_MIN = 0.3;                   // a split's remembered height stays between these shares
	static SPLIT_MAX = 0.88;

	// Below this height a drag reads as the strip; under half the strip, as closed.
	static strip_below(H){ return (this.STRIP + H * this.SPLIT_MIN) / 2; }
	static settle(h, H){
		if (h >= H * this.FULL_AT) return "full";
		if (h < this.STRIP / 2) return "closed";
		return h < this.strip_below(H) ? "strip" : "split";
	}
	static clamp(px, H){ return Math.min(Math.max(px, H * this.SPLIT_MIN), H * this.SPLIT_MAX); }
	static down(mode){ return this.MODES[Math.max(this.RANK[mode] - 1, 0)]; }
	// The sizes after from, up to and including to (empty when to is not bigger).
	static between(from, to){ return this.MODES.slice(this.RANK[from] + 1, this.RANK[to] + 1); }
}

Sheet.Size = SheetPanel.Size = SheetSize;
Sheet.Panel = SheetPanel;

// Sheet.Dock: above 52em the AI sits docked in the right drawer (drawer(fn), the DrawerTabs), pushing the page.
// Open by default at 1920 px and wider until you shut it with ✕; ✦ (menu.js) opens it below that. doc/sheet.md
export class SheetDock {
	static AT = 1920;
	static KEY = "lew42-sheet-dock-shut";

	static query(){ return globalThis.matchMedia?.(`(min-width: ${this.AT}px)`); }
	static wide(){ return !!this.query()?.matches; }

	// menu.js calls this once, after the styles are in; a window widened past AT opens it too.
	static start(){
		const open = () => { if (this.wide() && !this.shut() && !tabs.mine() && !AIPage.current) tabs.open("ai"); };   // the routed AI page already shows the chat
		window.addEventListener("drawer-close", () => { if (this.wide()) this.remember(true); });
		this.query()?.addEventListener?.("change", open);
		open();
	}

	static shut(){ try { return localStorage.getItem(this.KEY) === "1"; } catch { return false; } }
	static remember(shut){ try { shut ? localStorage.setItem(this.KEY, "1") : localStorage.removeItem(this.KEY); } catch {} }
}
Sheet.Dock = SheetDock;
Sheet.Sheet = SheetPanel;   // the old name for the same part


// ☰ Menu = this site's pages (was ⋯ More, which opened the drawer's tabs; those live in the full sheet now). doc/rail-notes.md#c81-drawerrailprototypemenu_icon
Sheet.prototype.menu_icon = "☰";
Sheet.prototype.menu_label = "Menu";
Sheet.prototype.menu_title = "Menu — this site's pages";

// The earlier ☰ strip, whose ☰ opened the drawer's tabs (kept reachable).
export class DrawerRailV1 extends Sheet { open_nav(){ tabs.toggle(); } }
DrawerRailV1.prototype.menu_icon = "☰";
DrawerRailV1.prototype.menu_label = "Menu";
DrawerRailV1.prototype.menu_title = "Menu — AI, sessions, dictation, settings";
Sheet.V1 = DrawerRailV1;


// View stamps .sheet from the class name; rail.css still keys on .drawer-rail.
Sheet.prototype.classes = "drawer-rail";

let $one;
export { Sheet, Sheet as DrawerRail };
