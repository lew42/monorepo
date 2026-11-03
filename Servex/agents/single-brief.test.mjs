/* node Servex/agents/single-brief.test.mjs — proves the REWRITTEN brief (ask2c-brief-rewrite, Servex/agents/single-voice-assistant.md)
 * against the rule it exists to enforce: say/nothing/retract_say are the only way out, plain text is never a reply, and the old
 * "reply on a pause" wording is gone. Three parts: (1) read the brief's own words; (2) the real opening prompt a single seat is
 * spawned with is brief() + where (review finding 1); (3) replay a real session's owner sentences
 * (public/framework/ai/sessions/2026/11/03/v-z0jonhy — has plain sentences, direct questions, and a task-like prompt) through the
 * REAL say/nothing/retract_say handlers in tools.js, one call per sentence, plus a narration attempt the gate must still mute.
 * Plain node, a scratch repo, no model runs, no live Servex. */
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
const BRIEF = fs.readFileSync(path.join(ROOT, "Servex/agents/single-voice-assistant.md"), "utf8");

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "single-brief-test-"));
fs.mkdirSync(path.join(repo, "public/a"), { recursive: true });
const agents = {
	live: new Map(), spawned: [],
	spawn(spec){ this.spawned.push(spec); const id = spec.id ?? `${spec.role}-${spec.name}`, a = { id, state: "idle", session_id: null }; this.live.set(id, a); return a; },
	send(){},
	stop(id){ this.live.get(id).state = "stopped"; },
};
let n = 0;
const make = () => {
	const s = new Sessions({ repo, file: path.join(repo, `brief-${++n}.json`), assistant: "single", single_pause_ms: 30,
		say_gate_default_ms: 40, say_gate_question_ms: 15, say_gate_long_ms: 100 });
	s.load(); s.servex = { agents };
	return s;
};
const file_of = made => path.join(repo, "public", made.file.replace(/^\//, ""));
const lines = file => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const replies = file => lines(file).filter(l => l.chat?.from?.kind === "assistant");
const skips = file => lines(file).filter(l => l.skip);

try {

	// --- Part 1: the brief's own text ----------------------------------------------------------------------------------

	await check("brief names all three tools", () => {
		for (const name of ["say", "nothing", "retract_say"]) assert.match(BRIEF, new RegExp("\\b" + name + "\\b"), `brief mentions ${name}`);
	});

	await check("brief has no 'reply on a pause' wording and no instruction to acknowledge", () => {
		assert.doesNotMatch(BRIEF, /reply now only if a question is open/i, "the removed pause-cue instruction text is gone");
		assert.doesNotMatch(BRIEF, /acknowledge/i, "no instruction to acknowledge");
		assert.doesNotMatch(BRIEF, /no open questions/i, "no filler line the owner specifically complained about");
	});

	await check("brief says plain text is never a reply, and keeps the raw-words rule untouched", () => {
		assert.match(BRIEF, /plain text/i);
		assert.match(BRIEF, /from:\s*\{\s*prompt/, "the ask1 raw-words shape (from: {prompt, sentence}) survives the rewrite");
		assert.match(BRIEF, /sentence/);
	});

	await check("brief says newest thing first (review finding 3: this is the check risk.md item 4 names)", () => {
		assert.match(BRIEF, /newest/i);
	});

	// --- Part 2: a real recorded session replayed through the real single-seat machinery -------------------------------

	await check("replayed session: the real opening prompt is the brief (review finding 1) — brief() + the \"where\" part Sessions.js actually spawns the seat with, not a stand-in", async () => {
		const s = make(), made = s.create({ path: "/a/", fresh: true });
		s.say({ session: made.session, path: "/a/", text: "First sentence.", via: "voice" });
		await tick();
		const sess = s.map[made.session];
		const spec = agents.spawned.find(sp => sp.role === "single-voice-assistant");
		assert.ok(spec, "the single seat was spawned for real, through Sessions.spawn()");
		const where = `\n\nThis session is ${sess.id}. Its home page is ${sess.home}; the owner pressed ✦ on ${sess.path}.`
			+ `\n\nYour session's page (the item tool's \`path\`): ${path.posix.dirname(sess.file)}/`;
		assert.equal(spec.system, s.single_brief() + where, "the system prompt handed to the real agent IS brief() + where — the exact text the brief asked this test to put in front of the seat");
	});

	await check("replayed session: a scripted seat, driven through the REAL say/nothing/retract_say handlers in tools.js (one call per sentence), never reaches the owner before the gate — and a narration attempt in plain text is a muted skip, not a reply", async () => {
		const sample = path.join(ROOT, "public/framework/ai/sessions/2026/11/03/v-z0jonhy/session.jsonl");
		assert.ok(fs.existsSync(sample), "the named sample session exists");
		const owner_lines = lines(sample).filter(l => l.chat?.from?.kind === "owner" && l.chat.text);
		assert.ok(owner_lines.some(l => /\?/.test(l.chat.text)), "sample has a direct question");
		assert.ok(owner_lines.some(l => /study how|file.*task/i.test(l.chat.text)), "sample has a task-like prompt");
		assert.ok(owner_lines.length >= 5, "sample is a real multi-sentence dictation, not one line");

		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		const sentences = owner_lines.slice(0, 6);
		for (const l of sentences) s.say({ session: made.session, path: "/a/", text: l.chat.text, via: "voice" });
		await tick();
		const sess = s.map[made.session], agent_id = sess.smart;
		assert.match(agent_id, /^single-voice-assistant-/, "the single seat's own minted id — the real caller the tools check");

		const list = servex_tools({ servex: { sessions: s } });
		const say_tool = list.find(t => t.name === "say"), nothing_tool = list.find(t => t.name === "nothing");
		assert.ok(say_tool && nothing_tool, "both tools are in the real, shared tool list");

		// One real tools.js call per replayed sentence — exactly the shape the brief asks for: `nothing` on a plain
		// sentence, `say` on a real question (the brief's one silent-escalation case, answered once the mastermind
		// would have replied). Neither call is allowed to write a reply straight to the messages list.
		let say_id = null;
		for (const l of sentences){
			if (/\?/.test(l.chat.text)){
				const r = JSON.parse(await say_tool.handler({ text: "Answering the open question.", re: l.chat.at }, { caller: agent_id }));
				assert.ok(r.id, "say queues through the real handler and answers {id}");
				say_id = r.id;
			} else {
				const r = JSON.parse(await nothing_tool.handler({}, { caller: agent_id }));
				assert.equal(r.ok, true, "nothing is a no-op through the real handler");
			}
		}
		assert.ok(say_id, "the sample's question was reached and queued a say");
		assert.equal(replies(file).length, 0, "queued, not released: nothing reached the owner yet");

		// A narration attempt — exactly what review finding 1 asked to add: plain text ("I've filed that") must be
		// muted to a skip line by `heard()` (ask2a-say-tools), never written as a reply, even mid-burst like this.
		s.heard({ type: "result", text: "I've filed that for you." }, { id: agent_id });
		assert.equal(replies(file).length, 0, "the narration attempt did not become a reply");
		assert.ok(skips(file).some(l => l.skip.text === "I've filed that for you."), "it was written as a muted skip instead");

		await wait(120);   // past every gate band (default 40, question 15, long 100 — six sentences trips the long band)
		const got = replies(file);
		assert.equal(got.length, 1, "released once the gate passed — exactly the one queued say, nothing else");
		assert.equal(got[0].chat.text, "Answering the open question.");

		const replay = Session.replay(lines(file));
		assert.ok(replay.messages.messages.some(m => m.constructor.name === "Reply"), "the released say reached the one source of truth, the messages list");
	});

} finally {
	fs.rmSync(repo, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

console.log(`single-brief.test.mjs: ${checks} checks passed`);
