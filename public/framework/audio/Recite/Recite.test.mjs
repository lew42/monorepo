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

// A phone refuses sound that starts without a tap (NotAllowedError). The first tap unlocks Recite's <audio> and starts the refused reply;
// a paused sentence keeps its source (pause keeps its place), and one tap's two events unlock once. A fake <audio> stands in for the phone.
if (Recite) test("Recite: the first tap unlocks a refused reply", async t => {
	const r = new Recite({ voice: fake_voice });
	r.barge.on = false;
	let plays = 0, refuse = true;
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ plays++; return refuse && this.src !== Recite.SILENCE ? Promise.reject(Object.assign(new Error("no"), { name: "NotAllowedError" })) : Promise.resolve(); } };
	await r.read("A reply from the network.").play(0, 0);
	t.eq(r.state, "paused", "the browser refused the reply: paused");
	t.ok(/tap/.test(r.error), "and the bar asks for a tap");
	refuse = false; plays = 0;
	document.dispatchEvent(new Event("pointerdown")); document.dispatchEvent(new Event("touchend"));   // one tap fires both
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.unlocked, true, "the tap unlocked it");
	t.eq(r.state, "playing", "and the refused reply started");
	t.eq(plays, 2, "one silent play, then the reply: the second event of the tap did nothing");
	r.pause(); const src = r.audio.src;
	document.dispatchEvent(new Event("pointerdown"));
	t.eq(r.audio.src, src, "a later tap never swaps a paused sentence's source");
	return r;
});

// Turn-taking (dictation-v3, 2026-11-01): a reply queues behind what is playing, never replaces it; a real barge-in
// pauses and auto-resumes from the START of the cut sentence once things go quiet; a question drops the rest instead.
// Driven through owner_spoke() — the real route a wire line takes (review note 7), not heard_speech() called directly.
if (Recite) test("Recite + BargeIn: queueing, resume from the sentence's start, a question drops the rest", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;   // owner_spoke()/sync() never open a real mic in a test; `on` only gates sync()'s own mic-open/close

	r.queue("First reply, sentence one. First reply, sentence two.");
	await new Promise(res => setTimeout(res, 20));   // the queue's own auto-play settles
	t.eq(r.state, "playing", "nothing is talking: the first reply started on its own");

	r.queue("Second reply arrives while the first still plays.");
	t.eq(r.chunks.length, 3, "it queued behind the first reply — nothing already there was dropped");
	t.eq(r.chunks[0].text, "First reply, sentence one.", "the first reply's own first sentence is unchanged");

	await r.play(1, 1.5);   // simulate: partway into reply one's second sentence
	r.barge.quiet_ms = 15;   // fast for the test
	r.barge.owner_spoke("wait, hold on");   // a wire line, real speech, not a question
	t.eq(r.state, "heard", "still paused, giving the owner a moment to keep talking");
	await new Promise(res => setTimeout(res, 50));
	t.eq(r.state, "playing", "resumed by itself once the owner went quiet");
	t.eq(r.audio.currentTime, 0, "it started the cut sentence over, not mid-word");
	t.eq(r.chunks.length, 3, "the queued second reply is still waiting its turn, untouched");

	let synced = 0; const real_sync = r.barge.sync.bind(r.barge); r.barge.sync = () => { synced++; real_sync(); };
	r.barge.owner_spoke("but what about the other one?");   // a question: a new answer is coming
	await new Promise(res => setTimeout(res, 20));   // drop_heard()'s own play() of whatever is queued behind settles
	t.eq(r.chunks.length, 1, "only the dropped reply (the one that was heard) is gone");
	t.eq(r.chunks[0].text, "Second reply arrives while the first still plays.", "the reply that was already queued behind it was never touched, and starts right where it was waiting");
	t.eq(r.state, "playing", "playback carries on with what was queued behind the dropped reply");
	t.ok(synced > 0, "dropping a question re-syncs the mic, ready for the next interruption");
	return r;
});

// requirements.md: a question ("...?") drops the old reply, "or a reply to it is coming" — the second half needs no
// "?" at all: a fresh reply itself arriving while the old one sits paused IS the signal (finding 3).
if (Recite) test("Recite: a reply arriving while the old one is paused by barge-in drops it, even with no '?'", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.queue("An answer that gets interrupted, no less.");
	await new Promise(res => setTimeout(res, 20));
	r.barge.owner_spoke("actually never mind");   // real speech, no question mark
	t.eq(r.state, "heard", "paused, waiting to see if the owner keeps talking");

	r.final("A fresh reply has already started arriving.");   // "a reply to it is coming"
	t.eq(r.state, "loading", "the reply arriving is itself the signal: the old one is dropped, and the new one starts right away — not resumed into");
	t.eq(r.chunks.length, 1, "only the new reply is queued");
	t.eq(r.chunks[0].text.startsWith("A fresh reply"), true, "and it is the new reply, not a leftover of the old one");
	return r;
});

