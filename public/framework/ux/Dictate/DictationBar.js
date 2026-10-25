import { View, span, button } from "../../core/View/View.js";

View.stylesheet(import.meta, "DictationBar.css");

/**
 * class DictationBar — the phone sheet's "fewer controls" bar (variant D, sheet step 10): one big mic that says,
 * in one word, what it is doing; a Type button that opens the text box in place; no Send and no gear.
 *
 *   DictationBar.mount(widget, live)   // widget = the chat's Widget (its .dictate is the mic); live = the strip's row, or omit
 *
 * It adds no engine: it drives the composer's own mic (a `ComposerMic`, which is a `Dictate`), listens to the mic's
 * state changes (the mic's methods are wrapped once, no polling) and hides the composer's row (mic, gear, Send) with CSS.
 * Tap = talk / pause; hold = off. The word: starting, listening, sending, paused (stopped by tap) or off (never on, held, or an error).
 * The bar's height is fixed, so a changing word never moves anything. Doc: doc/voice-assistant.md#the-bar.
 * To go back to the old controls: remove the one `DictationBar.mount` line in ext/drawer/Sheet.js (`VoiceStrip` stays in the tree).
 */
export default class DictationBar extends View {

	static HOLD_MS = 600;
	static WATCHED = ["set_state", "set_error", "send_screen", "send_sentences", "enqueue"];   // the mic's methods that change what the word says
	static HINTS = { starting: "connecting…", listening: "sends when you pause", sending: "one moment", paused: "tap to talk", off: "tap to talk" };
	static note = null;   // a one-off reason the mic is off (the AI sheet after a dev reload), shown instead of "tap to talk" until the mic starts

	/** Put the bar in the widget's composer (full size) and, if `live` is given, a compact one in that row (the strip size). */
	static mount(widget, live){
		const mic = widget?.dictate, compose = mic?.el.closest(".chatbox-compose");
		if (!compose) return null;
		compose.setAttribute("data-dictation-bar", "");
		const box = compose.querySelector(".chatbox-compose-input");
		if (box) box.placeholder = "type, then Enter to send";
		const bars = [];
		new View({ el: compose, capture: false }).append(() => { bars.push(new this({ mic, compose })); });
		if (live){
			const row = live.el ?? live;
			new View({ el: row, capture: false }).append(() => { bars.push(new this({ mic, compose, compact: true })); });
			row.prepend(bars.at(-1).el);   // the mic leads the strip, the last line said fills the middle
			const said = row.querySelector(".drawer-rail-sheet-said");
			if (said?.textContent === "listening…") said.textContent = "say something";   // the bar says whether it is listening
		}
		return bars;
	}

	/** Wrap the mic's state-changing methods once; every bar on that mic is told after each call (and again when an async one settles). */
	static watch(mic, bar){
		if (!mic.$bars){
			mic.$bars = new Set();
			const tell = (name, args) => { for (const b of mic.$bars) b.refresh(name === "set_error" ? args[0] : undefined); };
			for (const name of this.WATCHED){
				const original = mic[name];
				if (typeof original !== "function") continue;
				mic[name] = function(...args){
					const out = original.apply(this, args);
					tell(name, args);
					if (out?.finally) out.finally(() => tell(name, []));
					return out;
				};
			}
		}
		if (!mic.$meter_wrapped){   // the level is the mic's own on_meter number (Dictate.js on_level), wrapped once, never a second audio graph
			mic.$meter_wrapped = true;
			const prior = mic.on_meter;
			mic.on_meter = level => { prior?.(level); for (const b of mic.$bars) b.level(level); };
		}
		mic.$bars.add(bar);
	}

	/** Remember the newest level; one animation frame writes it to `--level` (0 to 1), the mic button's fill height. */
	level(v){
		this.$v = v;
		if (this.$raf) return;
		this.$raf = requestAnimationFrame(() => { this.$raf = 0; this.$mic.style("--level", Math.min(1, Math.max(0, this.$v)).toFixed(3)); });
	}

