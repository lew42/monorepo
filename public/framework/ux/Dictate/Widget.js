import { View, div, span, button, select, option, label, textarea, details, summary, strong, icon } from "../../core/View/View.js";
import MicIndicator from "./MicIndicator.js";
import Dictate, { remember_device, remembered_device } from "./Dictate.js";
import { pg } from "./playground/Playground.js";
import { marks as fetch_marks } from "../Understand/Understand.js";
import { md_into } from "../../ext/Chat/md.js";
import { who_label } from "../../ext/Chat/roles.js";
import { speak, patch_piece, retag_piece, split_bubble, sticky_scroll, mergeable, answered_below, GUESS_TITLE } from "../../ext/Chat/Chat.js";
import { clock } from "../../ext/Session/Session.js";
import { composer } from "../../ext/Chat/Composer.js";
import TaskView from "../../core/Task/TaskView.js";

View.stylesheet(import.meta, "Widget.css");

/** The model the reader picked, shared with ext/drawer/tabs/ai.js (see doc/widget-notes.md#model-picker-origin). */
export const MODELS = ["haiku", "sonnet", "opus", "fable"];
const MODEL_KEY = "lew42-drawer-model";
export function model(value){
	try {
		if (value) localStorage.setItem(MODEL_KEY, value);
		return localStorage.getItem(MODEL_KEY) || "sonnet";
	} catch { return value || "sonnet"; }
}

/** One dictation widget for every surface, configured by options (see doc/widget-notes.md#widget-options-and-parts). */
// A mode is a named row, never a second code path (see doc/widget-notes.md#mode-presets).
const MODES = {
	dictate: { bubble: true },   // in place (the owner, 2026-10-17): words grow in the chat bubble; the gear's "into: box" still wins
	live: { into: "chat", bubble: true },
};

export default class Widget extends View {

	render(){
		this.ac("ux-dictate-widget flex v gap");
		// an unknown mode falls back to "dictate" instead of throwing
		const preset = this.constructor.MODES[this.mode] ?? this.constructor.MODES.dictate;
		this.mic_preset = preset;
		this.join = preset.join !== false;
		const Thread = this.v1 ? this.constructor.ThreadV1 : this.constructor.Thread;
		const Composer = this.v1 ? this.constructor.ComposerV1 : this.constructor.Composer;
		// the new composer is a sibling of the feed card, not a child (see doc/widget-notes.md#the-shell)
		div.c("ux-dictate-widget-shell flex v", () => {
			div.c("ux-dictate-widget-card card pad flex v gap", () => {
				if (this.models) new this.constructor.Models({ widget: this });
				// pulse needs a wrapper outside the scrolling thread (see doc/widget-notes.md#pulse-wrapper)
				if (this.pulse) div.c("ux-dictate-widget-feed-wrap", () => {
					new Thread({ widget: this });
					new this.constructor.Pulse({ widget: this });
				});
				else new Thread({ widget: this });
				if (this.v1) new Composer({ widget: this });
			});
			if (!this.v1) new Composer({ widget: this });
		});
		if (this.debug) new this.constructor.Debug({ widget: this });

		if (typeof this.history === "function")
			(this.history() ?? []).forEach(chat => this.$thread?.draw({ chat, history: true }));

		// headless-test seam: the last widget built wins
		globalThis.$dictate_widget = this;
	}

	// every sentence routes through the widget (see doc/widget-notes.md#submit-routing)
	submit(text, via){
		this.on_text?.(text);
		const at = new Date().toISOString();
		this.$thread?.settle_draft?.();
		this.$thread?.draw({ chat: { at, from: { kind: "owner" }, via, text } });
		if (typeof this.deliver !== "function") return;
		// `at` rides along so a caller can retag() the bubble (see doc/widget-notes.md#retag-after-deliver)
		const entry = { text, via, at };
		Promise.resolve(this.deliver(entry)).then(ok => { if (!ok) this.$thread?.mark_failed(at); });
	}

	/** Dictated words just left the draft to be sent (ComposerMic.take_out): the settled piece takes the draft's exact spot in this
	 * same step, so nothing vanishes while the send waits (doc/flicker.md). The send arrives later at submit_entry() with the same `at`. */
	show_out({ text, at }){
		this.$thread?.settle_draft?.();
		this.$thread?.draw({ chat: { at, from: { kind: "owner" }, text, via: "whisper" } });
	}

	/** The new composer's deliver; entry is {text, via, at?, raw?, level?}; returns true/false (or a promise). */
	submit_entry(entry){
		const at = entry.at ?? new Date().toISOString();
		// Drawn already by show_out() (a refined text patches that piece in place), or a typed line, which leaves the dictation draft alone:
		// settling here dropped whatever draft was live when a slow send landed, i.e. the next sentence being said (doc/flicker.md).
		this.$thread?.draw({ chat: { at, from: { kind: "owner" }, text: entry.text, via: entry.via } });
		if (typeof this.deliver !== "function") return true;
		const full = { ...entry, at };
		return Promise.resolve(this.deliver(full)).then(ok => { if (!ok) this.$thread?.mark_failed(at); return ok; });
	}

