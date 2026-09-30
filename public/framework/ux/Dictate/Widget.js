import { View, div, span, button, select, option, label, input } from "../../core/View/View.js";
import Dictate, { remember_device, remembered_device } from "./Dictate.js";
import { pg } from "./playground/Playground.js";
import { marks as fetch_marks } from "../Understand/Understand.js";
import { md_into } from "../../ext/Chat/md.js";
import { who_label } from "../../ext/Chat/roles.js";

View.stylesheet(import.meta, "Widget.css");

/** The model the reader picked, moved here from `ext/drawer/tabs/ai.js` (round 3,
 *  2026-09-30 — "find the drawer's current model switcher and move it into the Widget")
 *  so `Widget`'s own `models` option can draw it without `ux/Dictate` reaching UP into
 *  `ext/drawer`. `ai.js` now imports `{ model, MODELS }` from here instead of owning them. */
export const MODELS = ["haiku", "sonnet", "opus", "fable"];
const MODEL_KEY = "lew42-drawer-model";
export function model(value){
	try {
		if (value) localStorage.setItem(MODEL_KEY, value);
		return localStorage.getItem(MODEL_KEY) || "sonnet";
	} catch { return value || "sonnet"; }
}

/**
 * **ONE dictation widget, the same everywhere** (the owner, 2026-09-30, from the phone:
 * "the button is so far down the page… the actual transcription is below another
 * paragraph or two"). This IS the ✦ sheet's own compact widget — a framed card, bubbles
 * on top, a composer row at the bottom (a typed box, the mic, Send) — pulled into its own
 * class so the sheet, the desktop drawer and the Dictate page all build the SAME thing,
 * configured instead of copied:
 *
 *     new Widget();                                   // just bubbles + the composer row
 *     new Widget({ level: true, source: true });       // + a tiny level meter, + a mic picker
 *     new Widget({ debug: true });                     // + the "Debug ▾" bar (below the card)
 *     new Widget({ revision: "edit" });                 // ux/Revise tidies each sentence too
 *     new Widget({ models: true });                     // + the model picker above the thread
 *
 * **Six options, each a plain property** (default `false`/off, so the smallest call —
 * `new Widget()` — draws exactly what the sheet already showed, nothing more):
 * - `level` — a small level meter right beside the mic button.
 * - `source` — a compact `<select>` of audio input devices.
 * - `debug` — a small "Debug ▾" toggle below the card (the playground's own tabs, reused).
 * - `revision` — `"clean" | "edit" | "summary" | false`, forwarded to `Dictate`'s `revise`.
 * - `models` — the model picker (`model()`/`MODELS` above) shown over the thread. ON in the
 *   desktop drawer's AI tab, OFF in the ✦ sheet (the owner, round 3: "shown in the desktop
 *   drawer, off in the sheet").
 *
 * **Wiring a real conversation through it** — three more properties, all optional, all
 * `null`/off by default so the plain `new Widget()` the Dictate page uses is unaffected:
 * - `history()` — a function returning this thread's already-saved lines (the universal
 *   chat line shape, `{at, from:{kind}, text, via}` — `ext/Chat/readme.md`), drawn once,
 *   on mount. `sync()` (below) re-reads it.
 * - `deliver(entry)` — `async (entry) => ok`, `entry` is `{text, via}`. Called once a
 *   sentence (typed or dictated) is ready to go out; the widget has ALREADY drawn it as
 *   the owner's own bubble (optimistic, same reasoning as the sheet's old `echo()`) by the
 *   time this runs. A reply is the caller's own job — call `widget.say({chat:{...}})` from
 *   inside `deliver` once it has one (exactly how `ext/drawer/tabs/ai.js`'s own `deliver`
 *   already called `panel.say(...)`; only the object changed). `deliver` resolving falsy
 *   marks the bubble "not sent".
 * - `on_text(text)` — fires the moment a sentence is ready (before `deliver`) — for a hint
 *   line a caller wants to hide the first time something is said, same as `ChatPanel`'s.
 *
 * **The Chat HITL seam** (restored round 4, `ai/2026-09-30/audio-consolidate/minion-wire/`
 * — the widget swap had dropped this, `ChatPanel`'s own doc on `rail.js` named the gap):
 * - `answer(choice)` — same contract `ChatPanel` had: call `widget.say({type: "ask",
 *   heading, text, choices, at})` to show a question with buttons (the resume offer in
 *   `rail.js` is the one caller today); a click disables the buttons, marks the pick, and
 *   calls `answer(choice)` so the caller does whatever "yes" means.
 * - `marks: true` — after each of the OWNER'S OWN bubbles, asks `ux/Understand`'s `marks()`
 *   in the background and adds a small ✓/`?` beside it (ok / unclear). Off by default
 *   (`false`), same as `ChatPanel`'s own `marks` option.
 *
 * `say(entry)` and `sync()` are public methods — see their own doc below.
 *
 * **The live guess is `Dictate`'s own caption, not a second copy of it** — the exact trick
 * `ext/drawer/rail.css` already used for the sheet before this task: `mode: "open"` makes
 * `Dictate` draw one `.ux-dictate-line` per settled sentence plus one `.ux-dictate-line
 * .muted` for the still-moving guess; `Widget.css` hides the settled ones (this widget's
 * own bubbles already show them) and leaves the muted guess line showing, right under the
 * mic button.
 *
 * **Wired into the ✦ sheet and the desktop drawer's AI tab** (round 3, 2026-09-30, once
 * voice-sessions-2 merged) — `ext/drawer/rail.js`'s `DrawerRailSheetPanel` and
 * `ext/drawer/tabs/ai.js` both build `Widget` now instead of `ChatPanel`
 * (`ext/Chat/ChatPanel.js`), through `deliver`/`history`/`say`/`sync` above — no second
 * composer implementation left on either surface. The session PAIR itself
 * (`ext/Session/Session.js`'s `start`/`say`/`floor`/`nav`/`watch`) still lives in
 * `rail.js`, unchanged in shape — this widget only had to grow the three hooks above for
 * that orchestration to plug into it instead of `ChatPanel`. `ext/Chat/ChatPanel.js` is
 * untouched and still used by `ext/Chat/drill/` and its own demo — not deleted, just no
 * longer the drawer's own composer.
 *
 * Parts as static subclasses (the `code` skill, §3) — `Widget.Thread` (the bubbles),
 * `Widget.Composer` (the bottom row), `Widget.Models` (the picker) and `Widget.Debug`
 * (the collapsed toggle below the card). A caller that wants a different bubble shape
 * overrides `Thread` alone; everything else — the engines, the errors, `revise`'s own
 * timing — stays `Dictate`'s.
 */
