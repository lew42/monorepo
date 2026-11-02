import { View } from "../../core/View/View.js";
import ReciteTap from "./ReciteTap.js";

View.stylesheet(import.meta, "ReciteBubble.css");

/**
 * class ReciteBubble — `Recite.Bubble`: the one small control under an assistant reply, shared by Chat V1, V2 and V3 (each
 * view calls `Recite.Bubble.mount(el, { text })` once for a reply bubble; this class is the only place the buttons exist).
 * ▶/⏸ plays or pauses THAT bubble (from the word it last stopped at, or from the start), ↺10 steps back about 10 s in its
 * text. A tap on the bubble's text does the same as ▶/⏸ (`Recite.Tap`). The audio is made again each time, never kept.
 *
 *   Recite.Bubble.mount(bubble_el, { text: () => "the reply's text" });
 *
 * It loads `Recite.js` only on the first tap (Recite imports this file, so a static import would be a cycle). `Recite.shared` calls
 * `follow()` when it is made, and from then on each ▶/⏸ follows what Recite is reading.
 */
export default class ReciteBubble {

	static HOST = ".recite-bubble";
	static texts = new WeakMap();   // host element -> () => the text Recite should read
	static keys = new WeakMap();    // host element -> Recite.bubble_key(text), refreshed at mount and at every tap

	/** Add (or move to the end) the control on `host`; `text()` is read when a tap needs the words, so a patched bubble reads its latest text. */
	static mount(host, { text }){
		if (!host || typeof document === "undefined") return null;
		this.texts.set(host, text);
		host.classList.add("recite-bubble");
		let ctl = host.querySelector(":scope > .recite-bubble-ctl");
		if (!ctl){
			ctl = document.createElement("span");
			ctl.className = "recite-bubble-ctl";
			const play = document.createElement("button"), back = document.createElement("button");
			play.type = back.type = "button";
			play.className = "recite-bubble-play"; play.textContent = "▶"; play.title = play.ariaLabel = "Play this reply";
			back.className = "recite-bubble-back"; back.textContent = "↺10"; back.title = back.ariaLabel = "Back 10 seconds";
			play.addEventListener("click", () => this.run(host, r => r.tap_bubble(this.text_of(host), host)));
			back.addEventListener("click", () => this.run(host, r => r.back_bubble(this.text_of(host), host)));
			ctl.append(play, back);
		}
		if (!host.recite_tap){
			host.recite_tap = true;
			// before Recite exists there is no Recite.Tap to hear a tap on the text: this one starts it, and marks the click so Recite.Tap, made a moment later, does not toggle it again
			host.addEventListener("click", e => {
				if (this.recite || !ReciteTap.root_of(e)) return;
				e.recite_handled = true;
				this.run(host, r => r.tap_bubble(this.text_of(host), host));
			});
		}
		host.append(ctl);   // always last: a view that redraws its pieces appends them after the control
		this.sync();   // Recite is loaded and started only by a tap (attach); if the page already has one, this shows what it is reading
		return ctl;
	}

	static text_of(host){
		const get = this.texts.get(host);
		if (get) return String(get() ?? "");
		const copy = host.cloneNode(true);
		copy.querySelector(":scope > .recite-bubble-ctl")?.remove();
		return copy.textContent ?? "";
	}

	/** Runs `fn(recite)` once Recite has loaded (it already has by the time anyone taps). */
	static run(host, fn){
		this.attach().then(r => { this.keys.set(host, r.constructor.bubble_key(this.text_of(host))); fn(r); });
	}

	/** Loads Recite and gives back the page's one shared Recite (a page with no tap yet never starts one). */
	static attach(){ return this.loading ??= import("./Recite.js").then(m => m.default.shared); }

	/** Called by `Recite.shared` the moment the page's Recite exists, however it was started: keeps every ▶/⏸ in step with it. */
	static follow(recite){
		if (this.recite === recite) return;
		this.recite = recite;
		recite.on(() => this.sync());
		this.sync();
	}

	/** ▶ or ⏸ on each bubble's button: ⏸ only on the one being read right now. */
	static sync(){
		const r = this.recite;
		if (!r || typeof document === "undefined") return;
		const now = r.bubble_state();
		for (const host of document.querySelectorAll(this.HOST)){
			const play = host.querySelector(":scope > .recite-bubble-ctl > .recite-bubble-play");
			if (!play) continue;
			let key = this.keys.get(host);
			if (key == null){ key = r.constructor.bubble_key(this.text_of(host)); this.keys.set(host, key); }
			const on = now.key === key && now.playing;
			const label = on ? "⏸" : "▶";
			if (play.textContent !== label){ play.textContent = label; play.title = play.ariaLabel = on ? "Pause this reply" : "Play this reply"; play.classList.toggle("is-on", on); }
		}
	}
}
