/* node Servex/agents/awaken-race.test.mjs — the never-lose-a-wake regression suite.
 *
 * The incident this whole task exists to close (vscode-mastermind, 2026-10-01): `Agents.awaken()`
 * calls `host.register()` before the caller's own `send()` gets to push the message that woke
 * the agent. `register()` (wrapped by `Global.js`'s `reaper()`) runs the idle sweep the instant
 * it sees an idle agent — and the idle clock it read was stale, so the sweep put the agent
 * STRAIGHT BACK TO SLEEP in the same tick, closing the brand-new queue before `send()`'s push
 * ever landed. The message vanished; `send()` still marked the agent "working", with no process
 * behind it at all — a phantom.
 *
 * This file proves, against the REAL `Agents` class (never a second implementation written for
 * the test — only `start()` is overridden, the same pattern `spawn-worktree.test.mjs` already
 * uses, so no real claude.exe is ever launched):
 *   - item 1: the idle clock resets on awaken, so an aggressive idle sweep cannot catch it stale.
 *   - item 5: a message that still loses the race (the queue closes again before the push) is
 *     HELD, not lost, and replayed on the very next awaken.
 *   - item 5 (second half): a message sent to a `starting` agent is held until its first turn —
 *     already correct before this task; proved here so a future change cannot break it unseen.
 *   - item 2: a row whose claude.exe has died is excluded from the working cap and set idle,
 *     once, with no process ever created for the test.
 *   - item 3 and item 7: the spawn gate's own re-queue rules, against `Servex.js`'s real
 *     `drain()` / `next_ready()` / `requeue_stuck_start()`, bound to a minimal fake Servex (no
 *     real dashboard, no real worktree, no real pool — just the plain object those three
 *     methods actually read and write).
 *   - item 4: `Heartbeat.post()`'s own Inbox fallback, against the real `Heartbeat.prototype.post`.
 *
 * No network, no filesystem touched outside one scratch SERVEX_HOME. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let checks = 0;
const check = async (name, fn) => { try { await fn(); checks++; } catch (e){ console.error(`FAILED: ${name}`); throw e; } };

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "awaken-race-test-"));
process.env.SERVEX_HOME = dir;   // home.js's place(): registry.json and servex.jsonl land here, never the real machine's
// ⚠ set BEFORE this import, and it must be DYNAMIC — a static top-of-file import is hoisted
// ahead of the line above and would freeze home.js's module-level HOME at the REAL Servex home
// first (the exact trap External.test.mjs documents, caught 2026-09-28).
const { Agents } = await import("./Agents.js");
const Servex = (await import("../Servex.js")).default;
const Heartbeat = (await import("../Heartbeat.js")).default;
const TaskLoop = (await import("../TaskLoop.js")).default;

/* A fake Agent that never starts a real claude.exe: only `start()` is overridden (the rest —
 * register(), sleep(), awaken(), send(), the queue — is all the real Agent's own code), and it
 * always carries a `claude_pid` that is genuinely alive (this very test process), so item 2's
 * cap-counting logic has something real to check. */
class FakeAgent extends Agents.Agent {
	start(){
		this.queue = new this.constructor.Queue();
		this.aborter = { abort(){} };
		this.query = { close(){} };
		this.claude_pid = process.pid;
		if (this.resume && !this.fork) this.session_id ??= this.resume;
		else { this.session_id ??= "fake-" + Math.random().toString(36).slice(2); this.minted = true; }
		if (!this.prompt){ this.state = "idle"; return this; }
		this.queue.push(this.turn(this.prompt));
		this.state = "working";
		return this;
	}
}

let n = 0;
/* A host whose `register()` is as AGGRESSIVE as the original bug needs: it tries to sleep every
 * idle agent it sees, on every single register() call — the worst-case stale clock (as if the
 * idle wait were already up and the clock agreed). If item 1's fix (the idle clock reset in
 * `awaken()`) and the 60 s belt in `sleep()` were not both in place, this reliably reproduces the
 * exact race: awaken() -> register() -> sleep() -> the new queue closes -> send()'s own push is
 * lost. */