export default class Widget extends View {

	render(){
		this.ac("ux-dictate-widget flex v gap");
		div.c("ux-dictate-widget-card card pad flex v gap", () => {
			if (this.models) new this.constructor.Models({ widget: this });
			new this.constructor.Thread({ widget: this });
			new this.constructor.Composer({ widget: this });
		});
		if (this.debug) new this.constructor.Debug({ widget: this });

		if (typeof this.history === "function")
			(this.history() ?? []).forEach(chat => this.$thread?.draw({ chat }));

		// The headless-test seam, same pattern as `playground/page.js`'s own
		// `globalThis.$dictate_pg` — the last widget built on the page wins, which is
		// fine for a proof script that only ever mounts one at a time.
		globalThis.$dictate_widget = this;
	}

	// Called by `Composer`'s own `Dictate` instance (`on_text`/`on_revised`), and by
	// `Composer`'s own typed Send — routed through the widget, not straight into `Thread`,
	// so a caller overriding `Thread` alone still gets every sentence without also having
	// to know how `Composer` is wired. Goes out through `deliver` when the caller wired
	// one; otherwise it's just a local bubble, today's plain-`Widget()` behaviour.
	submit(text, via){
		this.on_text?.(text);
		const at = new Date().toISOString();
		this.$thread?.draw({ chat: { at, from: { kind: "owner" }, via, text } });
		if (typeof this.deliver !== "function") return;
		// `at` rides along on `entry` too — a caller whose own server answers with a
		// DIFFERENT, authoritative `at` (the session pair's own `say()`, `rail.js`) calls
		// `retag(entry.at, real_at)` to rekey the bubble already drawn here, so a later
		// `fix`-update or a dedup check (a watched file reading the same line back) finds
		// the right one instead of drawing a second bubble.
		const entry = { text, via, at };
		Promise.resolve(this.deliver(entry)).then(ok => { if (!ok) this.$thread?.mark_failed(at); });
	}

	/** Rekey a bubble `submit()` already drew under a LOCAL `at` to the real one a
	 *  caller's server answered with — see `submit()`'s own note. A no-op if `old_at`
	 *  isn't found (already retagged, or the thread moved on). */
	retag(old_at, new_at){ this.$thread?.retag(old_at, new_at); }