	/** Rekey a bubble drawn under a local `at` to the real one a server answered with. */
	retag(old_at, new_at){ this.$thread?.retag(old_at, new_at); }

	/** A line from elsewhere, {chat:{at, from:{kind}, text, via, fix}}; fix:true updates that bubble in place. */
	say(entry){ this.$thread?.draw(entry); }

	/** Redraw the thread from history() after the thread changed under it. */
	sync(){
		if (typeof this.history !== "function") return;
		this.$thread?.reset();
		(this.history() ?? []).forEach(chat => this.$thread?.draw({ chat }));
	}

	/** Clear the thread, drawing nothing back. */
	reset(){ this.$thread?.reset(); }

	/** A reply still being written: one bubble per speaker, redrawn whole, kept out of speak() merging (see doc/widget-notes.md#streaming-replies). */
	stream(who, text){
		if (!text) return void this.$thread?.end_stream?.("stream:" + who);   // the reply's text ended: no blinking cursor left behind
		this.$thread?.draw({ chat: { at: "stream:" + who, from: { kind: "assistant", id: who }, text, fix: true } });
	}

	mic_active(){ return this.dictate?.state === "listening" || this.dictate?.state === "connecting"; }
	start_mic(){ if (!this.mic_active()) this.dictate?.start(); }
	stop_mic(){ if (this.mic_active()) this.dictate?.stop(); }
}

Widget.prototype.level = false;
Widget.prototype.source = false;
Widget.prototype.debug = false;
Widget.prototype.revision = false;   // "clean" | "edit" | "summary" | false — Dictate's own `revise`
Widget.prototype.models = false;
Widget.prototype.pulse = false;
Widget.prototype.history = null;
Widget.prototype.deliver = null;
Widget.prototype.on_text = null;
Widget.prototype.answer = null;
Widget.prototype.marks = false;
Widget.prototype.v1 = false;         // true = the OLD thread (one bubble per sentence) + composer (Dictate's own open mic)
Widget.prototype.mode = "dictate";
Widget.MODES = MODES;
Widget.HISTORY = 50;   // the sheet draws only this many newest chat lines of a long session; the rest wait behind "show earlier (N)" (doc/voice-assistant.md#nothing-jumps)
Widget.STREAM_END_MS = 15000;   // an ended stream bubble with no settled line after this long goes (the reply was dropped or became a reaction)

/** The old thread (v1: true): one bubble per line, never merged. */
Widget.ThreadV1 = class WidgetThreadV1 extends View {
	render(){
		this.ac("ux-dictate-widget-thread flex v gap");
		this.widget.$thread = this;
		this.lines = new Map();   // at -> {$bubble, $text}
		this.$empty = div.c("ux-dictate-widget-empty muted", "Say something — it shows up here as its own bubble.");
		this.$bubbles = div.c("ux-dictate-widget-bubbles flex v gap");
		this.scroll = sticky_scroll(this.el);
	}

	/** {chat:{at, from, text, via, fix}} (fix:true updates in place) or {type:"ask", heading, text, choices, at}. */
	draw(entry){
		if (entry?.type === "ask") return this.draw_ask(entry);
		const chat = entry?.chat;
		if (!chat?.text) return;
		this.$empty.hide();
		const at = chat.at ?? new Date().toISOString();
		const assistant = chat.from?.kind === "assistant";
		const existing = chat.fix && this.lines.get(at);
		// md_into is what ext/Chat bubbles use, so a reply renders the same everywhere
		if (existing){ md_into(existing.$text.el, chat.text, true); return; }

		let $bubble, $text;
		this.$bubbles.append(() => {
			$bubble = div.c("ux-dictate-widget-bubble card pad" + (assistant ? " ux-dictate-widget-bubble-assistant" : ""), () => {
				// who_label is the shared avatar from ext/Chat/roles.js
				who_label(chat.from?.id ?? (assistant ? "assistant" : "owner"));
				$text = span();
				md_into($text.el, chat.text, true);
			});
		});
		this.lines.set(at, { $bubble, $text });
		this.scroll.pin();
		// owner lines only, new ones only (a replayed line was marked when it was new: each mark is a paid model call); never blocks the bubble
		if (!assistant && this.widget.marks && !entry.history) this.mark(chat.text, $bubble);
	}

	/** A choice-button question; a click calls widget.answer(choice). */
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
		this.scroll.pin();
	}

	// HITL green checks temporarily removed from V1 (owner, 2026-10-25); may come back later. The yellow ? stays.
	/** Adds a ? after the bubble text from ux/Understand when a line reads unclear; no clarify-card loop-back. */
	mark(text, $bubble){
		fetch_marks([text]).then(out => {
			const m = out?.marks?.[0];
			if (!m || m.mark !== "unclear") return;
			$bubble.append(() => span.c("ux-dictate-widget-mark muted", " ?").attr("title", m.purpose ?? ""));
		}).catch(() => {});   // ignored on purpose: the ? mark is a bonus on a bubble; no mark just means nothing was judged
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

	add(text){ this.draw({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text } }); }

	reset(){
		this.lines = new Map();
		this.$bubbles.empty();
		this.$empty.show();
	}
};

