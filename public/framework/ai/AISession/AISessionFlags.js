import AISessionRows from "./AISessionRows.js";

// Red flags: what looks wrong with a session, worked out from numbers, never guessed. `Server/session-flags.mjs` reads the
// transcripts and writes sessions/session-flags.json (role, mastermind, last-turn context, last line time, the hour's $);
// this class loads that file and turns it plus the live row and the session index into flags. It draws nothing.
// The thresholds are the owner's (2026-10-09): over $10 or $5 in the last hour; working but quiet 5 minutes; context over 300k; Opus minion.
export default class AISessionFlags {

	static rows = {};   // id -> { role, mm, ep, ctx, last, model, hour_usd }, set by load()

	static LIMITS = { usd: 10, hour_usd: 5, quiet_ms: 5 * 60 * 1000, ctx: 300000 };

	static FLAGS = {
		expensive: { label: "$$$", title: "Expensive: this session cost over $10, or over $5 in its last hour." },
		stalled:   { label: "stalled", title: "Stalled: marked working, but nothing new in its transcript for 5 minutes or more." },
		bloat:     { label: "context", title: "Context bloat: its last turn read over 300k tokens of context, and every turn pays for that again." },
		opus:      { label: "Opus minion", title: "A spawned agent that is not a mastermind is running on Opus." },
	};

	static async load(url){
		const data = await AISessionRows.get_json(url + "session-flags.json");
		AISessionFlags.rows = AISessionRows.flag_rows = data?.rows ?? {};   // the same table gives AISessionRows its roles
		return data;
	}

	static of(r){ return AISessionFlags.rows[r.session_id || r.id] ?? null; }

	/** Mastermind: Servex says so (its registry role), or the first prompt loads the mastermind skill (the script's `mm`). */
	static is_mastermind(r){ return /mastermind/.test(r.role ?? "") || !!AISessionFlags.of(r)?.mm; }

	/** The flag keys that apply to one row right now. */
	static flags_of(r, now = Date.now()){
		const { LIMITS } = AISessionFlags, f = AISessionFlags.of(r), out = [];
		const usd = AISessionRows.claude_usd_of(r);
		if (usd > LIMITS.usd || (f?.hour_usd ?? 0) > LIMITS.hour_usd) out.push("expensive");
		// the newest sign of life: the transcript's last line, the live index, the row's own stamp
		const last = Math.max(Date.parse(f?.last ?? 0) || 0, Date.parse(r.last_activity ?? 0) || 0);
		if (AISessionRows.WORKING_STATES.has(r.state) && last && now - last >= LIMITS.quiet_ms) out.push("stalled");
		if ((r.context ?? f?.ctx ?? 0) > LIMITS.ctx) out.push("bloat");
		const model = String(r.model ?? f?.model ?? ""), role = f?.role ?? r.role ?? "";
		const spawned = r.source === "servex" || (f?.ep === "sdk-ts" && !["vscode tab", "terminal"].includes(role));
		if (spawned && !AISessionFlags.is_mastermind(r) && /opus/i.test(model)) out.push("opus");
		return out;
	}

	/** { expensive: n, stalled: n, ... , any: n } over a list of rows. */
	static counts(rows){
		const c = { any: 0 };
		for (const r of rows){
			const fl = AISessionFlags.flags_of(r);
			if (fl.length) c.any++;
			for (const k of fl) c[k] = (c[k] ?? 0) + 1;
		}
		return c;
	}
}