// Dropping the reply a barge-in cut off must not drop what is already queued behind it — only that one reply's own
// chunks go (review: drop_heard() called stop(), which emptied the whole queue; a second reply that had not even
// started yet was lost along with the first).
if (Recite) test("Recite: dropping a cut-off reply keeps whatever is already queued behind it", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.barge.quiet_ms = 10000;   // long enough that a non-question line could not auto-resume during this test

	r.final("First reply.", "msg-q1");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the first reply started");

	r.final("Second reply, queued behind the first.", "msg-q2");
	t.eq(r.chunks.length, 2, "both replies are queued, in order");

	r.barge.owner_spoke("actually never mind");   // real speech, no question — just pauses it
	t.eq(r.state, "heard", "paused mid first reply");

	r.final("The answer that was coming is this one.", "msg-q3");   // a fresh reply arriving is itself the drop signal
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.length, 2, "the first reply is gone; the second (never heard) and the new third reply remain");
	t.eq(r.chunks[0].text, "Second reply, queued behind the first.", "the one already waiting its turn kept its place — and plays first, not last");
	t.eq(r.chunks[1].text, "The answer that was coming is this one.", "the new reply queues behind it, not ahead of it");
	t.eq(r.state, "playing", "playback carries straight on with the reply that was already queued");
	return r;
});

// A question drop must also clear `this.live`, or a reply still streaming in picks up as if nothing happened: its
// next partial() would match the old live object's text prefix and queue only the unsent tail — a context-less
// half reply (review note 6: drop_heard() left `this.live` set).
if (Recite) test("Recite: a question drop also clears a still-streaming reply, so it is not half-read if it keeps coming", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.partial("First partial sentence of a stream. ");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.length, 1, "the first complete sentence streamed in and started playing");

	r.barge.owner_spoke("wait, what?");   // a question: drop
	t.eq(r.live, null, "the streaming reply being tracked is cleared along with the chunks it had queued");

	r.partial("First partial sentence of a stream. Second partial sentence continues anyway. ");
	await new Promise(res => setTimeout(res, 20));
	t.ok(r.chunks.some(c => c.text.includes("First partial sentence")), "the stream continuing is read as a fresh reply from its own start, not a bare, context-less tail");
	return r;
});

// Never start a fresh reply while the owner is talking; wait for a moment of quiet (the owner, 2026-11-01, "turn-taking").
// Proof for item 14: mic speech comes FIRST, then a reply arrives — nothing plays until the quiet window. Then a real
// barge-in (owner_spoke) stops the reply mid-sentence, and the rest resumes once the owner is quiet again.
if (Recite) test("Recite: a reply waits for the owner to stop talking before it starts, proof item 14", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = true;      // start_or_hold() only holds when barge.on is true — but stub sync() below so it never opens a real mic (error 4: a real mic rejects async in a headless test and clobbers barge.state)
	r.barge.sync = () => {};
	r.turn_wait_ms = 15;
	r.barge.hear(0.9);   // the owner is already speaking BEFORE the reply arrives — a real level fed through hear(), not a stubbed speaking()

	r.queue("A reply arriving while you are still talking.");
	t.eq(r.barge.speaking(), true, "speaking() computes true from the real level/threshold math, not a stub");
	t.eq(r.state, "idle", "it does not start over you");
	t.eq(r.wait_at, 0, "it is waiting for a moment of quiet");
	await new Promise(res => setTimeout(res, 40));
	t.eq(r.state, "idle", "still waiting — you are still talking");
	r.barge.hear(0.05);   // the level actually drops below threshold: real quiet, not a flipped flag
	t.eq(r.barge.speaking(), false, "and speaking() now reads quiet from that same real path");
	await new Promise(res => setTimeout(res, 150));
	t.eq(r.state, "playing", "started once you had been quiet for a moment");

	r.barge.quiet_ms = 15;
	r.barge.owner_spoke("hold on a second");   // a real barge-in, mid-reply, through the real wire-line route
	t.eq(r.state, "heard", "a barge-in mid-reply still stops playback");
	await new Promise(res => setTimeout(res, 50));
	t.eq(r.state, "playing", "and the rest resumes once the owner is quiet again");
	return r;
});