	/** A line from ELSEWHERE — a reply streaming in, a saved line a `history()` reload
	 *  missed, the same universal chat line shape `ext/Chat` already uses:
	 *  `{chat: {at, from: {kind: "owner"|"assistant"}, text, via, fix}}`. `fix: true`
	 *  updates the bubble already drawn for that same `at` in place (a streamed reply
	 *  growing token by token) instead of adding a new one — `ChatPanel.say()`'s own rule,
	 *  kept so a caller moving from `ChatPanel` to this class changes nothing but the
	 *  object it calls it on. */
	say(entry){ this.$thread?.draw(entry); }

	/** Re-reads `history()` (if the caller gave one) and redraws the thread from scratch —
	 *  for when the thread this widget shows has CHANGED under it (the sheet's own
	 *  `sync_card()`, a card page's `sync_global_ai()`), not for a single new line (`say()`
	 *  above is for that). A no-op with no `history()` — a caller driving the thread
	 *  entirely through `say()` never needs this. */
	sync(){
		if (typeof this.history !== "function") return;
		this.$thread?.reset();
		(this.history() ?? []).forEach(chat => this.$thread?.draw({ chat }));
	}

	/** Clear the thread back to its empty state, drawing nothing back in — for a caller
	 *  that drives the thread entirely through `say()` (`ux/Dictate/chat.js`'s own
	 *  `watch()`-fed mounts) and needs to wipe it before redrawing a DIFFERENT session's
	 *  history from scratch. `sync()` (above) is for a caller with a `history()` function;
	 *  this is the same first half, with no second half for a caller that has none. */
	reset(){ this.$thread?.reset(); }

	/** An assistant's reply while it is STILL being written — the whole text so far,
	 *  redrawn each call (`ext/Session/Session.js`'s `stream()`, dictation-stream,
	 *  2026-09-30, merged into this widget round 4). A fixed, made-up `at`
	 *  (`"stream:" + who`) means every call for the SAME speaker updates one bubble in
	 *  place (`Thread.draw()`'s own `fix: true` rule) instead of adding a new one per
	 *  token. Simpler than `Chat.js`'s own `stream()`, which removes this live bubble
	 *  the instant the real, settled line lands — here the two sit briefly side by
	 *  side instead (`readme.md` names this as the accepted gap; `text: ""`, the "the
	 *  stream just ended" signal, is a no-op rather than a removal for the same
	 *  reason). Missing this method entirely was a crash waiting to happen: `rail.js`'s
	 *  `watch_session()` already calls `panel?.stream(...)` on every SSE token once
	 *  `ext/Session`'s own live wire is merged in, and `panel?.stream(...)` throws
	 *  (not a silent no-op) the moment `panel` exists but has no `stream` of its own. */
	stream(who, text){
		if (!text) return;
		this.$thread?.draw({ chat: { at: "stream:" + who, from: { kind: "assistant", id: who }, text, fix: true } });
	}

	/** Whether the mic is live right now — `panel.compose.mic.active()`'s replacement for
	 *  a caller that used to reach into `ChatPanel`'s own composer (`ext/drawer/rail.js`'s
	 *  `stop_mic()`/`start_mic()`). */
	mic_active(){ return this.dictate?.state === "listening" || this.dictate?.state === "connecting"; }
	start_mic(){ if (!this.mic_active()) this.dictate?.start(); }
	stop_mic(){ if (this.mic_active()) this.dictate?.stop(); }
}

Widget.prototype.level = false;      // a second, bigger level meter beside the mic
Widget.prototype.source = false;     // show the audio-source (mic) picker
Widget.prototype.debug = false;      // show the collapsed "Debug ▾" bar
Widget.prototype.revision = false;   // "clean" | "edit" | "summary" | false — Dictate's own `revise`
Widget.prototype.models = false;     // show the model picker above the thread
Widget.prototype.history = null;     // () => past lines, drawn once on mount — see class doc
Widget.prototype.deliver = null;     // async (entry) => ok — see class doc
Widget.prototype.on_text = null;     // (text) => … — fires the moment a sentence is ready, before `deliver`
Widget.prototype.answer = null;      // (choice) => … — a choice-button question's pick (`say({type:"ask",...})`)
Widget.prototype.marks = false;      // show a ✓/`?` beside each of the OWNER'S OWN bubbles (`ux/Understand`)

