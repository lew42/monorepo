import { Page, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "AI tasks",
	description: "A task's task.jsonl (or legacy session.json), rendered — request, spend, agents — with a chat replay of the raw transcript on the dev server.",
	icon: "smart_toy",

	content(){
		code.js(`import { AITask } from "/app.js";

export default new AITask({
	meta: import.meta,
	title: "Panel system",
	icon: "receipt_long",
});`);

		md("Beside that `page.js` sits a `session.json` — the request verbatim, when it was asked and when it landed, which models ran, one row per agent with tokens, duration and cost. The page renders whatever fields are present.");

		md("**The raw transcript never enters the repo.** On the dev server, `/ai-logs/<session-id>` streams the real file from `~/.claude/projects/`, and each recorded session id becomes a threaded replay: the rail holds every prompt in full — time, duration, char count, a copyable ref — and clicking one opens its flow beside it, thinking as expandable bars, responses rendered in markdown, screenshots inline. On static hosting the replay says \"unavailable\" and the manifest stands alone.");

		md("Live example: [sessions](/framework/ai/2026-08-13/sessions/) — the session that built this ext, recorded by it.");

		md.details(import.meta, "readme.md", "Design record — schema, the serving verdict, sharp edges");
	}
});
