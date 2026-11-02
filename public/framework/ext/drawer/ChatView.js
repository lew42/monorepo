import { View, div, button } from "/framework/core/View/View.js";
import ChatV2 from "/framework/ext/Chat/v2/ChatV2.js";
import ChatV3 from "/framework/ext/Chat/v3/ChatV3.js";
import { sticky_scroll } from "/framework/ext/Chat/Chat.js";
import { menu as popover_menu } from "/framework/ux/Popover/Popover.js";

View.stylesheet(import.meta, "ChatView.css");

/**
 * The chat version dropdown (V1 / V2 / V3) and the Chat v2 or v3 box it switches on, shared by the phone ✦ sheet (Sheet.js) and the
 * desktop drawer's AI tab (tabs/ai.js). V2 or V3 swaps the chat's bubbles for ext/Chat/v2's or v3's drawing of the same
 * session file; the composer and mic footer stay. One choice, kept on this device in localStorage, rules both.
 *   slot  -> () => the element the chat mounted in (gets .drawer-rail-sheet-v2-on while v2 shows)
 *   mount -> () => the chat.js mount (its file() is the session record)
 */
export default class ChatView {
	static KEY = "lew42.sheet.chat_view";

	constructor({ slot, mount }){
		this.slot = slot; this.mount = mount;
		this.mode = (() => { try { const m = localStorage.getItem(this.constructor.KEY); return m === "v2" || m === "v3" ? m : null; } catch { return null; } })();
	}

	get on(){ return !!this.mode; }

	// The version dropdown: ONE button naming the version on screen ("Chat V1 ▾"), opening V1 / V2 / V3. Built like the session
	// dropdown beside it (ux/Dictate/chat.js session_switcher(): a drawer-ai-switch-btn plus ux/Popover's menu), so both look the same.
	// V1 is the bubbles chat, always mounted underneath (the mic keeps recording across a switch); V2 and V3 draw over it. Returns the button.
	static VERSIONS = [
		{ mode: null, name: "V1", text: "V1: bubbles, live words" },
		{ mode: "v2", name: "V2", text: "V2: Prompts, raw words one click down" },
		{ mode: "v3", name: "V3", text: "V3: Prompt cards with every reply" },
	];
	chip(){
		const V = this.constructor.VERSIONS;
		this.$chip = button.c("drawer-ai-switch-btn drawer-chat-version", "").attr("type", "button")
			.attr("title", "Which chat view: V1, V2 or V3").attr("aria-haspopup", "menu");
		this.menu = popover_menu(this.$chip.el, V.map(v => ({ text: v.text, current: v.mode === this.mode, pick: () => this.set(v.mode) })));
		this.label();
		return this.$chip;
	}
	label(){
		const V = this.constructor.VERSIONS, i = Math.max(0, V.findIndex(v => v.mode === this.mode));
		if (this.$chip) this.$chip.el.textContent = `Chat ${V[i].name} ▾`;
		this.menu?.$box?.el.querySelectorAll(".ux-popover-item").forEach((el, n) => {   // the menu is drawn once: re-mark its current row
			el.toggleAttribute("aria-current", n === i); el.style.fontWeight = n === i ? "700" : "";
		});
	}

	set(mode){
		this.mode = mode === true ? "v2" : mode || null;
		this.label();
		try { this.mode ? localStorage.setItem(this.constructor.KEY, this.mode) : localStorage.removeItem(this.constructor.KEY); } catch {}   // storage off: the choice lasts until reload
		this.sync();
	}

	// Draws (or drops) the Chat v2 box inside the chat's card, above the composer; called on a toggle and whenever the session changes.
	sync(){
		const slot = this.slot(), mount = this.mount();
		slot?.classList.toggle("drawer-rail-sheet-v2-on", !!(this.on && mount));
		const file = this.on ? mount?.file?.() ?? null : null;
		if (this.file === file && this.shown === this.mode && (file || !this.on)) return;
		this.chat_v2?.unsubscribe(); this.chat_v2 = null; this.file = file;
		if (this.shown !== this.mode) { this.$box?.el.remove(); this.$box = null; }
		this.shown = this.mode;
		if (!this.on || !mount){ this.pin_watch?.disconnect(); this.$box?.el.remove(); this.$box = null; return; }
		if (!this.$box?.el.isConnected){
			this.$box = div.c(`drawer-rail-sheet-v2 flow ${this.mode === "v3" ? "chat-v3" : ""}`);
			(slot.querySelector(".ux-dictate-widget-card") ?? slot).prepend(this.$box.el);
			// the same scroll lock and jump button as the bubbles chat (Chat.js sticky_scroll); Chat v2 grows by patching, so pin on every change
			const scroll = sticky_scroll(this.$box.el);
			this.pin_watch?.disconnect();
			this.pin_watch = new MutationObserver(() => scroll.pin());
			this.pin_watch.observe(this.$box.el, { childList: true, subtree: true, characterData: true });
		}
		if (file) this.chat_v2 = new (this.mode === "v3" ? ChatV3 : ChatV2)({ url: file, $box: this.$box }).live();
		else this.$box.empty(() => div.c("chat-v2-empty", `Say something: Chat ${this.mode} draws this conversation once it has started.`));
	}

	// The chat gave its box back: stop the stream and forget the box (the slot is emptied by the caller).
	release(){
		this.chat_v2?.unsubscribe(); this.pin_watch?.disconnect();
		this.chat_v2 = this.$box = this.file = null;
	}
}