// Played/unplayed per message id survives a reload (owner item 20, folded in 2026-11-01 21:08): a reload must never
// re-read a reply already played, and never skip one not yet played. A second `Recite` (a stand-in for the reload)
// shares the same localStorage, as the real page does. Marked played only once the last chunk actually finishes
// (a second review caught marking at queue time: a reply dropped before it played was wrongly skipped forever).
if (Recite) test("Recite: a reply (by message id) is marked played only once it finishes, not when it is queued", async t => {
	const KEY = "lew42.recite.played", prior = localStorage.getItem(KEY);
	try {
		localStorage.removeItem(KEY);
		const r1 = new Recite({ voice: fake_voice });
		r1.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
		r1.barge.on = false;
		r1.final("First reply, already read before.", "msg-1-test");
		await new Promise(res => setTimeout(res, 20));
		t.eq(r1.state, "playing", "the reply started");
		t.eq(Recite.was_played("msg-1-test"), false, "not marked played yet — its one chunk has not finished");
		r1.ended();   // its one sentence finishes
		t.eq(Recite.was_played("msg-1-test"), true, "marked played once the last chunk actually finished");

		const r2 = new Recite({ voice: fake_voice });   // stands in for the page reloading: a new instance, same localStorage
		r2.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
		r2.barge.on = false;
		r2.final("First reply, already read before.", "msg-1-test");
		t.eq(r2.chunks.length, 0, "the same id, after a reload, is not read again");
		r2.final("A second, different reply.", "msg-2-test");
		t.eq(r2.chunks.length, 1, "a reply with a new id is still read — nothing unplayed is skipped");

		await new Promise(res => setTimeout(res, 20));
		r2.stop();   // dropped before it finished (a barge-in question, a session switch, a reload)
		t.eq(Recite.was_played("msg-2-test"), false, "a reply dropped before it finished is never marked played — it is read in full next time, never skipped");
		return r2;
	} finally { if (prior == null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, prior); }
});

// A second reply queued while the first still waits for quiet must not skip the first (review: queue() called
// start_or_hold() on every queue while idle, including while already holding one — it moved `wait_at` to the new,
// later chunk, orphaning everything held before it).
if (Recite) test("Recite: a second reply queued while the first still waits for quiet does not skip the first", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = true;
	r.barge.sync = () => {};   // never open a real mic in a test
	r.turn_wait_ms = 15;
	r.barge.hear(0.9);   // a real level above threshold, fed through the real hear() path, not a stubbed speaking()

	r.queue("First reply, held.");
	t.eq(r.wait_at, 0, "the first reply is held at chunk 0");

	r.queue("Second reply arrives while you are still talking.");
	t.eq(r.wait_at, 0, "still held at chunk 0 — a second queue() while still talking must not move it");
	t.eq(r.chunks.length, 2, "both replies are queued, in order");

	r.barge.hear(0.05);   // the level drops below threshold: real quiet
	clearTimeout(r.wait_timer);
	r.check_wait();   // first poll: notices quiet, starts the clock — not long enough yet
	t.eq(r.state, "idle", "not yet — the quiet window just started");
	r.quiet_since_wait = performance.now() - (r.turn_wait_ms + 5);   // fast-forward past turn_wait_ms: no real sleep needed
	clearTimeout(r.wait_timer);
	r.check_wait();   // second poll: quiet long enough — starts
	await new Promise(res => setTimeout(res, 20));   // let play()'s render promise settle
	t.eq(r.state, "playing", "started once quiet");
	t.eq(r.at, 0, "chunk 0 (the first reply) plays first, not chunk 1");

	r.ended();   // chunk 0 finishes
	t.eq(r.at, 1, "chunk 1 (the second reply) plays next — nothing was skipped");
	return r;
});

// BargeIn.speaking() must go quiet once the mic closes, or a reply held by turn-taking would wait for quiet that
// never arrives (close() used to leave the last loud `level` in place, with no more hear() frames to correct it).
if (Recite) test("BargeIn: close() resets the level, so speaking() cannot stay stuck true", t => {
	const r = new Recite({ voice: fake_voice });
	r.barge.on = true;
	r.barge.level = 0.9;   // a loud reading just before the mic closed
	t.eq(r.barge.speaking(), true, "loud, by the stub level");
	r.barge.close();
	t.eq(r.barge.level, 0, "close() clears the stale level");
	t.eq(r.barge.speaking(), false, "and speaking() reports quiet again — nothing holds a queued reply forever");
	return r;
});

// A second owner line while already paused by an earlier barge-in must still get its own question check
// (review: owner_spoke() ignored anything heard while recite.state was already "heard", so a second "wait... what
// about the other one?" resumed anyway and talked over the new answer).
if (Recite) test("Recite + BargeIn: a second owner line while already paused still drops on a question", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.barge.quiet_ms = 10000;   // long enough that it could not resume by itself during this test

	r.queue("An answer that gets interrupted.");
	await new Promise(res => setTimeout(res, 20));
	r.barge.owner_spoke("wait, hold on");
	t.eq(r.state, "heard", "paused by the first line");

	r.barge.owner_spoke("actually, what about the other one?");   // a SECOND line, while still paused — a question
	t.eq(r.state, "idle", "the question in the second line still drops the reply, even though it arrived while already paused");
	t.eq(r.chunks.length, 0, "nothing left queued");
	return r;
});

