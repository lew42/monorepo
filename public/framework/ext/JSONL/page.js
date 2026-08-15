import { Page, md, code, demo, p, div } from "/app.js";
import { JSONL, TaskJSONL } from "./JSONL.js";

export default new Page({
	meta: import.meta,
	title: "JSONL",
	description: "Append-only .jsonl logs, assembled back into object state.",
	icon: "table_rows",

	content(){
		code.js(`import { JSONL, TaskJSONL } from "/framework/ext/JSONL/JSONL.js";`);

		md("One JSON object per line, one verb per key. `assign` merges onto the object — the constructor's own `Object.assign`, replayed — while `log` and `action` append. The writer only ever appends; the reader replays.");

		demo(() => {
			const text = [
				`{"assign": {"title": "jsonl", "now": "scoping"}}`,
				`{"log": {"at": "11:01", "msg": "started"}}`,
				`{"assign": {"now": "building", "tokens": 42000}}`,
			].join("\n");

			const state = new JSONL().read(JSONL.parse(text));
			p(`title ${state.title} — now ${state.now} — ${state.logs.length} log line`);
		}, "The last assign wins: three lines in, one object out.");

		demo(() => {
			const task = new TaskJSONL().read(JSONL.parse([
				`{"agent": {"kind": "cli", "task": "audit css", "model": "claude-sonnet-5"}}`,
				`{"agent": {"task": "audit css", "outcome": "clean", "tokens": 54129}}`,
			].join("\n")));

			p(`${task.agents.length} agent — ${task.agents[0].outcome}, ${task.agents[0].tokens.toLocaleString()} tokens`);
		}, "TaskJSONL merges agent lines by task — dispatched once, landed later, one row.");

		demo(() => {
			div(async $live => {
				const task = await new TaskJSONL({ url: "/framework/ai/2026-08-14/jsonl/task.jsonl" }).load();
				$live.append(() => p(task.loaded
					? `now: ${task.now} — ${task.logs.length} log lines`
					: "task.jsonl unavailable"));
			});
		}, "A live one — the task.jsonl of the task that built this module.");

		md(`Where the logs live:

- \`ai/<date>/<task>/task.jsonl\` — the task manifest as a log (\`TaskJSONL\`). The [day dashboard](/framework/ai/) reads it, falling back to legacy \`session.json\`.
- \`ai/<date>/day.jsonl\` — the day's blind-append log.

Next: [AITask](/framework/ext/AITask/) — the viewer these logs feed.`);
	}
});
