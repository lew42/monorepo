/* THE DISPATCHER — a spoken card becomes a task mastermind, nobody polling.
 *
 * The fast assistant hears "build me X", decides it is a `task` (not a note
 * or a question) and appends a `task` line, `state: "queued"`, to the same
 * `prompts` log everything else goes through (`Assistant.js`). This class
 * watches that log the way `Assistant.listen()` does — the single writer
 * announces every line it accepts (`Servex.Log`'s `append`) — and for each
 * queued task spawns a `task-mastermind` agent to build it.
 *
 * Not a Claude session itself: plain code, one `Map` of who is running, one
 * array of who is waiting. `max` caps how many run at once — no cap by default
 * (the owner, 2026-09-24: "an unnecessary limitation"); set a number to bring
 * one back, and a slot freeing up (a child's wake) starts the next one queued. */
import fs from "node:fs";
import path from "node:path";

/* The pause switch — a file, so the owner can flip it with no restart and see it in a
 * directory listing: `%LOCALAPPDATA%/lew42/servex/dispatch.off`. While it exists a
 * spoken task is still carded and still logged `queued`, but nothing is spawned (the
 * owner, 2026-09-23, under weekly budget pressure: "speak directly to the fast agent
 * without it using any secondary assistants or masterminds"). Delete the file and the
 * NEXT queued task dispatches; tasks queued while paused are not replayed — say them
 * again, or restart Servex. */
const OFF = path.join(process.env.LOCALAPPDATA || "", "lew42", "servex", "dispatch.off");