// Echo (dictation-v3 echo, 2026-11-01): the read-aloud voice leaking into the chat's own mic must never pause
// playback or fire a barge-in on itself. While recite.echo_active() (playing, or within echo_guard_ms after),
// owner_spoke() drops any heard text that fuzzy-matches the sentence being read, logged and never acted on; an
// unrelated line still barges in, exactly as before.
if (Recite) test("Recite + BargeIn: an echo of the sentence being read never pauses or barges in, but an unrelated line does", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	const traced = []; const real_trace = r.trace.bind(r); r.trace = (kind, fields) => { traced.push(kind); real_trace(kind, fields); };

	r.queue("The weather today is sunny and warm.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the reply started");

	r.barge.owner_spoke("the weather today is sunny and warm");   // the voice leaking back into the mic, near word-for-word
	t.eq(r.state, "playing", "an echo of what is being read never pauses playback");
	t.ok(traced.includes("barge: echo dropped"), "the drop is logged, not acted on");

	r.barge.owner_spoke("please stop for a second");   // unrelated words: a real interruption
	t.eq(r.state, "heard", "an unrelated line still barges in and pauses, same as always");
	return r;
});

// A known Whisper phantom ("Thank you.", "you") heard alone must never pause playback, even though it shares no
// words with what is being read — BargeIn.noise() catches it before the fuzzy echo match is even checked.
if (Recite) test("Recite + BargeIn: a known Whisper phantom phrase is dropped without pausing", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.queue("A reply about something else entirely.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the reply started");

	r.barge.owner_spoke("Thank you.");
	t.eq(r.state, "playing", "a known phantom phrase never pauses playback");

	r.barge.owner_spoke("Thanks for watching");
	t.eq(r.state, "playing", "a second known phantom phrase is dropped too");
	return r;
});

// Near-silent Whisper finals (review finding 1, 2026-11-01): the chat-mic path, owner_spoke(), must drop a
// hallucinated line out of near-silent audio too, not only trigger()'s own-mic path — the chat mic is the normal
// route on a phone. recent_peak is hear()'s decaying max of what the mic actually saw.
if (Recite) test("Recite + BargeIn: owner_spoke() drops a Whisper final heard out of near-silent audio", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	const traced = []; const real_trace = r.trace.bind(r); r.trace = (kind, fields) => { traced.push(kind); real_trace(kind, fields); };

	r.queue("A reply read while the room stays quiet.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the reply started");

	r.barge.recent_peak = 0.01;   // the mic frames hear() saw while this line was spoken never left near-silence
	r.barge.owner_spoke("go ahead and skip that one");
	t.eq(r.state, "playing", "a near-silent hallucinated line never pauses playback");
	t.ok(traced.includes("barge: near-silent dropped"), "the drop is logged, not acted on");

	r.barge.recent_peak = 0.9;   // the same words, but the owner was actually loud this time
	r.barge.owner_spoke("go ahead and skip that one");
	t.eq(r.state, "heard", "the gate only catches near-silence — real volume still barges in on the same words");
	return r;
});

// The thinking cue (dictation-v3, 2026-11-02): a short tone once the owner's line lands, again cue_repeat_ms later
// if the reply still has not started, then quiet. cue_repeat_ms is shortened here — the logic is the same at any
// interval, and the real 2 s default would make this test needlessly slow.
if (Recite) test("Recite: a thinking cue plays once, again if the reply has not started, then stays quiet", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.cue_repeat_ms = 20;

	const cues = []; const real_trace = r.trace.bind(r); r.trace = (kind, fields) => { if (kind === "thinking cue") cues.push(kind); real_trace(kind, fields); };

	r.from_wire({ kind: "line", line: { chat: { text: "what's the weather like", at: new Date().toISOString() } } });
	t.eq(cues.length, 1, "the cue plays once, right away");

	await new Promise(res => setTimeout(res, 35));
	t.eq(cues.length, 2, "and again once the reply still has not started");

	await new Promise(res => setTimeout(res, 35));
	t.eq(cues.length, 2, "then it stays quiet — no third cue");
	return r;
});

// Real reply text arriving — a stream chunk or a settled line — must stop the cue right away, even mid-wait.
if (Recite) test("Recite: a thinking cue stops the moment the reply starts", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.cue_repeat_ms = 20;

	const cues = []; const real_trace = r.trace.bind(r); r.trace = (kind, fields) => { if (kind === "thinking cue") cues.push(kind); real_trace(kind, fields); };

	r.from_wire({ kind: "line", line: { chat: { text: "what's the weather like", at: new Date().toISOString() } } });
	t.eq(cues.length, 1, "the cue plays once");

	r.from_wire({ kind: "stream", role: "smart", text: "It is sunny" });   // the reply starts arriving
	await new Promise(res => setTimeout(res, 35));
	t.eq(cues.length, 1, "no second cue — the reply already started");
	return r;
});

// A thinking cue never fires while a previous reply is already playing — it would talk over it.
if (Recite) test("Recite: a thinking cue is skipped while a reply is already playing", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.cue_repeat_ms = 20;

	const cues = []; const real_trace = r.trace.bind(r); r.trace = (kind, fields) => { if (kind === "thinking cue") cues.push(kind); real_trace(kind, fields); };

	r.queue("An earlier reply, still being read.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the earlier reply is playing");

	r.from_wire({ kind: "line", line: { chat: { text: "a follow-up line", at: new Date().toISOString() } } });
	t.eq(cues.length, 0, "no cue while something is already playing");
	return r;
});

