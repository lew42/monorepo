import { View, div, span, a, button, select, option, label } from "../../core/View/View.js";
import ErrorLog from "../ErrorLog/ErrorLog.js";
import { composer } from "../Chat/Composer.js";
import Whisper from "../../audio/Whisper/Whisper.js";
import WhisperLog from "../../audio/Whisper/WhisperLog.js";
import PromptRun from "./PromptRun.js";
import "./PromptView.js";
import RefineSystem from "./RefineSystem.js";
import RefineExplorer from "./RefineExplorer.js";
import VoiceFollow from "./VoiceFollow.js";

View.stylesheet(import.meta, "Prompt.css");

/**
 * class RefineDemo — the working demo on the Refine page: speak (or type) ONE prompt and watch it become
 * raw → clean → refined cards with clarity/weight scores.
 *
 * Order of events (the owner, 2026-10-09, `ai/2026-10-09/refine-v3`; one-input, 2026-10-12):
 *   1. every Whisper chunk (or keystroke) → `system.quick()`: the cleaned text appears in about a millisecond;
 *   2. every chunk ALSO ticks `/api/refine/live` (law 2/6 — THE composer's own mic does this, Mic.js's
 *      `refine_tick`/`refine_final`): the outline below ("3 · Outline") updates live, before Refine ever runs;
 *   3. Refine (Send, or the mic's own auto-send) → `system.go()`: the real server call, each model call its
 *      own new session, shown with its model, time and cost (links to the session page);
 *   4. the Whisper log (`audio/Whisper` `WhisperSession.View`) and the instance explorer (`RefineExplorer`)
 *      update as you dictate.
 * One `PromptRun` instance is the single source for all views, so they cannot disagree.
 *
 * ONE CHAT INPUT, HERE TOO (`doc/one-input-2026-10-12.md`): this used to build its own
 * `VoiceStrip` + plain `<textarea>`; it is THE composer now (`ext/Chat/Composer.js`), same as
 * every other chat surface — mic, gear and Send in one row, raw shown while speaking. `VoiceStrip`
 * is dropped here, not kept as a second status line: it ran its OWN separate `Dictate` instance,
 * which risked two live mics at once (`ComposerMic`'s own "one microphone at a time" guard only
 * covers composer mics) — the composer's own status line (`Chat.css`'s `.chatbox-compose-diag`)
 * already says the same mic/whisper health in one line.
 */
export default class RefineDemo extends View {

