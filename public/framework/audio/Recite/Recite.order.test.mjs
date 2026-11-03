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
	t.eq(r.chunks[r.at].text, "Reply C.", "next up is C");   // the TEXT that is actually playing, not just the index (review finding 3, round 3: an index can be right while the wrong chunk sits there)
	r.ended();
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks[r.at].text, "Reply B.", "then B");
	r.ended();
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks[r.at].text, "Reply A.", "then A, last");
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

// Review finding 1 (ask2b round 3, 2026-11-03): a fresh STREAM's own first chunk used to fall into the "no
// existing run" branch and append at the true end, behind every reply already waiting — the reverse of
// newest-first, and streaming is the smart reply's normal path. It must use the same fresh-reply anchor as a
// settled reply.
if (Recite) test("Recite: with A and B already waiting, a new streamed reply plays before them too", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.queue("The first, already playing.");
	await new Promise(res => setTimeout(res, 20));
	r.queue("A.");
	r.queue("B.");
	t.eq(r.chunks.map(c => c.text), ["The first, already playing.", "B.", "A."], "A and B wait, newest first");

	r.partial("A fresh stream starts. ");   // the stream's very first chunk — no existing run of its own yet
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.map(c => c.text), ["The first, already playing.", "A fresh stream starts.", "B.", "A."],
		"the stream plays right after what is already playing, ahead of both A and B — same as any other fresh reply");
	return r;
});

// Review finding 2 (ask2b round 3, 2026-11-03): a stream S plays S1; an agent update U is appended behind it and,
// once S1 ends, starts playing at the index S2 (more of the SAME stream) would otherwise be spliced back into —
// S2 must still be read, in its own place after U (playback has already moved past S's old spot), and U must not
// play twice.
if (Recite) test("Recite: a stream's continuation lands after an update that started playing in the meantime — the update is never repeated, the continuation is never lost", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.partial("S1. ");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks[r.at].text, "S1.", "the stream's first sentence is playing");

	r.from_wire({ kind: "line", line: { chat: { text: "An update, not held (no cue pending).", at: new Date().toISOString(), from: { kind: "assistant", id: "mastermind-x" } } } });
	t.eq(r.chunks.map(c => c.text), ["S1.", "I have an update on x, it is in the chat."], "the update queued in behind S1");

	r.ended();   // S1 finishes; the update starts playing next
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks[r.at].text, "I have an update on x, it is in the chat.", "the update is playing now");

	r.partial("S1. S2. ");   // the stream's own next sentence — its old run (S1, already heard) sits behind the update now playing
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.map(c => c.text), ["S1.", "I have an update on x, it is in the chat.", "S2."],
		"S2 lands after the update, not spliced back behind it where it would never be reached");

	r.ended();   // the update finishes
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks[r.at].text, "S2.", "S2 plays next — not a repeat of the update");
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

// Review finding 1 (ask2b round 4, 2026-11-03): skip_stale() checked only `ts`, and every sentence of a reply
// carries the time it was QUEUED — so a reply already under way, whose later sentence just happened to be queued
// over 2 minutes ago (it arrived mid-stream, or sat behind a long pause), could get cut by the very check meant
// only for a reply that never started. It must stop at the reply already at `this.at`.
if (Recite) test("Recite: an old timestamp on a later sentence of the CURRENT reply never skips it — a reply already under way is never stale", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	// Case 1: a plain two-sentence reply, playing its first sentence; the second's own `ts` is old (it was queued
	// a long time before this test's clock, as a slow stream might).
	r.queue("R1, sentence one. R1, sentence two.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks[r.at].text, "R1, sentence one.", "the first sentence is playing");
	r.chunks[1].ts -= 130000;   // more than 2 minutes old, same reply as the one playing

	r.ended();   // the first sentence finishes; skip_stale() runs on index 1 next
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks[r.at].text, "R1, sentence two.", "the second sentence still plays — it is the SAME reply as the one just playing, never stale");

	// Case 2: a reply paused by a barge-in (state "heard", `this.at` unchanged while paused) whose later sentence
	// ages while it sits paused.
	r.stop();
	r.queue("R2, sentence one. R2, sentence two.");
	await new Promise(res => setTimeout(res, 20));
	r.pause("heard");   // simulates BargeIn pausing mid-reply, same as a real barge-in
	t.eq(r.state, "heard", "paused, as if by a barge-in");
	r.chunks[1].ts -= 130000;
	r.resume();
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "resumed");
	r.ended();   // the first sentence finishes; skip_stale() runs on index 1 next
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks[r.at].text, "R2, sentence two.", "the second sentence still plays after the pause, despite its old ts — same reply, never stale");
	return r;
});