/** **The thread** — one bubble per line: the owner's own and, once a caller's `deliver`
 *  calls `say()`, the assistant's reply beside it in a second look. An empty-state line
 *  until the first one lands. Override this whole class for a different shape without
 *  touching `Composer` or `Debug` at all. The live, still-moving guess is NOT drawn here —
 *  see `Widget`'s own class doc for why it's `Dictate`'s own caption, inside `Composer`,
 *  instead. */
Widget.Thread = class WidgetThread extends View {
	render(){
		this.ac("ux-dictate-widget-thread flex v gap");
		this.widget.$thread = this;
		this.lines = new Map();   // at -> {$bubble, $text}
		this.$empty = div.c("ux-dictate-widget-empty muted", "Say something — it shows up here as its own bubble.");
		this.$bubbles = div.c("ux-dictate-widget-bubbles flex v gap");
	}

	/** `{chat: {at, from, text, via, fix}}` — `fix: true` updates the line already drawn
	 *  for that `at` (a streamed reply growing in place); otherwise a new bubble. `at` is
	 *  made up when a caller never gave one (`Widget.submit()`'s own local echo). Or
	 *  `{type: "ask", heading, text, choices, at}` — a choice-button question (below). */
	draw(entry){
		if (entry?.type === "ask") return this.draw_ask(entry);
		const chat = entry?.chat;
		if (!chat?.text) return;
		this.$empty.hide();
		const at = chat.at ?? new Date().toISOString();
		const assistant = chat.from?.kind === "assistant";
		const existing = chat.fix && this.lines.get(at);
		// MARKDOWN IN REPLIES (minion-polish, item 4, 2026-09-30 — the owner: a reply
		// showed raw backticks around a path instead of `code`). `md_into` is the
		// exact function `ext/Chat`'s own bubbles already render with (`Chat.js`'s
		// `para()`) — reused here, not rebuilt, so a link, a bold word or a `path`
		// reads the same everywhere the site shows a chat line. `inline: true`: a
		// bubble is one short line, never a wrapped paragraph block.
		if (existing){ md_into(existing.$text.el, chat.text, true); return; }

		let $bubble, $text;
		this.$bubbles.append(() => {
			$bubble = div.c("ux-dictate-widget-bubble card pad" + (assistant ? " ux-dictate-widget-bubble-assistant" : ""), () => {
				// ICONS ON THE BUBBLES (minion-polish, item 5, 2026-09-30 — the owner:
				// the bubbles "used to have icons"). `who_label` is `ext/Chat/roles.js`'s
				// own small round avatar (reused whole, not rebuilt — CLAUDE.md law 6):
				// 👤 for the owner's own words, 💬 for a reply, floated at the bubble's
				// own start so the text begins on the same line beside it (`Widget.css`'s
				// matching float rule, copied from `ext/Chat/Chat.css`'s identical one).
				who_label(chat.from?.id ?? (assistant ? "assistant" : "owner"));
				$text = span();
				md_into($text.el, chat.text, true);
			});
		});
		this.lines.set(at, { $bubble, $text });
		this.$bubbles.el.scrollTop = this.$bubbles.el.scrollHeight;
		// THE CHAT HITL MARK (`widget.marks`, restored round 4) — only for the OWNER'S
		// OWN line, same rule `ChatPanel`'s `mark_owner_piece()` used. Asked once, in the
		// background; a small ✓/`?` lands beside the text whenever the answer comes back,
		// never blocking the bubble from showing at once.
		if (!assistant && this.widget.marks) this.mark(chat.text, $bubble);
	}

	/** A QUESTION FOR YOU — same shape and rule as `ChatPanel`'s own `ask()` (`ext/Chat/
	 *  Chat.js`, out of this task's fence so not imported directly): a heading, the
	 *  question text, one button per choice. A click disables every button, marks the
	 *  pick, and calls `widget.answer(choice)` — the caller's business what a "yes" does. */
	draw_ask(e){
		this.$empty.hide();
		const choices = e.choices?.length ? e.choices : ["Yes", "No"];
		let $q;
		this.$bubbles.append(() => {
			$q = div.c("ux-dictate-widget-bubble card pad ux-dictate-widget-bubble-assistant ux-dictate-widget-ask", () => {
				if (e.heading) div.c("ux-dictate-widget-ask-heading", e.heading);
				if (e.text) span(e.text);
				div.c("ux-dictate-widget-choices flex wrap gap", () => {
					choices.forEach(c => button.c("ux-dictate-widget-choice").attr("type", "button").text(c).click(() => {
						if ($q.el.classList.contains("answered")) return;
						$q.ac("answered");
						[...$q.el.querySelectorAll(".ux-dictate-widget-choice")].forEach(b => {
							b.disabled = true;
							if (b.textContent === c) b.classList.add("picked");
						});
						this.widget.answer?.(c);
					}));
				});
			});
		});
		this.$bubbles.el.scrollTop = this.$bubbles.el.scrollHeight;
	}

	/** `ux/Understand`'s own `marks()`, reused, never rebuilt here — asks once, adds a
	 *  small ✓ (`ok`) or `?` (`unclear`) right after the bubble's own text. Deliberately
	 *  simpler than `ChatPanel`'s version: no clarify-card loop-back
	 *  (`ux/Content/Decision`) — this widget's thread has no seam for a `place` card yet,
	 *  and nothing in this task's proof needs one; `readme.md` names this as the open
	 *  gap a caller wanting the full loop-back would need to add. */
	mark(text, $bubble){
		fetch_marks([text]).then(out => {
			const m = out?.marks?.[0];
			if (!m) return;
			$bubble.append(() => span.c("ux-dictate-widget-mark muted", m.mark === "unclear" ? " ?" : " ✓").attr("title", m.purpose ?? ""));
		}).catch(() => {});
	}

	mark_failed(at){
		const line = this.lines.get(at);
		if (!line) return;
		line.$bubble.append(() => span.c("muted ux-dictate-widget-failed", " — not sent"));
	}

	retag(old_at, new_at){
		const line = this.lines.get(old_at);
		if (!line || old_at === new_at) return;
		this.lines.delete(old_at);
		this.lines.set(new_at, line);
	}

	// Still the shape `Dictate`'s own `on_text`/`on_revised` call with just a string —
	// `Widget.submit()` is the normal path now (it also fires `on_text`/`deliver`), but
	// this stays as the plain local-only add a caller with none of the new hooks gets.
	add(text){ this.draw({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text } }); }

	reset(){
		this.lines = new Map();
		this.$bubbles.empty();
		this.$empty.show();
	}
};

