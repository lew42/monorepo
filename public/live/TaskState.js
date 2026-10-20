/* A task's closeout state, computed from its task.jsonl lines (no imports: the Today card and Server/task-closeout.mjs both use it).
 *   done      has a landing line (assign.landed_at)
 *   finished  no landing line, but the log itself says it is done AND names a commit: closeable (Server/task-closeout.mjs --close)
 *   waiting   anything else; `on` says what it waits on, or "?" when no line says
 * Decisions: public/live/doc/notes.md. */
export default class TaskState {
	static DONE = /(nothing in flight|all \d+ steps? (are )?done)/i;
	static COMMIT = /\b[0-9a-f]{9}\b|\bcommitted\b.*\b[0-9a-f]{7,}\b/i;

	static parse(text){
		return (text ?? "").split("\n").filter(s => s.trim()).flatMap(s => { try { return [JSON.parse(s)]; } catch { return []; } });
	}

	// → { state: "done" | "finished" | "waiting", on: string|null, why: string }
	static classify(lines, now = Date.now()){
		const assigns = lines.map(l => l.assign).filter(Boolean);
		if (assigns.some(a => a.landed_at)) return { state: "done", on: null, why: "landed" };

		const logs = lines.map(l => l.log).filter(Boolean);
		// finished = the LAST thing the agent itself said is a done report (bookkeeping lines don't count)
		const book = l => l.heartbeat === "check" || /^(session (ended|resumed)|task-loop|status check)/.test(l.msg ?? "");
		const own = logs.filter(l => !book(l));
		const said = this.DONE.test(own.at(-1)?.msg ?? "") ? [own.at(-1)] : [];
		const all = JSON.stringify(logs);
		if (said.length && this.COMMIT.test(all)) return { state: "finished", on: null, why: "its own log says done and names a commit" };

		const snooze = lines.map(l => l.snooze).filter(Boolean).at(-1);
		if (snooze && Date.parse(snooze.until) > now) return { state: "waiting", on: `the snooze until ${snooze.until.slice(0, 10)} (set by ${snooze.by})`, why: "snoozed" };

		if (own.at(-1)?.heartbeat === "answered" && /(idle|waiting for)/i.test(own.at(-1).msg))
			return { state: "waiting", on: "the next question (its own report: idle, open on purpose)", why: "standing" };

		const esc = logs.filter(l => l.chase === "escalated").at(-1);
		if (esc) return { state: "waiting", on: "the owner (task-loop escalated it to the card)", why: "escalated" };

		const live = assigns.at(-1)?.now;
		if (live && live !== "queued") return { state: "waiting", on: "its own agent (in flight)", why: "running" };
		return { state: "waiting", on: "? (no line says)", why: "unnamed" };
	}

	// A one-line label for the card.
	static label(r){ return r.state === "done" ? "done" : r.state === "finished" ? "finished, not landed" : `waiting on ${r.on}`; }
}
