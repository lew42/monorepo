import { View, div, span, button } from "/app.js";
import { chat } from "./Chat.js";
import { composer } from "./Composer.js";
import { watch as watch_session } from "/framework/ext/Session/Session.js";
import { rename_options } from "/framework/ux/Rename/Rename.js";
import { marks } from "/framework/ux/Understand/Understand.js";
import { ChatDrill } from "./Drill.js";

// history and reasons: doc/ChatPanel-notes.md
let panels = 0;

View.stylesheet(import.meta, "Chat.css");

export class ChatPanel extends View {
	render(){
		const local = [];
		this.entries = local;
		this.raw_recent = [];

		if (this.watch) this.stop_watch = watch_session(this.watch, line => {
			if (line.chat || line.react) local.push(line);
			this.sync();
		});

		this.talk = chat({
			source: this.source ? () => [...local, ...this.source()] : () => local,
			keep: this.keep,
			answer: this.answer ?? (() => {}),
			on_select: sel => { this.selected = sel; },
			rename: { options: rename_options, on_renamed: (info, name) => this.deliver_rename(info, name) },
			marks: this.marks ? marks : undefined,
			on_unclear: (c, m) => this.handle_unclear(c, m),
			// see doc/drill.md
			on_open: this.drill === false ? undefined : card => this.drilled.open(card),
			on_reply: this.threads || !this.source ? target => this.reply_to_set(target) : undefined,
			on_react: this.react ? r => this.react(r)
				: this.source ? undefined
				: r => { local.push({ react: { ...r, from: { kind: "owner" } } }); },
		});
		if (this.drill !== false) this.drilled = new ChatDrill({ panel: this, session: this.session ?? this.watch ?? "panel-" + (++panels) });

		// "Replying to …" — shown above the box while a Reply is pending; × cancels it.
		this.$replying = div.c("chatbox-replying", () => {
			span.c("chatbox-replying-text");
			button.c("chatbox-replying-x").attr("type", "button").attr("title", "cancel the reply").text("×").click(() => this.reply_to_set(null));
		});
		this.$replying.el.hidden = true;

		const deliver = this.deliver ?? (async entry => {
			this.say({ chat: { at: entry.at ?? new Date().toISOString(), from: { kind: "owner" }, via: entry.via, text: entry.text,
				...(entry.thread ? { re: entry.thread, thread: true } : {}) } });
			return true;
		});
		this.compose = composer({
			deliver: entry => {
				if (this.reply_to){ entry.thread = this.reply_to.re; this.reply_to_set(null); }
				return deliver(entry);
			},
			re: this.re,
			mic: this.mic,
			autostart: this.autostart,
			max: this.max,
			placeholder: this.placeholder ?? "say something",
			hint: this.hint ?? "",
			sent: this.sent ?? "sent",
			failed: this.failed ?? "nothing was sent",
			on_text: text => this.on_text?.(text),
			revise: this.revise === undefined ? "clean" : this.revise,
			on_live: state => this.talk.live(state),
			on_revised: (text, meta) => this.handle_revision(text, meta.raw, meta.level),
			try_command: text => /^rename this[.!]?$/i.test(text) && this.talk.rename_selected(),
		});

		this.sync();
	}

	/** Start/cancel a threaded reply. */
	reply_to_set(target){
		this.reply_to = target;
		this.$replying.el.hidden = !target;
		if (target) this.$replying.el.querySelector(".chatbox-replying-text").textContent = "↩ Replying to “" + (target.title || "that message") + "”";
		if (target) this.compose?.$input?.el.focus();
	}

	/** Draw whatever is new since the last call — same contract as `chat().sync()`. */
	sync(){ this.talk.sync(); this.drilled?.check(); return this; }

	/** An assistant's reply while it is still being written (`chat().stream()`); `""` removes it. */
	stream(who, text){ this.talk.stream(who, text); return this; }

	/** Add one entry to the panel's OWN list (ignored once a real `source` is given) and draw it.
	 *  A fresh RAW owner line (`{chat: {from: {kind: "owner"}, text, …}}`, no `re` of its own) is
	 *  also remembered — see `handle_revision()` below. */
	say(entry){
		if (entry.chat && entry.chat.from?.kind === "owner" && !entry.chat.re) this.remember_raw(entry.chat);
		this.entries.push(entry);
		return this.sync();
	}

	remember_raw(c){
		this.raw_recent.push({ at: c.at, text: c.text });
		if (this.raw_recent.length > 20) this.raw_recent.shift();
	}

	/** Pair a revised line to its raw version. */
	handle_revision(text, raw, level){
		const hit = [...this.raw_recent].reverse().find(r => r.text === raw && !r.used);
		if (!hit) return;   // no raw line to pair with — never shown as a standalone line either (readme.md)
		hit.used = true;
		this.say({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text, re: hit.at, level } });
	}

	/** Deliver a rename action. */
	async deliver_rename(info, name){
		const at = info.piece?.id ?? new Date().toISOString();
		const entry = { at, type: "prompt", by: "owner", text: name, via: "typed", fix: true };
		if (this.deliver){ try { await this.deliver(entry); } catch (e){ console.error("chat: rename delivery failed", e); } }
		else this.say({ chat: { at, from: { kind: "owner" }, text: name, fix: true } });
	}

	/** Handle an unclear mark. */
	handle_unclear(c, m){
		this.say({ chat: {
			at: new Date().toISOString(),
			from: { kind: "assistant" },
			place: {
				module: "/framework/ux/Content/Decision/Decision.js",
				id: "clarify-" + c.at,
				ask: m.question.ask,
				options: m.question.options.map(say => ({ say })),
				on_chosen: line => {
					if (line.chose?.option == null) return;
					this.talk.resolve_mark(c.at, { mark: "ok", purpose: "Clarified: " + line.chose.option });
				},
			},
		} });
	}
}
ChatPanel.prototype.classes = "chatbox-panel";

export default ChatPanel;
