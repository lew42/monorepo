import { Doc, md, code, demo, p, div } from "/app.js";
import { JSONL, TaskJSONL } from "./JSONL.js";

export default new Doc({
	meta: import.meta,
	title: "JSONL",
	description: "Append-only .jsonl logs, assembled back into object state by replaying one verb per line.",
	icon: "table_rows",

	subject: JSONL,
	properties: "verbs logs actions skipped loaded offset unparsed",
	methods:    "parse load live unsubscribe read apply log action skip reset",
	notes:      "task-jsonl live",
	files:      "JSONL.js live.js page.js readme.md",

	overview: [
		{ title: "TaskJSONL", icon: "checklist", description: "The task manifest as a log — agent lines merge by task.", content(){

			code.js(`static verbs = [...JSONL.verbs, "agent", "chat"];

agent(value){
	const known = this.agents.find(a => a.task === value.task);
	known ? Object.assign(known, value) : this.agents.push(value);
}`, "framework/ext/JSONL/JSONL.js");

			demo(() => {
				const task = new TaskJSONL().read(JSONL.parse([
					`{"agent": {"kind": "cli", "task": "audit css", "model": "claude-sonnet-5"}}`,
					`{"agent": {"task": "audit css", "outcome": "clean", "tokens": 54129}}`,
				].join("\n")));

				p(`${task.agents.length} agent — ${task.agents[0].outcome}, ${task.agents[0].tokens.toLocaleString()} tokens`);
			}, "Dispatched once, landed later — merged by task into one row, never two.");

			md("`chat` (one browser turn) and a `steps`/`step` progress pair follow the same rule: an extra verb or an extra assigned field, never a second file. [TaskJSONL](/framework/ext/JSONL/docs/task-jsonl/) has the full shape, including the subclassing trap the static `verbs` list sets.");
		} },
		{ title: "Streaming", icon: "sensors", description: "A real task.jsonl, streamed from the dev server.", content(){

			code.js(`const task = new TaskJSONL({ url: "…/task.jsonl" });
await task.live(show);   // resolves like load(), then calls show() per appended batch`);

			demo(() => {
				div(async $live => {
					const task = new TaskJSONL({ url: "/framework/ai/2026-08-14/jsonl/task.jsonl" });
					const show = () => $live.empty(() => p(task.loaded
						? `now: ${task.now} — ${task.logs.length} log lines`
						: "task.jsonl unavailable"));
					await task.live(show);
					show();
				});
			}, "The task.jsonl of the task that built this module. `live()` is `load()` plus a subscription — on the dev server the box refills itself when the file is appended to; on static hosting it IS the fetch. `.loaded` tells a real read from an empty, never-populated instance under either transport.");
		} },
	],

	content(){

		code.js(`import { JSONL, TaskJSONL } from "/framework/ext/JSONL/JSONL.js";`);

		md("One JSON object per line, one verb per key. `assign` merges onto the object — the constructor's own `Object.assign`, replayed — while `log` and `action` append. The writer only ever appends; the reader replays.");

		demo(() => {
			const text = [
				`{"assign": {"title": "jsonl", "now": "scoping"}}`,
				`{"log": {"at": "11:01", "msg": "started"}}`,
				`{"assign": {"now": "building", "tokens`,
				`{"assign": {"tokens": 42000}}`,
			].join("\n");

			const state = new JSONL({ url: "the demo above" });
			state.read(state.parse(text));
			p(`title ${state.title} — now ${state.now} — ${state.logs.length} log line — ${state.unparsed} unparsed`);
		}, "The last assign wins, and the torn third line costs one line rather than the file — dropped, counted, and warned about once in the console.");

		md("An unrecognized verb never vanishes silently either — it lands in `.skipped` with a console warning, so a typo in a hand-written verb stays visible instead of quietly dropping a line.");

		md("On the dev server a log doesn't have to be re-fetched to stay current: [`live()`](/framework/ext/JSONL/api/live/) subscribes to the file, replays each appended batch through the same `read()`, and calls back so the reader redraws — no reload. Off localhost there is no socket and it *is* `load()`, so nothing on the site depends on a server.");

		md(`Where the logs live:

- \`ai/<date>/<task>/task.jsonl\` — the task manifest as a log (**TaskJSONL**, in the rail beside this text). The [day dashboard](/framework/ai/) reads it, falling back to legacy \`session.json\`.
- \`ai/<date>/day.jsonl\` — the day's blind-append log, read fine by base **JSONL**.`);

		md("Next: [AITask](/framework/ext/AITask/) — the viewer these logs feed.");

		md.details(import.meta, "readme.md", "Design record — the verb format, the traps, and who uses it");
	}
});
