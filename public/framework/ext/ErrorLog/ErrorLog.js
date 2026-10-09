import FsFile from "../filesystem/FsFile.js";

/**
 * ErrorLog — the one place a UI error becomes a log line a session can follow.
 *
 *   ErrorLog.watch(() => ({ prompt: system.prompt }));   // once per page: catches uncaught errors
 *   ErrorLog.report(error, { where: "Refine.go" });      // a caught error you still want seen
 *
 * Each call appends ONE line to `/framework/ai/errors/<date>.jsonl` through the one file API
 * (`FsFile.append`, dev socket, a no-op off localhost): the file is a stream the dev server
 * tails, so a session following it sees the error in ~100 ms. Errors and one state snapshot only,
 * never ordinary activity, so the file stays small. Design: `doc/design.md`.
 */
export default class ErrorLog {
	static dir = "/framework/ai/errors/";
	static state = null;      // () => object: a small snapshot of the page's live state
	static seen = new Set();  // one line per distinct message per page load, so a loop cannot flood

	static path(){ return `${ErrorLog.dir}${new Date().toISOString().slice(0, 10)}.jsonl`; }

	/** Build the line (pure: easy to test). */
	static line(error, context = {}){
		const e = error instanceof Error ? error : new Error(String(error?.message ?? error));
		let state = null;
		try { state = ErrorLog.state?.() ?? null; JSON.stringify(state); } catch { state = "unserialisable"; }
		return { ts: new Date().toISOString(), level: "error", page: location.pathname, message: e.message,
			stack: (e.stack ?? "").split("\n").slice(0, 6).join("\n"), context, state };
	}

	/** Append one error line. Never throws; returns the line (or null when it was a repeat). */
	static report(error, context = {}){
		const line = ErrorLog.line(error, context);
		const key = line.page + "|" + line.message;
		if (ErrorLog.seen.has(key)) return null;
		ErrorLog.seen.add(key);
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
