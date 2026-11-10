import PromptRecords from "../../Server/PromptRecords.mjs";
import Ask from "../../Server/Ask.mjs";
import PromptTasks from "./PromptTasks.js";
import os from "node:os";

/* THE REFINER OF A TURN THAT HAS NO PROMPT PAGE (one-refiner step 4, 2026-11-09). A channel that wrote its words through Ask.write
 * calls TurnRefiner.refine(text, via, re, put) right after: the parts brief (PromptRecords.parts_of, the one refiner) splits the
 * same sentences Ask.split numbered, and a second `refined` line with the same `re` carries the parts as sections whose items cite
 * sentence numbers (1-based), so Session.coverage() counts them. A failure is returned, never thrown; the turn's words already stand.
 * Channels: cloud voice (RemoteMCP.record) and web dictation (Sessions.say) call it. VS Code is refined by Echo + PromptTasks
 * (both write sections). Doc: ext/Refine/doc/prompt-records.md. */
export default class TurnRefiner {

	/** The sections for parts, items citing 1-based sentence numbers (a part's nested details cite too): [{heading, items:[{id, text, cites}]}]. */
	static sections(parts){
		const items = parts.map((x, i) => ({ id: "p" + (i + 1), text: x.text, cites: [...new Set([...(x.cites ?? []), ...(x.parts ?? []).flatMap(d => d.cites ?? [])])].map(n => n + 1) }));
		return items.length ? [{ heading: "", items }] : [];
	}

	/** {ok, parts, usd} or {ok:false, why}. `put(line)` is the channel's own door, as for Ask.write. */
	static async refine(text, via, re, put, { parts_of = PromptRecords.parts_of } = {}){
		try {
			if (PromptTasks.off()) return { ok: true, skipped: "prompt tasks are off" };   // the same switch as PromptTasks: node Servex/agents/PromptTasks.js off
			const floor = Number(process.env.SERVEX_MIN_FREE_MB) || 1024, free = os.freemem() / 1048576;   // the memory floor Echo.call checks: this starts a claude process outside agents.spawn
			if (free < floor) return { ok: false, why: `only ${Math.round(free)} MB free, under the ${floor} MB floor` };
			if (Ask.skip(text)) return { ok: true, skipped: Ask.skip(text) };
			const sentences = Ask.split(text);
			if (!sentences.length) return { ok: true, skipped: "no sentences" };
			const r = await parts_of(sentences.map(s => s.text));
			const out = await Ask.write(text, via, re, put, { sentences, sections: TurnRefiner.sections(r.parts), by: "parts", cost_usd: +(r.usd ?? 0).toFixed(5) });
			return out.ok ? { ok: true, parts: r.parts.length, usd: r.usd } : out;
		} catch (e){ return { ok: false, why: e.message || String(e) }; }
	}
}
