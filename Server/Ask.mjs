// THE ONE WRITER OF AN OWNER TURN'S RAW SENTENCES (the owner, 2026-11-06). Every owner prompt, on any channel, leaves
//   {"refined":{"at","re":<the turn's at>,"sentences":[{n,text}],"sections":[],"via","by":"code"}}
// on that session's record: the same line the voice model writes, here split by CODE (ext/Refine quick_clean, no AI) with secrets withheld,
// so `git grep '"sentences":'` finds the owner's words on every channel. A later AI refine writes a second `refined` line with the same `re`
// and `sections`. The line carries `v: 2`; Session.apply_line turns such a turn into one open Prompt task and each section item into a child task (core/Session/Session.js).
// Every channel calls Ask.write(text, via, re, put, opts); `put(line)` is its own door (the hook posts to Servex over MCP, Servex code writes in-process).
// Doc: core/Session/readme.md, "Asks".
import { quick_clean } from "../public/framework/ext/Refine/engine.js";
import Session from "../public/framework/core/Session/Session.js";

export default class Ask {
	// Common key and token shapes, checked line by line so one bad line withholds the whole prompt (moved here from the hook).
	static SECRET_PATTERNS = [
		/-----BEGIN[ A-Z]*PRIVATE KEY-----/,
		/\b(AKIA|ASIA)[0-9A-Z]{16}\b/,
		/\bsk-(ant-|proj-)?[A-Za-z0-9_-]{16,}\b/,
		/\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
		/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
		/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
		/\b(api[_-]?key|secret|token|password|passwd)\b\s*[:=]\s*["']?[A-Za-z0-9_\-/+]{12,}/i,
	];
	static WITHHELD = "[withheld: looked like a secret]";
	// A subagent's hand-back, a background notice, a message from another agent: user turns that are not the owner's words.
	static HARNESS = /^<(agent-message|task-notification|system-reminder)\b/;

	static looks_like_secret(text){ return String(text).split(/\r?\n/).some(line => Ask.SECRET_PATTERNS.some(re => re.test(line))); }
	static is_slash(text){ return /^\s*\//.test(text); }

	/** Why this text is not an ask (a string), or null when it is. */
	static skip(text){
		const t = String(text ?? "").trim();
		if (!t) return "empty";
		if (Ask.HARNESS.test(t)) return "harness turn";
		if (Ask.is_slash(t)) return "slash command";
		return null;
	}

	/** The words as they are stored: a secret becomes WITHHELD. {text, redacted}. */
	static redact(text){
		const secret = !!String(text ?? "").trim() && Ask.looks_like_secret(text);
		return { text: secret ? Ask.WITHHELD : String(text ?? ""), redacted: secret };
	}

	/** Local time with its offset and milliseconds, `2026-09-29T19:30:12.345-05:00`: the one `at` format of every channel's lines (Sessions.now_ms is this). */
	static now(){
		const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
		return new Date(d.getTime() + off * 60000).toISOString().slice(0, 23) + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
	}

	/** The owner's words as numbered sentences, by code: secrets withheld first, then the shared mechanical split. [{n,text}] */
	static split(text){
		const { text: safe } = Ask.redact(text);
		const rows = quick_clean(safe);
		return rows.length ? rows : (safe.trim() ? [{ n: 1, text: safe.trim() }] : []);
	}

	/** The lines one turn leaves, or null when it is not an ask. The refined line carries `v: 2`: Session derives the turn's tasks only from lines that
	 *  carry it, so older {refined} lines replay as they always did. `turn` (VS Code, which has no chat line) adds the counted Prompt item first.
	 *  opts: turn, at, by, sentences (already split, e.g. Echo's), sections, flags, cost_usd. */
	static lines(text, via, re, opts = {}){
		if (Ask.skip(text)) return null;
		const { text: safe, redacted } = Ask.redact(text);
		const refined = { at: opts.at ?? Ask.now(), re, sentences: opts.sentences ?? Ask.split(text), sections: opts.sections ?? [], ...(opts.flags ? { flags: opts.flags } : {}), ...(opts.cost_usd != null ? { cost_usd: opts.cost_usd } : {}), via, by: opts.by ?? "code", v: 2, ...(redacted ? { redacted: true } : {}) };
		return [...(opts.turn ? [{ content: { add: { type: "Prompt", id: Session.turn_id(re), text: safe, via, counted: true, ...(redacted ? { redacted: true } : {}) } } }] : []), { refined }];
	}

	/** THE ONE WRITER of an owner turn: skip, redact, shape, write. `put(line)` is the channel's own door (the item tool's page_set, Sessions.write, an
	 *  append); it may be sync or async, and so is the answer. {ok, id, re, redacted} when written, {ok:true, skipped} when it is not an ask, {ok:false, why} when refused. */
	static write(text, via, re, put, opts = {}){
		const lines = Ask.lines(text, via, re, opts);
		if (!lines) return { ok: true, skipped: Ask.skip(text) };
		const done = { ok: true, id: Session.turn_id(re), re, redacted: Ask.redact(text).redacted };
		const check = out => { if (typeof out === "string") try { out = JSON.parse(out); } catch { out = null; } return out?.ok === false ? { ok: false, why: out.why ?? "refused" } : null; };
		const step = i => {
			if (i === lines.length) return done;
			const out = put(lines[i]);
			return out?.then ? out.then(o => check(o) ?? step(i + 1)) : (check(out) ?? step(i + 1));
		};
		return step(0);
	}
}
