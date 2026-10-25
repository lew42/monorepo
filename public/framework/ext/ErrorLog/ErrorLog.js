import FsFile from "../filesystem/FsFile.js";

/**
 * ErrorLog — the one place a UI error becomes a log line a session can follow.
 *
 *   ErrorLog.watch(() => ({ prompt: system.prompt }));   // once per page: catches uncaught errors
 *   ErrorLog.report(error, { where: "Refine.go" });      // a caught error you still want seen
 *
 * Each call appends ONE line to `failures.jsonl` in the folder of the module that broke, the same
 * file and shape `Servex/WorktreeWatch.js` writes for a failing test or page check, so whoever
 * `follow`s that module hears it (`Servex/doc/follow.md`, "One subscription system"). The module is
 * `context.module`, else the folder of the first `/framework/…` file in the stack, else the page's
 * folder. A copy still goes to `/framework/ai/errors/<date>.jsonl`, the old global index, until its
 * readers follow the module logs. Both go through the one file API (`FsFile.append`, dev socket, a
 * no-op off localhost). Errors and one state snapshot only, never ordinary activity. Design: `doc/design.md`.
 */
export default class ErrorLog {
	static dir = "/framework/ai/errors/";
	static state = null;      // () => object: a small snapshot of the page's live state
	static seen = new Set();
	static FAILURES = "failures" + ".jsonl";   // the module's own log; WorktreeWatch.report() writes the same file  // one line per distinct message per page load, so a loop cannot flood

	static path(){ return `${ErrorLog.dir}${new Date().toISOString().slice(0, 10)}.jsonl`; }

	/** Build the line (pure: easy to test). */
	static line(error, context = {}){
		const e = error instanceof Error ? error : new Error(String(error?.message ?? error));
		let state = null;
		try { state = ErrorLog.state?.() ?? null; JSON.stringify(state); } catch { state = "unserialisable"; }
		return { ts: new Date().toISOString(), level: "error", page: location.pathname, message: e.message,
			stack: (e.stack ?? "").split("\n").slice(0, 6).join("\n"), context, state };
	}

	/** The folder of the module an error belongs to, with a trailing slash: `context.module`, else the folder
	 *  of the first site file in the stack (`http://host/framework/ux/Dictate/Dictate.js:400` → `/framework/ux/Dictate/`),
	 *  else the page's own folder. Pure: easy to test. */
	static module_of(line){
		const named = line.context?.module;
		if (named) return String(named).replace(/\/?$/, "/");
		for (const m of String(line.stack ?? "").matchAll(/https?:\/\/[^/\s)]+(\/framework\/[^\s):?#]+\.m?js)/g)) return m[1].replace(/[^/]+$/, "");
		return String(line.page ?? "/").replace(/[^/]*$/, "");
	}

	/** The module's own failures line: `{at, fail:{kind:"page-error", page, msg, where, stack}}`, WorktreeWatch's shape. */
	static failure(line){
		return { at: line.ts, fail: { kind: "page-error", page: line.page, msg: line.message, where: line.context?.where, stack: line.stack || undefined } };
	}

	/** Append one error line (the module's failures log, and the day file). Never throws; returns the line (or null when it was a repeat). */
	static report(error, context = {}){
		const line = ErrorLog.line(error, context);
		const key = line.page + "|" + line.message;
		if (ErrorLog.seen.has(key)) return null;
		ErrorLog.seen.add(key);
		line.module = ErrorLog.module_of(line);
		FsFile.append(line.module + ErrorLog.FAILURES, ErrorLog.failure(line)).catch(() => {});
		FsFile.append(ErrorLog.path(), line).catch(() => {});
		return line;
	}

	/** Install the page-wide catchers once; `state` is read at the moment an error happens. */
	static watch(state){
		if (state) ErrorLog.state = state;
		if (ErrorLog.watching) return;
		ErrorLog.watching = true;
		addEventListener("error", ev => ErrorLog.report(ev.error ?? ev.message, { where: "window.onerror", at: `${ev.filename}:${ev.lineno}` }));
		addEventListener("unhandledrejection", ev => ErrorLog.report(ev.reason, { where: "unhandledrejection" }));
	}
}