class RaceAgents extends Agents {
	register(agent){
		const row = super.register(agent);
		if (agent.state === "idle") agent.sleep("aggressive-idle-sweep");
		return row;
	}
}
RaceAgents.Agent = FakeAgent;
const fresh = () => new RaceAgents({ registry_dir: path.join(dir, `reg-${++n}`), servex: { say(){} } });

/* A plain host (no aggressive register()) for the tests that are not themselves about the race —
 * item 2 just needs `working()`'s own phantom logic, not a second sweep immediately re-sleeping
 * the row it just set idle. */
class PlainAgents extends Agents {}
PlainAgents.Agent = FakeAgent;
const plain = () => new PlainAgents({ registry_dir: path.join(dir, `reg-${++n}`), servex: { say(){} } });

// ── item 1 + the end-to-end race: awaken a dormant agent, send one message ──────────────
await check("awaken: the idle clock resets, so an aggressive idle sweep cannot put it back to sleep before send() delivers", () => {
	const agents = fresh();
	const agent = agents.spawn({ id: "minion-race", role: "minion", name: "race", prompt: "go" });
	assert.equal(agent.state, "working", "a fresh prompted spawn starts working");
	agent.queue.items.shift();   // the real SDK's pump() would already have consumed the first prompt by now

	// simulate the turn ending the way Agent.result() does: state -> idle, then register() —
	// which THIS host's register() uses to try to sleep it (it is actually idle, so it succeeds).
	agent.state = "idle";
	agents.register(agent);
	assert.equal(agent.state, "dormant", "the agent is genuinely dormant before the race begins");

	// now wake it with one message — the exact call that lost the race before this task's fix.
	agents.send("minion-race", "are you there?", { from: "test" });

	assert.notEqual(agent.state, "dormant", "NOT dormant: the message woke it and was not immediately re-slept");
	assert.equal(agent.state, "working", "working: the message was actually pushed and counted as a turn");
	assert.equal(agent.queue.done, false, "its queue is open — nothing closed it out from under the push");
	assert.equal(agent.queue.items.length, 1, "the message is sitting in the queue, not lost");
	assert.equal(agents.working().some(a => a.id === agent.id), true,
		"counted toward the cap — a LIVE process (this test's own pid), never a phantom");
});

// ── item 5: a message that still loses the race is HELD, not lost ──────────────────────
await check("send(): a push that finds the queue already closed is held, and replayed on the next awaken — never lost", () => {
	const agents = fresh();
	const agent = agents.spawn({ id: "minion-held", role: "minion", name: "held", prompt: "go" });
	agent.state = "idle";
	agent.sleep("idle");
	assert.equal(agent.state, "dormant");

	// Force the exact race DETERMINISTICALLY (no reliance on real timing): wrap awaken() so it
	// closes the fresh queue again right after the real awaken() runs, reproducing "the new queue
	// was closed" a split second before send()'s own push — the scenario item 1's fix prevents in
	// practice, and item 5 exists to make harmless even if something else ever reintroduces it.
	const real_awaken = agent.awaken.bind(agent);
	let forced = false;
	agent.awaken = function (by){ const out = real_awaken(by); if (!forced){ forced = true; this.queue.close(); } return out; };

	agent.send("urgent — are you there?", { from: "test" });
	assert.equal(agent.state, "dormant", "honest: nothing is running to receive it right now");
	assert.equal(agent.held_messages?.length, 1, "the message is HELD, not dropped");

	// the next awaken (restore the real one first) replays the held message before anything else
	agent.awaken = real_awaken;
	agent.send("still there?", { from: "test" });
	assert.equal(agent.state, "working", "this send actually landed");
	assert.equal(agent.queue.items.length, 2, "BOTH messages are in the live queue — the held one, replayed first, plus this one");
	assert.equal(agent.held_messages.length, 0, "held_messages is drained once replayed");
});

// ── item 5, second half: a message to a STARTING agent is held until its first turn ────
await check("send(): a message to a starting (mid-first-turn) agent queues behind it, delivered in order", () => {
	const agents = fresh();
	const agent = agents.spawn({ id: "minion-starting", role: "minion", name: "starting", prompt: "first turn" });
	assert.equal(agent.state, "working", "the first prompt is already in flight");
	assert.equal(agent.queue.items.length, 1, "the first prompt itself is sitting in the queue — nothing has consumed it yet");
	agent.send("a second thing, while the first turn is still running", { from: "test" });
	assert.equal(agent.queue.items.length, 2, "queued BEHIND the first turn, in order — not lost, not jumped ahead of it");
	assert.ok(agent.queue.items[0].message.content.includes("first turn"), "the first turn is still first");
	assert.equal(agent.state, "working", "still just working — the second message did not get lost or corrupt the state");
});

