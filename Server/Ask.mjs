// THE ONE WRITER OF AN OWNER TURN'S RAW SENTENCES (the owner, 2026-11-06). Every owner prompt, on any channel, leaves
//   {"refined":{"at","re":<the turn's at>,"sentences":[{n,text}],"sections":[],"via","by":"code"}}
// on that session's record: the same line the voice model writes, here split by CODE (ext/Refine quick_clean, no AI) with secrets withheld,
// so `git grep '"sentences":'` finds the owner's words on every channel. A later AI refine writes a second `refined` line with the same `re`
// and `sections`. Session.apply_line turns the turn into one open Prompt task and each section item into a child task (core/Session/Session.js).
// Channels call Ask.write(); `send(url, delta)` is the item tool (the hook posts it to Servex over MCP; Servex code calls it in-process).
// Doc: core/Session/readme.md, "Asks".
import { quick_clean } from "../public/framework/ext/Refine/engine.js";

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

	/** The id of a turn's Prompt task, from the turn's `at`; the same on every replay (Session.turn_id is this same hash). */
	static turn_id(at){ let h = 5381; for (const c of String(at)) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return "t" + h.toString(36); }

	/** The owner's words as numbered sentences, by code: secrets withheld first, then the shared mechanical split. [{n,text}] */
	static split(text){
		const { text: safe } = Ask.redact(text);
		const rows = quick_clean(safe);
		return rows.length ? rows : (safe.trim() ? [{ n: 1, text: safe.trim() }] : []);
	}

	/** The refined line for one turn: {refined:{at,re,sentences,sections:[],via,by:"code",redacted?}}. The item tool stamps `by` and `ts` on the line. */
	static refined(text, via, re, at = new Date().toISOString()){
		const { redacted } = Ask.redact(text);
		return { refined: { at, re, sentences: Ask.split(text), sections: [], via, by: "code", ...(redacted ? { redacted: true } : {}) } };
	}

	/** Files one turn's sentences on the session record at `url`. `turn` (VS Code, which has no chat line): also adds the counted Prompt
	 *  item that IS the turn, id Ask.turn_id(re). {ok, id, re} when written, {ok:true, skipped} when it is not an ask, {ok:false, why} when refused. */
	static async write(url, text, via, send, { re = new Date().toISOString(), turn = false } = {}){
		const skipped = Ask.skip(text);
		if (skipped) return { ok: true, skipped };
		const id = Ask.turn_id(re), { text: safe, redacted } = Ask.redact(text);
		const deltas = [...(turn ? [{ content: { add: { type: "Prompt", id, text: safe, via, counted: true, ...(redacted ? { redacted: true } : {}) } } }] : []), Ask.refined(text, via, re)];
		for (const delta of deltas){
			let out = await send(url, delta);
			if (typeof out === "string") try { out = JSON.parse(out); } catch { out = null; }
			if (!out || out.ok === false) return { ok: false, why: out?.why ?? "the item tool did not answer" };
		}
		return { ok: true, id, re, redacted };
	}
}
