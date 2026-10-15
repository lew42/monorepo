// DrawerRail: the phone's bottom rail (✦ AI, ⋯ More) and its voice sheet. Notes: doc/rail-notes.md
import { View, div, span, button } from "/framework/core/View/View.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import grip from "/framework/ext/grip/grip.js";
import floor from "/framework/ux/Dictate/floor.js";
import MicIndicator from "/framework/ux/Dictate/MicIndicator.js";
import Widget from "/framework/ux/Dictate/Widget.js";
import chat, { ago, new_session_button as chat_new_session_button } from "/framework/ux/Dictate/chat.js";
import Inbox from "./inbox.js";
import { servex_url } from "/framework/dev/servex_url.js";
import * as Session from "/framework/ext/Session/Session.js";
import tabs from "./tabs.js";
import drawer from "./drawer.js";
const { start, say, nav, watch, stream, report_quiet, react } = Session;

View.stylesheet(import.meta, "rail.css");

const SESSION_KEY = "lew42-voice-session";


// ⚠ see doc/rail-notes.md#c4-export-class-drawerrail-extends-view
export class DrawerRail extends View {

	// ⚠ see doc/rail-notes.md#c5-render
	render(){
		this.ac(this.compact === false ? "drawer-rail-full" : "drawer-rail-compact");
		this.ai_button();
		this.menu_button();
		this.watch_breakpoint();
		this.watch_history();
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
			.click(() => tabs.toggle());
	}

	sheet(){
		if (!this.$sheet) this.append(() => { this.$sheet = new this.constructor.Sheet({ rail: this }); });
		return this.$sheet;
	}

	open_sheet(){
		if (this.mode === "open" || this.mode === "full") this.sheet().show({ listen: true });
		else this.to("open", { listen: true });
		return this.$sheet;
	}
}

// ⚠ see doc/rail-notes.md#c21-export-class-drawerrailsheetv1-extends-v
export class DrawerRailSheetV1 extends View {

	// ⚠ see doc/rail-notes.md#c22-render
	render(){
		this.head();
		this.handle();
		this.$thread = div.c("drawer-rail-sheet-thread");
		this.$mic = div.c("drawer-rail-sheet-mic");
	}

