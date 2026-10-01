import { Doc, md, code, demo, p, div } from "/app.js";
import { JSONL, TaskJSONL } from "./JSONL.js";

export default new Doc({
	meta: import.meta,
	title: "JSONL",
	description: "Append-only .jsonl logs, assembled back into object state by replaying one verb per line.",
	icon: "table_rows",

	subject: JSONL,
	properties: "verbs logs actions skipped loaded offset unparsed",
	methods:    "parse load live unsubscribe read apply flat log action skip reset",
	notes:      "task-jsonl live decisions",
	files:      "JSONL.js live.js page.js readme.md",

	overview: [
		{ title: "TaskJSONL", icon: "checklist", description: "The task manifest as a log — agent lines merge by task.", content(){

			code.js(`static verbs = [...JSONL.verbs, "agent", "chat", "shot", "ask", "decision", "verdict"];

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

			md("`ask` does the same by `id` — one thing the owner asked for, kept in their own words with the `uuid` of the message they said it in, so [ext/AITask](/framework/ext/AITask/) can show it as a card that links back to the real sentence. `chat` (one browser turn), `shot` (one screenshot taken outside the repo — path, url, viewport width, label), and a `steps`/`step` progress pair follow the same rule: an extra verb or an extra assigned field, never a second file. `decision` and `verdict` are a PAIR on the same rule: the worker writes down a choice and the alternatives it was made over, the owner presses Approve or Improve on [ext/AITask](/framework/ext/AITask/doc/decisions-tab/)'s Decisions tab, and the press is a verdict line in this same log. [TaskJSONL](/framework/ext/JSONL/doc/task-jsonl/) has the full shape, including the subclassing trap the static `verbs` list sets.");
		} },
		{ title: "experiment and review", icon: "science", description: "Two verbs the skills already write — rendered as one line each, no new array.", content(){

			code.js(`experiment(value){
	const msg = value.msg ?? [value.try ?? value.name, value.measure, value.result].filter(Boolean).join(" → ");
	this.logs.push({ ...value, msg });
}

review(value){
	const a = value.answer;
	const msg = value.msg ?? (a ? \`review: #\${a.n} — \${a.reply}\`
		: value.found != null ? \`review: found \${value.found}, real \${value.real}, fixed \${value.fixed}\`
		: JSON.stringify(value));
	this.logs.push({ ...value, msg });
}`, "framework/ext/JSONL/JSONL.js");

			demo(() => {
				const task = new TaskJSONL().read(JSONL.parse([
					`{"experiment": {"try": "4 Haiku agents on a private Servex, 3 idle", "measure": "claude.exe holding their sessions", "result": "at +33s: 4 processes, 251/262/253/270 MB"}}`,
					`{"review": {"found": 7, "real": 6, "fixed": 6}}`,
				].join("\n")));

				task.logs.forEach(entry => p(entry.msg));
			}, "Neither verb grows its own array — both push a plain one-line `msg` onto `logs`, the same array `log` itself fills, so any reader of `logs` already knows how to show them.");

			md("A line with no verb at all — an old day-log line, or a pre-verb `{\"type\": \"launch\", …}` task line — renders the same way, as long as it carries something to read (`msg`, `text` or `title`) beside a `type` or `at`:");

			demo(() => {
				const log = new JSONL().read(JSONL.parse([
					`{"at": "2026-09-30T12:00:00-05:00", "task": "sheet-regression", "msg": "landed — the sheet no longer freezes at 150px"}`,
					`{"type": "launch", "at": "2026-09-30T12:30:01-05:00", "slug": "sheet-regression", "title": "Fix the sheet height"}`,
				].join("\n")));

				log.logs.forEach(entry => p(entry.msg));
			}, "Both lines predate `\"one verb per key\"` and parse fine — they just have no verb to dispatch on. `static flat()` is what tells them apart from a genuinely unknown line, which still warns.");
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

		md.details(import.meta, "readme.md", "Readme");
	}
});