export default class Dispatcher {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return { id: "dispatcher", log: "prompts", max: Infinity, running: new Map(), queue: [], paused: new Set(), cards: new Map(), titles: new Map() };
	}

	install(){ this.hire(); this.listen(); return this; }

	/* A fake "parent" agent, in the very same `live` map real ones sit in and
	 * registered the same way (`GET /agents`; `GET /api/agents` calls `.card()`
	 * on every live entry, hence that method below). `Agents.wake_parent()`
	 * needs nothing more than a `.send()` at `child.parent` — the whole trick
	 * that lets a child's done/blocked/error reach us with no polling. */
	hire(){
		const agent = {
			id: this.id, role: "dispatcher", name: null, topics: null, page: null,
			state: "idle", visibility: "team", session_id: null, parent: null,
			started_at: new Date().toISOString(),
			card(){ return { id: this.id, role: this.role, model: null, state: this.state,
				visibility: this.visibility, started_at: this.started_at, turns: 0,
				session_id: this.session_id, cost: 0, parent: this.parent }; },
			send: (text, note) => this.woken(text, note)
		};
		this.servex.agents.live.set(this.id, agent);
		this.servex.agents.register(agent);
	}

	/* ⚠ OUR OWN LINES ARE NOT NEWS. `progress()` writes `task` lines onto the
	 * very log this listens to, and the paused note is itself `state: "queued"`
	 * — found live 2026-09-23 15:04: each note was heard as a new queued task,
	 * which wrote another note, 1.2 million lines (294 MB) in ninety seconds
	 * until Servex ran out of memory. Every line we write carries `by: this.id`
	 * and is skipped here; `paused` says the paused note once per task. */
	listen(){
		this.servex.log.on("append", (name, entry) => {
			if (name !== this.log || entry.type !== "task") return;
			this.mirror(entry);
			if (entry.by !== this.id && entry.state === "queued") this.saw(entry);
		});
	}

	/* A task spoken INTO a card (the fast assistant stamps `card`) shows up in
	 * that card's own log too — its queued line and every progress line after,
	 * whoever wrote them, keyed on the task id. */
	mirror(entry){
		if (entry.card) this.cards.set(entry.id, entry.card);
		const card = this.cards.get(entry.id);
		if (card) this.servex.log.append(`cards/${card}`, entry).catch(() => {});
		// …and every task moment is one line in the Live card's own chat.
		const title = entry.title ?? this.titles.get(entry.id) ?? entry.id;
		if (entry.title) this.titles.set(entry.id, entry.title);
		this.servex.log.append("cards/live", { type: "update", ref: entry.id,
			text: `task ${title}: ${entry.state}${entry.now ? " — " + entry.now : ""}` }).catch(() => {});
	}

	saw(task){
		if (fs.existsSync(OFF)){
			if (this.paused.has(task.id)) return;
			this.paused.add(task.id);
			return this.progress(task.id, "queued", "dispatch is paused (dispatch.off exists) — carded, not spawned");
		}
		if (this.queue.some(t => t.id === task.id) || [...this.running.values()].includes(task.id)) return;
		this.queue.push(task);
		this.pump();
	}

	pump(){
		while (this.running.size < this.max && this.queue.length) this.dispatch(this.queue.shift());
	}

	/* Opus 5.5 at MEDIUM effort — the owner, 2026-09-24, on a fresh weekly
	 * window: "Opus 5.5 medium effort seems to work pretty well" (was Sonnet
	 * medium, decision `card-to-task-budget`). `permission_mode` is left at the role's own
	 * `bypassPermissions` — nobody is there to approve a tool call on a
	 * non-interactive session. */
	async dispatch(task){
		/* A task spoken on a card goes to THAT card's manager (Layers.js), whose
		 * session is kept for the card's whole life, instead of a fresh task
		 * mastermind that knows nothing the card already knows. It does not hold
		 * a slot here: the manager reports on the card, not to us. */
		if (task.card && this.servex.layers){
			const { manager } = this.servex.layers.ask_manager({ card: task.card, text: task.brief, from: this.id, task: task.id });
			return this.progress(task.id, "working", `handed to ${manager}`);
		}
		const { topics, page } = await this.context(task);
		const post = (state, now) => `append_log({name: "prompts", entry: {type: "task", id: "${task.id}",`
			+ ` state: "${state}", now: "${now}"}})`;
		const opening = "you own this task; open `ai/<date>/<slug>/` with `new-task`; a"
			+ " worktree if you edit site files; land with `finish-task`. Separately from your own"
			+ " task.jsonl, post your progress on THIS log — call the MCP tool"
			+ ` \`${post("working", "<one line>")}\` as you start, again with state "blocked" if you`
			+ ` get stuck, and \`${post("landed", "the page's own url")}\` the moment you land, its`
			+ " `now` naming the page's own url — exactly that flat shape (`type` at the top, never"
			+ ' nested under a `"task"` key), or nothing will show it.'
			+ (task.card ? ` To talk to the owner, call \`card_reply({card: "${task.card}", from: "<your agent id>", text: "<two plain sentences>"})\``
				+ " — it lands in the card they spoke this into, where they are reading." : "");

		const agent = this.servex.agents.spawn({
			role: "task-mastermind",
			name: task.id.replace(/^t-/, ""),
			model: "claude-opus-5-5", effort: "medium",
			prompt: `${task.brief}\n\n${opening}`,
			parent: this.id,
			topics, page
		});

		this.running.set(agent.id, task.id);
		try {
			const folder = task.card && this.servex.cards?.canonical(task.card);
			if (folder) Promise.resolve(this.servex.cards.attach(folder, agent.id)).catch(() => {});
		} catch {}
		this.progress(task.id, "working", `spawned ${agent.id}`);
	}

	/* The names the fast assistant minted alongside this same idea, read back
	 * off the card's own `re` — which lists every id minted since the prompt
	 * it answers, names included (`Assistant.js`'s `entry()`). `page` is a
	 * link back to where the card lives, so a registry row is never a dead
	 * end even before the task has a page of its own. */
	async context(task){
		const history = await this.servex.log.tail(this.log, 500).catch(() => []);
		const card = history.find(e => e.type === "card" && e.id === task.re);
		const ids = [].concat(card?.re ?? []);
		const topics = history.filter(e => e.type === "name" && ids.includes(e.id)).map(e => e.name).filter(Boolean);
		return { topics, page: "/framework/ai2/" };
	}

	/* A child's wake — `done` or `blocked`, from `Agents.wake_parent()` —
	 * frees its slot and becomes one more `task` line, so a task mastermind
	 * that forgets to post its own final state still leaves the card an
	 * honest answer instead of stuck on `working` forever. */
	woken(text, note){
		const task_id = this.running.get(note?.from);
		this.running.delete(note?.from);
		if (task_id){
			const blocked = /^blocked/i.test(text ?? "");
			this.progress(task_id, blocked ? "blocked" : "landed", String(text ?? "").replace(/^\w+:\s*/, "").slice(0, 200));
		}
		this.pump();
		return this;
	}

	progress(id, state, now){
		this.servex.log.append(this.log, { type: "task", id, state, now, by: this.id }).catch(() => {});
	}
}