/** The thread: bubbles drawn through ext/Chat speak(), which merges same-sender sentences (see doc/widget-notes.md#the-thread). */
Widget.Thread = class WidgetThread extends View {
	render(){
		this.ac("ux-dictate-widget-thread flex v gap");
		this.widget.$thread = this;
		this.lines = new Map();   // at -> {bubble, text, ref}; bubble is shared once sentences merge (see doc/widget-notes.md#thread-state)
		this.lives = new Map();   // "stream:"+who -> {el, text}, kept out of speak() merging
		this.settled = new Set();     // sentence ids a {place} or {refined} line points at: not raw any more (doc/voice-assistant.md#raw-and-refined)
		this.summaries = new Map();   // card id -> summary text; a view over the card's own lines, nothing is rewritten
		this.$empty = div.c("ux-dictate-widget-empty muted", "Say something, or press the mic. Your words show up here.");
		this.$bubbles = div.c("ux-dictate-widget-bubbles flex v gap");
		// this.el scrolls, not $bubbles (see doc/widget-notes.md#sticky-scroll)
		this.scroll = sticky_scroll(this.el, { observe: false });   // its resize re-pin is skipped: anchor() answers resizes and mutations once per frame
		if (typeof ResizeObserver === "function") new ResizeObserver(() => this.anchor()).observe(this.el);
		if (typeof MutationObserver === "function") new MutationObserver(() => this.anchor()).observe(this.el, { childList: true, subtree: true, characterData: true });   // a live whisper line or a streamed reply grows in place: whatever draws it, the pin follows
	}

	/** Locked = pinned to the bottom after every change, once per animation frame (a replay of 200 lines or 3 caption redraws a second
	 * reads layout once). A reader who scrolled up is never moved. Rule: doc/voice-assistant.md#nothing-jumps */
	anchor(){
		if (this.anchor_frame) return;
		this.anchor_frame = requestAnimationFrame(() => { this.anchor_frame = 0; if (this.scroll.locked()) this.scroll.pin(); });
	}

	/** Lifts live bubbles out while fn runs so mergeable() never takes one for the last real bubble. */
	follow(fn){
		const own = this.draft && !this.draft.host ? this.draft.el : null;   // a draft in its own bubble is not "the last real bubble" either
		own?.remove();
		for (const l of this.lives.values()) l.el.remove();
		const result = fn();
		if (own) this.$bubbles.el.append(own);
		for (const l of this.lives.values()) this.$bubbles.el.append(l.el);
		return result;
	}

	/** Same contract as WidgetThreadV1.draw(); speak() decides merge or new bubble; also takes {para:{re}}. */
	draw(entry){
		if (this.hold_orphan(entry)) return;
		if (entry?.type === "ask") return this.follow(() => this.draw_ask(entry));
		if (entry?.type === "refined") return this.draw_refined(entry);
		if (entry?.task) return this.show_task(entry.task);
		if (entry?.place) return this.place(entry.place);
		if (entry?.summary) return this.summarise(entry.summary);
		if (entry?.sent) return this.sent(entry.sent);
		const para = entry?.para ?? (entry?.type === "para" ? entry : null);
		if (para?.re) return this.split_paragraph(para.re);
		const chat = entry?.chat;
		if (!chat?.text) return;
		this.$empty.hide();
		const at = chat.at ?? new Date().toISOString();
		const assistant = chat.from?.kind === "assistant";

		// a streamed reply is its own live bubble, never a speak() piece (see doc/widget-notes.md#draw-live-bubbles)
		if (chat.fix && String(at).startsWith("stream:")) return this.show_stream(at, chat.from?.id ?? "assistant", chat.text);

		// a settled reply replaces a live bubble from the same sender
		if (assistant) this.drop_live("stream:" + (chat.from?.id ?? "assistant"));

		// ONE bubble piece per `at`: the same line again (the live wire and the poll both carry it) changes nothing,
		// and a line with new text for a known `at` (a `fix`) updates its piece in place, never a second copy
		const known = this.lines.get(at);
		if (known){
			if (known.said !== chat.text && known.bubble){ patch_piece(known.bubble, known.ref.id, { text: chat.text }); known.said = chat.text; this.refresh(); this.anchor(); }
			return;
		}

		const sender = chat.from?.id || chat.from?.kind || (assistant ? "assistant" : "owner");
		const who = chat.from?.id ?? (assistant ? "assistant" : "owner");
		const bubble = this.follow(() => speak(this.$bubbles, {
			cls: assistant ? "chatbox-reply" : "chatbox-you",
			who, text: chat.text, sender, at: chat.said_at ?? at, id: at, via: chat.via,   // ordered by when it was said (doc/notes.md#bubble-order), keyed by its own `at`
			join: this.widget.join, track: !assistant && !entry.history,   // a live owner line shows its fast and smart marks; a replayed one only once a {sent} line names it
			prompt: chat.prompt,   // once a different Prompt starts, the old bubble is closed and never merged into again (review finding 3, 2026-10-25)
		}));
		// the new piece is found by its id: a late line is put in time order, so it is not always the last child
		const text_node = bubble.querySelector(`:scope > [data-re="${CSS.escape(String(at))}"]`) ?? bubble.lastElementChild;
		const ref = { id: at };
		this.lines.set(at, { bubble, text: text_node, ref, said: chat.text, spoken: !assistant && (chat.via === "voice" || chat.via === "whisper") });   // `said`: the raw words, kept when a placement improves the text
		this.apply_sent(at);
		entry.history ? this.refresh_after_batch() : this.refresh();   // a replay of 200 lines walks the lines once, not 200 times
		this.anchor();
		// stored on the piece so it survives a later merge (see doc/widget-notes.md#thread-marks); new lines only: each mark is a paid model call
		if (!assistant && this.widget.marks && !entry.history) this.mark(chat.text, bubble, ref);
	}

	/** Session lines are older than the newest `Widget.HISTORY` chat lines wait here, behind a "show earlier (N)" button; returns
	 * the lines to draw now. `draw(line)` is how a waiting line is drawn later. */
	hold_history(lines, draw){
		let n = 0, cut = 0;
		for (let i = lines.length - 1; i >= 0; i--) if (lines[i]?.chat && ++n > Widget.HISTORY){ cut = i + 1; break; }
		if (!cut) return lines;
		this.waiting = lines.slice(0, cut);
		this.waiting_draw = draw;
		this.show_earlier_button();
		return lines.slice(cut);
	}

	show_earlier_button(){
		const n = this.waiting?.reduce((sum, l) => sum + (l?.chat ? 1 : 0), 0) ?? 0;
		if (!n){ this.$earlier?.remove(); this.$earlier = null; return; }
		if (!this.$earlier){
			this.$earlier = document.createElement("button");
			this.$earlier.type = "button"; this.$earlier.className = "chatbox-earlier";
			this.$earlier.addEventListener("click", () => this.load_earlier());
			this.el.insertBefore(this.$earlier, this.$bubbles.el);
		}
		this.$earlier.textContent = "show earlier (" + n + ")";
	}

	/** A {place}, {refined} or {para} line whose sentence is still behind "show earlier" is held by that sentence's `at` and drawn
	 * right after it in load_earlier(), so a placement in the shown part is never lost (doc/voice-assistant.md#nothing-jumps). */
	hold_orphan(entry){
		if (!this.waiting?.length) return false;
		const re = entry?.place?.re ?? (entry?.type === "refined" ? entry.re : null) ?? (entry?.para ?? (entry?.type === "para" ? entry : null))?.re;
		if (!re || this.lines.has(re) || !this.waiting.some(l => l?.chat?.at === re)) return false;
		(this.orphans ??= new Map()).set(re, [...(this.orphans.get(re) ?? []), entry]);
		return true;
	}

	/** Draw the previous chunk ABOVE what is shown, keeping the reader where they were. speak() only merges onto the last bubble, so the
	 * chunk is drawn into an emptied box and the shown bubbles put back after it (the same trick as ext/Chat's load_earlier). */
	load_earlier(){
		const rest = this.waiting ?? [];
		let n = 0, from = 0;
		for (let i = rest.length - 1; i >= 0; i--) if (rest[i]?.chat && ++n >= Widget.HISTORY){ from = i; break; }
		const chunk = rest.slice(from);
		this.waiting = rest.slice(0, from);   // before the draws: hold_orphan() then re-holds only lines for sentences still waiting, never the ones replayed below
		const box = this.el, host = this.$bubbles.el, before = box.scrollHeight - box.scrollTop;
		const shown = [...host.children];
		shown.forEach(c => c.remove());
		for (const line of chunk){
			this.waiting_draw(line);
			const re = line?.chat?.at, held = re && this.orphans?.get(re);
			if (held){ this.orphans.delete(re); held.forEach(l => this.draw(l)); }
		}
		host.append(...shown);   // moves a draft or live bubble that follow() re-added back to its place
		this.show_earlier_button();
		box.scrollTop = box.scrollHeight - before;
	}

	/** refresh() once, when the synchronous batch that is drawing history lines has ended. */
	refresh_after_batch(){
		if (this.refresh_queued) return;
		this.refresh_queued = true;
		queueMicrotask(() => { this.refresh_queued = false; this.refresh(); });
	}

	/** Re-apply the two views over the lines (a redraw of a bubble rebuilds its nodes): raw look, and folded cards. Idempotent. */
	refresh(){
		const d = this.draft;   // a redraw of the draft's host bubble (Chat.js fill) puts the pieces after the draft: it goes back to the end
		if (d?.host && d.host.lastElementChild !== d.el) d.host.append(d.el);
		for (const [at, line] of this.lines){
			const node = line.bubble?.querySelector(`:scope > [data-re="${CSS.escape(String(at))}"]`);
			node?.classList.toggle("ux-dictate-raw", !!line.spoken && !this.settled.has(at));
		}
		for (const card of this.summaries.keys()) this.fold(card);
	}

	/** {summary:{card, text}} from the voice assistant: the card shows `text` and folds its own lines under it (doc/voice-assistant.md#raw-and-refined). */
	summarise({ card, text } = {}){
		if (!card || !text) return false;
		this.summaries.set(card, String(text));
		this.fold(card);
		this.anchor();
		return true;
	}

	/** The card's summary box with an "N raw lines" toggle; needs two or more lines, else the card is left as it is. */
	fold(card){
		const b = this.lines.get(card)?.bubble;
		if (!b) return;
		const n = b.querySelectorAll(":scope > [data-re]").length;
		let box = b.querySelector(":scope > .ux-dictate-summary");
		if (n < 2){ box?.remove(); b.classList.remove("ux-dictate-swallowed", "open"); return; }
		if (!box){
			box = document.createElement("div");
			box.className = "ux-dictate-summary";
			const t = document.createElement("div");
			t.className = "ux-dictate-summary-text";
			const toggle = document.createElement("button");
			toggle.type = "button";
			toggle.className = "ux-dictate-fold-toggle";
			toggle.addEventListener("click", () => { b.classList.toggle("open"); this.fold_label(b, toggle); });
			box.append(t, toggle);
			b.insertBefore(box, b.querySelector(":scope > [data-re]"));
		}
		b.classList.add("ux-dictate-swallowed");
		box.firstElementChild.textContent = this.summaries.get(card);
		this.fold_label(b, box.lastElementChild);
	}

	fold_label(b, toggle){
		const n = b.querySelectorAll(":scope > [data-re]").length;
		toggle.textContent = `${n} raw lines ${b.classList.contains("open") ? "▾" : "▸"}`;
		toggle.setAttribute("aria-expanded", String(b.classList.contains("open")));
	}

	/** A choice-button question, same as WidgetThreadV1.draw_ask(); called through follow(). */
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
		this.anchor();
	}

	/** A Task or Question from a prompt (ChatV2Model's fold): one row under the owner bubble that opened its Prompt (the end of the chat if that bubble is not drawn), patched in place when its stage or answer changes. */
	show_task(t){
		this.$empty.hide();
		const rows = this.task_rows ??= new Map(), old = rows.get(t.id);
		let node;
		const parent = t.at && this.lines.get(t.at)?.bubble;
		this.$bubbles.append(() => {
			node = div.c("chatbox chatbox-task " + (t.question ? "chatbox-you" : "chatbox-reply"), () => {   // a Question is the owner's own (right, his colour); a Task is the assistant's
				// the state icon IS the avatar: it sits inside the same round frame who_label draws (red ? asked, yellow answered, green complete; a Task shows its checkbox)
				span.c("chatbox-who chatbox-avatar chatbox-who-" + (t.question ? "you" : "assistant"), () => icon(t.question ? "help_outline" : TaskView.STAGE[t.phase] ?? "help").ac("chat-v2-state", "is-" + t.phase)).attr("title", t.phase);
				div.c("chatbox-text", () => {
					span(t.label);
					if (t.answer) div.c("muted", t.answer);
				});
			}).attr("data-id", t.id).el;
		});
		// moved (the owner, 2026-10-25): a Question just gained its answer — its row is already built at the END of
		// $bubbles (the append() above), so dropping the old row in place, rather than replacing it, IS the move.
		// No transition, no animation: a plain removal and the new row sitting where it already landed.
		if (old) t.moved ? old.remove() : old.replaceWith(node);
		else if (parent){   // under its Prompt: after the bubble, its refined block and the rows already put there
			let after = parent;
			while (after.nextElementSibling?.matches(".ux-dictate-widget-refined, .chatbox-task[data-under]")) after = after.nextElementSibling;
			after.insertAdjacentElement("afterend", node);
		}
		if (parent) node.dataset.under = t.at;
		// A Question card replaces the plain bubble it came from: hide that source bubble (view only, the log keeps it).
		// Hiding is idempotent, so a second Question from the same bubble changes nothing.
		if (parent && t.question) parent.style.display = "none";
		rows.set(t.id, node);
		this.anchor();
	}
	static QUESTION_ICON = { open: "help_outline", answered: "mark_chat_unread", complete: "check_box" };

	/** Collapsed <details> after the owner bubble `re` for a {refined} line; skipped if that bubble is not drawn. */
	draw_refined(entry){
		const line = this.lines.get(entry.re);
		if (!line?.bubble) return;
		let node;
		this.$bubbles.append(() => {
			node = details.c("ux-dictate-widget-refined muted", () => {
				summary(`refined · $${Number(entry.cost_usd ?? 0).toFixed(4)}`);
				const sections = entry.sections?.length ? entry.sections
					: [{ heading: "", items: (entry.sentences ?? []).map(s => ({ text: s.text, cites: [s.n] })) }];
				sections.forEach(sec => div(() => {
					if (sec.heading) strong(sec.heading);
					(sec.items ?? []).forEach(it => div(`${it.cites?.length ? it.cites.map(c => "S" + c).join(", ") + " — " : ""}${it.text}`));
				}));
			}).el;
		});
		line.bubble.insertAdjacentElement("afterend", node);
		this.settled.add(entry.re);
		this.refresh();
		this.anchor();
	}

	/** A reply still being written: its own bubble in this.lives, redrawn whole on every call. */
	show_stream(key, who, text){
		this.$empty.hide();
		let hit = this.lives.get(key);
		if (hit?.timer){ clearTimeout(hit.timer); hit.timer = null; hit.el.classList.add("chatbox-streaming"); }   // more text after an end: writing again
		if (!hit){
			// same look as a settled reply plus chatbox-streaming (the blinking cursor)
			let node, text_el;
			this.$bubbles.append(() => {
				node = div.c("chatbox chatbox-reply chatbox-streaming", () => {
					who_label(who);
					text_el = div.c("chatbox-text").el;
				}).el;
			});
			this.lives.set(key, hit = { el: node, text: text_el });
		}
		md_into(hit.text, text, true);
		this.anchor();
	}

	/** The owner's words growing in the chat while they talk (doc/voice-assistant.md#the-flow-one-sentence-at-a-time).
	 * In place: the draft is the LAST PIECE of the owner bubble it will join (or its own bubble when none can be joined),
	 * and settle_draft() swaps it for the settled piece in the same step, so the words never move. */
	live({ text = "", settled = text, guess = "" } = {}){
		if (!text) return this.drop_draft();   // sent (the settled piece already took its spot) or cancelled
		this.$empty.hide();
		if (this.draft?.host && answered_below(this.draft.host)) this.drop_draft();   // a reply landed below the bubble this draft grows in: the words go on below the reply, not above it
		let d = this.draft;
		if (!d){
			const host = this.widget.join ? this.follow(() => mergeable(this.$bubbles, "owner", Date.now() + clock.offset)) : null;
			let el, text_el;
			if (host){
				el = document.createElement("div");
				el.className = "ux-dictate-draft-piece";
				text_el = document.createElement("div");
				text_el.className = "chatbox-text";
				el.append(text_el);
				host.append(el);
			} else this.$bubbles.append(() => {
				el = div.c("chatbox chatbox-you chatbox-live chatbox-draft", () => {
					who_label("owner");
					text_el = div.c("chatbox-text").el;
				}).el;
			});
			d = this.draft = { el, text: text_el, host };
		}
		if (d.host && d.host.lastElementChild !== d.el) d.host.append(d.el);   // a redraw of the host (a mark) appended pieces after it
		d.text.textContent = settled;
		if (guess) { const g = span.c("chatbox-guess").text((settled ? " " : "") + guess).el; g.title = GUESS_TITLE; d.text.append(g); }
		this.anchor();
	}

	/** The sentence is being sent: drop the draft so the settled piece lands where it was (its host stays mergeable). */
	settle_draft(){
		const d = this.draft;
		if (!d) return;
		if (d.host) d.host.dataset.at = String(Date.now() + clock.offset);   // still talking: the 10 s merge gap counts from now, not from the last piece
		this.drop_draft();
	}

	drop_draft(){
		this.draft?.el.remove();
		this.draft = null;
	}

	/** One placement from the voice assistant, {re, to, where, edit, text, title} (doc/voice-assistant.md); the latest per sentence wins.
	 * `same` changes nothing; `paragraph` splits the bubble at `re`; `card` does that and marks the bubble a card. Raw words stay in `said`. */
	place({ re, to = "same", where = "beside", edit = "nothing", text, title } = {}){
		const hit = this.lines.get(re);
		if (!hit) return false;
		this.settled.add(re);   // a placed line is no longer raw
		if (text && (edit === "improve" || edit === "both")) patch_piece(hit.bubble, hit.ref.id, { text });
		// a late split (later lines already joined this bubble) would cut a thought in two: keep it where it is (doc/voice-assistant.md#late-placements)
		const lines = hit.bubble?.querySelectorAll(":scope > [data-re]") ?? [];
		if (lines.length && String(lines[lines.length - 1].dataset.re) !== String(re)) to = "same";
		if (to === "paragraph" || to === "card") this.split_paragraph(re);
		if (to === "card"){
			const b = this.lines.get(re).bubble;
			b.classList.add("ux-dictate-placed-card");
			b.dataset.where = where;
			if (title && !b.querySelector(":scope > .ux-dictate-placed-title")){
				const t = document.createElement("div");
				t.className = "ux-dictate-placed-title";
				t.textContent = title;
				b.prepend(t);
			}
		}
		this.refresh();
		this.anchor();
		return true;
	}

	/** The stream said its text ended: stop the cursor; the settled line normally replaces it at once, else it goes after STREAM_END_MS. */
	end_stream(key){
		const hit = this.lives.get(key);
		if (!hit) return;
		hit.el.classList.remove("chatbox-streaming");
		clearTimeout(hit.timer);
		hit.timer = setTimeout(() => this.drop_live(key), Widget.STREAM_END_MS);
	}

	/** Remove a live bubble and clear its fade timer. */
	drop_live(key){
		const hit = this.lives.get(key);
		if (!hit) return;
		clearTimeout(hit.timer);
		hit.el.remove();
		this.lives.delete(key);
	}

	/** ux/Understand mark stored on the piece so it survives redraws; ref follows retag() (see doc/widget-notes.md#thread-marks). */
	mark(text, bubble, ref){
		fetch_marks([text]).then(out => {
			const m = out?.marks?.[0];
			if (!m) return;
			patch_piece(bubble, ref.id, { mark: m });
			this.refresh();
		}).catch(() => {});   // ignored on purpose: the check/? mark is a bonus on a bubble; no mark just means nothing was judged
	}

	/** A {sent:{to, at, re:[line at…], delay_ms}} session line: those owner lines reached the `to` seat ("fast" | "smart"). A line this
	 * thread has not drawn or retagged yet (the stream can beat the POST's answer) waits in `pending_sent` for apply_sent(). */
	sent({ to, at, re = [], delay_ms }){
		for (const r of re){
			(this.pending_sent ??= new Map()).set(r, { ...this.pending_sent.get(r), [to]: { at, delay_ms } });
			this.apply_sent(r);
		}
	}

	apply_sent(at){
		const got = this.pending_sent?.get(at), line = this.lines.get(at);
		if (!got || !line) return;
		this.pending_sent.delete(at);
		line.sent = { ...line.sent, ...got };
		patch_piece(line.bubble, line.ref.id, { sent: line.sent, track: true });
		this.refresh();
	}

	mark_failed(at){
		const line = this.lines.get(at);
		if (!line) return;
		patch_piece(line.bubble, line.ref.id, { failed: true });
		this.refresh();
	}

	/** A send that timed out arrived after all (chat.js, the late echo): take the "not sent" off. */
	mark_sent(at){
		const line = this.lines.get(at);
		if (!line) return;
		patch_piece(line.bubble, line.ref.id, { failed: false });
		this.refresh();
	}

	retag(old_at, new_at){
		const line = this.lines.get(old_at);
		if (!line || old_at === new_at) return;
		this.lines.delete(old_at);
		this.lines.set(new_at, line);
		retag_piece(line.bubble, line.ref.id, new_at);   // so a pending mark()/mark_failed() under the new id still finds the piece
		line.ref.id = new_at;
		this.apply_sent(new_at);
		if (this.settled.delete(old_at)) this.settled.add(new_at);
		if (this.summaries.has(old_at)){ this.summaries.set(new_at, this.summaries.get(old_at)); this.summaries.delete(old_at); }
		this.refresh();
	}

	/** Move paragraph `re` and the ones merged after it into a new bubble, then repoint this.lines (see doc/widget-notes.md#paragraph-split). */
	split_paragraph(re){
		const hit = this.lines.get(re);
		if (!hit) return;
		const old_bubble = hit.bubble;
		const made = this.follow(() => split_bubble(this.$bubbles, old_bubble, re));
		if (!made) return;
		for (const [at, line] of this.lines){
			if (line.bubble !== old_bubble && line.bubble !== made) continue;
			const moved_node = made.querySelector(`[data-re="${at}"]`);
			line.bubble = moved_node ? made : old_bubble;
			line.text = moved_node ?? old_bubble.querySelector(`[data-re="${at}"]`) ?? line.text;
		}
		this.refresh();
		this.anchor();
	}

	add(text){ this.draw({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text } }); }

	reset(){
		this.lines = new Map();
		this.lives = new Map();
		this.settled = new Set();
		this.summaries = new Map();
		this.draft = null;
		this.waiting = null; this.orphans = null; this.show_earlier_button();
		this.$bubbles.empty();
		this.$empty.show();
	}
};

