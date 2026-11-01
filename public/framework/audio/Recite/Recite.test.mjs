// node public/framework/audio/Recite/Recite.test.mjs — Recite's core: splitting a reply into sentences, the timeline, seeking.
// No audio in node, so a fake Voice renders each sentence as 1 s per 20 characters; the browser part is the demo page.
import { test } from "../../core/Test/Test.js";

// Recite is a browser class (its parts build DOM on import), so this runs on the test page:
// /framework/core/Test/view/?file=audio/Recite/Recite.test.mjs — in node it skips. The server has its own node test: Servex/ext/recite/recite.test.mjs
const Recite = typeof document === "undefined" ? null : (await import("./Recite.js")).default;
if (!Recite) console.log("skip in node — Recite needs the DOM; open /framework/core/Test/view/?file=audio/Recite/Recite.test.mjs");

globalThis.URL.createObjectURL ??= () => "blob:fake";
globalThis.URL.revokeObjectURL ??= () => {};
const fake_voice = { name: "Fake", rate: 1, render: async text => ({ blob: typeof Blob === "function" ? new Blob([]) : {}, seconds: text.length / 20 }) };

if (Recite) test("Recite: split, render, timeline, seek", async t => {
	const parts = Recite.split("# Done\n\nI fixed **the bar**. See [the page](/x/) for more. ```js\nlet a = 1;\n``` Then `node run.mjs` again! Ok.");
	t.eq(parts[0], "Done", "a heading becomes its own short first sentence (it starts sooner)");
	t.ok(parts.some(p => p.startsWith("I fixed the bar.")), "markdown bold is taken out (a short sentence joins the next one)");
	t.ok(parts.some(p => p.includes("See the page for more.")), "a link reads as its text");
	t.ok(parts.join(" ").includes("(a code block)"), "a code block is named, not read");
	t.ok(parts.join(" ").includes("node run.mjs again!"), "inline code is read plainly");
	t.ok(parts.every(p => p.length <= 300), "no piece is over 300 characters");
	t.eq(Recite.split("a ".repeat(400)).length > 1, true, "one long run-on is cut into pieces");

	const r = new Recite({ voice: fake_voice });
	r.barge.on = false;   // no mic in a test
	t.eq(r.state, "idle", "a new Recite is idle");
	t.ok(r.url.endsWith(":8177") || r.url.endsWith("/recite"), "it talks to recite-server, or to the page's /recite proxy off this machine");

	r.queue("First sentence is here. Second sentence is a bit longer. Third.");   // play() fails quietly in node (no Audio): we only check the timeline
	await Promise.all(r.chunks.map((c, i) => r.render(i)));
	t.eq(r.chunks.length, 3, "three sentences, three chunks");
	t.eq(r.chunks[1].start, r.chunks[0].seconds, "chunk 2 starts where chunk 1 ends");
	t.eq(+r.duration().toFixed(2), +(r.chunks.reduce((s, c) => s + c.text.length, 0) / 20).toFixed(2), "duration is the sum of the rendered sentences");
	t.eq(r.server, "online", "a successful render marks the server online");

	const mid = r.chunks[1].start + 0.5;
	t.eq(r.find(mid).i, 1, "find() puts a time inside chunk 2 in chunk 2");
	t.eq(+r.find(mid).offset.toFixed(2), 0.5, "and gives the offset into it");
	t.eq(r.find(0).i, 0, "time 0 is chunk 1");
	t.eq(r.find(999).i, 2, "past the end is the last chunk");

	r.pick("George");
	t.eq(r.voice.name, "George", "pick() changes the persona");
	t.eq(r.chunks[2].src, null, "sentences still ahead are rendered again in the new voice");

	r.stop();
	t.eq(r.chunks.length, 0, "stop() clears the queue");
	t.eq(r.state, "idle", "and is idle");
	t.eq(Recite.BargeIn.noise("[BLANK_AUDIO]"), true, "Whisper's blank mark counts as noise");
	t.eq(Recite.BargeIn.noise("wait, stop"), false, "real words do not");
	return r;
});
