import { Page, p, h2, a, div, img, small, span, ul, li, ui } from "/app.js";

/* THE REPORT — what this task built, one screen, shown before it is described.
 * Parent: ../page.js (`children:`). The detail is the task log beside this file
 * and the two modules' own readmes; nothing is explained twice here. */

const shot = name => new URL(`shots/${name}`, import.meta.url).pathname;

const STAGES = [
	["1. raw", "live", "Your sentence, verbatim, the moment you finish saying it. Split into sentences once and frozen there."],
	["2. refined", "live", "A cleaned reading of it, naming the sentence numbers it came from — hover it and those sentences light up."],
	["3. pre-proposal", "live", "A sketch: a title and three bullets. It arrives when you press ✓ on a card, and never before."],
	["4. proposal", "phase 3", "The same thing again, naming classes and methods — the one you could actually say yes to."],
	["5. build", "phase 3", "Tasks pointing back at the proposal, collecting their own intents, decisions and file touches."],
];

const LINKS = [
	["/framework/ai/v/3/?view=prompts", "The Prompts view", "the fifth tab on the AI board; empty until you say something"],
	["/framework/ai/2026-09-22/prompt-lifecycle/", "This task's log", "every decision and every measurement"],
	["/framework/ai/2026-09-22/log-model/", "The event schema", "what a prompt, a name and a card actually are"],
	["/framework/ai/2026-09-22/log-model/lifecycle/", "The five stages, walked", "the same story on a worked sample log"],
];

export default new Page({
	meta: import.meta,
	title: "Your words become names while you talk",
	icon: "graphic_eq",
	description: "A Sonnet assistant inside Servex answers every sentence you dictate with a name, a card and a reading — median two seconds.",

	content(){
		// `wide` (main + breakout), never `bleed`: the shot IS the report, and a
		// 610px copy of a 1440px screen is unreadable — but a framed box still
		// rides a padded track (`layout`: bleed is for paint).
		div.c("card wide", () => {
			img().attr("src", shot("thread.png")).attr("alt", "The Prompts view: five spoken prompts, each with its refined reading, its name chips and its card")
				.attr("loading", "lazy").style({ width: "100%", borderRadius: "0.4em" });
			small.c("muted", "The Prompts view on the AI board. Your words on the left, never tidied. What was made of them on the right.");
		});

		p("You speak. The sentence lands in Servex's log. About two seconds later it has a name, a card and a short reading of what you said that points at the exact sentences it came from. Nothing waits for you: the ✓ and ✗ on any chip or card are optional, always, and the board carries on whether you press them or not.");

		h2("The five stages, and which of them are live");
		ui.table(["stage", "today", "what it is"], STAGES);

		h2("What it cost in time");
		p("Five real sentences of yours, posted one every eight seconds: the first event came back after 2023, 2029, 2050, 2832 and 3270 milliseconds. The median is 2.05 seconds. All five produced a name, a card and a refined line — six names, five cards, five readings, no misses.");

		h2("Go and look");
		ul(() => LINKS.forEach(([url, label, why]) => li(() => {
			a(label).href(url);
			span.c("muted", ` — ${why}`);
		})));

		h2("The pieces");
		ui.table(["file", "what it does"], [
			["Servex/agents/Assistant.js", "One Sonnet session, always up, with one tool and no file tools at all. It hears every prompt and answers only by appending events."],
			["Servex/agents/assistant.md", "Its whole posture, thirty lines — the voice, the three events, and the rules it works under."],
			["Servex/Stream.js", "The live wire. It now carries the prompt log as well as the agents, so an open board hears a line the moment it is written."],
			["public/framework/ai/v/3/prompts.js", "The view: the thread, the citation highlight, and the optional ✓ ✗ and \"what else?\"."],
		]);

		h2("What was left, and why");
		p("Stages 4 and 5 are phase 3 of the owner's own brief, not a shortfall here. Two smaller things are written up in the log: the AI board builds its whole view twice on every load (an old fault, not from this task, but it doubles every count you take off the page), and a browser logs its own network notice when Servex is not running — the page itself says nothing and renders correctly, but the browser's console cannot be talked out of mentioning a refused connection.");

		p.c("flow", () => { a("Every measurement, every decision, in the log.").href("/framework/ai/2026-09-22/prompt-lifecycle/"); });
	},
});
