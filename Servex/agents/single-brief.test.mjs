/* node Servex/agents/single-brief.test.mjs — proves the REWRITTEN brief (ask2c-brief-rewrite, Servex/agents/single-voice-assistant.md)
 * against the rule it exists to enforce: say/nothing/retract_say are the only way out, plain text is never a reply, and the old
 * "reply on a pause" wording is gone. Two parts: (1) read the brief's own words; (2) replay a real session's owner sentences
 * (public/framework/ai/sessions/2026/11/03/v-z0jonhy — has plain sentences, direct questions, and a task-like prompt) through the
 * real Sessions.js machinery with a scripted stub model standing in for the seat, and check no reply reaches the messages list
 * before the say gate releases it. Plain node, a scratch repo, no model runs, no live Servex. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Sessions from "./Sessions.js";
import Session from "../../public/framework/core/Session/Session.js";

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; console.log("PASS —", name); };
const tick = () => new Promise(r => setImmediate(r));
const wait = ms => new Promise(r => setTimeout(r, ms));
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const BRIEF = fs.readFileSync(path.join(ROOT, "Servex/agents/single-voice-assistant.md"), "utf8");

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "single-brief-test-"));
fs.mkdirSync(path.join(repo, "public/a"), { recursive: true });
const agents = {
	live: new Map(),
	spawn(spec){ const id = spec.id ?? `${spec.role}-${spec.name}`, a = { id, state: "idle", session_id: null }; this.live.set(id, a); return a; },
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

	// --- Part 2: a real recorded session replayed through the real single-seat machinery -------------------------------

	await check("replayed session: a scripted seat says nothing for plain sentences and queues a say for real questions — none reaches the messages list before the gate", async () => {
		const sample = path.join(ROOT, "public/framework/ai/sessions/2026/11/03/v-z0jonhy/session.jsonl");
		assert.ok(fs.existsSync(sample), "the named sample session exists");
		const owner_lines = lines(sample).filter(l => l.chat?.from?.kind === "owner" && l.chat.text);
		assert.ok(owner_lines.some(l => /\?/.test(l.chat.text)), "sample has a direct question");
		assert.ok(owner_lines.some(l => /study how|file.*task/i.test(l.chat.text)), "sample has a task-like prompt");
		assert.ok(owner_lines.length >= 5, "sample is a real multi-sentence dictation, not one line");

		const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
		for (const l of owner_lines.slice(0, 6)) s.say({ session: made.session, path: "/a/", text: l.chat.text, via: "voice" });
		await tick();
		const sess = s.map[made.session], id = sess.smart, agent = { id };

		// The scripted stub model: exactly the single seat's own shape — `nothing` on a plain sentence, `say` only once a
		// real question was heard (the last one the loop above sent). Neither call writes a reply straight to the messages
		// list; both must pass through the queue/gate like any other seat output.
		s.heard({ type: "result", text: "" }, agent);            // nothing: no text at all
		assert.equal(replies(file).length, 0, "nothing wrote no reply");

		const asked = owner_lines.find(l => /\?/.test(l.chat.text));
		const r = s.queue_say(sess, { text: "Answering the open question.", re: asked?.chat.at });
		assert.ok(r.id, "say queues and answers {id}");
		assert.equal(replies(file).length, 0, "still nothing in the messages list: queued, not released");

		await wait(120);   // past every gate band (default 40, question 15, long 100 — six sentences trips the long band)
		const got = replies(file);
		assert.equal(got.length, 1, "released once the gate passed — exactly one reply, not one per sentence heard");
		assert.equal(got[0].chat.text, "Answering the open question.");

		const replay = Session.replay(lines(file));
		assert.ok(replay.messages.messages.some(m => m.constructor.name === "Reply"), "the released say reached the one source of truth, the messages list");
	});

} finally {
	fs.rmSync(repo, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

console.log(`single-brief.test.mjs: ${checks} checks passed`);
