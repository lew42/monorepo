import { Page, md, div, h2, h3, img, a } from "/app.js";

// The phone sheet at 400 px, one shot per 40 px of drag, before and after 2026-10-20 (../test/sheet-steps.mjs; doc: ext/drawer/doc/sheet.md).
const STEPS = new URL("./sheet-steps/", import.meta.url).href;   // made by ../test/sheet-steps.mjs
function sheet_steps(){
	h2("The phone sheet, step by step").attr("id", "the-phone-sheet-step-by-step");
	md("**How to read the steps.** Each series starts with the first click on ✦. Before, that opens a one-line strip; after, it opens at 60% of the screen. Steps then run upward, 40 px per shot, to the snap to full screen (before 1 to 17, after 1 to 9). After also comes back down: step 10 is the 60% height again, and 11 to 21 drag down 40 px per shot to the compact strip (head and mic footer, the well at 0 px).");
	md("**One click on ✦, then the top edge dragged 40 px at a time.** Before (left): it opens as a one-line strip, the page behind turns into an empty grey page, and the layout changes as it grows (a strip, a boxed chat, a tab row). After (right): the page stays visible, and the same three rows (head, chat well, mic footer) only grow, snap open at 90%, then come back down to the compact strip. Made by [test/sheet-steps.mjs](/framework/ux/Dictate/test/sheet-steps.mjs); why and how: [ext/drawer/doc/sheet.md](/framework/ext/drawer/doc/sheet.md).");
	div.c("ux-dictate-surfaces-steps", $g => {
		$g.style({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5em", alignItems: "start" });
		[["Before", "before", 18], ["After", "after", 22]].forEach(([label, dir, n]) => div(() => {
			h3(label);
			div($r => {
				$r.style({ display: "flex", flexWrap: "wrap", gap: "0.4em" });
				for (let i = 0; i < n; i++){
					const src = STEPS + dir + "/sheet-" + String(i).padStart(3, "0") + ".png";
					a(() => img().attr("src", src).attr("alt", label + ", step " + i).attr("loading", "lazy")
						.style({ width: "7.5em", border: "1px solid var(--line)", display: "block" })).href(src);
				}
			});
		}));
	});
}

/* The one permanent map of every voice and chat surface. Long form, the census and the measurement:
 * /framework/ux/Dictate/doc/surfaces.md. Screenshots: shoot.mjs in the task that built this page
 * (ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/). */
const SHOT = new URL("./", import.meta.url).href;

// name · where · file · who answers · where it writes · screenshot
const SURFACES = [
	{ name: "Drawer chat", where: "Every page, width over 52em: ☰ top right, AI tab",
		file: "/framework/ext/drawer/tabs/ai.js", agent: "fast + smart", log: "`ai/<id>.jsonl`", shot: "drawer-ai-1920.png",
		says: "The main one. The header names the session, shows whether fast and smart are awake, and holds New session and Switch session." },
	{ name: "Phone sheet", where: "Every page, width under 52em: ✦ at the bottom",
		file: "/framework/ext/drawer/rail.js", agent: "fast + smart", log: "`ai/<id>.jsonl`", shot: "sheet-400.png",
		says: "The same chat in a sheet that slides up. Same session as the drawer chat." },
	{ name: "Floating mic", where: "Every page, while the mic is on",
		file: "/framework/ux/Dictate/push-to-talk.js", agent: "fast + smart", log: "`ai/<id>.jsonl`", shot: "floating-mic-1920.png",
		says: "A small button, not a chat. It speaks into the same global session, so the words land in the drawer chat." },
	{ name: "Dictation tab", where: "Drawer, Dictation tab",
		file: "/framework/ext/drawer/tabs/dictation.js", agent: "none", log: "none", shot: "drawer-dictation-1920.png",
		says: "The dictation playground embedded: a debug view of the mic and the stages. Nobody answers here." },
	{ name: "Card chat", where: "A card's page, Activity tab",
		file: "/framework/ai/cards/card.js", agent: "whoever is attached to the card, or none", log: "the card's `page.jsonl`", shot: "card-chat-1920.png",
		says: "A different conversation: the card's own thread, posted with `POST /card/append`, not a voice session." },
	{ name: "Session page", where: "`/framework/ai/sessions/<id>/`, Conversation tab",
		file: "/framework/ai/AISession/AISessionConversation.js", agent: "none (it replays a Claude Code session)", log: "reads the SDK session file; Refine writes the stages", shot: "session-page-1920.png",
		says: "A read-only view of what you and a Claude Code agent said. Its one action is the Refine button on a prompt." },
	{ name: "Refine view", where: "`/framework/ext/Refine/`",
		file: "/framework/ext/Refine/RefineDemo.js", agent: "none (a pipeline: clean, structure, refine)", log: "the session's `page.jsonl`", shot: "refine-1920.png",
		says: "Dictate or paste, press Refine, watch the five stages fill in." },
	{ name: "Dev shell", where: "Localhost only, ctrl + \\: ai and chat tabs",
		file: "/framework/dev/DevShell/DevShell.js", agent: "ai tab: fast + smart (the same chat file); chat tab: this page's own Servex agent", log: "ai tab: `ai/<id>.jsonl`; chat tab: a Servex page session (`/api/page-session/*`)", shot: "devshell-1920.png",
		says: "Dev chrome, reusing the dev bar's tabs. Its ai tab ([dev/DevBar/ask.js](/framework/dev/DevBar/ask.js)) mounts the one shared chat; its chat tab ([dev/DevBar/chat.js](/framework/dev/DevBar/chat.js)) talks to the agent that owns the page, a separate conversation." },
	{ name: "Live card", where: "`/framework/ai/`, the board's Live card",
		file: "/framework/ai/rail/rail.js", agent: "the global session at its foot, the card thread above", log: "`ai/<id>.jsonl` and the card", shot: "live-card-1920.png",
		says: "The board's own rail: card threads on top, the global chat at the bottom." },
];

const FLOW = `microphone
  → Whisper (local, audio/Whisper)                     words appear at once
  → the stream: a JSONL line per sentence               ai/<id>.jsonl   (raw, kept first)
  → cleaning (ext/Refine/engine.js, fillers out)
  → structure → refined prompt → cards                  drawn on the session page
        ↑ these three run only when Refine is pressed (or Echo is on), never on every sentence

the same sentence also goes, as typed text, to:
  POST /api/session/say → Servex Sessions.js
        → fast agent  (first reply, usually "(listening)")
        → smart agent (the real answer, can use tools)
  both replies are written back to ai/<id>.jsonl and drawn by every surface that follows it

which surface shows which stage
  drawer chat · phone sheet · live card foot ... raw words + fast and smart replies
  session page, Refine view ................... all five stages (raw, clean, structure, refined, cards)
  card chat ................................... the card's own lines, not the voice session
  dictation tab ............................... the mic and Whisper state only`;

const SESSIONS = `ONE voice session per browser tab   (sessionStorage "lew42-voice-session", ux/Dictate/chat.js)
  shared by: drawer chat · phone sheet · floating mic · live card foot · Dictate page
  first sentence in a tab   → POST /api/session/new  (instant; resumes this page's session if it spoke in the last hour)
  "New session" button      → same call with fresh:true; the old session stays on disk, resumable from Switch session
  "Switch session"          → picks an older session by id (ext/Session recent())
  where sessions are listed → Switch session menu (drawer header), /framework/ai/sessions/ (every kind of session)
card chat and session page  → NOT this session; they have their own stores`;

export default new Page({
	meta: import.meta,
	title: "Voice and chat surfaces",
	description: "Every place on the site that talks to an agent or shows what was said: where it is, what runs it, who answers, what it writes.",
	icon: "dashboard",

	content(){
		md("**Nine places talk, show or record what you say.** Four share one conversation (the global voice session), three are separate things, and two are a debug view and a dev-only tab. Each card below is one surface: a screenshot, then where it is, what renders it, who answers and where it writes.");

		md("**Same conversation:** drawer chat, phone sheet, floating mic, live card foot, the dev shell's ai tab (and the Dictate page's own box). One chat file, [`ux/Dictate/chat.js`](/framework/ux/Dictate/chat.js), is mounted by all of them. **Not the same:** card chat, session page, Refine view, the dev shell's chat tab.");

		div.c("ux-dictate-surfaces-grid", $g => {
			$g.style({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22em), 1fr))", gap: "1.5em", alignItems: "start" });
			SURFACES.forEach(s => div.c("ux-dictate-surfaces-card", () => {
				h3(s.name).attr("id", s.shot.replace(".png", ""));
				md(s.says);
				img().attr("src", SHOT + s.shot + "?v=20261013").attr("alt", s.name + " screenshot").attr("loading", "lazy")
					.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.4em", display: "block" });
				md(["- **Appears:** " + s.where,
					"- **Renders:** [" + s.file.replace("/framework/", "") + "](" + s.file + ")",
					"- **Answers:** " + s.agent,
					"- **Writes to:** " + s.log].join("\n"));
			}));
		});

		sheet_steps();

		md("## The flow\nFrom the microphone to the screen, and which surface shows which stage.");
		md("```\n" + FLOW + "\n```");

		md("## Sessions\nWhich surfaces share one session, which start a new one, and what the New session button does.");
		md("```\n" + SESSIONS + "\n```");

		md("## The 30-second first reply\n**Cause:** not a new session and not a queue. The pair's process starts in under a second; the wait is the model's first token, 8 to 17 s measured, on a machine with 27 agents working on the same Claude account. A pair is stopped after 5 idle minutes, so the first sentence after a pause pays it again. Numbers and the next brief: [doc/surfaces.md](/framework/ux/Dictate/doc/surfaces.md#the-30-second-first-reply).");

		md("## What is duplicated\nOne system is wanted; today there are copies. Detail and links: [doc/surfaces.md](/framework/ux/Dictate/doc/surfaces.md#what-is-duplicated), the merge is a later brief ([doc/next.md](/framework/ux/Dictate/doc/next.md)).\n\n" +
			"- Three conversation stores behind one renderer: the voice session (`ai/<id>.jsonl`), the card thread (`page.jsonl`), the Claude Code transcript.\n" +
			"- Three writers of the same five Refine stages: the Refine button, the session page's Refine button, Echo.\n" +
			"- A \"New session\" button built three times: `chat.js`, `rail.js`, `tabs/ai.js`.\n" +
			"- An older chat, `ext/Ask/chat.js`, kept alive by the dev bar's v1 tab.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
