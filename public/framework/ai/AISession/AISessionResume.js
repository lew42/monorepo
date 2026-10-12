// How to resume a session, worked out from its idle time and last-turn context (doc: sessions/doc/data/resumption.md). Pure: runs in node and the browser.
export default class AISessionResume {
	static WARM_MS = 60 * 60e3;               // the prompt cache lasts about an hour
	static STALE_MS = 7 * 24 * 60 * 60e3;
	static BLOAT = 300e3;                     // same limit as the context-bloat red flag
	static TIERS = {
		warm:  { label: "warm",  title: "Resume as is: idle under an hour, the prompt cache is still warm." },
		cold:  { label: "cold",  title: "Resume, but the first turn re-reads the whole context uncached." },
		fresh: { label: "fresh", title: "Start a new session that links this one: idle over 7 days, or context over 300k." },
	};

	/** { tier, why } for { ctx, last } (last = ISO time of the last transcript line). */
	static tier(row, now = Date.now()){
		const idle = now - Date.parse(row.last), ctx = row.ctx ?? 0;
		if (ctx > this.BLOAT) return { tier: "fresh", why: `context ${Math.round(ctx / 1e3)}k is over ${this.BLOAT / 1e3}k: every turn would re-pay it` };
		if (idle > this.STALE_MS) return { tier: "fresh", why: `idle ${Math.round(idle / 864e5)} days` };
		if (idle > this.WARM_MS) return { tier: "cold", why: `idle past the cache window: the first turn re-reads ${Math.round(ctx / 1e3)}k tokens uncached` };
		return { tier: "warm", why: "inside the cache window: resume as is" };
	}
}