/** Helpers shared by both composers. */
function composer_meter(view){
	view.$meter = div.c("ux-dictate-widget-meter", () => { view.$meter_fill = div.c("ux-dictate-widget-meter-fill"); });
}
// compact audio-input picker; width capped in CSS
function composer_source_picker(){
	let $select;
	$select = select.c("ux-dictate-widget-source").attr("aria-label", "Microphone")
		.on("change", e => composer_pick_device($select, e.target.value));
	composer_refresh_devices($select);
}
async function composer_refresh_devices($select){
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
function composer_pick_device($select, id){
	const opt = [...$select.el.options].find(o => o.value === id);
	remember_device(id, opt?.textContent ?? "");
}

/** The old composer (v1: true): open mic, never writes into the typed box. */
Widget.ComposerV1 = class WidgetComposerV1 extends View {
	render(){
		this.ac("ux-dictate-widget-composer flex v gap");
		const w = this.widget;

		this.$input = textarea.c("ux-dictate-widget-input")
			.attr("placeholder", w.placeholder || "say something")
			.attr("rows", "1")
			.on("input", () => this.autosize())
			.on("keydown", e => { if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); this.send(); } });

		div.c("ux-dictate-widget-controls flex gap v-center wrap", () => {
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

			// scripted sample: no mic or whisper needed
			if (w.debug) this.$sample = button.c("ux-dictate-widget-sample", "▶ Sample").attr("type", "button")
				.attr("title", "a scripted line, no mic needed — proves the bubble + live-guess pipeline")
				.click(() => this.sample());
		});
	}

	autosize(){
		this.$input.el.style.height = "auto";
		this.$input.el.style.height = this.$input.el.scrollHeight + "px";
	}

	send(){
		const text = this.$input.el.value.trim();
		if (!text) return;
		this.widget.submit(text, "typed");
		this.$input.el.value = "";
		this.autosize();
	}

	// settles via Dictate.sample(), never commit(), which would post to the real prompt log
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

	meter(){ composer_meter(this); }

	set_level(level){ this.$meter_fill?.style("--ux-dictate-widget-level", level.toFixed(3)); }

	source_picker(){ composer_source_picker(); }
};

