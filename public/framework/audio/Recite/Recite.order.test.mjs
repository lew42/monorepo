// node public/framework/audio/Recite/Recite.order.test.mjs — newest-first: when several replies wait (not yet
// started), the newest arrival plays before the older waiting ones. Only the order BETWEEN replies flips; each
// reply's own sentences keep their order, and a reply already playing is never cut (ask2b-newest-first).
import { test } from "../../core/Test/Test.js";

const Recite = typeof document === "undefined" ? null : (await import("./Recite.js")).default;
if (!Recite) console.log("skip in node — Recite needs the DOM; open /framework/core/Test/view/?file=audio/Recite/Recite.order.test.mjs");

globalThis.URL.createObjectURL ??= () => "blob:fake";
globalThis.URL.revokeObjectURL ??= () => {};
const fake_voice = { name: "Fake", rate: 1, render: async text => ({ blob: typeof Blob === "function" ? new Blob([]) : {}, seconds: text.length / 20 }) };

// The brief's own scenario: something is already playing ("the first"), then A, B, C are queued in that order
// while it plays. None of A, B, C has started, so each new arrival jumps ahead of the ones already waiting:
// read order ends up [playing one], C, B, A — newest first among the waiting ones.
if (Recite) test("Recite: queueing A, B, C while a reply plays reads them newest-first, C then B then A", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.queue("The first reply, already playing.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the first reply started");

	r.queue("Reply A.");
	r.queue("Reply B.");
	r.queue("Reply C.");
	t.eq(r.chunks.map(c => c.text), ["The first reply, already playing.", "Reply C.", "Reply B.", "Reply A."],
		"C, arriving last, plays right after the one already playing; B and A are pushed further back in arrival order");

	r.ended();   // the playing reply finishes
	await new Promise(res => setTimeout(res, 20));   // play()'s render promise settles before the next ended()
	t.eq(r.at, 1, "next up is C");
	r.ended();
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.at, 2, "then B");
	r.ended();
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.at, 3, "then A, last");
	return r;
});

// Sentences within one reply never reorder, even though the reply itself jumps ahead of older waiting ones.
if (Recite) test("Recite: a reply's own sentences stay in order even though the reply jumps ahead of older ones waiting", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.queue("Playing now.");
	await new Promise(res => setTimeout(res, 20));
	r.queue("Older waiting reply, one sentence.");
	r.queue("Newest reply, sentence one. Newest reply, sentence two. Newest reply, sentence three.");
	t.eq(r.chunks.map(c => c.text), [
		"Playing now.",
		"Newest reply, sentence one.", "Newest reply, sentence two.", "Newest reply, sentence three.",
		"Older waiting reply, one sentence.",
	], "the newest reply's three sentences land together, in order, ahead of the older waiting one");
	return r;
});

// A reply already playing is never cut: it keeps the rest of its own sentences in front, even once something
// newer has been queued behind it.
if (Recite) test("Recite: a reply already playing is never cut, even once a newer one is queued behind it", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.queue("Playing, sentence one. Playing, sentence two.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "started");
	await r.play(1, 0);   // now on the playing reply's own second sentence

	r.queue("A newer reply arrives.");
	t.eq(r.chunks.map(c => c.text), ["Playing, sentence one.", "Playing, sentence two.", "A newer reply arrives."],
		"the newer reply goes in behind BOTH of the playing reply's sentences, not between them");
	t.eq(r.at, 1, "still on the playing reply's own second sentence — it was not cut");
	return r;
});

// A continuation of the live, streaming reply must keep extending that reply's own run, even once a newer,
// settled reply has been inserted right after it.
if (Recite) test("Recite: a streaming reply's continuation sentences stay with it, not after a reply inserted ahead of a waiting one", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.partial("First streamed sentence. ");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the stream started playing its first sentence");

	r.queue("An older reply, queued and waiting.");   // a second, unrelated reply queued directly behind it (final() would clear `this.live`, a separate concern from ordering)
	t.eq(r.chunks.map(c => c.text), ["First streamed sentence.", "An older reply, queued and waiting."],
		"the settled reply queued in behind the stream (nothing else was waiting yet)");

	r.partial("First streamed sentence. Second streamed sentence. ");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.map(c => c.text), ["First streamed sentence.", "Second streamed sentence.", "An older reply, queued and waiting."],
		"the stream's own next sentence extends ITS run, landing before the older reply, not after it");
	return r;
});

// skip_stale: a reply that waited more than 2 minutes, never started, is dropped rather than read late.
if (Recite) test("Recite: a reply waiting more than 2 minutes, never started, is skipped rather than read late", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.queue("Playing now, one sentence.");
	await new Promise(res => setTimeout(res, 20));
	r.queue("A stale reply that waited too long.");
	r.chunks[1].ts -= 130000;   // more than 2 minutes old, never started

	r.ended();   // the playing reply finishes; the next up is the stale one
	t.eq(r.chunks.map(c => c.text), ["Playing now, one sentence."], "the stale reply was dropped, not played — only the already-played one is still in the array (it stays until stop())");
	t.eq(r.state, "idle", "nothing left to read");
	return r;
});