	head(){
		return div.c("drawer-rail-sheet-head flex v-center", () => {
			div.c("drawer-rail-sheet-heading flex v-center wrap", () => {
				span.c("drawer-rail-sheet-title", this.title);
				this.$path = span.c("drawer-rail-sheet-path muted");
			});
			button.c("drawer-x", "✕").attr("type", "button").attr("title", "Close").click(() => this.close());
		});
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

	state(mode){
		this.el.classList.toggle("drawer-rail-sheet-full", mode === "full");
		this.el.classList.remove("drawer-rail-sheet-collapsed");
		mode === "full" ? this.size_to("100dvh") : this.size();
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
		// No dragged height yet: a real default HEIGHT (60dvh), not only a ceiling, so about four bubbles show (dictate-next-4; was 50dvh max).
		this.size_to("60dvh");
	}

	active_card(){
		const active = this.rail?.app?.router?.active;
		return active?.shell?.ai2 && active.id && typeof active.subs === "function" ? active : null;
	}

	show({ listen = true } = {}){
		this.ac("on");
		this.update_path();
		this.sync_card();
		this.dictate ? (listen && this.dictate.start()) : this.listen(listen);
		this.size();
		return this;
	}

	hide(){
		this.dictate?.stop();
		this.rc("on");
		return this;
	}

	listen(start = true){
		this.$mic.append(() => {
			this.dictate = new Dictate({
				mode: "open", revise: "edit",
				on_text: text => this.card(text),
				on_revised: text => this.card(text),
			});
		});
		if (start) this.dictate.start();
	}

	sync_card(){
		const card = this.active_card();
		const id = card?.id ?? null;
		if (id === this.card_id){ this.talk?.sync(); return; }
		this.card_id = id;
		this.card_ref = card;
		if (!card){
			this.talk = null;
			this.$thread.empty(() => {
				this.$empty = div.c("drawer-rail-sheet-empty muted", "Say something — it shows up here as its own card.");
				this.$cards = div.c("drawer-rail-sheet-cards flex v");
			});
			return;
		}
		const token = this.sync_token = (this.sync_token ?? 0) + 1;
		import("/framework/ai/cards/CardChat.js").then(m => {
			if (this.sync_token !== token) return;
			this.$thread.empty(() => {
				this.talk = m.CardChat.chat({ source: () => card.chat_entries(), re: () => card.id });
			});
			// ⚠ see doc/rail-notes.md#c41-thistalksync
			this.talk.sync();
		});
	}

	// ⚠ see doc/rail-notes.md#c42-card-text
	card(text){
		if (this.card_ref){
			const $echo = this.echo(text);
			import("./tabs/ai.js").then(async m => {
				const r = await m.send({ card: this.card_ref.id, text, via: "voice" });
				if (!r.ok) this.not_sent(text, r.note);
				this.talk?.sync();
				$echo?.remove();
			});
			return;
		}
		this.$empty?.hide();
		let $item, $wait;
		this.$cards?.append(() => {
			$item = div.c("drawer-rail-sheet-card", () => {
				div.c("drawer-rail-sheet-card-text", text);
				$wait = div.c("drawer-rail-sheet-card-reply muted", "waiting for the page's assistant…");
			});
		});
		import("./tabs/ai.js").then(async m => {
			const r = await m.send({ text, via: "voice" });
			$wait?.remove();
			$item?.append(() => {
				r.via === "none"
					? span.c("muted", "not sent — " + (r.note || "Servex is not answering"))
					: div.c("drawer-rail-sheet-card-reply muted", r.text ?? r.note ?? "");
			});
		});
	}

	echo(text){
		let $line;
		this.$thread.append(() => { $line = div.c("drawer-rail-sheet-pending muted", "you: " + text); });
		return $line;
	}

	not_sent(text, note){
		this.$thread.append(() => {
			div.c("drawer-rail-sheet-card", () => {
				div.c("drawer-rail-sheet-card-text", text);
				span.c("muted", "not sent — " + (note || "Servex is not answering"));
			});
		});
	}
}

export class DrawerRailSheet extends DrawerRailSheetV1 {
	render(){
		super.render();
		this.links();
	}

	links(){
		return div.c("drawer-rail-sheet-links flex wrap", () => {
			if (!this.new_in_head) this.new_session_button();
			this.link("Dictation", "dictation");
			this.link("Settings", "settings");
			this.link("Open full AI", "ai");
		});
	}

	link(label, tab){
		return button.c("drawer-rail-sheet-link", label).attr("type", "button")
			.click(() => this.close().then(() => tabs.open(tab)));
	}

	// The one New session button: ux/Dictate/chat.js's (doc/chat.md). Older sheet classes have no mount of their own, so they reset the shared session.
	new_session_button(){
		return chat_new_session_button(() => this.mount ?? chat)
			.ac("drawer-rail-sheet-link drawer-rail-sheet-new")
			.attr("title", "Clear this sheet and start a fresh conversation");
	}
}

// ⚠ see doc/rail-notes.md#c50-export-class-drawerrailsheetpanel-extend
export class DrawerRailSheetPanel extends DrawerRailSheet {
	render(){
		this.head();
		this.handle();
		new Inbox.Compact({ page: drawer.page() }).view();
		this.$slot = div.c("drawer-rail-sheet-panel");
		this.$links = this.links().ac("drawer-rail-sheet-links-folded");
	}

	head(){
		const $head = super.head();
		const $x = $head.el.querySelector(".drawer-x");
		$head.append(() => {
			const $more = button.c("drawer-rail-sheet-more", "More").attr("type", "button")
				.attr("aria-expanded", "false")
				.attr("title", "Sessions, dictation, settings, the full AI")
				.click(() => {
					const open = this.$links.el.classList.toggle("drawer-rail-sheet-links-folded") === false;
					$more.attr("aria-expanded", String(open));
				});
			$head.el.insertBefore($more.el, $x);
		});
		return $head;
	}

