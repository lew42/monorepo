// ChatList.js — the simplest live view of a session's real chat list, `session.messages` (core/Session/Chat/readme.md): one bubble per
// message, in the list's order. It reads ONLY the list lines ({"messages":…}, {"sentences":…}), never V1's {chat} lines, and redraws
// from the Session's own "delta" events, so a message added or grown in the file shows here without a reload (ext/JSONL live()).
// Chat V3 (../v3/) is the designed view; this one is the proof that the list alone is enough to draw the chat.
import View, { div } from "/framework/core/View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import Session from "/framework/core/Session/Session.js";
import Message from "/framework/core/Session/Chat/Message.js";
import Prompt from "/framework/core/Session/Chat/Prompt.js";
import Reply from "/framework/core/Session/Chat/Reply.js";
import { md_into } from "../md.js";
View.stylesheet(import.meta, "ChatList.css");

export default class ChatList extends JSONL {
	session = new Session();
	els = new Map();          // message -> its bubble element
	dirty = new Set();        // messages changed since the last draw

	// { url: the session.jsonl url, $box: the View to draw into }
	read(entries){
		if (!this.listening){ this.listening = true; this.session.on("delta", (line, from) => { if (from instanceof Message) this.dirty.add(from); }); }
		for (const line of entries) if (line && typeof line === "object" && (line.messages || line.sentences || line.session)) this.session.replay_line(line);
		this.draw();
		return this;
	}
	live(){ super.live(() => {}); return this; }
	reset(){ this.session = new Session(); this.els.clear(); this.dirty.clear(); this.listening = false; this.$box?.el.replaceChildren(); return super.reset?.() ?? this; }

	// Every message in list order: a new one gets a bubble at its place, a changed one is refilled. Positions never change.
	draw(){
		const box = this.$box?.el;
		if (!box) return;
		const list = this.session._messages?.messages ?? [];
		box.querySelector(":scope > .chatlist-empty")?.remove();
		if (!list.length){ box.append(Object.assign(document.createElement("div"), { className: "chatlist-empty", textContent: "No messages in this session's chat list yet." })); return; }
		let prev = null;
		for (const m of list){
			let el = this.els.get(m);
			if (!el){ el = document.createElement("div"); this.els.set(m, el); this.fill(el, m); }
			else if (this.dirty.has(m)) this.fill(el, m);
			if (el.previousElementSibling !== prev || el.parentNode !== box) prev ? prev.after(el) : box.prepend(el);
			prev = el;
		}
		this.dirty.clear();
	}

	fill(el, m){
		const kind = m instanceof Prompt ? "prompt" : m instanceof Reply ? "reply" : "note";
		el.className = `chatlist-msg is-${kind}`;
		el.dataset.id = m.id;
		el.replaceChildren();
		const who = document.createElement("div"); who.className = "chatlist-who";
		who.textContent = kind === "prompt" ? "You" : kind === "reply" ? `${m.by} assistant${m.level ? " · " + m.level : ""}` : m.by ?? "note";
		const text = document.createElement("div"); text.className = "chatlist-text md";
		if (kind === "prompt" && m.title) { const t = document.createElement("strong"); t.textContent = m.title; el.append(who, t); } else el.append(who);
		md_into(text, kind === "prompt" ? (m.text || m.said) : m.text);
		el.append(text);
	}
}
