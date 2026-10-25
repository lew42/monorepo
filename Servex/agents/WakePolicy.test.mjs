/* node Servex/agents/WakePolicy.test.mjs — the smart seat's wake gate with a FAKE clock and fake lines: no model, no Claude
 * session, no real timers. Part 1 is the policy alone; part 2 runs it inside Sessions.js against a fake agent host. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import WakePolicy, { WAKE_DEFAULTS, WAKE_LIMITS, sentence_count, is_question, is_addressed } from "./WakePolicy.js";
import Sessions from "./Sessions.js";

// These checks were written against a 6 s gap; the shipped default is now WAKE_DEFAULTS.gap_ms (12 s), so they pin 6 s here.
const GAP6 = { gap_ms: 6000, every: WAKE_DEFAULTS.every };
process.env.SERVEX_SESSION_WAKE_GAP_MS = "6000";

let checks = 0;
const check = (name, fn) => { fn(); checks++; };

/** A clock you move by hand: set() queues a callback at now+ms, advance(ms) runs everything that comes due, in order. */
export function fake_clock(){
	let now = 0, next = 1; const timers = new Map();
	return {
		get now(){ return now; },
		set(fn, ms){ const id = next++; timers.set(id, { at: now + ms, fn }); return id; },
		clear(id){ timers.delete(id); },
		advance(ms){
			const end = now + ms;
			for (;;){
				const due = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
				if (!due) break;
				timers.delete(due[0]); now = due[1].at; due[1].fn();
			}
			now = end;
		},
	};
}

function rig(opts = {}){
	const clock = fake_clock(), wakes = [];
	const policy = new WakePolicy({ clock, flush: (id, lines, why, info) => wakes.push({ at: clock.now, id, why, n: lines.length, sentences: info.sentences }), defaults: GAP6, ...opts });
	return { clock, wakes, policy, say: (text, id = "s1") => policy.add(id, { at: clock.now, text }) };
}

// ── part 1: the policy ────────────────────────────────────────────────────────────────────
check("20 sentences in 2 minutes with three pauses wake the smart seat 3-4 times, not 20", () => {
	const { clock, wakes, say } = rig();
	let sentences = 0;
	for (let burst = 0; burst < 4; burst++){
		for (let i = 0; i < 5; i++){ say(`This is sentence ${++sentences} of the dictation.`); clock.advance(4000); }
		clock.advance(10000);   // a pause past the gap
	}
	assert.equal(sentences, 20);
	assert.ok(clock.now <= 120000, `the scenario fits in two minutes (${clock.now} ms)`);
	assert.ok(wakes.length >= 3 && wakes.length <= 4, `wakes: ${wakes.length}`);
	assert.equal(wakes.reduce((n, w) => n + w.sentences, 0), 20, "every sentence reached the smart seat, in a batch");
	assert.ok(wakes.every(w => /^paused/.test(w.why)));
});

check("a pause is measured from the LAST line: a line inside the gap restarts it", () => {
	const { clock, wakes, say } = rig();
	say("one."); clock.advance(5000); say("two."); clock.advance(5000); say("three.");
	assert.equal(wakes.length, 0);
	clock.advance(5999); assert.equal(wakes.length, 0);
	clock.advance(1); assert.equal(wakes.length, 1);
	assert.deepEqual([wakes[0].n, wakes[0].sentences, wakes[0].why], [3, 3, "paused 6 s"]);
});

check("20 sentences with no pause at all wake it every N sentences, then once at the end", () => {
	const { clock, wakes, say } = rig();
	for (let i = 1; i <= 20; i++){ say(`Sentence ${i}.`); clock.advance(1000); }
	clock.advance(10000);
	assert.deepEqual(wakes.map(w => w.why), ["6 sentences", "6 sentences", "6 sentences", "paused 6 s"]);
	assert.deepEqual(wakes.map(w => w.sentences), [6, 6, 6, 2]);
});