	show({ listen = true } = {}){
		this.quiet = !listen;
		this.ac("on");
		this.update_path();
		this.sync_card();
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

	navigated(){
		if (!this.session) return;
		setTimeout(() => {
			const to = drawer.page();
			if (to === this.nav_path) return;
			const from = this.nav_path;
			this.nav_path = to;
			nav({ session: this.session, from, to }).catch(() => {});
		});
	}

	sync_card(){
		const card = this.active_card();
		const id = card?.id ?? null;
		if (id === this.card_id && this.panel){ this.panel.sync(); this.start_mic(); return; }
		this.card_id = id;
		this.card_ref = card;
		this.build_voice_panel();
	}

	build_voice_panel(){
		this.own_ats = new Set();
		this.force_fresh ??= false;
		this.$slot.empty(() => {
			this.panel = new Widget({
				placeholder: this.card_ref ? "talk into this card" : "say something",
				marks: true,
				answer: choice => this.on_resume_choice(choice),
				deliver: entry => this.voice_deliver(entry),
				threads: true,
				react: r => this.session ? react({ session: this.session, ...r }) : Promise.reject(new Error("no voice session yet, so the reaction is not saved")),
			});
		});
		this.start_mic();
		if (!this.session) this.offer_recent();
		this.size();
	}

	offer_recent(){
		const card = this.card_ref?.id;
		const ask = card
			? fetch(servex_url(`/api/sessions?card=${encodeURIComponent(card)}&limit=1`), { cache: "no-store" })
				.then(r => r.json()).then(out => out.ok ? out.sessions : [])
			: (typeof Session.recent === "function" ? Session.recent(drawer.page(), { limit: 1 }) : Promise.resolve([]));
		const panel = this.panel;
		ask.then(([row]) => {
			if (!row || this.session || this.panel !== panel) return;
			this.offer_resume({ session: row.session, title: row.title, summary: row.summary, at: row.last_at ?? row.at });
			requestAnimationFrame(() => this.size());
		}).catch(() => {});
	}

	async ensure_session(){
		if (this.session) return;
		const card = this.card_ref?.id ?? null;
		try {
			const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
			if (saved?.session && saved?.file && (saved.card ?? null) === card){
				this.session = saved.session; this.session_file = saved.file; this.nav_path = drawer.page();
				this.watch_session();
				return;
			}
		} catch {}
		try {
			const fresh = this.force_fresh; this.force_fresh = false;
			const made = await start({ path: drawer.page(), card, fresh });
			this.session = made.session; this.session_file = made.file; this.nav_path = drawer.page();
			try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session: made.session, file: made.file, card })); } catch {}
			this.watch_session();
			this.offer_resume(made.previous);
		} catch {}
	}

	watch_session(){
		this.stop_watch?.();
		const draw = line => {
			if (line?.react) return void this.panel?.say({ react: line.react });
			if (!line?.chat) return;
			if (this.own_ats?.has(line.chat.at)) return;
			this.panel?.say({ chat: line.chat });
		};
		this.stop_watch = watch(this.session_file, draw);
		this.stop_stream?.();
		this.stop_stream = stream(this.session, ev => {
			if (ev.kind === "stream") this.panel?.stream(ev.role, ev.text);
			else if (ev.kind === "line") draw(ev.line);
		});
		this.stop_quiet ??= report_quiet(() => this.session);
	}

	forget_session(){
		this.stop_watch?.(); this.stop_watch = null;
		this.stop_stream?.(); this.stop_stream = null;
		this.stop_quiet?.(); this.stop_quiet = null;
		this.session = null; this.session_file = null;
		try { sessionStorage.removeItem(SESSION_KEY); } catch {}
	}

	async voice_deliver(entry){
		try {
			await this.ensure_session();
			if (!this.session) return false;
			const via = entry.via === "typed" ? "text" : "voice";
			floor.stamp(entry);
			const thread = entry.thread ? { re: entry.thread, thread: true } : {};
			const r = await say({ session: this.session, path: drawer.page(), text: entry.text, via, raw: entry.raw, floor: entry.floor, cues: entry.cues, ...thread });
			this.own_ats?.add(r.at);
			this.panel?.retag(entry.at, r.at);
			if (entry.floor === "speaking") this.watch_floor();
			return true;
		} catch {
			return false;
		}
	}

	watch_floor(){
		clearInterval(this.floor_watch);
		const session = this.session, started = Date.now();
		this.floor_watch = setInterval(() => {
			if (session !== this.session || Date.now() - started > 30000) return clearInterval(this.floor_watch);
			if (floor.state() !== "done") return;
			clearInterval(this.floor_watch);
			if (typeof Session.floor === "function") Session.floor({ session, floor: "done" }).catch(() => {});
		}, 250);
	}

	static RESUME_OFFER_MS = 60 * 60 * 1000;

	offer_resume(previous){
		if (!previous || typeof Session.resume !== "function") return;
		if (Date.now() - Date.parse(previous.at ?? 0) < this.constructor.RESUME_OFFER_MS) return;
		this._previous = previous;
		this._previous_label = `${previous.title ?? "The last conversation"} · ${ago(previous.at)}`;
		this.panel?.say({
			type: "ask", heading: "Pick up where you left off?",
			choices: [this._previous_label], at: new Date().toISOString(),
		});
	}

	on_resume_choice(choice){
		if (choice !== this._previous_label || !this._previous || typeof Session.resume !== "function") return;
		const previous = this._previous; this._previous = null;
		Session.resume(previous.session).then(made => {
			this.forget_session();
			this.session = made.session; this.session_file = made.file; this.nav_path = drawer.page();
			try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session: made.session, file: made.file, card: this.card_ref?.id ?? null })); } catch {}
			this.watch_session();
		}).catch(() => {});
	}
}