/** **The composer** — the sheet's own bottom row: a typed box ("say something"), the mic
 *  button, Send. `mode: "open"` — the live open mic: nothing is ever written into the typed
 *  box (that box is typing's own, never the mic's), every finished sentence reaches
 *  `on_text` instead, which becomes a bubble. Typing and Send work the same way, for a
 *  reader who would rather not talk. */
Widget.Composer = class WidgetComposer extends View {
	render(){
		this.ac("ux-dictate-widget-composer flex gap v-center");
		const w = this.widget;

		this.$input = input.c("ux-dictate-widget-input").attr("type", "text")
			.attr("placeholder", w.placeholder || "say something")
			.on("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); this.send(); } });

		w.dictate = new Dictate({
			mode: "open",
			revise: w.revision || false,
			on_text: text => w.submit(text, "voice"),
			on_revised: text => w.submit(text, "voice"),
			on_meter: w.level ? level => this.set_level(level) : undefined,
		});

		if (w.level) this.meter();
		if (w.source) this.source_picker();

		this.$send = button.c("ux-dictate-widget-send", "Send").attr("type", "button")
			.click(() => this.send());

		// Same debug flag as the "Debug ▾" bar — no mic, no whisper, a scripted growing
		// guess then a settle, through `Dictate`'s OWN `partial_text`/`draw_caption()`/
		// `commit()` (the exact methods a real segment calls), so "does this widget
		// actually transcribe" can be shown on a machine with no mic and no whisper-server
		// — the playground's own `run_sample()` does the same thing, one level down.
		if (w.debug) this.$sample = button.c("ux-dictate-widget-sample", "▶ Sample").attr("type", "button")
			.attr("title", "a scripted line, no mic needed — proves the bubble + live-guess pipeline")
			.click(() => this.sample());
	}

	send(){
		const text = this.$input.el.value.trim();
		if (!text) return;
		this.widget.submit(text, "typed");
		this.$input.el.value = "";
	}

	// ⚠ Grows the guess through `partial_text`/`draw_caption()` (real `Dictate` fields and
	// methods — the same ones a live resend calls) but SETTLES through `Dictate`'s OWN
	// `sample()`, never `commit()` directly: `commit()` always posts to the real prompt log,
	// and a scripted demo line must never land there (`Dictate.js`'s own `sample()` doc —
	// "must never land in the real prompt log"). `partial_text` is cleared first so the old
	// grey guess doesn't linger beside the real settled bubble `sample()` produces.
	async sample(){
		const d = this.widget.dictate;
		const text = "testing one two three";
		const words = text.split(" ");
		for (let n = 1; n <= words.length; n++){
			d.partial_text = words.slice(0, n).join(" ");
			d.draw_caption();
			await new Promise(r => setTimeout(r, 120));
		}
		d.partial_text = "";
		d.draw_caption();
		await new Promise(r => setTimeout(r, 200));
		await d.sample([text]);
	}

	meter(){
		this.$meter = div.c("ux-dictate-widget-meter", () => { this.$meter_fill = div.c("ux-dictate-widget-meter-fill"); });
	}

	set_level(level){ this.$meter_fill?.style("--ux-dictate-widget-level", level.toFixed(3)); }

	// A compact picker of `enumerateDevices()` audio inputs — same remembered key as every
	// `Dictate` on the site (`remember_device`/`remembered_device`), width capped in CSS so
	// a long device name never reopens the "640px dropdown" this is replacing.
	source_picker(){
		let $select;
		$select = select.c("ux-dictate-widget-source").attr("aria-label", "Microphone")
			.on("change", e => this.pick_device($select, e.target.value));
		this.refresh_devices($select);
	}

	async refresh_devices($select){
		if (!navigator.mediaDevices?.enumerateDevices){
			$select.empty(() => { option("no mic list").attr("value", ""); });
			return;
		}
		let devices = [];
		try { devices = await navigator.mediaDevices.enumerateDevices(); }
		catch { /* no permission asked yet — an empty list still renders something honest */ }

		const inputs = devices.filter(d => d.kind === "audioinput");
		const remembered = remembered_device();
		const picked = inputs.find(d => d.deviceId === remembered?.id) ?? inputs[0];

		$select.empty(() => {
			if (!inputs.length){ option("no mic found").attr("value", ""); return; }
			inputs.forEach((d, i) => {
				option(d.label || remembered?.label || `mic ${i + 1}`).attr("value", d.deviceId)
					.attr("selected", d.deviceId === picked?.deviceId ? "" : undefined);
			});
		});
	}

	pick_device($select, id){
		const opt = [...$select.el.options].find(o => o.value === id);
		remember_device(id, opt?.textContent ?? "");
	}
};

/** **The model picker** (`models: true`) — moved here from `ext/drawer/tabs/ai.js`
 *  (round 3). Stored only, same as it always was — "nothing reads it yet". */
Widget.Models = class WidgetModels extends View {
	render(){
		label.c("ux-dictate-widget-models flex v-center")
			.attr("title", "Only stored for now — the provider that reads it comes with harness step 2.")
			.append(() => {
				span.c("muted", "model");
				const $pick = select(() => { MODELS.forEach(m => option(m[0].toUpperCase() + m.slice(1)).attr("value", m)); });
				$pick.el.value = model();
				$pick.on("change", () => model($pick.el.value));
			});
	}
};

/** **The debug bar** — one small "Debug ▾" toggle, below the card, collapsed by default.
 *  Opening it mounts [`ux/Dictate/playground`](/framework/ux/Dictate/playground/)'s own
 *  widget (`pg.widget()`) right there: its raw/clean toggle, Chunks, Corrections, Live and
 *  Side-by-side tabs, drawn once, on the first open, and left alone after that — this class
 *  reuses those views wholesale rather than rebuilding a second copy of them. Because `pg`
 *  is one shared singleton pipeline, a sentence said into this SAME page's `Composer` above
 *  also shows up in the debug panel's own session (the playground's own doc has the
 *  details). Never built on the ✦ sheet — `debug` stays `false` there. */
Widget.Debug = class WidgetDebug extends View {
	render(){
		this.ac("ux-dictate-widget-debug");
		this.$toggle = button.c("ux-dictate-widget-debug-toggle", "Debug ▾").attr("type", "button")
			.attr("aria-expanded", "false")
			.attr("title", "Raw vs clean, Chunks, Corrections, Live, Side by side — the playground's own tabs")
			.click(() => this.toggle());
		this.$panel = div.c("ux-dictate-widget-debug-panel");
		this.$panel.el.hidden = true;
	}

	toggle(){
		const open = this.$panel.el.hidden;
		this.$panel.el.hidden = !open;
		this.$toggle.attr("aria-expanded", String(open)).text(open ? "Debug ▴" : "Debug ▾");
		if (open && !this.built){
			this.built = true;
			this.$panel.append(() => { pg.widget(); });
		}
	}
};
