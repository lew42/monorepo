/* node Servex/agents/Sessions.single.test.mjs — the `single` seat (ux/Dictate/doc/single-voice-assistant.md): one agent, role
 * `single-voice-assistant`, instead of the fast + smart pair. Plain node, a scratch repo and a fake agent host: no model runs.
 * The brief's item-tool examples are run for real against a session file, then replayed the way Chat V3 reads it. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Sessions, { ASSISTANTS, session_assistant } from "./Sessions.js";
import { run_item } from "./page_tools.js";
import Session from "../../public/framework/core/Session/Session.js";
import { paragraph_groups } from "../../public/framework/ext/Chat/v3/placement.js";

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; console.log("PASS —", name); };
const tick = () => new Promise(r => setImmediate(r));
const wait = ms => new Promise(r => setTimeout(r, ms));
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "sessions-single-test-"));
for (const d of ["public/a", "public/b"]) fs.mkdirSync(path.join(repo, d), { recursive: true });
const sent = [], spawned = [];
const agents = {
	live: new Map(),
	spawn(spec){ spawned.push(spec); if (process.env.DBG) console.log("SPAWN", spec.role, spec.name, new Error().stack.split(/\n/).slice(2, 7).join(" | ")); const id = spec.id ?? `${spec.role}-${spec.name}`, a = { id, state: "working", session_id: null }; this.live.set(id, a); return a; },
	send(id, text){ sent.push({ id, text }); },
	stop(id){ this.live.get(id).state = "stopped"; },
};
let n = 0;
const make = (opts = {}) => {
	const s = new Sessions({ repo, file: path.join(repo, `sessions-${++n}.json`), assistant: "single", single_pause_ms: 60, ...opts });
	s.load(); s.servex = { agents };
	return s;
};
const file_of = made => path.join(repo, "public", made.file.replace(/^\//, ""));
const lines = file => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const to_seat = () => sent.filter(c => c.id.startsWith("single-voice-assistant"));
const idle = id => { agents.live.get(id).state = "idle"; };

// 1. the setting
await check("session_assistant() reads the word `single` from the file and the env var; the default is still voice", () => {
	const home = fs.mkdtempSync(path.join(os.tmpdir(), "single-home-")), saved = process.env.SERVEX_SESSION_ASSISTANT;
	try {
		delete process.env.SERVEX_SESSION_ASSISTANT;
		assert.equal(session_assistant(home), "voice", "no file, no env: voice");
		process.env.SERVEX_SESSION_ASSISTANT = "single";
		assert.equal(session_assistant(home), "single", "the env var");
		fs.writeFileSync(path.join(home, "session-assistant.txt"), "single\n");
		delete process.env.SERVEX_SESSION_ASSISTANT;
		assert.equal(session_assistant(home), "single", "the file");
	} finally {
		if (saved === undefined) delete process.env.SERVEX_SESSION_ASSISTANT; else process.env.SERVEX_SESSION_ASSISTANT = saved;
		fs.rmSync(home, { recursive: true, force: true });
	}
	assert.deepEqual(ASSISTANTS, ["fast", "voice", "single", "off"]);
});

await check("one session can choose `single` through settings(); the boot word stays the default for the others", () => {
	const s = make({ assistant: "voice" });
	const a = s.create({ path: "/a/", fresh: true }), b = s.create({ path: "/b/", fresh: true });
	assert.equal(s.single_seat(s.map[a.session]), false);
	const r = s.settings({ session: a.session, assistant: "single" });
	assert.equal(r.assistant, "single");
	assert.equal(s.single_seat(s.map[a.session]), true, "this session is single");
	assert.equal(s.single_seat(s.map[b.session]), false, "the other session is not");
	assert.equal(s.voice_seat(s.map[b.session]), true, "the other session is still dual");
	assert.throws(() => s.settings({ session: a.session, assistant: "bogus" }), /assistant must be/);
	assert.equal(s.settings({ session: a.session, assistant: null }).assistant ?? "voice", "voice", "null drops it back to the boot word");
	const t = make({ assistant: "single" }), c = t.create({ path: "/a/", fresh: true });
	t.settings({ session: c.session, assistant: "voice" });
	assert.equal(t.single_seat(t.map[c.session]), false, "a session can also step back to dual");
});

// 2. who is spawned
await check("single: no fast agent, no code-filed Question, one agent in the smart seat with its own brief", async () => {
	await tick(); spawned.length = 0;
	const s = make(), made = s.create({ path: "/a/", fresh: true });
	s.say({ session: made.session, path: "/a/", text: "Where does the single seat go?", via: "text" });
	await tick();
	assert.ok(!spawned.some(x => x.role === "voice-assistant" || x.role === "session-fast" || x.role === "session-smart"), "no other role spawned: " + spawned.map(x => x.role));
	const spec = spawned.find(x => x.role === "single-voice-assistant");
	assert.ok(spec, "the single-voice-assistant role is spawned");
	assert.equal(spec.name, made.session);
	const brief = fs.readFileSync(path.join(ROOT, "Servex/agents/single-voice-assistant.md"), "utf8");
	assert.ok((typeof spec.system === "string" ? spec.system : spec.system.append).startsWith(brief.trim().slice(0, 60)), "its own brief is the system text");
	assert.ok(!s.map[made.session].fast, "no fast agent id");
	assert.ok(s.map[made.session].smart.startsWith("single-voice-assistant"));
	const all = lines(file_of(made));
	assert.ok(!all.some(l => Object.values(l).some(v => v?.tasks?.add?.type === "Question")), "code files no Question: the assistant does");
});

// 3. every sentence at once
await check("single: each sentence reaches the seat at once, with no thought hold", async () => {
	sent.length = 0;
	const s = make(), made = s.create({ path: "/a/", fresh: true });
	s.say({ session: made.session, path: "/a/", text: "First sentence", via: "voice", floor: "speaking" });
	s.say({ session: made.session, path: "/a/", text: "Second sentence.", via: "voice", floor: "speaking" });
	await tick();
	const got = to_seat();
	assert.equal(got.length, 2, "one message per sentence, nothing held back");
	assert.match(got[0].text, /First sentence/);
	assert.match(got[1].text, /Second sentence\./);
	assert.match(got[1].text, /\(prompt p-/, "it is told the Prompt");
	assert.equal(s.thoughts.get(made.session)?.lines?.length ?? 0, 0, "no held thought");
});

// 4. the pause cue
await check("pause cue: one cue after the pause, none while sentences keep coming, none while the seat is busy", async () => {
	sent.length = 0;
	const s = make(), made = s.create({ path: "/a/", fresh: true });
	const say = text => s.say({ session: made.session, path: "/a/", text, via: "voice", floor: "speaking" });
	say("One."); await tick();
	const id = s.map[made.session].smart;
	idle(id);
	for (let i = 0; i < 4; i++){ await wait(25); say(`More ${i}.`); idle(id); }
	assert.equal(to_seat().filter(c => /\(pause:/.test(c.text)).length, 0, "no cue while sentences keep coming");
	agents.live.get(id).state = "working";
	await wait(120);
	assert.equal(to_seat().filter(c => /\(pause:/.test(c.text)).length, 0, "no cue into a busy seat");
	idle(id);
	await wait(120);
	const cues = to_seat().filter(c => /\(pause:/.test(c.text));
	assert.equal(cues.length, 1, "exactly one cue after the pause");
	assert.match(cues[0].text, /reply now only if a question is open/);
	await wait(150);
	assert.equal(to_seat().filter(c => /\(pause:/.test(c.text)).length, 1, "and no second cue for the same silence");
});

await check("text without an open cue is dropped; an empty turn is dropped; a cue turn's text becomes the reply", async () => {
	sent.length = 0;
	const s = make(), made = s.create({ path: "/a/", fresh: true }), file = file_of(made);
	s.say({ session: made.session, path: "/a/", text: "Does it work?", via: "voice", floor: "speaking" });
	await tick();
	const id = s.map[made.session].smart, agent = { id };
	const replies = () => lines(file).filter(l => l.chat?.from?.kind === "assistant");
	s.heard({ type: "result", text: "Sure, it works." }, agent);
	assert.equal(replies().length, 0, "no cue open: the text is dropped");
	s.heard({ type: "result", text: "" }, agent);
	assert.equal(replies().length, 0, "an empty turn writes nothing");
	idle(id);
	await wait(150);
	assert.equal(s.map[made.session].cue_open, true, "the cue opened");
	s.heard({ type: "result", text: "Yes, it works." }, agent);
	assert.equal(replies().length, 1, "the cue turn's text is a reply");
	assert.equal(replies()[0].chat.text, "Yes, it works.");
	assert.ok(!s.map[made.session].cue_open, "the cue closes at the result");
	s.heard({ type: "result", text: "Another." }, agent);
	assert.equal(replies().length, 1, "after it, text is dropped again");
});

// 5 + 6. the brief and Chat V3
const BRIEF = path.join(ROOT, "Servex/agents/single-voice-assistant.md");
const brief = fs.existsSync(BRIEF) ? fs.readFileSync(BRIEF, "utf8") : "";
await check("the brief is under 700 words and names its own files", () => {
	const words = brief.split(/\s+/).filter(Boolean).length;
	assert.ok(words > 100 && words < 700, `the brief has ${words} words`);
	for (const f of ["Servex/agents/single-voice-assistant.md", "Servex/agents/roles.js", "Servex/agents/Sessions.js"]) assert.ok(brief.includes(f), `names ${f}`);
});

const REL = "public/framework/ai/sessions/2026/11/02/.single-voice-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "session.jsonl"), URL_ = "/" + REL.slice("public/".length) + "/";
const S = make(), made = S.create({ path: "/a/", fresh: true });
for (const text of ["so um the tab bar is broken", "on my phone", "also we need a new logo"]) S.say({ session: made.session, path: "/a/", text, via: "text" });
const owner = lines(file_of(made)).filter(l => l.chat?.from?.kind === "owner").map(l => l.chat);
const [at1, at2, at3] = owner.map(c => c.at), prompt = owner[0].prompt;
const message = Session.replay(lines(file_of(made))).messages.messages.find(m => m.constructor.name === "Prompt").id;
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, fs.readFileSync(file_of(made), "utf8"));
const results = [];
try {
	const blocks = [...brief.matchAll(/```js\n([\s\S]*?)```/g)].map(m => m[1]);
	await check("the brief has item-tool examples (a clean, a paragraph, a card with a title, a move, an amend)", () => assert.ok(blocks.length >= 5, `${blocks.length} examples`));
	for (const [i, block] of blocks.entries()){
		const code = block.replaceAll("<session>", URL_).replaceAll("<at1>", at1).replaceAll("<at2>", at2).replaceAll("<at3>", at3).replaceAll("<prompt>", prompt).replaceAll("<message>", message);
		const item = async args => { const r = await run_item(args, { caller: "single-voice-assistant-test" }); results.push({ i, r }); return r; };
		await new (Object.getPrototypeOf(async function(){}).constructor)("item", code)(item);
	}
	await check("every example in the brief ran for real: ok, and each add returned its ids", () => {
		assert.ok(results.length >= blocks.length);
		for (const { i, r } of results) assert.ok(r.ok, `example ${i}: ${r.why}`);
		for (const { i, r } of results.filter(x => x.r.line && JSON.stringify(x.r.line).includes('"add"'))) assert.ok(r.ids?.length, `example ${i} returned ids`);
	});
	const raw = lines(FILE), replayed = Session.replay(raw), prompts = replayed.messages.messages.filter(m => m.constructor.name === "Prompt");
	await check("V3 draws what the assistant wrote: cleaned words and a card title, raw words kept", () => {
		const p = prompts[0];
		assert.equal(p.raw, "so um the tab bar is broken on my phone also we need a new logo", "the raw words stay");
		assert.match(p.cleaned, /The tab bar is broken\./, "the cleaned sentence replaces the raw one on screen");
		assert.ok(!/\bum\b/.test(p.cleaned), "filler is gone from what is drawn");
		assert.ok(p.title && p.title.split(/\s+/).length <= 5, `a card title: ${p.title}`);
		assert.ok(raw.some(l => l.place), "V1's {place} lines are still written");
		const groups = paragraph_groups(p.sentence_items);
		assert.ok(groups.length >= 1 && groups.flat().length === 3, "V3's paragraphs still hold every sentence");
	});
	await check("the writer is not woken by its own writes (not in tail mode)", () => assert.ok(!S.map[made.session].tail));
} finally {
	fs.rmSync(DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
	fs.rmSync(repo, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
console.log(`Sessions.single.test.mjs: ${checks} checks passed`);
