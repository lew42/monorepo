// THE ONE ASK WRITER (the owner, 2026-11-06). Every owner prompt, on any channel, is ONE line on that session's record:
//   {"ask":{"id","text","via"}, "by":"owner"}   -> Session.ask() adds an open Prompt task (core/Session/Session.js)
// Channels (the VS Code hook, the voice app, Servex chat, the phone sheet) call Ask.write() and nothing hand-writes the line.
// Ask.write skips what is not the owner's words, withholds secrets, and sends the line through the caller's transport:
// `send(url, delta)` is the item tool (the hook posts it to Servex over MCP; Servex code calls it in-process). Doc: core/Session/readme.md, "Asks".
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

	static id(){ return "a" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }

	/** The delta: {"ask":{id,text,via,redacted?}}. The item tool stamps `by` and `ts`. */
	static delta(text, via, id = Ask.id()){
		const { text: safe, redacted } = Ask.redact(text);
		return { ask: { id, text: safe, via, ...(redacted ? { redacted: true } : {}) } };
	}

	/** Files one ask on the session record at `url`. {ok, id} when written, {ok:true, skipped:"<why>"} when it is not an ask, {ok:false, why} when the transport refused. */
	static async write(url, text, via, send, { id } = {}){
		const skipped = Ask.skip(text);
		if (skipped) return { ok: true, skipped };
		const delta = Ask.delta(text, via, id);
		const out = await send(url, delta);
		return out?.ok === false || !out ? { ok: false, why: out?.why ?? "the item tool did not answer" } : { ok: true, id: delta.ask.id, redacted: !!delta.ask.redacted };
	}
}