check("a line with several sentences counts them", () => {
	assert.equal(sentence_count("One. Two! Three? Four"), 4);
	assert.equal(sentence_count("just words"), 1);
	const { wakes, say } = rig();
	say("One. Two. Three."); say("Four. Five. Six.");
	assert.deepEqual(wakes.map(w => [w.why, w.n]), [["6 sentences", 2]]);
});

check("a question wakes it at once, with what came before", () => {
	const { clock, wakes, say } = rig();
	say("Some context."); clock.advance(1000);
	say("What do you think about that?");
	assert.deepEqual(wakes.map(w => [w.why, w.n, w.at]), [["asked", 2, 1000]]);
	clock.advance(60000);
	assert.equal(wakes.length, 1, "the timer was cancelled by the flush");
});

check("being addressed by name wakes it at once; a possessive or a passing word does not", () => {
	for (const yes of ["Smart, can you check this", "okay mastermind what is open", "hey smart assistant, status", "That was fine. Mastermind, go ahead."]) assert.ok(is_addressed(yes), yes);
	for (const no of ["the mastermind's brief is long", "that is a smart idea", "I was smart about it.", "go ahead and spawn that mastermind however you can", "tell the smart assistant's seat to wait"]) assert.ok(!is_addressed(no), no);
	assert.ok(is_question("really?") && is_question("now? ") && is_question('he said "why?"') && !is_question("really."));
	assert.ok(!is_question("Why did it reorder those? I do not know why, so let me look."), "a rhetorical ? mid-dictation is not a wake");
	const { wakes, say } = rig();
	assert.equal(say("Smart, take a look at this."), "asked");
	assert.equal(wakes.length, 1);
});

check("silence() and flush() hand the batch over; an empty batch wakes nothing", () => {
	const { clock, wakes, say, policy } = rig();
	assert.equal(policy.flush("s1", "mic off"), false);
	say("hello there."); clock.advance(100);
	assert.equal(policy.silence("s1", 2500), false, "2.5 s of silence is under the gap");
	assert.equal(policy.silence("s1", 6000), true);
	say("last one."); policy.flush("s1", "mic off");
	assert.deepEqual(wakes.map(w => w.why), ["paused 6 s", "mic off"]);
	assert.equal(policy.size("s1"), 0);
});

check("silence already measured counts toward the gap (elapsed_ms) and a typed hold replaces it (hold_ms)", () => {
	const { clock, wakes, policy } = rig();
	policy.add("s1", { at: 0, text: "spoken." }, { elapsed_ms: 2500 });
	clock.advance(3499); assert.equal(wakes.length, 0);
	clock.advance(1); assert.equal(wakes.length, 1);
	policy.add("s1", { at: 0, text: "typed." }, { hold_ms: 1500 });
	clock.advance(1500); assert.deepEqual(wakes.map(w => w.why), ["paused 6 s", "paused 1.5 s"]);
});

check("sessions are gated independently", () => {
	const { clock, wakes, say } = rig();
	say("a one.", "a"); say("b one.", "b"); clock.advance(3000); say("b two.", "b"); clock.advance(3000);
	assert.deepEqual(wakes.map(w => [w.id, w.n]), [["a", 1]]);
	clock.advance(3000);
	assert.deepEqual(wakes.map(w => [w.id, w.n]), [["a", 1], ["b", 2]]);
});

check("the knobs: per-session values override the defaults, are validated, and null drops back", () => {
	const own = { s1: { gap_ms: 2000, every: 2 } };
	const { clock, wakes, say, policy } = rig({ stored: id => own[id] });
	assert.deepEqual(policy.knobs("s1"), { gap_ms: 2000, every: 2 });
	assert.deepEqual(policy.knobs("other"), GAP6);
	say("one."); clock.advance(2000);
	assert.equal(wakes.length, 1, "this session's gap is 2 s");
	say("a.", "other"); clock.advance(2000);
	assert.equal(wakes.length, 1, "another session still has the 6 s default");
	assert.deepEqual(policy.checked("s1", { every: 9 }), { gap_ms: 2000, every: 9 });
	assert.deepEqual(policy.checked("s1", { gap_ms: null, every: null }), {});
	for (const bad of [{ gap_ms: 5 }, { gap_ms: 999999 }, { every: 0 }, { every: "lots" }])
		assert.throws(() => policy.checked("s1", bad), e => e.status === 400 && /must be a number from/.test(e.message));
	assert.deepEqual(WAKE_LIMITS, { gap_ms: [1000, 60000], every: [1, 50] });
});

