/* The AI system, one concept per entry, most important first.
   `ai/page.js` draws these as the level-1 tiles and routes each slug to its own page:
   the gist first, then a few items, then the code that owns it.
   Where Servex implements a concept, the page links to Servex instead of repeating it. */
import { file_link as fs } from "../ext/filesystem/file_link.js";
const S = "/framework/servex/";

export const CONCEPTS = [
	{ group: "who", slug: "assistants", name: "Assistants", icon: "support_agent",
		gist: "Assistants answer you. The fast one replies in a line; the smart one gives an opinion.",
		items: [
			"**Fast assistant** (Sonnet, low effort): the front desk. It shows your words on screen and hands them to the mastermind that owns them.",
			"**Smart assistant** (the master assistant, Opus): knows what is going on, answers in one or two sentences, and audits the system between questions.",
			"Each card also gets its own assistant, which answers you on that card.",
		],
		code: [["Servex/agents/Assistant.js", fs("Servex/agents/Assistant.js")], ["Servex/agents/assistant.md", fs("Servex/agents/assistant.md")], ["Servex/agents/master-assistant.md", fs("Servex/agents/master-assistant.md")]],
		servex: [["Agents & roles", S + "doc/roles/"]] },

	{ group: "who", slug: "masterminds", name: "Masterminds", icon: "psychology",
		gist: "A mastermind owns work end to end: it decides, splits the work, and judges what comes back.",
		items: [
			"**The mastermind** picks the most important work and keeps the budget.",
			"**The Servex mastermind** improves the system itself: skills, briefs, tools.",
			"**A task mastermind** owns exactly one task, from brief to merge.",
			"A mastermind briefs and judges; the building is done by minions.",
		],
		code: [["Servex/agents/mastermind-servex.md", fs("Servex/agents/mastermind-servex.md")], ["Servex/agents/Dispatcher.js", fs("Servex/agents/Dispatcher.js")]],
		servex: [["Agents & roles", S + "doc/roles/"]] },

	{ group: "who", slug: "minions", name: "Minions", icon: "engineering",
		gist: "A minion is a worker: one brief (requirements.md), one fence of files, one result.",
		items: [
			"Haiku scans, Sonnet builds, Opus judges.",
			"Each minion gets its own task log, a subtask of its mastermind's.",
			"It is stopped once its result has been read, so it stops holding memory.",
		],
		code: [["Servex/agents/Agents.js", fs("Servex/agents/Agents.js")], ["Servex/agents/brief.js", fs("Servex/agents/brief.js")]],
		servex: [["Spawning (Agents & roles)", S + "doc/roles/"]] },

	{ group: "tracked", slug: "tasks", name: "Tasks and cards", icon: "task_alt",
		gist: "Every change is a task: a folder with a task.jsonl log. A card is how a task shows up on your dashboard.",
		items: [
			"A task folder lives at `ai/<date>/<slug>/`. Its first log line holds the ask and the plan.",
			"A card is a mini page. Its log is `page.jsonl`, and you can reply on it.",
			"Every day's tasks: [the log](/framework/ai/log/). The live board: [V3](/framework/ai/v/3/).",
		],
		code: [["ext/AITask", "/framework/ext/AITask/"], ["ext/JSONL", "/framework/ext/JSONL/"], ["Card rules", "/framework/core/Page/card/"]],
		servex: [] },

	{ group: "tracked", slug: "asks", name: "Asks", icon: "record_voice_over",
		gist: "Every ask you route gets one line in ai/asks.jsonl, naming the agent that owns it.",
		items: [
			"A line holds the ask, its owner agent, its card and its status.",
			"Servex marks an ask that has stalled, so nothing sits in limbo.",
		],
		code: [["ai/asks.jsonl", "/framework/ai/asks.jsonl"], ["ext/AITask (asks.js)", "/framework/ext/AITask/"]],
		servex: [] },

	{ group: "tracked", slug: "inboxes", name: "Page inboxes", icon: "inbox",
		gist: "Each page has an inbox, for coordination only. A note reaches whoever coordinates that module.",
		items: [
			"`drop(path, text)` appends a note to the page's `page.jsonl`.",
			"The mastermind holding `claim_topic` on that path gets it; otherwise it waits in the page's AI tab.",
		],
		code: [["Servex/agents/inbox.js", fs("Servex/agents/inbox.js")], ["Servex/agents/claims.js", fs("Servex/agents/claims.js")]],
		servex: [["Inbox (Servex doc)", fs("Servex/doc/inbox.md")]] },

	{ group: "lands", slug: "heartbeat", name: "Heartbeat", icon: "monitor_heart",
		gist: "The heartbeat checks on every open task. A task's owner that goes quiet is asked how it is doing.",
		items: [
			"Quiet for 5 minutes: the owner gets a one-line status check.",
			"Dead: it is revived. Only if that fails do you hear about it.",
			"It runs inside Servex.",
		],
		code: [["Servex/Heartbeat.js", fs("Servex/Heartbeat.js")], ["Servex/TaskLoop.js", fs("Servex/TaskLoop.js")]],
		servex: [["Task loop (Servex doc)", fs("Servex/doc/task-loop.md")]] },

	{ group: "lands", slug: "review-merge", name: "Review and merge", icon: "merge",
		gist: "Work is built in a worktree, reviewed by fresh eyes, smoke-tested, then merged into michael/dev.",
		items: [
			"`Server/review.mjs`: a fresh agent checks the result against your words.",
			"`Server/merge.mjs`: loads the changed pages, merges only with zero errors.",
			"Quick fixes take a worktree from the pool, which Servex keeps ready.",
			"Past reviews: [Review](/framework/ai/review/).",
		],
		code: [["Server/merge.mjs", fs("Server/merge.mjs")], ["Server/review.mjs", fs("Server/review.mjs")]],
		servex: [["The worktree pool", fs("Servex/doc/pool.md")], ["Lifecycle", S + "lifecycle/"]] },

	{ group: "know", slug: "claude-md", name: "CLAUDE.md", icon: "gavel",
		gist: "CLAUDE.md is the rulebook every agent reads first: the laws, what to ask before, and where to look.",
		items: [
			"The root file holds the four laws: less is more, clear beats brief, prioritize, follow the owner's words.",
			"It points to readmes; the detail lives in each module's `doc/`.",
			"Nobody edits it without asking the owner.",
		],
		code: [["CLAUDE.md, at the repo root", null]],
		servex: [] },

	{ group: "know", slug: "readmes", name: "Readmes", icon: "menu_book",
		gist: "Every folder's readme.md tells an agent where it is. A fresh agent reads the chain of them, from the root down to its folder, before it does anything.",
		items: [
			"**One shape, every readme:** what it is (one line) · Use · Watch out · More. As short as it can be.",
			"**A readme points; it doesn't explain.** The detail lives in `doc/*.md` beside the module, shown on its Docs tab. A past problem gets one line and a link to its doc.",
			"**Every module has three things:** `readme.md` (the index), `page.js` (show, don't tell), `doc/` (the detail).",
			"**The chain, top down:** a spawned agent gets every readme from the root to its folder, in that order, each cut to its first screen, about 3,000 tokens in all. The root is the context and the folder's own is the work, so over the cap the middle levels go first.",
			"**Switching directory:** reload the chain there (`load_module <dir>`), or hand the work to a fresh session in that directory; a fresh session keeps the context small.",
			"**Build order:** the readmes and docs are brought up to date before review, so the reviewer reads what is true.",
			"**Keeping them true:** the `documentation` skill runs before a task lands; a fresh agent reads only the readmes as a smoke test (`load_module`).",
			"Example: [the framework's readme](/framework/), then any module under it.",
		],
		code: [["Servex/agents/readme-chain.js", fs("Servex/agents/readme-chain.js")], ["documentation skill", "/framework/ai/skills/documentation/"]],
		servex: [["The readme chain (Servex doc)", fs("Servex/doc/readme-chain.md")]] },

	{ group: "know", slug: "memory", name: "Memory", icon: "neurology",
		gist: "Memory is what one session leaves for the next: short notes, and one handover page.",
		items: [
			"Auto-memory: one note per lesson, indexed one line each in MEMORY.md.",
			"The handover (`ai/handover.md`): the one screen a fresh session reads first.",
			"A folder's `ai/log.jsonl`: what AI work happened there, one line each.",
		],
		code: [["ai/handover.md", "/framework/ai/handover.md"]],
		servex: [] },

	{ group: "tracked", slug: "voice", name: "Voice sessions", icon: "mic",
		gist: "You talk; local Whisper writes it down; a fast session cleans the words and a smart one reads what you meant.",
		items: [
			"Each line is kept at three levels: clean, edit, summary.",
			"A session is resumable: its id is kept, so the same agent picks up where it left off.",
			"Try it: [Talk](/framework/ai/talk/).",
		],
		code: [["Servex/agents/Sessions.js", fs("Servex/agents/Sessions.js")], ["ai/talk", "/framework/ai/talk/"]],
		servex: [["Whisper (Servex readme)", fs("Servex/readme.md")]] },
];

