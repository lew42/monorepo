import { div, small, p, a, span } from "/app.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";

// The conversation on a session's page: the owner's prompts and the AI's text replies, in order.
// Tool calls are not shown one by one; a run of them between two messages is one quiet line, "12 tool calls".
// Feed it raw transcript lines (objects) with `add(lines)`: the first call draws the history, later calls append live.
// Built with `new AISessionConversation($box)`; `$box` is a View captured synchronously (nothing is drawn after an await otherwise).
export default class AISessionConversation {

	static MAX = 200;   // keep the newest messages; a long session would otherwise draw thousands

	constructor($box){
		this.$box = $box;
		this.seen = new Set();     // line uuids already drawn (a re-read must not draw twice)
		this.tools = null;         // { el, n }: the open "N tool calls" line, grown in place
		this.count = 0;
	}

	/** Reduce one transcript line to { role, at, text } | { tools: n } | null. */
	static read(l){
		if (l.isMeta || l.isSidechain) return null;
		const c = l.message?.content;
		if (l.type === "user"){
			if (l.turnOrigin === "task_notification") return null;
			const text = typeof c === "string" ? c : Array.isArray(c) ? c.filter(b => b?.type === "text").map(b => b.text).join("\n") : "";
			return text.trim() ? { role: "user", at: l.timestamp, text } : null;
		}
		if (l.type === "assistant" && Array.isArray(c)){
			const text = c.filter(b => b?.type === "text").map(b => b.text).join("\n").trim(), tools = c.filter(b => b?.type === "tool_use").length;
			if (text) return { role: "assistant", at: l.timestamp, text, tools };
			if (tools) return { tools };
		}
		return null;
	}

	/** Draw the new lines. If the reader was at the bottom of the page, stay there; otherwise leave the scroll alone. */
	add(lines){
		const msgs = [];
		for (const l of lines){
			if (l.uuid){ if (this.seen.has(l.uuid)) continue; this.seen.add(l.uuid); }
			const m = AISessionConversation.read(l); if (m) msgs.push(m);
		}
		if (!msgs.length) return 0;
		const sc = document.scrollingElement, stuck = !sc || sc.scrollHeight - sc.scrollTop - sc.clientHeight < 80;
		this.$box.append(() => msgs.forEach(m => this.draw(m)));
		this.trim();
		if (stuck && sc && this.count > msgs.length) sc.scrollTop = sc.scrollHeight;
		return msgs.length;
	}

	draw(m){
		if (m.tools && !m.text){ this.tool_line(m.tools); return; }
		this.tools = null;
		this.count++;
		div.c("conv-msg conv-" + m.role + " card", () => {
			small.c("muted", (m.role === "user" ? "you" : "AI") + (m.at ? " · " + age(m.at) : ""));
			p(m.text);
			// room for a per-prompt action (the Refine button) later: `.conv-actions`
			if (m.role === "user") div.c("conv-actions");
		});
		if (m.tools) this.tool_line(m.tools);
	}

	tool_line(n){
		if (this.tools){ this.tools.n += n; this.tools.el.textContent = `${this.tools.n} tool calls`; return; }
		const s = small.c("muted conv-tools", `${n} tool calls`);
		this.tools = { el: s.el, n };
	}

	trim(){
		const box = this.$box.el;
		while (box.children.length > AISessionConversation.MAX) box.firstElementChild.remove();
	}
}