// ── part 2: inside Sessions.js ───────────────────────────────────────────────────────────
const repo = fs.mkdtempSync(path.join(os.tmpdir(), "wake-test-"));
fs.mkdirSync(path.join(repo, "public/a"), { recursive: true });
const sent = [];
const agents = {
	live: new Map(),
	spawn(spec){ const id = spec.id ?? `${spec.role}-${spec.name}`; const agent = { id, state: "working", session_id: null }; agents.live.set(id, agent); return agent; },
	send(id, text){ sent.push({ id, text }); },
	stop(id){ agents.live.get(id).state = "stopped"; },
};
let n = 0;
function make(){
	const s = new Sessions({ repo, file: path.join(repo, `sessions-${++n}.json`), assistant: "fast" });
	s.load();
	s.servex = { agents };
	const clock = fake_clock();
	s.waker.clock = clock;
	return { s, clock, made: s.create({ path: "/a/" }) };
}
// Chat v2: every seat message now ends with the Prompt it answers, `\n(prompt p-…)`; PromptLines.say.test.mjs checks that tail, so these checks read the message without it.
const no_prompt = t => t?.replace(/\n\(prompt p-[\w-]+\)$/, "");
const smart_prompts = () => sent.filter(c => c.id.startsWith("session-smart")).map(c => no_prompt(c.text));
const fast_prompts = () => sent.filter(c => c.id.startsWith("session-fast")).map(c => no_prompt(c.text));
// A spoken line from a page that reports the floor, released by a 2.6 s quiet event (what the browser sends).
const speak = (s, made, text) => s.say({ session: made.session, path: "/a/", text, via: "voice", floor: "done", quiet_ms: 2600 });

check("Sessions: the fast seat hears every spoken thought, the smart seat only the batch", () => {
	sent.length = 0;
	const { s, clock, made } = make();
	for (let i = 1; i <= 5; i++){ speak(s, made, `Spoken thought number ${i}.`); clock.advance(3000); }
	assert.equal(fast_prompts().length, 5, "fast: one per thought");
	assert.equal(smart_prompts().length, 0, "smart: nothing yet (the 6 s gap is not reached between lines)");
	speak(s, made, "Spoken thought number 6.");
	assert.equal(smart_prompts().length, 1);
	assert.match(smart_prompts()[0], /Spoken thought number 1\.[\s\S]*Spoken thought number 6\.\n\(6 sentences\)$/);
	assert.equal(s.map[made.session].smart_re, s.map[made.session].fast_re);
});

check("Sessions: a pause wakes it once; real silence from the browser counts toward the gap", () => {
	sent.length = 0;
	const { s, clock, made } = make();
	speak(s, made, "First thought of the dictation."); speak(s, made, "A second one right after.");
	assert.equal(smart_prompts().length, 0);
	clock.advance(3399); assert.equal(smart_prompts().length, 0);   // 2.6 s already quiet + 3.4 s = the 6 s gap
	clock.advance(1);
	assert.equal(smart_prompts().length, 1);
	assert.match(smart_prompts()[0], /\n\(paused 6 s\)$/);
});

check("Sessions: the owner speaking again is not a pause: the timer stops, then gets a whole gap once the floor is done", () => {
	sent.length = 0;
	const { s, clock, made } = make();
	speak(s, made, "A thought, released after 2.6 s of quiet.");
	s.floor({ session: made.session, floor: "speaking" });
	clock.advance(4000); clock.advance(4000);
	assert.equal(smart_prompts().length, 0, "8 s of the owner talking is not 6 s of pause");
	s.floor({ session: made.session, floor: "done" });
	clock.advance(5999); assert.equal(smart_prompts().length, 0);
	clock.advance(1);
	assert.equal(smart_prompts().length, 1);
	assert.match(smart_prompts()[0], /\n\(paused 6 s\)$/);
});