// The setting itself: false turns the cue off entirely.
if (Recite) test("Recite: thinking_cue = false turns the cue off", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.thinking_cue = false;

	const cues = []; const real_trace = r.trace.bind(r); r.trace = (kind, fields) => { if (kind === "thinking cue") cues.push(kind); real_trace(kind, fields); };

	r.from_wire({ kind: "line", line: { chat: { text: "what's the weather like", at: new Date().toISOString() } } });
	t.eq(cues.length, 0, "thinking_cue = false means no cue at all");
	return r;
});

// Recite.Highlight's word timing: each word gets a share of the sentence's seconds by its length.
if (Recite) test("Recite.Highlight: which word is playing", t => {
	const H = Recite.Highlight, words = H.words("The voice server answers, on the phone.");
	t.eq(words.length, 7, "punctuation is not a word");
	t.eq(H.word_at(words, 0), 0, "at the start: the first word");
	t.eq(H.word_at(words, 0.999), 6, "at the end: the last word");
	t.ok(H.word_at(words, 0.5) > 1 && H.word_at(words, 0.5) < 5, "halfway: a middle word");
	t.eq(H.word_at([], 0.5), -1, "no words: none");
});

// Dropout fix (2026-11-02): raw, not-yet-rendered markdown (a link's bracket text followed by its literal URL)
// used to interpose extra DOM words the spoken sentence never had, breaking a strict positional match outright.
// Matching as a subsequence skips those words instead of giving up on the whole sentence.
if (Recite) test("Recite.Highlight: raw, not-yet-rendered markdown in the DOM still matches (the literal URL's words are skipped)", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	const root = document.createElement("div");
	root.setAttribute("data-recite-root", "");
	root.textContent = "Check the [sunny](http://example.com/weather) forecast and **bold** text now.";
	document.body.appendChild(root);

	r.queue("Check the sunny forecast and bold text now.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the reply started");

	r.highlight.tick();
	t.ok(Array.isArray(r.highlight.ranges) && r.highlight.ranges.length === 8, "the bracket text and the literal URL's own words don't break the match");

	root.remove();
	return r;
});

// A sentence genuinely not on the page yet (nothing streamed into the bubble) is retried every RETRY_MS rather
// than staying dark for the rest of the sentence, and traces "highlight: not found" once per distinct miss, not
// once per retry.
if (Recite) test("Recite.Highlight: a sentence not yet on the page is traced once, then found once it appears", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	const traced = []; const real_trace = r.trace.bind(r); r.trace = (kind, fields) => { if (kind === "highlight: not found") traced.push(fields); real_trace(kind, fields); };

	const root = document.createElement("div");
	root.setAttribute("data-recite-root", "");
	document.body.appendChild(root);   // empty: nothing streamed into the bubble yet

	r.queue("Check the sunny forecast and bold text now.");
	await new Promise(res => setTimeout(res, 20));

	r.highlight.tick();
	t.eq(r.highlight.ranges, null, "nothing on the page yet to match");
	t.eq(traced.length, 1, "the miss is logged once");

	r.highlight.tick();
	t.eq(traced.length, 1, "a retry before RETRY_MS passes does not log again");

	root.textContent = "Check the sunny forecast and bold text now.";   // the bubble just streamed this sentence in
	r.highlight.retry_at = 0;   // a test does not wait out the real retry window
	r.highlight.tick();
	t.ok(Array.isArray(r.highlight.ranges) && r.highlight.ranges.length === 8, "found once it appeared — no need to wait for the next sentence");
	t.eq(traced.length, 1, "still just the one trace — a successful retry does not log again");

	root.remove();
	return r;
});

// A live re-render that swaps in a brand new DOM node (the normal "bubble redrew while streaming" case) must
// reconnect without ever tracing a miss — the stale-node check already retried on every tick before this fix, and
// still does after it.
if (Recite) test("Recite.Highlight: a bubble re-rendered mid-sentence reconnects with no dropout", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	const traced = []; const real_trace = r.trace.bind(r); r.trace = (kind, fields) => { if (kind === "highlight: not found") traced.push(fields); real_trace(kind, fields); };

	const root = document.createElement("div");
	root.setAttribute("data-recite-root", "");
	root.textContent = "A link and a mention both read as their own plain text.";
	document.body.appendChild(root);

	r.queue("A link and a mention both read as their own plain text.");
	await new Promise(res => setTimeout(res, 20));
	r.highlight.tick();
	t.ok(Array.isArray(r.highlight.ranges), "found on the first render");
	const first_node = r.highlight.ranges[0].startContainer;

	root.replaceChildren(document.createTextNode("A link and a mention both read as their own plain text."));   // same text, a brand new node
	r.highlight.tick();
	t.ok(r.highlight.ranges[0].startContainer !== first_node, "reconnected to the new node");
	t.eq(traced.length, 0, "no dropout traced — the re-render was caught on the very next tick");

	root.remove();
	return r;
});

