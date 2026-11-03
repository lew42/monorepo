// ChatList.js — the simplest live view of a session's real chat list, `session.messages` (core/Session/Chat/readme.md): one bubble per
// message, in the list's order. It reads the list lines ({"messages":…}, {"sentences":…}) and {"tasks":…} (so a same-file Ref,
// step 3, can resolve its target), never V1's {chat} lines, and redraws from the Session's own "delta" event, so a message
// added or grown in the file shows here without a reload (ext/JSONL live()).
// Chat V3 (../v3/) is the designed view; this one is the proof that the list alone is enough to draw the chat.
import View, { div } from "/framework/core/View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import Session from "/framework/core/Session/Session.js";
import Message from "/framework/core/Session/Chat/Message.js";
import Prompt from "/framework/core/Session/Chat/Prompt.js";
import Reply from "/framework/core/Session/Chat/Reply.js";
import Ref from "/framework/core/Item/Ref.js";
import { DefaultView } from "/framework/ux/Content/Object/DefaultView.js";
import { md_into } from "../md.js";
View.stylesheet(import.meta, "ChatList.css");

export default class ChatList extends JSONL {
	static LEVELS = { clean: "your words, cleaned up", edit: "your words, edited", summary: "a summary of what you said" };   // Sessions.line's levels
	session = new Session();
	els = new Map();          // message -> its bubble element
	dirty = new Set();        // messages changed since the last draw

	// { url: the session.jsonl url, $box: the View to draw into }
	read(entries){
		if (!this.listening){ this.listening = true; this.session.on("delta", (line, from) => { if (from instanceof Message) this.dirty.add(from); }); }
		for (const line of entries) if (line && typeof line === "object" && (line.messages || line.sentences || line.session || line.tasks)) this.session.replay_line(line);
		this.paint();
		return this;
	}
	live(){ super.live(() => {}); return this; }
	reset(){ this.session = new Session(); this.els.clear(); this.dirty.clear(); this.listening = false; this.$box?.el.replaceChildren(); return super.reset?.() ?? this; }

	// Every message in list order: a new one gets a bubble at its place, a changed one is refilled, and one no
	// longer in the list drops out — the keyed loop is `DefaultView.place()` (ux/Content/Object/DefaultView.js),
	// the same one a bare `view(list)` uses, so there is ONE placement loop, not two (Law 6).
	paint(){
		const box = this.$box?.el;
		if (!box) return;
		const list = this.session._messages?.messages ?? [];
		box.querySelector(":scope > .chatlist-empty")?.remove();
		if (!list.length){ box.append(Object.assign(document.createElement("div"), { className: "chatlist-empty", textContent: "No messages in this session's chat list yet." })); return; }
		DefaultView.place(box, list, this.els, m => this.make(m), (el, m) => this.dirty.has(m) && !(m instanceof Ref) && this.fill(el, m));
		this.dirty.clear();
	}

	// A Ref (a root task or a spawned child session, step 3) is drawn by DefaultView.ref_view() — the target's
	// own state, live, through RefView — never by fill()'s prompt/reply bubble, which has nothing to say about
	// an item it does not hold the data of. `DefaultView.child()` builds the same Ref row, so this branch
	// exists once, not twice.
	make(m){
		if (m instanceof Ref) return DefaultView.ref_view(m, { capture: false }).ac("chatlist-msg", "is-ref").el;
		const el = document.createElement("div");
		this.fill(el, m);
		return el;
	}

	// `m.title`/`m.icon`/`m.content` are Message's own fields (core/Session/Chat/Message.js), so a card — fresh or an upgraded
	// Prompt/Reply/note — draws its title and icon the same way regardless of kind (review finding 1, ask3-cards-by-id): the
	// getters already answer `null`/`""` for a plain message, never the stringified word "undefined".
	fill(el, m){
		const kind = m instanceof Prompt ? "prompt" : m instanceof Reply ? "reply" : "note";
		el.className = `chatlist-msg is-${kind}`;
		el.dataset.id = m.id;
		el.replaceChildren();
		const who = document.createElement("div"); who.className = "chatlist-who";
		who.textContent = kind === "prompt" ? "You" : kind === "reply" ? `${m.by} assistant${m.level ? " · " + (this.constructor.LEVELS[m.level] ?? m.level) : ""}` : m.by ?? "note";
		el.append(who);
		if (m.icon) { const i = document.createElement("span"); i.className = "material-icons icon chatlist-icon"; i.textContent = m.icon; el.append(i); }
		if (m.title) { const t = document.createElement("strong"); t.textContent = m.title; el.append(t); }
		const text = document.createElement("div"); text.className = "chatlist-text md";
		md_into(text, kind === "prompt" ? (m.text || m.cleaned) : m.text);
		el.append(text);
		if (m.content?.length){
			const list = document.createElement("div"); list.className = "chatlist-content";
			for (const c of m.content){
				const line = document.createElement("div"); line.className = "chatlist-content-line";
				line.textContent = c?.get_one?.("title") ?? c?.get_one?.("text") ?? "";
				list.append(line);
			}
			el.append(list);
		}
	}
}
