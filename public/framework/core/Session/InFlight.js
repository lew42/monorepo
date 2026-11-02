// InFlight.js — the simplest dashboard: what is being worked on now (at most 5, each with a progress bar and its current line), what waits
// on the owner, what is next, and a count of what is done. `InFlight.pick(session)` chooses; one component for a session's
// page and for the AI dashboard. DOM-free, so a node test runs it; the view is InFlightView.js. Doc: doc/in-flight.md

export default class InFlight {
	static MAX = 5;   // tasks shown as "in flight"
	static NEXT = 3;  // idle tasks shown as "next"

	/** A task's current line: a process shows its current step, a task its own `now`. */
	static now_of(t){
		const step = t.step;   // only a Process has one
		return step ? `${step.get_one("title") ?? step.id}${step.get_one("now") ? ": " + step.get_one("now") : ""}` : (t.get_one("now") ?? "");
	}

	/** {inflight, more, waiting, next, done} from a session's top-level tasks. Prompts and dropped tasks are not work. */
	static pick(session, { max = this.MAX, next = this.NEXT } = {}){
		const all = [...(session._tasks ?? [])].filter(t => t.state !== "stopped" && t.constructor.name !== "Prompt");
		const when = t => Date.parse(t._last_ts ?? t.get_one("started_at") ?? t.created_at ?? "") || 0;
		const running = all.filter(t => t.state === "running").sort((x, y) => when(y) - when(x));
		const waiting = all.filter(t => t.state === "waiting" && [undefined, null, "owner", "creator"].includes(t.get_one("waiting_on"))).sort((x, y) => when(y) - when(x));
		const idle = all.filter(t => t.state === "idle" || t.state === "paused").sort((x, y) => (Number(y.priority?.score) || 0) - (Number(x.priority?.score) || 0) || when(y) - when(x));
		return {
			inflight: running.slice(0, max), more: Math.max(0, running.length - max),
			waiting: waiting.map(t => ({ task: t, on: t.get_one("waiting_on") ?? "owner", what: t.get_one("waiting_what") ?? "" })),
			next: idle.slice(0, next), done: all.filter(t => t.state === "complete").length
		};
	}
}