/** The composer from ext/Chat/Composer.js; Whisper writes into the typed box; widget.dictate is the ComposerMic (see doc/widget-notes.md#the-composer). */
Widget.Composer = class WidgetComposer extends View {
	render(){
		this.ac("ux-dictate-widget-composer flex v gap");
		const w = this.widget;
		const view = composer({
			placeholder: w.placeholder || "say something",
			revise: w.revision || false,
			on_text: text => w.on_text?.(text),
			deliver: entry => w.submit_entry(entry),
			on_out: item => w.show_out(item),   // the words are in the chat the moment they leave the draft or the box, before the send
			// pulse and level read the same 0..1 meter
			on_meter: (w.level || w.pulse) ? level => { this.set_level(level); w.$pulse?.set_level(level); } : undefined,
			// mode "live" only: leaving on_live undefined keeps dictation in the box
			on_live: w.mic_preset.bubble ? state => { this.widget.$thread?.live?.(state); window.dispatchEvent(new CustomEvent("chat-live", { detail: state })); } : undefined,   // "chat-live": Chat v3 draws the same unsent words (ext/Chat/v3)
		});
		w.dictate = view.mic;
		if (view.mic) view.mic.wake_session = () => w.session?.();   // chat.js says which voice session this is
		new MicIndicator();   // the one shared "mic is open" indicator
		// the preset lands on this one mic, never the shared SETTINGS
		if (view.mic){
			if ("send_mode" in w.mic_preset) view.mic.send_mode = w.mic_preset.send_mode;
			if ("into" in w.mic_preset) view.mic.into = w.mic_preset.into;
			// pulse needs on_start/on_stop to swap the lock overlay and the dot
			if (w.pulse){
				view.mic.on_start = () => w.$pulse?.locked(false);
				view.mic.on_stop = () => w.$pulse?.locked(true);
			}
		}
		if (w.level) this.meter();
		if (w.source) this.source_picker();
	}

	meter(){ composer_meter(this); }
	set_level(level){ this.$meter_fill?.style("--ux-dictate-widget-level", level.toFixed(3)); }

	source_picker(){ composer_source_picker(); }
};

