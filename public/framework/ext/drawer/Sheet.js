// Sheet: the phone's bottom strip (Home, ✦ AI, ☰ Menu) and the voice sheet it raises; was rail.js / DrawerRail (renamed 2026-10-16). Notes: doc/rail-notes.md
import { View, div, span, button, a, img } from "/framework/core/View/View.js";
import grip from "/framework/ext/grip/grip.js";
import MicIndicator from "/framework/ux/Dictate/MicIndicator.js";
import chat, { new_session_button as chat_new_session_button } from "/framework/ux/Dictate/chat.js";
import Inbox from "./inbox.js";
import tabs from "./tabs.js";
import drawer from "./drawer.js";

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
		mq?.addEventListener?.("change", e => e.matches ? this.apply(this.routed()) : this.$sheet?.hide());
	}

	small(){ return !!globalThis.matchMedia?.("(max-width: 52em)")?.matches; }

	static KEY = "sheet";
	static RANK = { closed: 0, open: 1, full: 2 };

	routed(){
		const m = new URLSearchParams(location.search).get(this.constructor.KEY);
		return m === "open" || m === "full" ? m : "closed";
	}

	url(mode){
		const url = new URL(location.href);
		mode === "closed" ? url.searchParams.delete(this.constructor.KEY) : url.searchParams.set(this.constructor.KEY, mode);
		return url;
	}

	// ⚠ see doc/rail-notes.md#c8-push-mode
	push(mode){
		const st = history.state ?? {};
		const depth = mode === "open" ? 1 : (st.depth ? st.depth + 1 : null);
		history.pushState({ ...st, sheet: mode, depth }, "", this.url(mode));
	}

	replace(mode){
		const { sheet, depth, ...st } = history.state ?? {};
		history.replaceState(mode === "closed" ? st : { ...st, sheet: mode, depth: null }, "", this.url(mode));
	}

	watch_history(){
		window.addEventListener("popstate", () => this.apply(this.routed()));
	}

	restore(){
		const mode = this.routed();
		if (mode === "closed" || !this.small()) return;
		this.app?.styles_loaded?.().then(() => {
			this.replace("closed");
			this.push("open");
			if (mode === "full") this.push("full");
			this.apply(mode);
		});
	}

	to(mode, { listen = false } = {}){
		const from = this.mode ?? "closed";
		if (mode === from){ this.apply(mode, listen); return Promise.resolve(); }
		const R = this.constructor.RANK, st = history.state ?? {};
		const steps = R[from] - R[mode];
		if (steps > 0 && st.depth === R[from]) return this.back(steps);
		steps < 0 ? this.push(mode) : this.replace(mode);
		this.apply(mode, listen);
		return Promise.resolve();
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
	}

	navigated(){
		this.$sheet?.update_path?.();
		this.$sheet?.navigated?.();
		if (this.mode && this.mode !== "closed") setTimeout(() => {
			if (this.routed() === "closed") this.replace("open");
			this.apply(this.routed());
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

	open_sheet(){
		if (this.mode === "open" || this.mode === "full") this.sheet().show({ listen: true });
		else this.to("open", { listen: true });
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

	head(){
		return div.c("drawer-rail-sheet-head flex v-center", () => {
			div.c("drawer-rail-sheet-heading flex v-center wrap", () => {
				span.c("drawer-rail-sheet-title", this.title);
				this.$path = span.c("drawer-rail-sheet-path muted");
			});
			this.new_session_button();   // one tap, as in the desktop AI tab (voice-e2e-review 2026-10-13)
			this.more_button();
			button.c("drawer-x", "✕").attr("type", "button").attr("title", "Close").click(() => this.close());
		});
	}

	more_button(){
		const $more = button.c("drawer-rail-sheet-more", "More").attr("type", "button")
			.attr("aria-expanded", "false")
			.attr("title", "Sessions, dictation, settings, the full AI")
			.click(() => {
				const open = this.$links.el.classList.toggle("drawer-rail-sheet-links-folded") === false;
				$more.attr("aria-expanded", String(open));
			});
		return $more;
	}

	links(){
		return div.c("drawer-rail-sheet-links flex wrap", () => {
			this.link("Dictation", "dictation");
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
	}

	// ⚠ see doc/rail-notes.md#c26-handle
	handle(){
		return grip({
			axis: "y",
			write: px => {
				const h = Math.min(Math.max(px, this.collapse_h()), innerHeight);
				this.size_to(h + "px");
				this.el.classList.toggle("drawer-rail-sheet-collapsed", h <= this.collapse_h() + 4);
				return h;
			},
			done: h => this.settle(h),
		});
	}

	collapse_h(){ return 84; }

	collapse(){
		this.el.classList.remove("drawer-rail-sheet-full");
		this.el.classList.add("drawer-rail-sheet-collapsed");
		this.size_to(this.collapse_h() + "px");
		return this;
	}

	settle(h){
		const H = innerHeight;
		if (h >= H * this.full_at) return this.rail ? this.rail.to("full").then(() => this.state("full")) : this.state("full");
		if (h <= this.collapse_h() + 4) return this.collapse();
		if (h < H * this.close_at) return this.rail ? this.rail.to("closed") : this.hide();
		this.remember_height(this.clamp_height(h));
		return this.rail?.mode === "full" ? this.rail.to("open") : this.state("open");
	}

	size_to(h){
		this.ac("drawer-rail-sheet-sized");
		this.style("--sheet-h", h);
	}

	// Full state = the whole sidebar: the chat above stays mounted (mic keeps running), the drawer's own tab row and tab body sit below it.
	state(mode){
		this.el.classList.toggle("drawer-rail-sheet-full", mode === "full");
		this.el.classList.remove("drawer-rail-sheet-collapsed");
		mode === "full" ? this.size_to("100dvh") : this.size();
		mode === "full" ? this.mount_tabs() : this.unmount_tabs();
		return this;
	}

	showing(){ return this.el.classList.contains("on"); }

	close(){
		return this.rail ? this.rail.to("closed") : Promise.resolve(this.hide({ keep_mic: true }));
	}

	clamp_height(px){
		return Math.min(Math.max(px, window.innerHeight * 0.4), window.innerHeight * 0.92);
	}

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
		this.el.classList.remove("drawer-rail-sheet-collapsed");
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
		return this.mount;
	}

	show({ listen = true } = {}){
		this.quiet = !listen;
		this.ac("on");
		this.update_path();
		this.ensure_mount();
		this.sync_card();
		this.start_mic();
		this.size();
		return this;
	}

	hide({ keep_mic = false } = {}){
		if (!keep_mic) this.stop_mic();
		this.rc("on");
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

	mount_tabs(){
		if (this.$tabs?.el.isConnected) return;
		this.$tabs = div.c("drawer-rail-sheet-tabs flex v");
		this.$tabrow = div.c("drawer-tabs drawer-rail-sheet-tabrow flex");
		this.$tabbody = div.c("drawer-rail-sheet-tabbody");
		this.$tabs.el.append(this.$tabrow.el, this.$tabbody.el);
		this.el.append(this.$tabs.el);
		this.pick(tabs.current?.name ?? "ai");
	}

	unmount_tabs(){
		this.$tabs?.el.remove();
		this.$tabs = null;
	}

	pick(name){
		const shown = tabs.shown();
		const tab = shown.find(t => t.name === name) ?? shown[0];
		this.$tabrow.empty(() => {
			shown.forEach(t => button.c("drawer-tab", t.label).attr("type", "button").ac(t === tab && "on").click(() => this.pick(t.name)));
		});
		if (tab.name === "ai"){ this.$tabbody.empty(); this.ac("drawer-rail-sheet-chat-only"); return; }   // the chat above IS the AI tab
		this.rc("drawer-rail-sheet-chat-only");
		const ctx = tabs.context(), body = this.$tabbody;
		body.empty(() => { span.c("drawer-wait muted", "loading…"); });
		tab.load().then(m => { if (this.$tabbody === body) body.empty(() => { m.default(ctx); }); })
			.catch(e => body.empty(() => { span.c("drawer-wait muted", "This tab could not load: " + e.message); }));
	}
}

SheetPanel.prototype.title = "AI";   // the ✦ AI button's own word
SheetPanel.prototype.full_at = 0.85;
SheetPanel.prototype.close_at = 0.28;
// The old chain's stamped names, kept so the DOM is unchanged (rail.css keys on drawer-rail-sheet; nothing keys on the other three).
SheetPanel.prototype.classes = "drawer-rail-sheet drawer-rail-sheet-v1 drawer-rail-sheet-panel drawer-rail-sheet-chat";

Sheet.Panel = SheetPanel;
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