	render(){
		this.ac("refine-demo");
		this.system = new RefineSystem({ on_change: () => this.draw() });
		this.prompt = this.system.prompt;
		this.system.whisper.on_change = () => this.draw_whisper();
		ErrorLog.watch(() => ({ status: this.prompt.status, raw: this.prompt.raw, error: this.prompt.error }));

		// ONE workspace (the owner, 2026-10-09): a sticky toolbar on top, the stages side by side, a sticky footer.
		div.c("refine-toolbar", () => {
			div.c("flex wrap gap v-center", () => {
				this.$go = button("Refine").ac("refine-go").click(() => this.go());
				button("New prompt").click(() => this.next());
				label.c("refine-model", () => {
					span("Model");
					this.$model = select(() => {
						option("Haiku 5.5 (default)").attr("value", "claude-haiku-5-5");   // the server default (RefineCall.model()); ai/doc/models.md
						option("Sonnet 5.5 (sharper)").attr("value", "claude-sonnet-5-5");
					});
					this.$model.el.addEventListener("change", () => { this.system.model = this.$model.el.value; });
				});
				this.$cost = span.c("refine-cost");
				a("Watch live ↗").href(this.system.page_url).ac("refine-watch").attr("title", "Watch it on the session page").attr("aria-label", "Watch it on the session page");
			});
			this.$note = div.c("refine-input-note");
			// THE composer: mic, gear, Send. Typing or dictating runs the instant `quick()` clean on every
			// change (below); Send (or the mic's own pause auto-send) runs the real Refine (`go()`).
			this.$compose = composer({
				placeholder: "speak with the mic, or type or paste a prompt here…",
				mic: true, revise: "clean", per_sentence: true,   // each finished sentence goes out and into the transcript while the next is still being heard
				// `entry.text` is captured BEFORE `Composer.js`'s own `send()` clears the box (typed) or
				// `consume_sent()` empties it (dictated) — reading `this.transcript()` here instead would
				// see an already-empty box, so this runs the real Refine straight off what was sent.
				deliver: async entry => {
					const text = entry.text?.trim();
					if (!text) return (this.$note.text("Nothing to refine yet."), false);
					this.system.source = entry.via === "whisper" ? "dictated" : "typed";
					this.$note.text("");
					this.system.go(text);
					return true;
				},
				on_live: undefined,   // real box, not a ghost chat bubble — this demo shows raw IN the box, like before
				on_text: () => this.quick(),
				on_revised: () => this.quick(),
				on_send_start: text => text ? this.system.sending_start(text) : this.quick(),   // sent words stay on the page while the last live call runs
				on_meter: () => {},
				session: () => this.system.session_id,
				// THE LIVE OUTLINE (law 2): `Mic.js`'s own `refine_tick`/`refine_final` already posted this —
				// write it onto the SAME `PromptRun` `RefineSystem.live()` would, so `draw()` below redraws it
				// through the one `on_change` path, never a second.
				on_refine_live: out => this.system.set_live(out),
			});
			this.dictate = this.$compose.mic;   // a `ComposerMic` (`Dictate` subclass) — same shape `VoiceStrip.dictate` was
			this.$box = this.$compose.$input;
			this.dictate.on_whisper = line => this.system.session.record(line);
			WhisperLog.attach(this.dictate, this.system);   // every event from Whisper's reply to the cleaner, numbered: /framework/audio/Whisper/log/
			this.$box.el.addEventListener("input", () => this.quick());
			// the ✦ chat (drawer or phone sheet) heard something: show the same words here, one result everywhere
			this.voice = new VoiceFollow({ on_text: (text, v) => {
				if (this.$box.el.value.trim()) return;   // you are typing or dictating here: leave it alone
				if (this.prompt.status === "done"){ this.system.next(); v.reset(); text = v.text; }
				this.system.source = "dictated";
				this.$note.text("Heard in the ✦ chat (press Refine for the full result).");
				this.system.quick(text);
			} });
		});

		this.$result = div.c("refine-result");
		this.explorer = new RefineExplorer({ subject: this.system });
		div.c("refine-foot", () => { this.$whisper = div.c("refine-whisper"); });

		this.system.whisper.check();
		this.draw();
		this.draw_whisper();
	}

	/** The words in the box. The composer's mic already types its still-moving guess INTO the box, and its `partial_text` keeps the
	 *  guess of a sentence that was just sent, so adding it here repeated that sentence (found with the fake-mic run). */
	transcript(){ return this.$box.el.value.trim(); }

	/** Instant stage: show the cleaned text now, with no model. */
	quick(){
		this.system.quick(this.transcript());   // empty text clears the box's share, the sent sentences stay
	}

	async go(){
		// Stop the mic FIRST and wait: stop() settles the open segment into the box.
		const live = this.dictate.state === "listening" || this.dictate.state === "connecting";
		this.system.source = live || this.dictate.partial_text ? "dictated" : "typed";   // the raw line of the session log says how the words arrived
		if (live) this.$note.text("Finishing the last words…");
		if (live) await this.dictate.stop();
		const text = this.transcript();
		if (!text) return this.$note.text("Nothing to refine yet.");
		this.$note.text("");
		this.$box.el.value = "";   // sent: the words now live in the transcript, not the box
		this.system.go(text);
	}

	/** Start over with a fresh prompt and open the mic if it is not already listening. */
	next(){
		this.$box.el.value = "";
		this.$note.text("");
		this.system.next();
		if (this.dictate.state === "idle") this.dictate.start();
	}

	draw(){
		const prompt = this.prompt;
		this.$result.empty(() => new PromptRun.View({ subject: prompt, show_raw: true, compact: true }));
		const st = prompt.status;
		this.conn?.set("refine", st === "done" ? "ok" : st === "error" ? "bad" : st === "working" ? "wait" : "idle",
			st === "done" ? `done, ${(prompt.ms / 1000).toFixed(1)} s` : st === "error" ? "error: " + String(prompt.error).slice(0, 60) : st === "working" ? "working…" : "not yet");
		this.$cost?.text(prompt.runs.length ? "$" + prompt.runs.reduce((n, r) => n + (r.cost_usd || 0), 0).toFixed(3) + " · " + (prompt.ms / 1000).toFixed(1) + " s" : "");
		this.explorer?.draw();
	}

	draw_whisper(){
		this.$whisper.empty(() => new Whisper.View({ subject: this.system.whisper }));
		this.explorer?.draw();
	}
}
