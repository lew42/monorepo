/* node Servex/agents/say-tools.test.mjs — the single seat's three tools (ask2a-say-tools, Servex/agents/single-voice-assistant.md
 * "next step"): `say` queues a reply behind a gate, `nothing` ends a turn with nothing written, `retract_say` takes a queued one
 * back. Plain node, a scratch repo and a fake agent host: no model runs, no live Servex. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Sessions from "./Sessions.js";
import Session from "../../public/framework/core/Session/Session.js";
import { tools as servex_tools } from "./tools.js";

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; console.log("PASS —", name); };
const tick = () => new Promise(r => setImmediate(r));
const wait = ms => new Promise(r => setTimeout(r, ms));
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "say-tools-test-"));
fs.mkdirSync(path.join(repo, "public/a"), { recursive: true });
const agents = {
	live: new Map(),
	spawn(spec){ const id = spec.id ?? `${spec.role}-${spec.name}`, a = { id, state: "idle", session_id: null }; this.live.set(id, a); return a; },
	send(){},
	stop(id){ this.live.get(id).state = "stopped"; },
};
let n = 0;
// A SHORT, DISTINCT gate per band, fast enough for a test but far enough apart that a flaky tick cannot mix them up.
const make = (opts = {}) => {
	const s = new Sessions({ repo, file: path.join(repo, `say-${++n}.json`), assistant: "single", single_pause_ms: 60,
		say_gate_default_ms: 50, say_gate_question_ms: 15, say_gate_long_ms: 120, ...opts });
	s.load(); s.servex = { agents };
	return s;
};
const file_of = made => path.join(repo, "public", made.file.replace(/^\//, ""));
const lines = file => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const replies = file => lines(file).filter(l => l.chat?.from?.kind === "assistant");
const skips = file => lines(file).filter(l => l.skip);

try {

	// 1. plain text turn -> no reply line, one skip
	await check("plain text turn -> no reply line, one skip", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Hello.", via: "text" });
		await tick();
		const id = s.map[made.session].smart, agent = { id };
		s.heard({ type: "result", text: "Got it." }, agent);
		assert.equal(replies(file).length, 0, "no reply was written");
		assert.equal(skips(file).length, 1, "one skip line instead");
		assert.equal(skips(file)[0].skip.text, "Got it.");
	});

	// `nothing`: the tool itself (Servex/agents/tools.js) just returns {ok:true} and calls nothing on Sessions — proven
	// directly here as "an empty turn writes nothing", which is also what heard() does when there is no text at all.
	await check("an empty turn (the `nothing` tool, or no text) writes nothing — not even a skip", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Hello.", via: "text" });
		await tick();
		const id = s.map[made.session].smart, agent = { id };
		s.heard({ type: "result", text: "" }, agent);
		assert.equal(lines(file).filter(l => l.chat || l.skip).length, 1, "only the owner's own line is on disk");
	});

	// 2. say -> nothing written until the gate; after it, one reply through ChatWriter
	await check("say queues; nothing is written until the gate, then one reply through ChatWriter", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Plain thought.", via: "text" });
		await tick();
		const sess = s.map[made.session];
		const r = s.queue_say(sess, { text: "Here is the answer." });
		assert.ok(r.id, "say answers {id}");
		assert.equal(replies(file).length, 0, "nothing written yet, before the gate");
		await wait(70);
		const got = replies(file);
		assert.equal(got.length, 1, "released after the gate");
		assert.equal(got[0].chat.text, "Here is the answer.");
		const replay = Session.replay(lines(file));
		assert.ok(replay.messages.messages.some(m => m.constructor.name === "Reply"), "the messages list has the reply (ChatWriter's own path, same as heard())");
	});

	// review finding 1 (ask2a-say-tools): a say with no `re` of its own still links to the owner's latest sentence, the same
	// fallback `heard()` always used for a dual-seat smart reply ("exactly as before") — and a threaded owner line stays threaded.
	await check("a say with no `re` lands linked to the owner's latest sentence (s.smart_re), and threaded when that line was", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Plain thought.", via: "text", thread: false });
		await tick();
		const sess = s.map[made.session];
		const owner_at = sess.smart_re;
		assert.ok(owner_at, "single_say stamped smart_re for this sentence");
		s.queue_say(sess, { text: "No re given." });   // no `re` at all
		await wait(70);
		const got = replies(file);
		assert.equal(got.length, 1);
		assert.equal(got[0].chat.re, owner_at, "defaulted to smart_re, same as heard()'s own fallback");
		assert.ok(!got[0].chat.thread, "not threaded: the owner line was not");

		// a threaded owner line: the reply threads too, through the same reply_line() heard() uses.
		sess.threaded = [owner_at];
		s.queue_say(sess, { text: "Again, no re." });
		await wait(70);
		const got2 = replies(file);
		assert.equal(got2.length, 2);
		assert.equal(got2[1].chat.re, owner_at);
		assert.ok(got2[1].chat.thread, "threaded, because the owner line it defaults to was");
	});

	// 3. a floor `speaking` between cancels the release; the say stays queued
	await check("floor speaking cancels the pending release; the say stays queued until done again", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Plain thought.", via: "text" });
		await tick();
		const sess = s.map[made.session];
		s.queue_say(sess, { text: "Queued reply." });
		await wait(20);
		s.floor({ session: made.session, floor: "speaking" });   // a new sentence arrives mid-wait
		await wait(70);
		assert.equal(replies(file).length, 0, "still queued: the floor went speaking before the gate fired");
		s.floor({ session: made.session, floor: "done" });
		await wait(70);
		assert.equal(replies(file).length, 1, "released once the floor is done again");
	});

	// 4. two says queued -> the newest releases first, the older one only after a second gate
	await check("two says queued: the newest is released first, the older one only after a second gate", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Plain thought.", via: "text" });
		await tick();
		const sess = s.map[made.session];
		s.queue_say(sess, { text: "First queued." });
		await wait(10);
		s.queue_say(sess, { text: "Second, newer." });
		await wait(70);
		let got = replies(file);
		assert.equal(got.length, 1, "only the newest released so far");
		assert.equal(got[0].chat.text, "Second, newer.");
		await wait(70);
		got = replies(file);
		assert.equal(got.length, 2, "the older one released on its own, later gate");
		assert.equal(got[1].chat.text, "First queued.");
	});

	// 5a. retract_say removes a queued say
	await check("retract_say removes a queued say before it is released", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Plain thought.", via: "text" });
		await tick();
		const sess = s.map[made.session];
		const r = s.queue_say(sess, { text: "Never mind." });
		const g = s.retract_say(sess, { id: r.id });
		assert.equal(g.removed, true);
		await wait(70);
		assert.equal(replies(file).length, 0, "nothing was released: it was retracted");
	});

	// 5b. review finding 3: the REAL tool handlers in tools.js, not a stand-in — `ctx.caller` set to the single seat's own
	// agent id works; any other caller (a dual-seat smart agent, a minion, nobody) is refused.
	await check("say / nothing / retract_say through the real tools.js handlers: the single seat's own caller works, any other is refused", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Plain thought.", via: "text" });
		await tick();
		const sess = s.map[made.session], agent_id = sess.smart;
		assert.match(agent_id, /^single-voice-assistant-/, "the single seat's own minted id");
		const list = servex_tools({ servex: { sessions: s } });
		const say_tool = list.find(t => t.name === "say"), nothing_tool = list.find(t => t.name === "nothing"), retract_tool = list.find(t => t.name === "retract_say");
		assert.ok(say_tool && nothing_tool && retract_tool, "all three are registered in the real tool list");

		const r = JSON.parse(await say_tool.handler({ text: "Through the real handler." }, { caller: agent_id }));
		assert.ok(r.id, "say answers {id} for the single seat's own caller");
		assert.equal(replies(file).length, 0, "queued, not released yet");

		const bad = JSON.parse(await say_tool.handler({ text: "Should not queue." }, { caller: "session-smart-" + made.session }));
		assert.equal(bad.ok, false, "a dual-seat smart agent's own id is refused");
		assert.match(bad.why, /single seat only/);
		const bad2 = JSON.parse(await say_tool.handler({ text: "Also refused." }, {}));
		assert.equal(bad2.ok, false, "no caller at all is refused the same way");

		const g = JSON.parse(await retract_tool.handler({ id: r.id }, { caller: agent_id }));
		assert.equal(g.removed, true, "retract_say works for the single seat's own caller");
		const g2 = JSON.parse(await retract_tool.handler({ id: "whatever" }, { caller: "minion-something" }));
		assert.equal(g2.ok, false, "and refuses any other caller");

		const before = lines(file).length;
		assert.equal(JSON.parse(await nothing_tool.handler({}, { caller: agent_id })).ok, true);
		assert.equal(JSON.parse(await nothing_tool.handler({}, {})).ok, true, "nothing is a no-op for any caller, even none");
		assert.equal(lines(file).length, before, "nothing never touches the log, for anyone");
	});

	// 6. the question gate and the long-dictation gate
	await check("the question gate (say_gate_question_ms) is picked when the last owner sentence ends with \"?\"", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Is this working?", via: "text" });
		await tick();
		const sess = s.map[made.session];
		assert.equal(s.say_gate_ms(sess), s.say_gate_question_ms, "the question band");
		s.queue_say(sess, { text: "Yes." });
		await wait(25);   // well past say_gate_question_ms (15), well short of say_gate_default_ms (50)
		assert.equal(replies(file).length, 1, "released on the short question gate");
	});

	await check("the long-dictation gate (say_gate_long_ms) is picked after more than 5 owner sentences since the last release", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		for (const t of ["One.", "Two.", "Three.", "Four.", "Five.", "Six."]) s.say({ session: made.session, path: "/a/", text: t, via: "text" });
		const sess = s.map[made.session];
		await tick();
		assert.equal(sess.say_pending_count, 6, "six owner sentences since the last release");
		assert.equal(s.say_gate_ms(sess), s.say_gate_long_ms, "the long band (more than 5)");
		s.queue_say(sess, { text: "Catching up." });
		await wait(70);   // past say_gate_default_ms (50), short of say_gate_long_ms (120)
		assert.equal(replies(file).length, 0, "not yet: the long gate is still running");
		await wait(70);
		assert.equal(replies(file).length, 1, "released on the long gate");
	});

	// 7. a say more than 10 deep or 10 minutes old is dropped as stale, not spoken
	await check("a say past the queue depth is dropped with a `skip` line (why: stale), not spoken", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		s.say({ session: made.session, path: "/a/", text: "Plain thought.", via: "text" });
		await tick();
		const sess = s.map[made.session];
		sess.says = []; clearTimeout(s.say_timers?.get(sess.id));
		// 11 queued by hand, oldest first, so the newest (index 10) is the one that should actually speak.
		for (let i = 0; i < 11; i++) sess.says.push({ id: `fake-${i}`, text: `Say ${i}`, queued_at: Date.now() - (10 - i) * 1000 });
		s.release_say(sess);
		const got = replies(file);
		assert.equal(got.length, 1, "only the newest speaks");
		assert.equal(got[0].chat.text, "Say 10");
		const stale = skips(file).filter(l => l.skip.why === "stale");
		assert.equal(stale.length, 1, "the 11th-deepest (the oldest) is dropped as stale");
		assert.equal(stale[0].skip.text, "Say 0");
	});

	// 8. a real recorded session, replayed through the single seat with a stub agent calling say/nothing
	await check("a stub agent replaying a real session's sentences: say queues, nothing writes nothing, no early reply", async () => {
		const real = path.join(ROOT, "public/framework/ai/sessions/2026/11/03");
		let sample = null;
		if (fs.existsSync(real)) for (const day of fs.readdirSync(real, { withFileTypes: true })){
			if (!day.isDirectory()) continue;
			const f = path.join(real, day.name, "session.jsonl");
			if (fs.existsSync(f) && /^v-/.test(day.name)){ sample = f; break; }
		}
		const texts = [];
		if (sample) for (const l of lines(sample)) if (l.chat?.from?.kind === "owner" && l.chat.text) texts.push(l.chat.text);
		if (!texts.length) texts.push("First sentence from the recording.", "Second one.", "Is this still working?");

		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		for (const text of texts.slice(0, 5)) s.say({ session: made.session, path: "/a/", text, via: "text" });
		await tick();
		const sess = s.map[made.session], id = sess.smart, agent = { id };
		// the stub agent: `nothing` on most turns, one `say` near the end — exactly the single seat's own shape.
		s.heard({ type: "result", text: "" }, agent);   // nothing
		const r = s.queue_say(sess, { text: "Filed." });
		assert.ok(r.id);
		assert.equal(replies(file).length, 0, "the messages list has no reply the owner would hear before the gate");
		await wait(70);
		assert.equal(replies(file).length, 1, "released once the gate passes");
	});

} finally {
	fs.rmSync(repo, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

console.log(`say-tools.test.mjs: ${checks} checks passed`);
