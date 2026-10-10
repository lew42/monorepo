#!/usr/bin/env node
// seed-openrouter.mjs — walks the OpenRouter decisions from ai/2026-09-28/harness-research/plan.md
// through Server/decide.mjs onto a card's page.jsonl, then places the Decisions view as a tab.
//
//   node public/framework/ai/2026-09-29/decide-tool/seed-openrouter.mjs --file <card>/page.jsonl
//
// Replayable: a decision already in the log is skipped, a leftover draft is dropped and redone,
// and the `place` line is written once. Sources are research ids from /framework/research/harness/.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../../..");
const decide = await import(new URL("file:///" + path.join(root, "Server/decide.mjs").replace(/\\/g, "/")).href);

const i = process.argv.indexOf("--file");
const file = i > 0 ? path.resolve(process.argv[i + 1]) : null;
if (!file || !fs.existsSync(file)) { console.error("usage: seed-openrouter.mjs --file <existing page.jsonl>"); process.exit(2); }

const by = "minion-decide-build";
const say = (verb, args) => { const r = decide.verbs[verb](file, { by, ...args }); console.log(verb.padEnd(9), args.id, "→", r.appended ? "appended" : r.next ?? "ok"); return r; };

/* One decision: create → options (with caveats) → then → recommend. `parent` = [id, option]. */
const DECISIONS = [
	{
		id: "d-proxy-or-own-loop", rank: 1,
		question: "Should agents reach other models by proxying the Claude Agent SDK through OpenRouter, or through a loop we build ourselves?",
		options: [
			{ id: "proxy", text: "Proxy the SDK through OpenRouter (three environment settings, same harness)",
				caveats: ["Non-Claude models run inside prompts written for Claude; how well they behave there is unmeasured until the proxy spike runs.", "Caching and thinking still differ per provider under OpenRouter."] },
			{ id: "own-loop", text: "Build our own agent loop on @openrouter/agent",
				caveats: ["We would rebuild compaction, resume, fork and the long-lived session ourselves — the expensive part, cost unknown."] },
		],
		recommend: { option: "proxy", confidence: 0.75,
			why: "OpenRouter's own Claude Code guide and a fresh-eyes check say the SDK runs there with sessions, tools and hooks intact; building our own loop is kept for whatever the proxy spike proves broken.",
			sources: ["cjuqp", "q0snn", "ah7hc", "cd7rg", "c0lzh"] },
	},
	{
		id: "d-provider-field", rank: 2, parent: ["d-proxy-or-own-loop", "proxy"],
		question: "Where does an agent's backend get chosen?",
		options: [
			{ id: "tiers-provider", text: "The provider field tiers.js already has, read by Agents.spawn()",
				caveats: ["Touches the three files that import the SDK: Agents.js, jobs.js and tools.js."] },
			{ id: "per-spawn-env", text: "An env block passed by hand on each spawn_agent call",
				caveats: ["Nothing remembers the choice; every caller must repeat the key and base url, and one slip bills the wrong account."] },
		],
		recommend: { option: "tiers-provider", confidence: 0.8,
			why: "The seam already exists and nothing reads it yet, so one place decides and Claude stays on the subscription by default.",
			sources: ["cx5h6", "adijt", "de2ph"] },
	},
	{
		id: "d-cost-source", rank: 3, parent: ["d-proxy-or-own-loop", "proxy"],
		question: "Which number goes on the task's cost line for a proxied turn?",
		options: [
			{ id: "openrouter-usage-cost", text: "OpenRouter's own usage.cost from each response",
				caveats: ["Needs the response read before the SDK summarises it; a turn that dies mid-stream may report nothing."] },
			{ id: "sdk-price", text: "The SDK's own price for the turn",
				caveats: ["The SDK prices every turn with Anthropic's table, so a GPT or Gemini turn gets a wrong number."] },
		],
		recommend: { option: "openrouter-usage-cost", confidence: 0.85,
			why: "It is what OpenRouter actually charges; the SDK's figure is known to be computed from the wrong price table.",
			sources: ["cjuqp", "ah7hc"] },
	},
	{
		id: "d-path-fence", rank: 4, parent: ["d-proxy-or-own-loop", "proxy"],
		question: "How do we stop an agent writing outside the files its brief allows?",
		options: [
			{ id: "pretooluse-hook", text: "A PreToolUse hook in Agents.js that refuses a Write or Edit outside the brief's globs",
				caveats: ["Bash still passes, so worktrees stay the hard wall."] },
			{ id: "can-use-tool", text: "The SDK's canUseTool callback",
				caveats: ["Agents run in bypassPermissions, which skips canUseTool entirely, so it would never fire."] },
		],
		recommend: { option: "pretooluse-hook", confidence: 0.8,
			why: "Agents.js already runs a PreToolUse hook for forks, and it fires under bypassPermissions where canUseTool does not.",
			sources: ["cqabo", "ceq98"] },
	},
	{
		id: "d-own-loop-rebuild", rank: 2, parent: ["d-proxy-or-own-loop", "own-loop"],
		question: "If we build our own loop, what do we rebuild first?",
		options: [
			{ id: "only-what-broke", text: "Only the piece the proxy spike showed broken",
				caveats: ["Two harnesses to keep alive side by side until the rest moves over."] },
			{ id: "everything", text: "Compaction, resume and fork, and the long-lived session, all at once",
				caveats: ["The largest build of the lot, started with no measurement saying it is needed."] },
		],
		recommend: { option: "only-what-broke", confidence: 0.6,
			why: "The plan builds our own loop only on evidence; rebuilding everything up front spends the most before anything is known.",
			sources: ["cd7rg", "c0lzh"] },
	},
];

