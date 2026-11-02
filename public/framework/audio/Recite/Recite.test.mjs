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
	t.eq(r.state, "idle", "the old reply, and whatever was still queued behind it, is dropped");
	t.eq(r.chunks.length, 0, "nothing left queued — talking over the new answer would make no sense");
	t.ok(synced > 0, "dropping a question re-syncs the mic, ready for the next interruption (finding 5)");
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

// Never start a fresh reply while the owner is talking; wait for a moment of quiet (the owner, 2026-11-01, "turn-taking").
// Proof for item 14: mic speech comes FIRST, then a reply arrives — nothing plays until the quiet window. Then a real
// barge-in (owner_spoke) stops the reply mid-sentence, and the rest resumes once the owner is quiet again.
if (Recite) test("Recite: a reply waits for the owner to stop talking before it starts, proof item 14", async t => {
	const r = new Recite({ voice: fake_voice });
	r.audio = { src: "", muted: false, currentTime: 0, pause(){}, play(){ return Promise.resolve(); } };
	r.barge.on = true;      // start_or_hold() only holds when barge.on is true — but stub sync() below so it never opens a real mic (error 4: a real mic rejects async in a headless test and clobbers barge.state)
	r.barge.sync = () => {};
	r.turn_wait_ms = 15;
	let talking = true;   // the owner is already speaking BEFORE the reply arrives
	r.barge.speaking = () => talking;

	r.queue("A reply arriving while you are still talking.");
	t.eq(r.state, "idle", "it does not start over you");
	t.eq(r.wait_at, 0, "it is waiting for a moment of quiet");
	await new Promise(res => setTimeout(res, 40));
	t.eq(r.state, "idle", "still waiting — you are still talking");
	talking = false;
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
	let talking = true;
	r.barge.speaking = () => talking;

	r.queue("First reply, held.");
	t.eq(r.wait_at, 0, "the first reply is held at chunk 0");

	r.queue("Second reply arrives while you are still talking.");
	t.eq(r.wait_at, 0, "still held at chunk 0 — a second queue() while still talking must not move it");
	t.eq(r.chunks.length, 2, "both replies are queued, in order");

	talking = false;
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

// Recite.Highlight's word timing: each word gets a share of the sentence's seconds by its length.
if (Recite) test("Recite.Highlight: which word is playing", t => {
	const H = Recite.Highlight, words = H.words("The voice server answers, on the phone.");
	t.eq(words.length, 7, "punctuation is not a word");
	t.eq(H.word_at(words, 0), 0, "at the start: the first word");
	t.eq(H.word_at(words, 0.999), 6, "at the end: the last word");
	t.ok(H.word_at(words, 0.5) > 1 && H.word_at(words, 0.5) < 5, "halfway: a middle word");
	t.eq(H.word_at([], 0.5), -1, "no words: none");
});