check("Sessions: a question wakes it at once, and the mic going off flushes the rest", () => {
	sent.length = 0;
	const { s, clock, made } = make();
	speak(s, made, "Some context first."); speak(s, made, "Is that the right call?");
	assert.equal(smart_prompts().length, 1);
	assert.match(smart_prompts()[0], /context first[\s\S]*right call\?\n\(asked\)$/);
	speak(s, made, "Then one more thing.");
	s.quiet({ session: made.session, ms: 1000, mic_off: true });
	assert.equal(smart_prompts().length, 2);
	assert.match(smart_prompts()[1], /\(the mic went off\)$/);
	clock.advance(60000);
	assert.equal(smart_prompts().length, 2, "nothing is left to fire");
});

check("Sessions: typed lines join the same gate with the short typed hold", () => {
	sent.length = 0;
	const { s, clock, made } = make();
	s.say({ session: made.session, path: "/a/", text: "typed note one", via: "text" });
	s.say({ session: made.session, path: "/a/", text: "typed note two", via: "text" });
	assert.equal(smart_prompts().length, 0);
	clock.advance(s.quiet_ms);
	assert.equal(smart_prompts().length, 1);
	assert.match(smart_prompts()[0], /typed note one[\s\S]*typed note two\n\(paused 1\.5 s\)$/);
});

check("Sessions: settings() stores the knobs on the session, validated, and they change the rule", () => {
	sent.length = 0;
	const { s, clock, made } = make();
	assert.deepEqual(s.settings({ session: made.session }), { ok: true, ...GAP6 });
	assert.deepEqual(s.settings({ session: made.session, every: 2, gap_ms: 3000 }), { ok: true, every: 2, gap_ms: 3000 });
	assert.deepEqual(s.map[made.session].wake, { every: 2, gap_ms: 3000 });
	assert.deepEqual(JSON.parse(fs.readFileSync(s.file, "utf8"))[made.session].wake, { every: 2, gap_ms: 3000 }, "saved to sessions.json");
	speak(s, made, "One."); speak(s, made, "Two.");
	assert.equal(smart_prompts().length, 1);
	assert.throws(() => s.settings({ session: made.session, every: 0 }), e => e.status === 400);
	assert.throws(() => s.settings({ session: "no-such" }), e => e.status === 404);
	assert.deepEqual(s.settings({ session: made.session, every: null, gap_ms: null }), { ok: true, ...GAP6 });
	assert.equal("wake" in s.map[made.session], false);
});

check("Sessions: tail mode follows session.jsonl once and stops sending the batches the smart seat already hears raw", () => {
	sent.length = 0;
	const { s, made } = make();
	const subs = [];
	s.servex.follow = { list: agent => subs.filter(f => f.agent === agent), follow: sub => subs.push(sub) };
	assert.deepEqual(s.settings({ session: made.session, tail: true }), { ok: true, ...GAP6, tail: true });
	for (const t of ["One.", "Two.", "Three.", "Four.", "Five.", "Six."]) speak(s, made, t);
	assert.equal(subs.length, 1, "one subscription, however many batches");
	assert.match(subs[0].path, /session\.jsonl$/);
	assert.ok(subs[0].skip_by.includes(`session-smart-${made.session}`), "the seat's own lines are skipped");
	const first = smart_prompts().length;
	for (const t of ["Seven.", "Eight.", "Nine.", "Ten.", "Eleven.", "Twelve."]) speak(s, made, t);
	assert.equal(smart_prompts().length, first, "an awake seat gets no second batch message: Follow carries it");
	assert.deepEqual(s.settings({ session: made.session, tail: false }), { ok: true, ...GAP6 });
});

console.log(`WakePolicy.test.mjs: ${checks} checks passed`);
process.exit(0);
