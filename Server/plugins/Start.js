import { spawn } from "child_process";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import stamp from "../stamp.js";

const AI = path.resolve("public/framework/ai");
const STOP = new Set("the a an to of for and or in on it is we i you can lets let please make just some that this".split(" "));

/* Start a task from the browser. Unlike `rpc:ask` this does NOT wait for the
 * turn: a task runs for an hour, so the call returns as soon as the directory
 * exists and the process is away, and the task's own log carries it to the
 * board from there — live-reload is the progress channel.
 * Dev server only; see public/framework/ext/AITask/readme.md. */
export default class Start {

	static setup(socket){ new Start(socket); }

	constructor(socket){
		this.socket = socket;
		socket.on("rpc:start", (args, index) => this.start(args[0] || {}, index));
	}

	start(req, index){
		const prompt = (req.prompt ?? "").trim();
		if (!prompt) return this.socket.send({ index, error: "Nothing to work on." });

		try {
			const task = this.scaffold(prompt, req);
			this.spawn(task, prompt, req);
			this.socket.send({ index, ...task });
		} catch (e){
			this.socket.send({ index, error: String(e.message || e) });
		}
	}

	/* The dir, the brief and the opened log — exactly what the `new-task` skill
	 * writes by hand, so a browser-started task is indistinguishable from one a
	 * session opened for itself. */
	scaffold(prompt, { group, model = "sonnet", name }){
		const date = stamp().slice(0, 10);
		const day = path.join(AI, date);
		const slug = unique(day, slugify(name || prompt));
		const dir = path.join(day, slug);
		if (!dir.startsWith(AI)) throw new Error("refusing path " + dir);

		fs.mkdirSync(dir, { recursive: true });
		const session_id = randomUUID(), at = stamp();

		this.write(path.join(dir, "requirements.md"),
			`# ${slug}\n\n## The ask, verbatim\n\n> ${prompt.split("\n").join("\n> ")}\n\n`
			+ `Started from the board at \`/framework/ai/\` on ${at}.\n`);

		this.append(path.join(dir, "task.jsonl"), [{ assign: {
			session_id, tab: "browser", group: group || undefined, request: prompt,
			requested_at: at, model: MODELS[model] ?? model,
			now: "starting — spawned from the board",
		} }]);

		this.append(path.join(day, "day.jsonl"),
			[{ log: { at, task: slug, msg: "task opened from the board — " + one_line(prompt) } }]);

		// `task` is a path under `public/` — the one shape `rpc:ask` and `rpc:thread`
		// also take, so a started task can be chatted to without a second format.
		return { task: `framework/ai/${date}/${slug}`, slug, session_id, url: `/framework/ai/${date}/${slug}/` };
	}

	/* ⚠ Muted for the tab that asked: three scaffold writes in a row would
	   otherwise live-reload the board out from under the compose box before it
	   can show the link. Only this socket, only for 5s — every OTHER tab still
	   sees the new task appear, and the task's own progress reloads normally. */
	mute(file){ this.socket.socket_server?.live_reload?.mute(file, this.socket); }

	write(file, text){ this.mute(file); fs.writeFileSync(file, text); }

	append(file, lines){
		fs.mkdirSync(path.dirname(file), { recursive: true });
		this.mute(file);
		fs.appendFileSync(file, lines.map(l => JSON.stringify(l)).join("\n") + "\n");
	}

	/* ⚠ `acceptEdits`, not `bypassPermissions`: a text box on a web page should
	 * be able to write files, not to run anything at all. Raise it per call if a
	 * task genuinely needs the shell. */
	spawn({ task, session_id }, prompt, { model = "sonnet", mode = "acceptEdits" }){
		const child = spawn(process.env.CLAUDE_BIN || "claude",
			["-p", "--session-id", session_id, "--model", model, "--permission-mode", mode],
			{ windowsHide: true, stdio: ["pipe", "ignore", "pipe"] });

		child.stdin.end(brief(task, prompt));
		child.stderr.on("data", d => console.warn("Start:", String(d).trim().slice(0, 300)));
		child.on("error", e => console.warn("Start: spawn failed —", e.message));
	}
}

const MODELS = { sonnet: "claude-sonnet-5", opus: "claude-opus-5", haiku: "claude-haiku-4-5-20251001" };

const one_line = (s, n = 90) => s.split("\n")[0].slice(0, n);

/* ⚠ Path-ish tokens go first: an ask that opens by naming a file ("Read
   public/framework/ext/AITask/readme.md and …") slugged to `read-public-framework-ext`,
   which names nothing. The compose box's own name field is the real answer;
   this is the fallback. */
const slugify = text => text.toLowerCase()
	.split(/\s+/).filter(w => !w.includes("/") && !/\w\.\w/.test(w)).join(" ")
	.replace(/[^a-z0-9\s-]/g, " ").split(/[\s-]+/)
	.filter(w => w && !STOP.has(w)).slice(0, 4).join("-").slice(0, 40) || "task";

const unique = (day, slug) => {
	let name = slug;
	for (let n = 2; fs.existsSync(path.join(day, name)); n++) name = `${slug}-${n}`;
	return name;
};

/* The task dir and its log already exist, so the brief's whole job is to point
 * at them and get out of the way — the conventions live in CLAUDE.md and the
 * `new-task` skill, which the session reads for itself. */
const brief = (task, prompt) => `You are picking up a task in this repo, started from the browser.

Its directory already exists: \`public/${task}/\` — \`requirements.md\` holds the ask and \`task.jsonl\` is open with the launch line written.

1. Read \`CLAUDE.md\` first. It rules: when anything dissents from it, it prevails.
2. Assign your step outline early — \`{"assign": {"steps": [...], "step": 1}}\` — so the board shows a progress bar.
3. Log milestones as you work by APPENDING to \`public/${task}/task.jsonl\` (format: \`public/framework/ext/JSONL/readme.md\`). Prefer a log line over a chat paragraph. **Every verb's value is an object carrying its own \`at\`** — a bare string is malformed:

    {"assign": {"now": "one line — what is happening right now"}}
    {"log": {"at": "<ISO with local offset>", "msg": "a finding or a decision"}}
    {"action": {"at": "<ISO>", "did": "write|edit|run", "files": ["…"]}}

4. Stamp \`landed_at\` and an \`outcome\` in a final \`assign\` when you are done.

Work autonomously and do not stop to ask questions — nobody is at the keyboard. If a decision genuinely needs the human, make the call, state the assumption in the log, and keep going.

The ask, verbatim:

${prompt}
`;