/** The model picker (models: true); the value is only stored for now. */
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

/** The "Debug" toggle: mounts playground's pg.widget() on first open; never built on the sheet. */
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

/** The pulsing dot (pulse: true): a locked "tap to talk" card, then a dot sized by the voice (see doc/widget-notes.md#the-pulsing-dot). */
Widget.Pulse = class WidgetPulse extends View {
	render(){
		this.ac("ux-dictate-widget-pulse");
		const w = this.widget;
		w.$pulse = this;

		this.$lock = div.c("ux-dictate-widget-pulse-lock").attr("role", "button").attr("tabindex", "0")
			.attr("title", "tap to start listening").text("tap to talk")
			.click(() => w.start_mic())
			.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); w.start_mic(); } });

		this.$dot = div.c("ux-dictate-widget-pulse-dot").attr("role", "button").attr("tabindex", "0")
			.attr("title", "tap to stop listening")
			.click(() => w.stop_mic())
			.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); w.stop_mic(); } });

		// starts locked; w.dictate does not exist yet at this point
		this.locked(true);
	}

	/** Audio level 0..1 written to a CSS variable, so the dot scales with no per-frame layout. */
	set_level(level){ this.$dot.style("--ux-dictate-widget-pulse-level", Math.min(1, level).toFixed(3)); }

	/** true shows the "tap to talk" card and resets the dot's size. */
	locked(is_locked){
		this.$lock.el.hidden = !is_locked;
		this.$dot.el.hidden = is_locked;
		if (is_locked) this.set_level(0);
	}
};
