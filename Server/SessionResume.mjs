#!/usr/bin/env node
// Server/SessionResume.mjs — which way to resume a session, computed from session-flags.json (ctx, last). Doc: public/framework/ai/sessions/doc/data/resumption.md
//   node Server/SessionResume.mjs <session-id>     print the tier and why
//   node Server/SessionResume.mjs --census         count every session by tier
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const FLAGS = fileURLToPath(new URL("../public/framework/ai/sessions/session-flags.json", import.meta.url));

import Resume from "../public/framework/ai/AISession/AISessionResume.js";

export default class SessionResume extends Resume {
	static rows(){ return JSON.parse(fs.readFileSync(FLAGS, "utf8")).rows; }
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