/* The Overview's four groups, in reading order. A `links` entry is a tile that goes
   somewhere else instead of to a concept page (Servex is linked, never repeated). */
export const GROUPS = [
	{ id: "who", title: "Who does the work", gist: "Agents, from the one that answers you to the ones that build.",
		links: [{ name: "Agents & roles", icon: "badge", gist: "Every role, its model and its tools. Documented in Servex.", href: S + "doc/roles/" }] },
	{ id: "know", title: "What they know", gist: "Every agent starts blank. These are what it reads.",
		links: [{ name: "Skills", icon: "school", gist: "How to do one kind of job well. One page per skill.", href: "/framework/ai/skills/" }] },
	{ id: "tracked", title: "How work is tracked", gist: "Every ask, task and note has a file, so nothing is lost." },
	{ id: "lands", title: "How work lands", gist: "Built apart, checked, then merged; kept moving by the heartbeat.",
		links: [{ name: "Servex", icon: "hub", gist: "The one process that runs all of it: agents, dev servers, logs.", href: S }] },
];

/* How the parts work together: the path your words take (from the servex-docs ask,
   2026-09-30, folded in here). Each step names the concept page that explains it. */
export const FLOW = [
	["You speak or type", "voice", "on the ✦ sheet, the drawer, or a VS Code tab."],
	["The assistants read it", "assistants", "the fast one cleans the words; the smart one reads what you meant."],
	["It becomes an ask", "asks", "one line in ai/asks.jsonl, with the agent that owns it."],
	["A mastermind takes it", "masterminds", "it opens a task, loaded with CLAUDE.md, the readme chain and its skills."],
	["Minions build it", "minions", "in a worktree from the pool, one brief each."],
	["It is reviewed and merged", "review-merge", "fresh eyes, a smoke test, then michael/dev."],
	["You see it on the card", "tasks", "and the heartbeat keeps every open task moving until then."],
];

export default CONCEPTS;