// Review finding 1 (ask2b round 2, 2026-11-03): a heard reply stays in `chunks` until `stop()` — insert_at() must
// anchor on the run around `this.at` (the one playing, or just finished), never `chunks[0]`, or from the third
// reply on a fresh reply lands among already-heard chunks instead of after the one actually current, and an
// already-heard reply gets read a second time.
if (Recite) test("Recite: three replies heard one after another, then a fourth queued mid-third, land in arrival order with no re-read", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	const read = [];

	r.queue("R1.");
	await new Promise(res => setTimeout(res, 20));
	read.push(r.chunks[r.at].text);

	r.ended();   // R1 finishes and stays in chunks, heard
	await new Promise(res => setTimeout(res, 20));
	r.queue("R2.");   // queued fresh, after R1 is already heard and sitting at chunks[0]
	await new Promise(res => setTimeout(res, 20));
	read.push(r.chunks[r.at].text);
	t.eq(r.chunks.map(c => c.text), ["R1.", "R2."], "R2 landed after R1, not interleaved with it");

	r.ended();   // R2 finishes; R1 AND R2 are both heard now — chunks[0] is old news
	await new Promise(res => setTimeout(res, 20));
	r.queue("R3.");
	await new Promise(res => setTimeout(res, 20));
	read.push(r.chunks[r.at].text);
	t.eq(r.chunks.map(c => c.text), ["R1.", "R2.", "R3."], "R3 landed after R2 (the one actually just heard), not spliced in behind the old chunks[0]");
	t.eq(r.at, 2, "R3 is playing, not a repeat of R2");

	r.queue("R4.");   // queued while R3 is still playing
	t.eq(r.chunks.map(c => c.text), ["R1.", "R2.", "R3.", "R4."], "R4 lands right after R3 — the one actually playing — not after the long-heard R1");

	r.ended();
	await new Promise(res => setTimeout(res, 20));
	read.push(r.chunks[r.at].text);
	t.eq(r.at, 3, "R4 plays next");
	t.eq(read, ["R1.", "R2.", "R3.", "R4."], "each reply was read exactly once, in order — nothing repeated");
	return r;
});

// Review finding 2 (ask2b round 2, 2026-11-03): agent updates are never high priority enough to jump ahead of the
// direct answer they were held behind — queue_update() appends at the true end, not the newest-first reorder.
if (Recite) test("Recite: updates held while a reply plays come out after the direct answer, in the order they arrived", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.cue_pending = true;   // the owner's line landed; a direct reply is still expected

	r.queue("Something already playing.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "a reply is already playing when the updates arrive");

	r.from_wire({ kind: "line", line: { chat: { text: "Update one.", at: new Date().toISOString(), from: { kind: "assistant", id: "mastermind-a" } } } });
	r.from_wire({ kind: "line", line: { chat: { text: "Update two.", at: new Date().toISOString(), from: { kind: "assistant", id: "mastermind-b" } } } });
	t.eq(r.pending_updates.length, 2, "both held — the direct answer hasn't arrived");

	r.from_wire({ kind: "line", line: { chat: { text: "The direct answer.", at: new Date().toISOString(), from: { kind: "assistant", id: "smart" } } } });
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.map(c => c.text), [
		"Something already playing.",
		"The direct answer.",
		"I have an update on a, it is in the chat.",
		"I have an update on b, it is in the chat.",
	], "the direct answer lands right after what was already playing (newest-first); both updates follow it, in arrival order — never ahead of the direct answer");
	return r;
});
