/* The AI system, one concept per entry, most important first.
   `ai/page.js` draws these as the level-1 tiles and routes each slug to its own page:
   the gist first, then a few items, then the code that owns it.
   Where Servex implements a concept, the page links to Servex instead of repeating it. */
import { file_link as fs } from "../ext/filesystem/file_link.js";
const S = "/framework/servex/";

export default [
	{ slug: "assistants", name: "Assistants", icon: "support_agent",
		gist: "Assistants answer you. The fast one replies in a line; the smart one gives an opinion.",
		items: [
			"**Fast assistant** (Sonnet, low effort): the front desk. It shows your words on screen and hands them to the mastermind that owns them.",
			"**Smart assistant** (the master assistant, Opus): knows what is going on, answers in one or two sentences, and audits the system between questions.",
			"Each card also gets its own assistant, which answers you on that card.",
		],
		code: [["Servex/agents/Assistant.js", fs("Servex/agents/Assistant.js")], ["Servex/agents/assistant.md", fs("Servex/agents/assistant.md")], ["Servex/agents/master-assistant.md", fs("Servex/agents/master-assistant.md")]],
		servex: [["Agents & roles", S + "doc/roles/"]] },

	{ slug: "masterminds", name: "Masterminds", icon: "psychology",
		gist: "A mastermind owns work end to end: it decides, splits the work, and judges what comes back.",
		items: [
			"**The mastermind** picks the most important work and keeps the budget.",
			"**The Servex mastermind** improves the system itself: skills, briefs, tools.",
			"**A task mastermind** owns exactly one task, from brief to merge.",
			"A mastermind briefs and judges; the building is done by minions.",
		],
		code: [["Servex/agents/mastermind-servex.md", fs("Servex/agents/mastermind-servex.md")], ["Servex/agents/Dispatcher.js", fs("Servex/agents/Dispatcher.js")]],
		servex: [["Agents & roles", S + "doc/roles/"]] },

	{ slug: "minions", name: "Minions", icon: "engineering",
		gist: "A minion is a worker: one brief (requirements.md), one fence of files, one result.",
		items: [
			"Haiku scans, Sonnet builds, Opus judges.",
			"Each minion gets its own task log, a subtask of its mastermind's.",
			"It is stopped once its result has been read, so it stops holding memory.",
		],
		code: [["Servex/agents/Agents.js", fs("Servex/agents/Agents.js")], ["Servex/agents/brief.js", fs("Servex/agents/brief.js")]],
		servex: [["Spawning (Agents & roles)", S + "doc/roles/"]] },

	{ slug: "tasks", name: "Tasks and cards", icon: "task_alt",
		gist: "Every change is a task: a folder with a task.jsonl log. A card is how a task shows up on your dashboard.",
		items: [
			"A task folder lives at `ai/<date>/<slug>/`. Its first log line holds the ask and the plan.",
			"A card is a mini page. Its log is `page.jsonl`, and you can reply on it.",
			"Every day's tasks: [the log](/framework/ai/log/). The live board: [V3](/framework/ai/v/3/).",
		],
		code: [["ext/AITask", "/framework/ext/AITask/"], ["ext/JSONL", "/framework/ext/JSONL/"], ["Card rules", "/framework/core/Page/card/"]],
		servex: [] },

	{ slug: "asks", name: "Asks", icon: "record_voice_over",
		gist: "Every ask you route gets one line in ai/asks.jsonl, naming the agent that owns it.",
		items: [
			"A line holds the ask, its owner agent, its card and its status.",
			"Servex marks an ask that has stalled, so nothing sits in limbo.",
		],
		code: [["ai/asks.jsonl", "/framework/ai/asks.jsonl"], ["ext/AITask (asks.js)", "/framework/ext/AITask/"]],
		servex: [] },

	{ slug: "inboxes", name: "Page inboxes", icon: "inbox",
		gist: "Each page has an inbox, for coordination only. A note reaches whoever coordinates that module.",
		items: [
			"`drop(path, text)` appends a note to the page's `page.jsonl`.",
			"The mastermind holding `claim_topic` on that path gets it; otherwise it waits in the page's AI tab.",
		],
		code: [["Servex/agents/inbox.js", fs("Servex/agents/inbox.js")], ["Servex/agents/claims.js", fs("Servex/agents/claims.js")]],
		servex: [["Inbox (Servex doc)", fs("Servex/doc/inbox.md")]] },

	{ slug: "heartbeat", name: "Heartbeat", icon: "monitor_heart",
		gist: "The heartbeat checks on every open task. A task's owner that goes quiet is asked how it is doing.",
		items: [
			"Quiet for 5 minutes: the owner gets a one-line status check.",
			"Dead: it is revived. Only if that fails do you hear about it.",
			"It runs inside Servex.",
		],
		code: [["Servex/Heartbeat.js", fs("Servex/Heartbeat.js")], ["Servex/TaskLoop.js", fs("Servex/TaskLoop.js")]],
		servex: [["Task loop (Servex doc)", fs("Servex/doc/task-loop.md")]] },

	{ slug: "review-merge", name: "Review and merge", icon: "merge",
		gist: "Work is built in a worktree, reviewed by fresh eyes, smoke-tested, then merged into michael/dev.",
		items: [
			"`Server/review.mjs`: a fresh agent checks the result against your words.",
			"`Server/merge.mjs`: loads the changed pages, merges only with zero errors.",
			"Quick fixes take a worktree from the pool, which Servex keeps ready.",
			"Past reviews: [Review](/framework/ai/review/).",
		],
		code: [["Server/merge.mjs", fs("Server/merge.mjs")], ["Server/review.mjs", fs("Server/review.mjs")]],
		servex: [["The worktree pool", fs("Servex/doc/pool.md")], ["Lifecycle", S + "lifecycle/"]] },
];