// ── item 2: a dead pid does not count, and is cleared exactly once ──────────────────────
await check("working(): a row whose claude.exe has died is excluded from the cap and cleared, logged once", () => {
	const agents = plain();
	const agent = agents.spawn({ id: "minion-dead", role: "minion", name: "dead", prompt: "go" });
	agent.queue.items.shift();   // the real SDK's pump() would already have consumed the first prompt by now
	assert.equal(agents.working().some(a => a.id === agent.id), true, "alive (this test's own pid): counts");

	agent.claude_pid = 999999999;   // almost certainly not a real pid on this machine
	agent.started_at = new Date(Date.now() - 60000).toISOString();   // long past the starting grace
	agent.queue.push(agent.turn("a message that arrived right as the process died"));   // still unconsumed

	let says = 0;
	agents.servex.say = () => { says++; };
	const working_once = agents.working();
	assert.equal(working_once.some(a => a.id === agent.id), false, "a dead pid does not count toward the cap");
	/* fresh-eyes review finding 3: NOT "idle" — an idle agent's send() pushes straight onto a
	 * queue nothing is reading any more and the message would be accepted, then silently
	 * stranded, with marked_phantom blocking this method from ever getting a second chance.
	 * "dormant" makes send() call awaken() first, which actually starts a fresh process. */
	assert.equal(agent.state, "dormant", "the phantom is DORMANT, not idle — so a real message still wakes a real process");
	assert.equal(agent.held_messages?.length, 1, "whatever was stuck in the dead queue travels to held_messages, not lost");
	assert.equal(says, 1, "logged once");

	agents.working();   // called again: must not re-log or flap the state a second time
	assert.equal(says, 1, "still once — mark_phantom is idempotent until the agent actually awakens");

	// and a real message to it now actually wakes a (fake) process and delivers both messages
	agents.send("minion-dead", "are you there now?", { from: "test" });
	assert.equal(agent.state, "working", "awaken() ran a real start(), so this is genuinely working again");
	assert.equal(agent.queue.items.length, 2, "the stranded message AND the new one, both delivered");
});

// ── item 3: a `starting` row that never began at all is re-queued, never dropped ───────
await check("Servex.requeue_stuck_start(): a starting agent re-queued at the head, with its own spec and unconsumed turns", () => {
	const agents = fresh();
	const agent = agents.spawn({ id: "minion-stuck", role: "minion", name: "stuck", prompt: "never got anywhere", parent: "task-mastermind-x" });
	agent.queue.push(agent.turn("a message that arrived before it ever truly started"));   // still unconsumed

	const fake = { queue: [], log: { append: async () => ({ ok: true }) }, save_queue(){} };
	Servex.prototype.requeue_stuck_start.call(fake, agent);

	assert.equal(agent.state, "stopped", "the broken instance is stopped, never left half-alive");
	assert.equal(fake.queue.length, 1, "its spec goes back into the gate's queue — never dropped");
	const entry = fake.queue[0];
	assert.equal(entry.spec.id, "minion-stuck", "the same id, so a parent watching it still finds it");
	assert.equal(entry.spec.role, "minion");
	assert.equal(agent.raw_prompt, "never got anywhere", "the agent itself kept the unwrapped prompt (spawn()'s raw_prompt)");
	assert.equal(entry.spec.prompt, "never got anywhere", "its original, UNWRAPPED prompt travels with it — never re-wrapped a second time");
	assert.equal(entry.spec._held_turns.length, 2, "both the start prompt's own turn and the one sent while it waited travel with it");
	assert.match(entry.reason, /never began/);

	// fresh-eyes review finding 5: does a turn object survive `save_queue()`'s JSON.stringify,
	// so a Servex restart does not lose it — exactly the loss this whole task exists to close?
	const revived = JSON.parse(JSON.stringify(entry));
	assert.deepEqual(revived.spec._held_turns, entry.spec._held_turns, "a turn object round-trips through JSON whole");
	assert.equal(revived.spec._held_turns[0].message.content, entry.spec._held_turns[0].message.content);
});

