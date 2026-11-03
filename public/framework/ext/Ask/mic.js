import { button } from "../../core/View/View.js";

/* ⚠ Superseded 2026-09-19 by `ux/Dictate` (`ext/Ask/reply.js`'s mic and dictate
   box are both built on it now) — kept here, not deleted, as the smaller
   browser-only building block `Dictate` itself calls into for its own fallback
   engine. Read `ux/Dictate/readme.md` first for anything new.

   The browser's OWN speech recognition, not a service we run — there is nothing
   to install, and a word appears while it is still being said. But it is NOT
   private: Chrome sends the audio to Google's servers to recognise it (only
   some browsers' on-device models would keep it local, and Chrome here isn't
   one of them — corrected 2026-09-19, this sentence used to claim otherwise).
   Chrome on desktop and Android have the API (still behind the `webkit`
   prefix); Firefox and iOS Safari have nothing, and there is no polyfill — so
   `can_hear()` is false there and the button is simply not drawn. */
const Recognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;

/** Can this browser transcribe speech at all? False on Firefox and iOS Safari. */
export const can_hear = () => !!Recognition;

/**
 * A 🎤 that dictates into one `<textarea>`. Press it and talk; press it again to
 * stop. Words you have finished saying are written into the box as you go, and
 * the sentence still in the air is shown after them, greyed, until it settles.
 *
 *     mic(() => this.$input, { on_start: () => this.open() });
 *
 * Returns the button, or `null` when the browser cannot hear — a caller draws a
 * line saying so, it never renders a dead control.
 */
export function mic($input, opts = {}){
	return Recognition ? new Mic({ $input, ...opts }).view() : null;
}

export class Mic {

	lang = "en-US";
	/* Chrome stops listening after a few seconds of silence even with
	   `continuous`, so a pause in the middle of a thought ends the session. We
	   restart it, and only a real press stops for good. */
	listening = false;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* The box may not exist yet when the button is built — a control draws its
	   buttons above its box — so `$input` may be a function that finds it later. */
	input(){ return typeof this.$input === "function" ? this.$input() : this.$input; }

	view(){
		return this.$button = button.c("ask-mic", "🎤").attr("type", "button")
			.attr("title", "dictate — click to start talking, click again to stop")
			.on("click", e => { e.stopPropagation(); this.toggle(); });
	}

	toggle(){ this.listening ? this.stop() : this.start(); }

	start(){
		this.listening = true;
		this.said = "";
		/* Whatever was already typed stays put and dictation lands after it — the
		   owner may have started a sentence and then reached for the microphone. */
		this.typed = this.input().el.value;
		this.$button.el.classList.add("listening");
		this.on_start?.();

		const rec = this.rec = new Recognition();
		rec.lang = this.lang;
		rec.continuous = true;
		rec.interimResults = true;

		rec.onresult = e => this.heard(e);
		rec.onerror = e => this.failed(e.error);
		// Not a stop: a silence ended the run, and the owner has not pressed anything.
		rec.onend = () => { if (this.listening) rec.start(); };

		rec.start();
	}

	/* ⚠ Only the results from `resultIndex` on are new — the event carries the
	     whole list every time, so folding all of it in repeats every sentence. */
	heard(e){
		let air = "";

		for (let i = e.resultIndex; i < e.results.length; i++){
			const said = e.results[i][0].transcript;
			if (e.results[i].isFinal) this.said += said;
			else air += said;
		}

		this.write(this.said + air);
	}

	write(text){
		const joiner = this.typed && !/\s$/.test(this.typed) ? " " : "";
		this.input().el.value = this.typed + joiner + text.replace(/^\s+/, "");
		// So anything watching the box — a Send button that enables on input — sees it.
		this.input().el.dispatchEvent(new Event("input", { bubbles: true }));
	}

	failed(error){
		this.stop();
		// `not-allowed` is the one a reader can act on: the browser asked and was told no.
		this.on_error?.(error === "not-allowed"
			? "The browser is not allowed to use the microphone — allow it for this site and press 🎤 again."
			: "The microphone stopped: " + error);
	}

	stop(){
		this.listening = false;
		this.$button?.el.classList.remove("listening");
		try { this.rec?.stop(); } catch { /* already stopped */ }
		this.write(this.said);
		this.on_stop?.();
	}
}

export default mic;