if (Recite) test("Recite.Highlight: a mention chip's own icon word does not break the match", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	const root = document.createElement("div");
	root.setAttribute("data-recite-root", "");
	// The real shape ext/Mention/Mention.js builds for "@mike" (mention_html()): an icon span (its ligature name,
	// "person", is still real text under the walker) then the shown-name span — the chip's own noise word sits
	// right where "mike" should be, between two real sentence words (review finding 4, 2026-11-02).
	root.innerHTML = 'Check with <a class="item inline mention is-agent"><span class="material-icons icon item-icon">person</span><span class="item-name">Mike</span></a> about the plan before lunch.';
	document.body.appendChild(root);

	r.queue("Check with Mike about the plan before lunch.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the reply started");
	r.highlight.tick();
	t.ok(Array.isArray(r.highlight.ranges) && r.highlight.ranges.length === 8, "the chip's icon word is skipped, the chip's name word still counted");

	root.remove();
	return r;
});

// No-flood (dictation-v3, 2026-11-02): a reply from a tracked agent role (Recite.AGENT_ID — never "smart", "fast",
// "revise" or "card") is an agent update, never read in full — it collapses to one short line, and if the owner's
// own line is still awaiting the direct answer
// (cue_pending), it waits behind that answer rather than flooding ahead of or instead of it.
if (Recite) test("Recite: an agent update collapses to one line and queues behind the direct answer, not ahead of it", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.cue_pending = true;   // the owner's line landed; a direct reply is still expected

	r.from_wire({ kind: "line", line: { chat: { text: "The build finished, 3 files changed.", at: new Date().toISOString(), from: { kind: "assistant", id: "mastermind-read-aloud-b" } } } });
	t.eq(r.chunks.length, 0, "held, not queued yet — the direct answer hasn't arrived");
	t.eq(r.pending_updates.length, 1, "one update waiting");

	r.from_wire({ kind: "line", line: { chat: { text: "Here is the direct answer.", at: new Date().toISOString(), from: { kind: "assistant", id: "smart" } } } });
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.length, 2, "the direct answer plus the held update, in that order");
	t.eq(r.chunks[0].text, "Here is the direct answer.", "the direct answer plays first");
	t.eq(r.chunks[1].text, "I have an update on read aloud b, it is in the chat.", "the update collapses to one short line, not the full text");
	t.eq(r.pending_updates.length, 0, "nothing left waiting");
	return r;
});

// With no direct answer pending, an update has nothing to wait behind — it just takes its turn like any other reply.
if (Recite) test("Recite: an agent update queues right away when no direct answer is pending", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	r.from_wire({ kind: "line", line: { chat: { text: "Just a status line, unprompted.", at: new Date().toISOString(), from: { kind: "assistant", id: "mastermind-chat-model" } } } });
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.length, 1, "queued right away — nothing to wait behind");
	t.eq(r.chunks[0].text, "I have an update on chat model, it is in the chat.", "the mastermind- prefix is stripped and dashes read as spaces");
	t.eq(r.state, "playing", "and it started");
	return r;
});

// Review finding, read-aloud-b 2026-11-02: flushing on every streamed partial (not just once the stream ends) let a
// held update land in the MIDDLE of the very answer it was meant to wait behind — queued after the stream's first
// sentence, ahead of its second. The stream's own "" (ended) signal is the only point flush_updates() should run.
if (Recite) test("Recite: a held update waits for the whole stream to end, not just its first sentence", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.cue_pending = true;   // the owner's line landed; a direct reply is still expected

	r.from_wire({ kind: "line", line: { chat: { text: "An update while a streamed answer is coming.", at: new Date().toISOString(), from: { kind: "assistant", id: "mastermind-read-aloud-b" } } } });
	t.eq(r.pending_updates.length, 1, "held — the direct answer hasn't started");

	r.from_wire({ kind: "stream", role: "smart", text: "First sentence of the answer. " });
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.length, 1, "the stream's first sentence queued");
	t.eq(r.pending_updates.length, 1, "still held — the stream has not ended, only its first sentence has");

	r.from_wire({ kind: "stream", role: "smart", text: "First sentence of the answer. Second sentence of the answer. " });
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.length, 2, "the stream's second sentence queued too");
	t.eq(r.pending_updates.length, 1, "still held — the stream has still not ended");

	r.from_wire({ kind: "stream", role: "smart", text: "" });   // the stream ends
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.length, 3, "the update is queued now, behind BOTH of the answer's own sentences");
	t.eq(r.chunks[2].text, "I have an update on read aloud b, it is in the chat.", "and it is the collapsed update line, not read in full");
	t.eq(r.pending_updates.length, 0, "nothing left waiting");
	return r;
});

