// AISessionCost.mjs: THE cost counter. One raw Claude session log in, one dollar total out, the same total however it is read.
// Node only. Rule and numbers: doc/cost-accounting.md.
//
// The raw log (`~/.claude/projects/<project>/<session>.jsonl`, plus `<session>/subagents/*.jsonl`) is the only truth. One API message is
// written as several lines (one per content block), each repeating the message's `usage`, and an early line can carry a partial output
// count. So a message counts ONCE, keyed by `message.id`, and each token field is the LARGEST value any line of that id carries (AISession.merge_usage: early lines hold
// a partial output count, and the SDK replays old messages with zeroed usage). The count lives in a Map of every id seen (never a
// bounded ring), so feeding the same lines again, in full, as a tail or in any order, merges entries with themselves and the total
// cannot move. The total is always summed from the Map; there is no running number to drift.
import fs from "node:fs";
import path from "node:path";
import AISession from "./AISession.js";

export default class AISessionCost {

	/** `part` is "main" or a subagent file name; one Map per part so the same id in two files counts in each (each file is billed on its own). */
	constructor(){ this.parts = new Map(); this.unknown_models = new Set(); }

	/** Feed complete log lines. Safe to call again with lines already fed. Returns the number of usage lines read. */
	feed(text, part = "main"){
		const map = this.parts.get(part) ?? this.parts.set(part, new Map()).get(part);
		let n = 0;
		for (const line of text.split("\n")){
			if (line.charCodeAt(0) !== 123) continue;       // not "{": blank or torn
			let o; try { o = JSON.parse(line); } catch { continue; }
			const m = o.message, u = m?.usage;
			if (o.type !== "assistant" || !u || m.model === "<synthetic>") continue;
			const cw5 = u.cache_creation?.ephemeral_5m_input_tokens, cw1 = u.cache_creation?.ephemeral_1h_input_tokens, split = cw5 != null || cw1 != null;
			const id = m.id || o.uuid, e = {                // no split reported: price the writes as 1-hour (what this machine uses)
				model: String(m.model || "unknown").replace(/-\d{8}$/, ""),
				input: u.input_tokens || 0, output: u.output_tokens || 0, cread: u.cache_read_input_tokens || 0,
				w5: split ? (cw5 || 0) : 0, w1: split ? (cw1 || 0) : (u.cache_creation_input_tokens || 0),
			};
			map.set(id, map.has(id) ? AISession.merge_usage(map.get(id), e) : e);
			n++;
		}
		return n;
	}

	/** Dollars of one counted message. */
	usd_of(e){
		const p = AISession.price_for(e.model, this.unknown_models);
		return (e.input * p.in + e.output * p.out + e.cread * p.cache_read + e.w5 * p.cache_write_5m + e.w1 * p.cache_write_1h) / 1e6;
	}

	get messages(){ let n = 0; for (const map of this.parts.values()) n += map.size; return n; }
	get total_usd(){ let t = 0; for (const map of this.parts.values()) for (const e of map.values()) t += this.usd_of(e); return t; }

	/** The log files of one session: its main transcript and the in-process subagent files beside it. */
	static files(main){
		const out = [{ part: "main", path: main }], dir = path.join(path.dirname(main), path.basename(main, ".jsonl"), "subagents");
		try { for (const f of fs.readdirSync(dir)) if (f.endsWith(".jsonl")) out.push({ part: f.slice(0, -6), path: path.join(dir, f) }); } catch {}
		return out;
	}

	/** The total of a session from its main log path. Reads everything, from byte 0, every time. */
	static of(main){
		const c = new AISessionCost();
		for (const f of AISessionCost.files(main)) try { c.feed(fs.readFileSync(f.path, "utf8"), f.part); } catch {}
		return { total_usd: c.total_usd, messages: c.messages, unknown_models: [...c.unknown_models] };
	}
}
