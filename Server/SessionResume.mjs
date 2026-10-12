#!/usr/bin/env node
// Server/SessionResume.mjs — which way to resume a session, computed from session-flags.json (ctx, last). Doc: public/framework/ai/sessions/doc/data/resumption.md
//   node Server/SessionResume.mjs <session-id>     print the tier and why
//   node Server/SessionResume.mjs --census         count every session by tier
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const FLAGS = fileURLToPath(new URL("../public/framework/ai/sessions/session-flags.json", import.meta.url));

export default class SessionResume {
	static WARM_MS = 60 * 60e3;          // the prompt cache lasts about an hour
	static STALE_MS = 7 * 24 * 60 * 60e3;
	static BLOAT = 300e3;                // same limit as the context-bloat red flag
	static rows(){ return JSON.parse(fs.readFileSync(FLAGS, "utf8")).rows; }

	/** { tier: "warm"|"cold"|"fresh", why } for a flags row ({ctx, last}). */
	static tier(row, now = Date.now()){
		const idle = now - Date.parse(row.last), ctx = row.ctx ?? 0;
		if (ctx > this.BLOAT) return { tier: "fresh", why: `context ${Math.round(ctx / 1e3)}k is over ${this.BLOAT / 1e3}k: every turn would re-pay it` };
		if (idle > this.STALE_MS) return { tier: "fresh", why: `idle ${Math.round(idle / 864e5)} days` };
		if (idle > this.WARM_MS) return { tier: "cold", why: `idle past the cache window: the first turn re-reads ${Math.round(ctx / 1e3)}k tokens uncached` };
		return { tier: "warm", why: "inside the cache window: resume as is" };
	}

	static census(now = Date.now()){
		const out = { warm: 0, cold: 0, fresh: 0 };
		for (const r of Object.values(this.rows())) if (r.last) out[this.tier(r, now).tier]++;
		return out;
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const a = process.argv[2];
	if (a === "--census") console.log(SessionResume.census());
	else if (a) { const r = SessionResume.rows()[a]; console.log(r ? SessionResume.tier(r) : "unknown session id"); }
	else console.log("usage: SessionResume.mjs <id> | --census");
}
