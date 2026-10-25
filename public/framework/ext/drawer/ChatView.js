import { View, div, button } from "/framework/core/View/View.js";
import ChatV2 from "/framework/ext/Chat/v2/ChatV2.js";
import { sticky_scroll } from "/framework/ext/Chat/Chat.js";

View.stylesheet(import.meta, "ChatView.css");

/**
 * The "v2" chip and the Chat v2 box it switches on, shared by the phone ✦ sheet (Sheet.js) and the desktop
 * drawer's AI tab (tabs/ai.js). The chip swaps the chat's bubbles for ext/Chat/v2's drawing of the same
 * session file; the composer and mic footer stay. One choice, kept on this device in localStorage, rules both.
 *   slot  -> () => the element the chat mounted in (gets .drawer-rail-sheet-v2-on while v2 shows)
 *   mount -> () => the chat.js mount (its file() is the session record)
 */
export default class ChatView {
	static KEY = "lew42.sheet.chat_view";

	constructor({ slot, mount }){
		this.slot = slot; this.mount = mount;
		this.on = (() => { try { return localStorage.getItem(this.constructor.KEY) === "v2"; } catch { return false; } })();
	}

	chip(classes = "drawer-rail-sheet-link"){
		return this.$chip = button.c(`${classes} drawer-rail-sheet-v2-chip`, "v2").attr("type", "button")
			.attr("aria-pressed", String(this.on)).attr("title", "Chat v2: this conversation as Prompts, the raw words one click down")
			.click(() => this.set(!this.on));
	}

	set(on){
		this.on = on;
		this.$chip?.attr("aria-pressed", String(on));
		try { on ? localStorage.setItem(this.constructor.KEY, "v2") : localStorage.removeItem(this.constructor.KEY); } catch {}   // storage off: the choice lasts until reload
		this.sync();
	}

	// Draws (or drops) the Chat v2 box inside the chat's card, above the composer; called on a toggle and whenever the session changes.
	sync(){
		const slot = this.slot(), mount = this.mount();
		slot?.classList.toggle("drawer-rail-sheet-v2-on", !!(this.on && mount));
		const file = this.on ? mount?.file?.() ?? null : null;
		if (this.file === file && (file || !this.on)) return;
		this.chat_v2?.unsubscribe(); this.chat_v2 = null; this.file = file;
		if (!this.on || !mount){ this.pin_watch?.disconnect(); this.$box?.el.remove(); this.$box = null; return; }
		if (!this.$box?.el.isConnected){
			this.$box = div.c("drawer-rail-sheet-v2 flow");
			(slot.querySelector(".ux-dictate-widget-card") ?? slot).prepend(this.$box.el);
			// the same scroll lock and jump button as the bubbles chat (Chat.js sticky_scroll); Chat v2 grows by patching, so pin on every change
			const scroll = sticky_scroll(this.$box.el);
			this.pin_watch?.disconnect();
			this.pin_watch = new MutationObserver(() => scroll.pin());
			this.pin_watch.observe(this.$box.el, { childList: true, subtree: true, characterData: true });
		}
		if (file) this.chat_v2 = new ChatV2({ url: file, $box: this.$box }).live();
		else this.$box.empty(() => div.c("chat-v2-empty", "Say something: Chat v2 draws this conversation once it has started."));
	}

	// The chat gave its box back: stop the stream and forget the box (the slot is emptied by the caller).
	release(){
		this.chat_v2?.unsubscribe(); this.pin_watch?.disconnect();
		this.chat_v2 = this.$box = this.file = null;
	}
}