export class DrawerRailSheetChat extends DrawerRailSheetPanel {
	// New session sits in the head, one tap, as in the desktop AI tab (voice-e2e-review 2026-10-13)
	head(){
		const $head = super.head();
		$head.append(() => { const $new = this.new_session_button(); $head.el.insertBefore($new.el, $head.el.querySelector(".drawer-rail-sheet-more")); });
		return $head;
	}

	render(){
		this.head();
		this.handle();
		new Inbox.Compact({ page: drawer.page() }).view();
		this.$slot = div.c("drawer-rail-sheet-panel");
		this.$links = this.links().ac("drawer-rail-sheet-links-folded");
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

	sync_card(){
		this.card_ref = this.active_card();
		this.mount?.nav(drawer.page(), this.card_ref?.id ?? null);
	}

	navigated(){
		setTimeout(() => this.mount?.nav(drawer.page(), this.active_card()?.id ?? null));
	}

	// Full state = the whole sidebar: the chat above stays mounted (mic keeps running), the drawer's own tab row and tab body sit below it.
	state(mode){
		super.state(mode);
		mode === "full" ? this.mount_tabs() : this.unmount_tabs();
		return this;
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

DrawerRailSheetV1.prototype.full_at = 0.85;
DrawerRailSheetV1.prototype.title = "AI";   // the ✦ AI button's own word; was the class name (voice-e2e-review)
DrawerRailSheetChat.prototype.new_in_head = true;
DrawerRailSheetV1.prototype.close_at = 0.28;

DrawerRail.Sheet = DrawerRailSheetChat;
DrawerRail.SheetPanel = DrawerRailSheetPanel;
DrawerRail.SheetV1 = DrawerRailSheetV1;
DrawerRail.SheetLinksV1 = DrawerRailSheet;

// ⚠ see doc/rail-notes.md#c81-drawerrailprototypemenu_icon
DrawerRail.prototype.menu_icon = "⋯";
DrawerRail.prototype.menu_label = "More";
DrawerRail.prototype.menu_title = "AI sessions, dictation, settings, admin";

export class DrawerRailV1 extends DrawerRail {}
DrawerRailV1.prototype.menu_icon = "☰";
DrawerRailV1.prototype.menu_label = "Menu";
DrawerRailV1.prototype.menu_title = "Menu — AI, sessions, dictation, settings";
DrawerRail.V1 = DrawerRailV1;

export class DrawerRailV2 extends DrawerRail {}
DrawerRailV2.prototype.compact = false;
DrawerRailV2.Sheet = DrawerRailSheetV1;
DrawerRail.V2 = DrawerRailV2;

let $rail;
export default function rail(app){
	return $rail ??= new DrawerRail({ app });
}

rail.navigated = () => $rail?.navigated?.();

export { rail };