// ── item 7: a spawn the gate admits but the pool refuses waits, instead of vanishing ────
await check("Servex.drain(): a pool-refused spawn is re-queued at the head, the pool tops up, and the parent is told once", () => {
	const sent = [];
	const fake = {
		queue: [{ spec: { id: "minion-x", role: "minion", parent: "task-mastermind-x" }, at: "2026-10-01T20:38:00-05:00", inbox: [] }],
		dispatcher: { queue: [], pump(){} },
		pool: { calls: 0, top_up(){ this.calls++; } },
		log: { append: async () => ({ ok: true }) },
		agents: {
			send(id, text, note){ sent.push({ id, text, note }); },
			spawn_now(spec){
				if (!this._tries) this._tries = 0;
				this._tries++;
				if (this._tries === 1) throw new Error(`No pool worktree is ready for minion "${spec.id}" — main stays refused for minions.`);
				return { id: spec.id, send(){}, queue: { push(){ return true; } } };
			}
		},
		save_queue(){},
		finishing(){ return false; },
		admit(){ return null; },   // the gate itself always admits in this test — only the pool refuses
		stale(){ return false; },
		emit(){},
		next_ready: Servex.prototype.next_ready   // the real method — only `drain()` and `admit`/`finishing`/`stale` below it are faked
	};

	Servex.prototype.drain.call(fake);
	assert.equal(fake.queue.length, 1, "put straight back — never dropped");
	assert.equal(fake.queue[0].reason, "waits for a pool worktree");
	assert.equal(fake.pool.calls, 1, "the pool is asked to top itself up");
	assert.equal(sent.length, 1, "the parent is told, once");
	assert.match(sent[0].text, /waits for a pool worktree/);

	Servex.prototype.drain.call(fake);   // still refused this tick: not told a second time
	assert.equal(sent.length, 1, "told only the first time");

	Servex.prototype.drain.call(fake);   // the pool now has a slot: the retry actually starts
	assert.equal(fake.queue.length, 0, "started, and out of the queue");
});

// ── item 7 (widened 22:56): the OpenRouter pace guard is a second known "wait", not "fail" ──
await check("Servex.drain(): a spawn the OpenRouter pace guard refuses also waits, instead of vanishing", () => {
	const sent = [];
	const fake = {
		queue: [{ spec: { id: "minion-lf-deepseek", role: "minion", parent: "task-mastermind-openrouter" }, at: "2026-10-01T22:37:00-05:00", inbox: [] }],
		dispatcher: { queue: [], pump(){} },
		agents: {
			send(id, text, note){ sent.push({ id, text, note }); },
			spawn_now(spec){
				if (!this._tries) this._tries = 0;
				this._tries++;
				if (this._tries === 1) throw new Error(`openrouter spawn refused: today's OpenRouter spend ($12.00) is at or over the $10/day cap`);
				return { id: spec.id, send(){}, queue: { push(){ return true; } } };
			}
		},
		log: { append: async () => ({ ok: true }) },
		save_queue(){},
		finishing(){ return false; },
		admit(){ return null; },
		stale(){ return false; },
		emit(){},
		next_ready: Servex.prototype.next_ready
	};

	Servex.prototype.drain.call(fake);
	assert.equal(fake.queue.length, 1, "put straight back — the pace guard clears on its own, so this is a wait, not a failure");
	assert.equal(fake.queue[0].reason, "waits for the OpenRouter pace guard to clear");
	assert.equal(sent.length, 1, "the parent is told, once — minion-lf-deepseek's real incident (22:56) told nobody");

	Servex.prototype.drain.call(fake);   // the pace guard has cleared: the retry actually starts
	assert.equal(fake.queue.length, 0, "started, and out of the queue");
});