const logged = decide.logged(file);
const drafts = (() => { try { return JSON.parse(fs.readFileSync(decide.drafts_path(file), "utf8")); } catch { return {}; } })();

for (const d of DECISIONS) {
	if (logged.has(d.id)) { console.log("skip     ", d.id, "(already logged)"); continue; }
	if (drafts[d.id]) decide.verbs.drop(file, { id: d.id });

	say("create", { id: d.id, question: d.question, rank: d.rank, depends_on: d.parent ? d.parent.join(":") : null });
	say("options", { id: d.id, options: d.options.map(({ id, text, caveats }) => ({ id, text, caveats })) });
}

// Every option's `then` is declared: children were added to their drafted parent on create;
// an option with no children says so explicitly (an empty list), which is what decide.mjs asks.
for (const d of DECISIONS) {
	if (logged.has(d.id)) continue;
	const draft = decide.verbs.show(file, { id: d.id }).decision;
	const then = Object.fromEntries(draft.options.filter(o => !Array.isArray(o.then)).map(o => [o.id, []]));
	if (Object.keys(then).length) say("then", { id: d.id, then });
}

for (const d of DECISIONS) if (!logged.has(d.id)) say("recommend", { id: d.id, ...d.recommend });

// The card shows the placed view as its "Decisions" tab. Tabs are opt-in per card
// (ai2/card.js tiny()): without `{"layout":"tabs"}` a placed module is drawn in the Overview,
// under the owner's words, so that line is written too.
const add = (line, has, note) => {
	const text = fs.readFileSync(file, "utf8");
	if (text.split(/\r?\n/).some(has)) return;
	fs.appendFileSync(file, (text.endsWith("\n") || !text ? "" : "\n") + JSON.stringify(line) + "\n");
	console.log(note);
};
add({ place: { module: "/framework/ux/Content/Decision/Decisions.js" } }, l => l.includes('"/framework/ux/Content/Decision/Decisions.js"'), "place     Decisions.js → the card's Decisions tab");
add({ layout: "tabs" }, l => /^\{"layout":/.test(l.trim()), "layout    tabs");

console.log(JSON.stringify(decide.list(file).decisions.map(function flat(n){ return { [n.id]: n.options.map(o => ({ [o.id]: o.then.map(flat) })) }; })));
