// Day.js — THE one rule for "which day is it": the owner's LOCAL calendar day (this machine's clock), never the UTC day.
// Session folders (ai/sessions/YYYY/MM/DD/), the state's `day` and every writer of a dated folder ask it. No imports, so
// the browser, the server and the hooks all share it. Doc: public/framework/ai/doc/task-folders.md (2026-10-18).
export default class Day {
	static DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
	/** "YYYY-MM-DD" of a time: a Date, epoch ms, an ISO string, or a bare "YYYY-MM-DD" (kept as that local day). Now when omitted; "" when it is not a time. */
	static of(t = Date.now()){
		if (typeof t === "string" && Day.DATE_ONLY.test(t)) return t; // a bare date is already a local day; Date.parse would read it as UTC midnight
		const d = t instanceof Date ? t : new Date(typeof t === "number" ? t : Date.parse(t ?? ""));
		const p = n => String(n).padStart(2, "0");
		return isNaN(d) ? "" : `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
	}
	/** "YYYY/MM/DD", the folder path of the same day. */
	static path(t){ const s = Day.of(t); return s && s.replaceAll("-", "/"); }
}
