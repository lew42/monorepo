import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.env.LEDGER_ROOT || path.join(fileURLToPath(import.meta.url), "../../.."));

// Appending to any of these from PostToolUse would log the log, forever.
const skip = new Set(["task.jsonl", "day.jsonl", "usage.jsonl", "usage.json"]);

const now = () => {
	const d = new Date(), o = -d.getTimezoneOffset(), pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${o < 0 ? "-" : "+"}${pad(o / 60)}:${pad(o % 60)}`;
};

const lines = file => fs.readFileSync(file, "utf8").split("\n").flatMap(l => {
	try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; }
});

// A log whose last line has no newline glues our entry onto it — and a line holding
// two objects fails JSON.parse, so BOTH silently vanish from every reader.
const append = (file, entry) => {
	let lead = "";
	try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.appendFileSync(file, lead + JSON.stringify(entry) + "\n");
};

const state = file => Object.assign({}, ...lines(file).filter(e => e.assign).map(e => e.assign));

// null means "outside the repo" — including a different drive, where relative() returns an absolute path.
const rel = file => {
	const r = path.relative(root, path.resolve(file));
	return !r || r.startsWith("..") || path.isAbsolute(r) ? null : r.split(path.sep).join("/");
};

const walk = function* (dir) {
	let entries;
	try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const e of entries) {
		if (!e.isDirectory()) { if (e.name === "task.jsonl") yield path.join(dir, e.name); continue; }
		if (e.name === "node_modules" || e.name[0] === ".") continue;
		yield* walk(path.join(dir, e.name));
	}
};

// An edit's path is ground truth: the first task.jsonl walking up owns it, no
// session match needed. Null outside every task dir falls through below.
const find_task_by_path = file => {
	let dir = path.dirname(path.resolve(file));
	while (dir === root || dir.startsWith(root + path.sep)) {
		const candidate = path.join(dir, "task.jsonl");
		if (fs.existsSync(candidate)) return candidate;
		if (path.dirname(dir) === dir) return null;
		dir = path.dirname(dir);
	}
	return null;
};

/* Fallback for paths outside every task dir: subagents inherit the parent's
   session_id, so many tasks share one session and matching by session alone is a
   guess. `newest` picks by CREATION, never mtime — this hook's own appends keep
   bumping whichever file it already chose, so mtime self-pins. */
const find_task = (session, newest) => {
	if (!session) return null;
	const key = newest ? "edit" : "run";
	const cache = path.join(os.tmpdir(), `claude-ledger-${key}-${String(session).replace(/[^\w-]/g, "_")}.txt`);
	try {
		if (Date.now() - fs.statSync(cache).mtimeMs < 60000) {
			const hit = fs.readFileSync(cache, "utf8").trim();
			if (hit.startsWith(root) && fs.existsSync(hit)) return hit;
		}
	} catch {}

	const born = [];
	for (const file of walk(path.join(root, "public")))
		try { const s = fs.statSync(file); born.push([s.birthtimeMs || s.mtimeMs, file]); } catch {}
	born.sort((a, b) => newest ? b[0] - a[0] : a[0] - b[0]);

	for (const [, file] of born) {
		if (lines(file).find(e => e.assign)?.assign.session_id !== session) continue;
		try { fs.writeFileSync(cache, file); } catch {}
		return file;
	}
	return null;
};

// An edit or a stop must never resolve to a task another agent is still working
// in: the only safe source beyond an edit's own path is THIS agent's own prior
// path-based resolution — never the session guess, which can land on a
// sibling's live task. Null means "no ground truth yet for this agent".
const agent_cache = id => path.join(os.tmpdir(), `claude-ledger-agent-${String(id).replace(/[^\w-]/g, "_")}.txt`);
const cached_task = (agent_id, session) => {
	if (!agent_id) return null;
	try {
		const hit = fs.readFileSync(agent_cache(agent_id), "utf8").trim();
		if (hit.startsWith(root) && fs.existsSync(hit) && lines(hit).find(e => e.assign)?.assign.session_id === session) return hit;
	} catch {}
	return null;
};

const stdin = () => new Promise(resolve => {
	if (process.stdin.isTTY) return resolve("");
	let s = "";
	process.stdin.setEncoding("utf8");
	process.stdin.on("data", d => s += d);
	process.stdin.on("end", () => resolve(s));
	process.stdin.on("error", () => resolve(""));
});

const run = async () => {
	let input = {};
	try { input = JSON.parse(await stdin()) || {}; } catch {}
	const event = String(process.argv[2] || input.hook_event_name || "").toLowerCase().replace(/[^a-z]/g, "");

	// Blocking again after our own block loops the session forever.
	if (event === "stop" && input.stop_hook_active) return;

	if (event === "posttooluse" && input.tool_name === "Skill") {
		const task = cached_task(input.agent_id, input.session_id) || (input.agent_id ? null : find_task(input.session_id, true));
		if (task && input.tool_input?.skill) append(task, { log: { at: now(), msg: `skill: ${input.tool_input.skill}` } });
		// The marker prompt-relay.mjs (the UserPromptSubmit hook) checks to know a session is "the assistant".
		try { if (["assistant", "every-prompt"].includes(input.tool_input?.skill)) fs.writeFileSync(path.join(os.tmpdir(), `claude-assistant-${String(input.session_id).replace(/[^\w-]/g, "_")}`), ""); } catch {}
		return;
	}

	/* A Bash call is not a write, so it never reaches the write path below — but it is
	   the ONLY place the repo can see "who just took a reload hold", because
	   `node Server/hold.mjs on …` is a plain command. hold-guard's `check()` half has
	   always been armed (via the write path); this is its `record()` half, and without
	   it `check()` finds no record for any agent and correctly does nothing forever.
	   Wired here rather than in a second hook file so arming it is ONE settings matcher
	   (`Bash` → this same script), not a new entry point. Harmless until that matcher
	   exists: with no `Bash` matcher in settings.json this branch simply never runs. */
	if (event === "posttooluse" && input.tool_name === "Bash") {
		try {
			const cmd = input.tool_input?.command;
			if (cmd) (await import("./hold-guard.mjs")).record(cmd, input.agent_id || input.session_id);
		} catch {}
		return;
	}

	if (event === "posttooluse") {
		const file = input.tool_input?.file_path || input.tool_input?.notebook_path;
		const agent = input.agent_id || input.session_id;

		/* THE THREE ALARMS — syntax-guard (a `.js` write that no longer parses),
		   health-guard (a write that parses but broke a page), hold-guard (a write
		   going out under a reload hold this agent let lapse). Each runs inside its
		   own try so a fault in a guard can never stop the ledger.

		   ⚠ That catch was EMPTY until 2026-09-21, which made a guard that THREW
		   indistinguishable from a guard that passed — and agents reason from the
		   silence: a minion the same day wrote that "the syntax-guard hook ran on
		   every Edit/Write and none was blocked, which is the only partial proof" it
		   had that its file was sound. A silent catch produces that same absence.
		   So the protection stays and the silence goes: a throw becomes a finding in
		   the day's health log, which the watcher and the health page already read.
		   The report is itself wrapped — a logger that can break the ledger would be
		   the very bug being fixed, one level up. */
		const guard = async (name, run) => {
			try { await run(); }
			catch (e) {
				try {
					const day = path.join(root, "public", "framework", "ai", "health", now().slice(0, 10) + ".jsonl");
					fs.mkdirSync(path.dirname(day), { recursive: true });
					fs.appendFileSync(day, JSON.stringify({ warning: {
						at: now(), url: "(hook)", kind: "guard-threw",
						text: name + " threw and was swallowed: " + (e && e.message ? e.message : String(e)),
						file, files: file ? [file] : [],
					} }) + "\n");
				} catch {}
			}
		};
		await guard("syntax-guard", async () => (await import("./syntax-guard.mjs")).default(file));
		await guard("health-guard", async () => (await import("./health-guard.mjs")).default(file, agent));
		await guard("hold-guard",   async () => (await import("./hold-guard.mjs")).default(file, agent));
		const r = file && rel(file);
		if (!r) return;
		const by_path = find_task_by_path(file);
		// Pin a subagent to its own task from its FIRST in-dir write — which is the
		// task.jsonl line `new-task` has it write — even though that write itself is
		// never logged. Before this, a minion whose first real edit was outside its dir
		// (Server/, ext/) had it attributed to a sibling's task (2026-08-18, four cases).
		if (by_path && input.agent_id) try { fs.writeFileSync(agent_cache(input.agent_id), by_path); } catch {}
		if (skip.has(path.basename(r))) return;
		// A subagent with no pin yet gets NO guess: every subagent shares the parent's
		// session_id, so `find_task(session)` is a sibling's live task as often as not.
		// A requirements.md with no task.jsonl beside it is a task not born yet (the mastermind
		// writes the brief before the minion opens its ledger) — never guess an owner for it; five
		// briefs landed in siblings' logs on 2026-09-17 before this line.
		const unborn = path.basename(r) === "requirements.md" && !by_path;
		const task = by_path || cached_task(input.agent_id, input.session_id) || (input.agent_id || unborn ? null : find_task(input.session_id, true));
		if (!task) return;
		if (lines(task).some(e => e.action?.files?.includes(r))) return; // first touch only
		append(task, { action: { at: now(), did: "edit", files: [r] } });
		return;
	}

	if (event === "stop") {
		const task = cached_task(input.agent_id, input.session_id) || find_task(input.session_id, false);
		if (!task) return;
		const s = state(task);
		if (s.landed_at || !Array.isArray(s.steps) || !(Number(s.step) < s.steps.length)) return;
		console.log(JSON.stringify({
			decision: "block",
			reason: `Your task ledger says step ${s.step} of ${s.steps.length} with no landed_at. Finish the remaining steps and bump step, or land it by appending ONE line to ${rel(task)}: {"assign": {"step": ${s.steps.length}, "landed_at": "<ISO with local offset>", "outcome": "**what landed** — …"}} — landed_at and outcome go INSIDE assign, never as their own verb.`
		}));
		return;
	}

	const task = find_task(input.session_id, false);
	if (!task) return;

	if (event === "sessionstart") {
		if (input.source === "resume") append(task, { log: { at: now(), msg: "session resumed" } });
		return;
	}

	if (event === "sessionend" && !state(task).landed_at)
		append(task, { log: { at: now(), msg: `session ended (${input.reason || "other"}) without landing` } });
};

try { await run(); } catch {}
process.exit(0);