	render(){
		this.ac("dictation-bar").attr("data-size", this.compact ? "compact" : "full");
		const mic = this.mic;
		this.$mic = button.c("dictation-bar-mic", () => { span.c("dictation-bar-icon", "🎤"); }).attr("type", "button")
			.attr("title", "Tap to talk or pause · hold to turn off")
			.on("pointerdown", () => this.press())
			.on("pointerup", () => this.release())
			.on("pointerleave", () => clearTimeout(this.hold))
			.on("pointercancel", () => clearTimeout(this.hold))
			.on("contextmenu", e => e.preventDefault())   // a long press on a phone must not open the browser's menu
			.on("click", e => { e.stopPropagation(); if (this.held) return void (this.held = false); this.tap(); });
		span.c("dictation-bar-caption", () => {
			this.$word = span.c("dictation-bar-word").attr("aria-live", "polite");
			this.$hint = span.c("dictation-bar-hint muted");
		});
		if (!this.compact){
			this.$type = button.c("dictation-bar-type", "⌨").attr("aria-label", "Type").attr("type", "button").attr("aria-pressed", "false")
				.attr("title", "Show the box to type in")
				.click(() => this.typing(!this.compose.hasAttribute("data-typing")));
			// the composer's own gear (ext/Chat/Composer.js) is hidden with its row; this one presses it, so the settings panel is the same one
			this.$gear = button.c("dictation-bar-gear", "⚙").attr("aria-label", "Dictation settings").attr("type", "button").attr("title", "Dictation settings: send delay, smart assistant batches")
				.click(() => this.compose.querySelector(".chatbox-compose-menu")?.click());
		}
		this.constructor.watch(mic, this);
		this.refresh();
	}

	/** The word for the mic's state right now. */
	state(){
		const m = this.mic;
		const busy = !!(m.sending_screen || m.sending_sentences || m.posting > 0);
		if (m.state === "error") return "off";
		if (m.state === "connecting") return "starting";
		if (busy) return "sending";
		if (m.state === "listening" || m.state === "transcribing") return "listening";
		return this.mic.$was_on && !this.mic.$off ? "paused" : "off";
	}

	/** Redraw the word, the hint and the mic's look. `error` is the reason when the mic just failed. */
	refresh(error){
		const m = this.mic;
		if (m.state === "listening" || m.state === "connecting") { m.$was_on = true; m.$off = false; this.constructor.note = null; }
		if (m.state === "error") this.error = String(error?.message ?? error ?? this.error ?? "the microphone stopped");
		else if (m.state !== "idle") this.error = null;
		const word = this.state();
		this.attr("data-state", word);
		this.$word.text(word[0].toUpperCase() + word.slice(1));
		if (word !== "listening" && word !== "sending") this.$mic.style("--level", "0");   // no meter while the mic is off
		const hint = m.state === "error" && this.error ? this.error : (word === "off" && this.constructor.note) || this.constructor.HINTS[word];
		this.$hint.text(this.compact ? "" : " · " + hint).attr("title", m.state === "error" ? this.error : "");
		this.$mic.attr("aria-pressed", String(word === "listening" || word === "sending")).attr("aria-label", "Microphone, " + word);
	}

	tap(){ this.mic.toggle(); }

	press(){
		this.held = false;
		clearTimeout(this.hold);
		this.hold = setTimeout(() => { this.held = true; this.mic.$off = true; this.mic.stop(); this.refresh(); }, this.constructor.HOLD_MS);
	}

	release(){ clearTimeout(this.hold); }

	/** Type shows or hides the box, in place: the bar itself never moves. */
	typing(on){
		this.compose.toggleAttribute("data-typing", on);
		this.$type.attr("aria-pressed", String(on));
		if (on) this.compose.querySelector(".chatbox-compose-input")?.focus({ preventScroll: true });
	}
}
