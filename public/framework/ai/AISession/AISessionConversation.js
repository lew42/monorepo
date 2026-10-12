import { chat } from "/framework/ext/Chat/Chat.js";
import { servex_url } from "/framework/dev/servex_url.js";

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
		this.session = null;     // the session id, set once the page knows it: the Refine button needs it
		this.talk = chat({ source: () => this.entries, on_refine: r => this.refine(r) });
		this.view = this.talk.view;
	}

	/** The Refine button on one of the owner's prompts (asks #7): runs the pipeline on its words. The five stages then
	 *  draw above the chat (`ext/Refine/stages`, written by `/api/refine` through `VoicePage`). The prompt id comes from the
	 *  message's time, so pressing it twice refreshes the same stages instead of piling up copies. Never throws. */
	async refine({ text, at, button }){
		if (!this.session || !text?.trim()) return;
		const was = button.textContent;
		button.disabled = true; button.textContent = "Refining…";
		try {
			const prompt = "t" + (Number(at) || Date.now()).toString(36);
			const res = await fetch(servex_url("/api/refine"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, session: this.session, prompt, source: "vscode" }) });
			const out = await res.json();
			if (!out?.ok) throw new Error(out?.why ?? "Servex answered " + res.status);
			button.textContent = "Refined ✓";
		} catch (e){ button.textContent = "Refine failed: " + String(e?.message ?? e).slice(0, 60); }
		button.disabled = false;
		setTimeout(() => { button.textContent = was; }, 4000);
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
