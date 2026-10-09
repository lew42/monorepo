import { chat } from "/framework/ext/Chat/Chat.js";

// The conversation on a session's page: the owner's prompts and the AI's text replies, drawn by `ext/Chat`
// (the one chat renderer: bubbles, smart scroll, one draw per line). This class only turns raw transcript lines into chat entries.
// Tool calls are not shown one by one; a run of them between two messages is one quiet update line, "12 tool calls".
// Feed it raw transcript lines with `add(lines)`: the first call draws the history (Chat shows the newest 50, the rest behind "show earlier"), later calls append live.
// Built with `new AISessionConversation()`; put `.view` where it should show (the view is a normal Chat box, `.view` is a View).
export default class AISessionConversation {

	constructor(){
		this.seen = new Set();   // line uuids already read (a re-read must not draw twice)
		this.entries = [];       // what the next sync() draws
		this.count = 0;          // messages drawn so far
		this.talk = chat({ source: () => this.entries });
		this.view = this.talk.view;
	}

	/** Reduce one transcript line to { role, at, text } | { tools: n } | null. */
	static read(l){
		if (l.isMeta || l.isSidechain) return null;
		const c = l.message?.content;
		if (l.type === "user"){
			if (l.turnOrigin === "task_notification") return null;
			const text = typeof c === "string" ? c : Array.isArray(c) ? c.filter(b => b?.type === "text").map(b => b.text).join("\n") : "";
			return text.trim() ? { role: "owner", at: l.timestamp, text } : null;
		}
		if (l.type === "assistant" && Array.isArray(c)){
			const text = c.filter(b => b?.type === "text").map(b => b.text).join("\n").trim(), tools = c.filter(b => b?.type === "tool_use").length;
			if (text) return { role: "assistant", at: l.timestamp, text, tools };
			if (tools) return { tools };
		}
		return null;
	}

	/** Draw the new lines (Chat keeps the scroll where the reader left it). Returns how many messages were new. */
	add(lines){
		const out = [];
		let run = 0, run_id = "";
		const flush = () => { if (run) out.push({ type: "update", id: "tools-" + run_id, text: `${run} tool call${run > 1 ? "s" : ""}` }); run = 0; };
		for (const l of lines){
			if (l.uuid){ if (this.seen.has(l.uuid)) continue; this.seen.add(l.uuid); }
			const m = AISessionConversation.read(l); if (!m) continue;
			if (m.tools){ run += m.tools; run_id = l.uuid ?? l.timestamp; }
			if (!m.text) continue;
			flush();
			out.push({ chat: { from: { kind: m.role, id: m.role === "owner" ? "owner" : "assistant" }, text: m.text, at: m.at } });
			if (m.tools){ run = m.tools; run_id = l.uuid ?? l.timestamp; }
		}
		flush();
		const talk = out.filter(e => e.chat);
		if (!talk.length && !out.length) return 0;
		this.entries = out;   // Chat shows the newest 50 and keeps the rest behind "show earlier"
		this.count += talk.length;
		this.talk.sync();
		return talk.length;
	}

	/** A card the AI posted to this session (a `page_add` item in the session's page.jsonl: title, text, href): one bubble, drawn at its time. */
	add_card(c){
		if (this.seen.has("card:" + c.id)) return;
		this.seen.add("card:" + c.id);
		const text = `**${c.href ? `[${c.title}](${c.href})` : c.title}**` + (c.text ? "\n\n" + c.text : "");
		this.entries = [{ chat: { from: { kind: "assistant", id: c.by ?? "card" }, text, at: c.ts ?? new Date().toISOString(), session: "card-" + c.id } }];
		this.talk.sync();
	}
}