// Review finding, read-aloud-b 2026-11-02: "fast", "revise" and "card" post an assistant chat line too, but are not
// agent updates — treating every non-"smart" id as one would read "revise" (every voice revision of the owner's own
// sentence) aloud as "I have an update on revise, it is in the chat.", the very flood this task was meant to stop.
if (Recite) test("Recite: 'fast', 'revise' and 'card' are not agent updates — ignored, same as before this task", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	for (const id of ["fast", "revise", "card"]){
		r.from_wire({ kind: "line", line: { chat: { text: "something posted on this id", at: new Date().toISOString(), from: { kind: "assistant", id } } } });
	}
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.chunks.length, 0, "none of them queued anything");
	t.eq(r.pending_updates.length, 0, "and none of them were even held as a pending update");
	return r;
});

// A held update must not be lost forever if the direct answer never arrives (the owner's line may not have needed one).
if (Recite) test("Recite: a held agent update is released on its own if no direct answer ever arrives", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;
	r.update_hold_ms = 20;   // fast for the test
	r.cue_pending = true;

	r.from_wire({ kind: "line", line: { chat: { text: "An update with nobody waiting to answer.", at: new Date().toISOString(), from: { kind: "assistant", id: "minion-scan-9" } } } });
	t.eq(r.chunks.length, 0, "held at first");

	await new Promise(res => setTimeout(res, 40));
	t.eq(r.chunks.length, 1, "released on its own once the safety window passed");
	return r;
});

// Tap to pause (dictation-v3, 2026-11-02, item 2/b): tapping a chat bubble toggles play/pause, the same gesture as
// the bar's own Play button — but a tap on a link, a mention chip or a button inside it does its own thing instead.
if (Recite) test("Recite.Tap: tapping a chat bubble plays or pauses, but a link, a mention chip or a button inside it does not", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	const root = document.createElement("div");
	root.setAttribute("data-recite-root", "");
	root.innerHTML = 'Some reply text, <a href="#test-link">a link</a>, ' +
		'<a class="item inline mention is-agent"><span class="material-icons icon item-icon">person</span><span class="item-name">Mike</span></a>, ' +
		'and <button>a button</button>.';
	document.body.appendChild(root);

	r.queue("Some reply text.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the reply started");

	root.querySelector("a[href]").dispatchEvent(new MouseEvent("click", { bubbles: true }));
	t.eq(r.state, "playing", "a tap on a plain link never toggles playback");

	root.querySelector("a.mention").dispatchEvent(new MouseEvent("click", { bubbles: true }));
	t.eq(r.state, "playing", "nor does a tap on a mention chip");

	root.querySelector("button").dispatchEvent(new MouseEvent("click", { bubbles: true }));
	t.eq(r.state, "playing", "nor a button");

	document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	t.eq(r.state, "playing", "nor a tap outside any chat bubble");

	root.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	t.eq(r.state, "paused", "but a tap on the bubble's own text pauses it");

	root.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	await new Promise(res => setTimeout(res, 20));   // resume()'s own audio.play() promise settles
	t.eq(r.state, "playing", "and a second tap resumes it");

	root.remove();
	return r;
});

// Review finding, read-aloud-b 2026-11-02: a drag to select text inside a bubble still fires a native `click` on
// mouseup — by then the selection is already in place, so checking for one at click time tells a drag apart from a tap.
if (Recite) test("Recite.Tap: a drag that leaves a text selection behind does not toggle playback", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = false;

	const root = document.createElement("div");
	root.setAttribute("data-recite-root", "");
	root.textContent = "Some reply text to select.";
	document.body.appendChild(root);

	r.queue("Some reply text to select.");
	await new Promise(res => setTimeout(res, 20));
	t.eq(r.state, "playing", "the reply started");

	const range = document.createRange();
	range.selectNodeContents(root.firstChild);
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);   // what a mouse drag leaves behind by the time `click` fires on mouseup

	root.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	t.eq(r.state, "playing", "a tap that left a text selection behind is a drag, not a tap — playback is untouched");

	sel.removeAllRanges();
	root.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	t.eq(r.state, "paused", "with no selection in place, the same tap still pauses");

	root.remove();
	return r;
});

