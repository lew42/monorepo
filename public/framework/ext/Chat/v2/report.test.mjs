// report.test.mjs — report.js posts the page's own errors/clicks/context (and now a Recite "read" marker) down
// the real dictation path. read_note() is pure (no fetch, no session): the formatting cutting-in's Recite.on_read
// wires into read() needs, tested without any network. report.js imports an absolute "/framework/..." path
// (servex_url.js), which only the browser's own module root resolves — like Recite.test.mjs, this skips in plain
// node: open /framework/core/Test/view/?file=ext/Chat/v2/report.test.mjs (or let TestRunner run it there).
import { test } from "../../../core/Test/Test.js";
const read_note = typeof document === "undefined" ? null : (await import("./report.js")).read_note;
if (!read_note) console.log("skip in node — report.js imports an absolute /framework/ path, resolved only in the browser");

if (read_note) test("report.read_note: the plain sentence for a cut-off or skipped reply (cutting in, 2026-11-03)", t => {
	t.ok(/cut off after "the weather today"/.test(read_note({ heard: "cut", words: "the weather today" })),
		"a cut reply names the last heard words");
	t.ok(/treat it as unsaid/.test(read_note({ heard: "cut", words: "hello" })), "and tells the assistant to forget the rest");
	t.ok(/skipped, never heard/.test(read_note({ heard: "skipped", words: "" })), "a skipped reply (never started) says so, with no words to quote");
	t.eq(read_note({ heard: "cut", words: "" }), read_note({ heard: "cut", words: "" }), "pure: the same event gives the same sentence");
});
