import { Page, p } from "/app.js";

// EXISTS, and fails. This is the branch Page.missing() is there to tell apart
// from a 404 — a syntax error or a bad assumption in a page you just wrote must
// not degrade into a silent "no such page".
throw new Error("boom — this module throws at import time, on purpose");

export default new Page({
	meta: import.meta,
	title: "Unreachable",
	content(){ p("Never rendered."); }
});
