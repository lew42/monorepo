import { Page, div, p, b, a, code, img, small } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in the day's board — the ordinary `main` column.
   2 SIZE       one screen: the loop in one sentence, the four states shown as
                pictures (not described), the proof numbers, a way to the detail.
   3 OWN LAYOUT `.flow` for the prose; the four state shots as a `.grid.auto`.
   4 REGIONS    what happens, the strip in each state, the proof run, the wiring.
   5 PREVIEW    the day board's own card; one line. */

const SHOT = name => import.meta.resolve(`./screens/${name}.png`);

const STATES = [
	{ name: "queued", shot: "strip-queued", alt: "A grey pill: queued — waiting for a free mastermind." },
	{ name: "working", shot: "strip-working", alt: "The pill with a dot and the mastermind's own live progress line." },
	{ name: "blocked", shot: "strip-blocked", alt: "An amber pill: blocked, with the reason." },
	{ name: "landed", shot: "strip-landed", alt: "A green pill: landed, with a real link to the finished page." },
];

export default new Page({
	meta: import.meta,
	title: "card-to-task",
	icon: "rocket_launch",
	description: "A card you spoke becomes a task; a mastermind takes it and runs; the card shows it happening.",
	children: "proof",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "Speak a build request and a task mastermind lands a real page — proven end to end, 5m41s and $2.04, one spoken sentence in."));
	},

	content(){
		p(b("Three-quarters of this already worked."), " You speak; the fast assistant hears it and makes a card in about two seconds. What was missing: nothing took the card and ran with it, and nothing on the card said so. This closes that loop.");

		p("The assistant now decides, per sentence: is this a ", code("task"), " (build it, fix it, change it, look into it), a ", code("note"), " (a remark), or a ", code("question"), "? Only a ", code("task"), " grows a fourth line — the brief, in the owner's own words, ", code("state: \"queued\""), ". ", b("Servex/agents/Dispatcher.js"), " watches for exactly that line, spawns a Sonnet task mastermind to build it (two at once, the rest wait), and keeps rewriting that same line's state as the work moves.");

		p.c("h3", "The card, in every state it can be in");
		div.c("grid auto gap-25", () => {
			STATES.forEach(s => {
				div.c("card", () => {
					small.c("muted").text(s.name);
					img.c("card").attr("src", SHOT(s.shot)).attr("alt", s.alt).style({ display: "block", width: "100%", marginBlockStart: "0.35em" });
				});
			});
		}).style({ marginBlock: "1em" });

		p.c("h3", "Proof: one spoken sentence to a landed page");
		p("Posted verbatim to a private Servex: “make a page at ", code("/framework/ai/2026-09-22/card-to-task/proof/"), " that says hello and the time.” The card and its task line existed within 5 seconds; the Dispatcher spawned ", code("task-mastermind-c-make-proof-page"), " (Sonnet, effort medium — this whole feature runs in budget mode, no Opus anywhere); it opened its own task, built the page, verified it headless with zero console errors, and posted its own ", code("landed"), " line naming the url. ", b("5 minutes 41 seconds"), " from sentence to landed, ", b("$2.04"), " (the task mastermind's own cost; the assistant and the dispatch itself add a few cents). The page it built:");
		div.c("card", () => {
			img.c("card").attr("src", SHOT("proof-page")).attr("alt", "The built proof page: 'hello — 9/22/2026, 7:11:33 PM', nothing else.").style({ display: "block", width: "100%" });
		}).style({ maxWidth: "30em", marginBlock: "1em" });
		p("A second sentence, “that looks fine”, got a card with ", code("route: \"note\""), " and — correctly — no task line at all.");

		p.c("h3", "What actually watches, and the one bug worth knowing about");
		p("The Dispatcher is not a Claude session — plain code, registered as a fake \"parent\" agent so a child's landing or getting stuck reaches it with ", b("no polling"), ": ", code("Agents.wake_parent()"), " already sends a done/blocked message to whatever sits at a child's ", code("parent"), ", so the Dispatcher just has to be something with a ", code(".send()"), ". The first proof run found a real gap: a task mastermind naturally writes its OWN ", code("task.jsonl"), " in the old ", code('{"task":{…}}'), " verb shape, and used the same shape on Servex's ", code("prompts"), " log by habit — which nothing folds, so the strip never moved. The wake's done/blocked fallback caught it anyway and posted a correct line from the child's last words; the Dispatcher's own instructions now hand the exact call shape as a worked example, and the fallback stays on as a safety net either way.");

		p.c("h3", "The detail, one click down");
		p(a("requirements.md").href(this.url + "requirements.md"), " has the full brief. ", a("the proof page itself").href(this.url + "proof/"), ". ", code("Servex/agents/Dispatcher.js"), ", ", code("Servex/agents/assistant.md"), " and ", code("Servex/agents/readme.md"), " have the wiring; ", code("public/framework/ai2/inbox.js"), " folds the task onto a card's data; ", code("public/framework/ai/talk/page.js"), " draws the strip. Numbers, decisions and the concurrency-queue check: this task's log.");
	},
});