// ── item 2 live example (22:40): requeue_stuck_start() must clear the row even when
//    agent.stop() itself throws partway through (a log name over Log.js's 64-char limit) ──
await check("Servex.requeue_stuck_start(): clears the row even when stop() throws (a bad log name)", () => {
	const agents = fresh();
	const agent = agents.spawn({ id: "minion-lib-h1-page-nvidia-nemotron-3-5-lightning-free-17908906192690", role: "minion", name: "x", prompt: "go" });
	let registered = 0;
	agent.stop = () => { agent.state = "stopped"; throw new Error(`Bad log name "agent-${agent.id}" — letters, digits, dot, dash and underscore only.`); };

	const fake = { queue: [], log: { append: async () => ({ ok: true }) }, save_queue(){}, agents: { register: a => { registered++; return a; } } };
	Servex.prototype.requeue_stuck_start.call(fake, agent);

	assert.equal(agent.state, "stopped", "cleared regardless of the throw inside stop()");
	assert.equal(registered, 1, "the registry is still told, even though stop()'s own register() call never ran");
	assert.equal(fake.queue.length, 1, "still re-queued — never dropped, whatever stop() itself did");
});

// ── item 4: an escalation with no card (or a card that cannot be found) reaches the Inbox ──
await check("Heartbeat.post(): no card at all falls back to the Inbox, logged once", async () => {
	const dropped = [];
	const said = [];
	const fake = { to_inbox: Heartbeat.prototype.to_inbox, servex: { mcp: { handlers: new Map() }, inbox: { drop: a => { dropped.push(a); return { ok: true, file: "framework/ai/page.jsonl" }; } }, say: (msg) => said.push(msg) } };
	const out = await Heartbeat.prototype.post.call(fake, null, "the task is stuck", false, "public/framework/ai/2026-10-01/never-lose-a-wake");
	assert.equal(dropped.length, 1, "with no card named at all, the note goes straight to the Inbox");
	assert.equal(dropped[0].path, "public/framework/ai/2026-10-01/never-lose-a-wake");
	assert.equal(dropped[0].text, "the task is stuck");
	assert.equal(said.length, 1, "one log line says so");
	assert.ok(out?.ok, "post() itself still answers ok — the caller never sees a throw");
});

await check("Heartbeat.post(): a named card that answers 'no card' also falls back to the Inbox", async () => {
	const dropped = [];
	const fake = { to_inbox: Heartbeat.prototype.to_inbox, servex: {
		mcp: { handlers: new Map([["card_reply", async () => JSON.stringify({ ok: false, why: 'no card "gone-card"' })]]) },
		inbox: { drop: a => { dropped.push(a); return { ok: true, file: "framework/ai/page.jsonl" }; } },
		say(){}
	} };
	await Heartbeat.prototype.post.call(fake, "gone-card", "still stuck", false, "public/framework/ai/2026-10-01/never-lose-a-wake");
	assert.equal(dropped.length, 1, "card_reply's own {ok:false} answer — never a throw — still reaches the Inbox");
});

await check("TaskLoop.escalate(): the same {ok:false} card answer falls back to the Inbox", async () => {
	const dropped = [];
	const fake = {
		servex: {
			mcp: { handlers: new Map([["card_ask", async () => JSON.stringify({ ok: false, why: 'no card "live"' })]]) },
			inbox: { drop: a => { dropped.push(a); return { ok: true, file: "framework/ai/page.jsonl" }; } },
			say(){}
		},
		slug(){ return "2026-10-01/never-lose-a-wake"; },
		at(){ return "2026-10-01T12:00:00-05:00"; },
		write_line: async () => {},
		totals: { escalated: 0 }
	};
	await TaskLoop.prototype.escalate.call(fake, "public/framework/ai/2026-10-01/never-lose-a-wake/task.jsonl", { state: {} }, Date.now());
	assert.equal(dropped.length, 1, "no live card, card_ask answers {ok:false}: the note still reaches the Inbox");
	assert.equal(dropped[0].path, "public/framework/ai/2026-10-01/never-lose-a-wake", "dropped on the task's own folder");
});

/* Every check above is synchronous, but several of them (mark_phantom, register(), the real
 * dormancy path) fire off a real `Log.append()` in the background — Servex's single-writer
 * queue, never awaited by this test, the same way Agents.js itself never awaits it. Give that
 * one tick to actually land on disk before the scratch directory under it disappears, or a
 * late write callback finds ENOENT and crashes the process after the real result already
 * printed (its target directory is gone either way; this only avoids the noisy unhandled error). */
await new Promise(r => setTimeout(r, 100));
fs.rmSync(dir, { recursive: true, force: true });
console.log(`awaken-race: ${checks} checks passed`);