// Replay any reply (Recite.Bubble): a bubble is named by its first ten spoken words, its last read place is {sentence, seconds}, and
// a replay starts from it. The rendered text of a reply and its markdown source give the same name.
if (Recite) test("Recite: a bubble's name, stepping back, and the place it stopped at", async t => {
	t.eq(Recite.bubble_key("**Done.** I fixed [the bar](/x/) today, ok?"), Recite.bubble_key("Done. I fixed the bar today, ok?"), "the markdown source and the drawn text give the same key");
	t.eq(Recite.bubble_key("One two three four five six seven eight nine ten eleven twelve"), "one two three four five six seven eight nine ten", "only the first ten words name it");
	t.eq(Recite.bubble_key(""), "", "an empty reply has no name");

	const c = [{ text: "a".repeat(30), seconds: 3 }, { text: "b".repeat(30), seconds: 3 }, { text: "c".repeat(150) }];   // the third is not rendered: 150 chars / 15 = 10 s
	t.eq(Recite.step_back(c, 1, 5, 2), { i: 1, t: 3 }, "inside a sentence: just seconds earlier");
	t.eq(Recite.step_back(c, 1, 1, 2), { i: 0, t: 2 }, "across a sentence boundary: the end of the one before, less what is left");
	t.eq(Recite.step_back(c, 1, 1, 10), { i: 0, t: 0 }, "past the start of the bubble: its start");
	t.eq(Recite.step_back(c, 2, 1, 5, 1), { i: 1, t: 0 }, "the floor keeps it inside this bubble's first sentence");
	t.eq(Recite.step_back(c, 2, 0, 3), { i: 1, t: 0 }, "an exact fit lands at the start of that sentence");
	t.eq(+Recite.step_back([{ text: "x".repeat(150) }, { text: "y" }], 1, 0, 3).t.toFixed(1), 7, "a sentence not rendered yet counts by the estimate (15 characters a second)");

	const key = "test bubble place " + Math.random();
	Recite.set_place(key, { i: 2, t: 4.5 }, true);
	t.eq(Recite.place_of(key), { i: 2, t: 4.5 }, "a place is remembered");
	t.eq(JSON.parse(localStorage.getItem("lew42.recite.places"))[key], { i: 2, t: 4.5 }, "and written to the browser's storage for a reload");
	Recite.clear_place(key);
	t.eq(Recite.place_of(key), null, "it can be cleared (a bubble heard to the end starts from the top next time)");
	t.eq(JSON.parse(localStorage.getItem("lew42.recite.places"))[key], undefined, "and is gone from storage too");
});

if (Recite) test("Recite: replay starts a bubble from the sentence and second it stopped at", async t => {
	const r = new Recite({ voice: fake_voice });
	r.barge.on = false;
	const played = [];
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ played.push({ src: this.src, at: this.currentTime }); return Promise.resolve(); } };

	const text = "First sentence is here and it is long enough. Second sentence is a bit longer than the first. Third sentence ends it.";
	const key = Recite.bubble_key(text);
	Recite.clear_place(key);

	r.replay(text);
	await new Promise(res => setTimeout(res, 40));
	t.eq(r.chunks.length, 3, "the bubble's three sentences are queued");
	t.eq(r.chunks[0].key, key, "each carries the bubble's key");
	t.eq(r.at, 0, "no place remembered: it starts at the first sentence");
	t.eq(played[0].at, 0, "from second 0");

	Recite.set_place(key, { i: 1, t: 1.5 }, true);
	r.replay(text);
	await new Promise(res => setTimeout(res, 40));
	t.eq(r.at, 1, "with a place remembered it starts at that sentence");
	t.eq(played.at(-1).at, 1.5, "that many seconds in");
	t.eq(r.bubble_state().key, key, "and Recite says which bubble is being read");

	r.audio.currentTime = 2;
	r.back_bubble(text);   // 2 s into sentence 1 (a 3.5 s sentence): back 10 s lands at the bubble's start
	await new Promise(res => setTimeout(res, 40));
	t.eq(r.at, 0, "back 10 s from near the start of the bubble goes to its first sentence");
	t.eq(played.at(-1).at, 0, "at second 0");

	r.stop();
	t.eq(Recite.place_of(key) != null, true, "stopping keeps the place");
	Recite.clear_place(key);
	return r;
});

if (Recite) test("Recite: a tap on the bubble being read pauses it; a tap on another one swaps to it", async t => {
	const r = new Recite({ voice: fake_voice });
	r.barge.on = false;
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	const a = "Alpha reply is the first one to read aloud today.", b = "Bravo reply is another reply with its own words entirely.";
	Recite.clear_place(Recite.bubble_key(a)); Recite.clear_place(Recite.bubble_key(b));

	r.tap_bubble(a);
	await new Promise(res => setTimeout(res, 40));
	t.eq(r.state, "playing", "a tap starts the bubble");
	r.tap_bubble(a);
	t.eq(r.state, "paused", "a second tap pauses it");
	r.tap_bubble(a);
	await new Promise(res => setTimeout(res, 40));
	t.eq(r.state, "playing", "a third resumes it");
	r.tap_bubble(b);
	await new Promise(res => setTimeout(res, 40));
	t.eq(r.bubble_state().key, Recite.bubble_key(b), "a tap on another bubble stops the first and reads that one");
	t.eq(r.chunks.every(c => c.key === Recite.bubble_key(b)), true, "nothing of the first is left in the queue");
	r.stop();
	Recite.clear_place(Recite.bubble_key(a)); Recite.clear_place(Recite.bubble_key(b));
	return r;
});
