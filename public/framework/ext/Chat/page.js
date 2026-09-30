import { Page, p, demo, button } from "/app.js";
import { chat } from "./Chat.js";

export default new Page({
	meta: import.meta,
	title: "Chat",
	description: "A scrolling chat log that follows new messages while you are at the bottom, and holds still once you scroll up.",
	icon: "chat",
	children: "panel",

	content(){
		p("The log below, on its own. For the log plus the composer and the mic as ONE component — the widget the desktop drawer and the mobile sheet both use — see Chat Panel, `/framework/ext/Chat/panel/`.");
		p("Messages are added below every second. Scroll up to read: the log stops moving. Scroll back to the bottom: it follows again.");

		demo(() => {
			const entries = [];
			const talk = chat({ source: () => entries });
			const add = () => {
				const n = entries.length + 1;
				entries.push({ type: n % 2 ? "prompt" : "reply", by: n % 2 ? "owner" : "assistant-demo", id: "m" + n, at: new Date().toISOString(), text: `Message **${n}** with a \`code\` word.` });
				talk.sync();
			};
			for (let i = 0; i < 8; i++) add();
			const timer = setInterval(() => { if (talk.view.el.isConnected) add(); else clearInterval(timer); }, 1000);
			talk.view.style("max-height", "14em");
		}, "`chat({ source })` returns `{ view, sync() }`. `sync()` draws only the entries it has not drawn yet.");

		p("One sender, one bubble: messages from the same sender less than 10 seconds apart, with nobody else in between, are paragraphs of a single bubble. Below, three messages 3 seconds apart make one bubble, the reply makes another, and a message 30 seconds later starts a new one. Press the button to add a live message: it joins the last bubble.");

		demo(() => {
			const t0 = Date.parse("2026-09-25T12:00:00Z"), entries = [];
			let last = t0;
			const say = (type, by, text, gap) => { last += gap * 1000; entries.push({ type, by, id: "d" + entries.length, at: new Date(last).toISOString(), text }); };
			say("prompt", "owner", "First thought.", 0);
			say("prompt", "owner", "Second, 3 s later.", 3);
			say("prompt", "owner", "Third, 3 s after that.", 3);
			say("reply", "assistant-demo", "Got all three: one reply.", 2);
			say("prompt", "owner", "A message 30 s later opens a new bubble.", 30);
			const talk = chat({ source: () => entries });
			talk.sync();
			button("Add a live message 2 s later").click(() => { say("prompt", "owner", "Live, " + entries.length + ".", 2); talk.sync(); });
		}, "Three owner messages, one reply, and one owner message 30 s later: three bubbles. Every bubble on a side is the same width (`--chat-bubble`).");
		p("A curated version: a `refined` line replaces a merged bubble's raw paragraphs with tidy sections. Click a section to open the raw words it came from, right there; click the bubble to open every raw piece in time order. (The line below is made up for this demo.)");

		demo(() => {
			const t0 = Date.parse("2026-09-25T12:00:00Z"), entries = [];
			const raw = [["r1", "um so the cards should like show one bubble"], ["r2", "and uh the width the same for both sides"], ["r3", "oh and keep the log separate, only the view merges"]];
			raw.forEach(([id, text], i) => entries.push({ type: "prompt", by: "owner", id, at: new Date(t0 + i * 3000).toISOString(), text }));
			entries.push({ type: "refined", by: "assistant-demo", at: new Date(t0 + 12000).toISOString(), of: ["r1", "r2", "r3"], sections: [
				{ text: "## Chat bubbles", from: ["r1"] },
				{ text: "One bubble per run of messages, and **one width** for each side.", from: ["r1", "r2"] },
				{ text: "The card log stays as it is; only the view merges.", from: ["r3"] },
			] });
			chat({ source: () => entries }).sync();
		}, "Three raw owner messages, one refined line. Without the refined line the three raw paragraphs would show.");

		p("**The universal chat line** (`voice-sessions/design.md`) is the one shape every surface — voice, typed, an agent's own reply — logs a turn as: `{\"chat\": {at, session, path, from: {kind, id}, via, text, re}}`. `from.kind` \"owner\" is your bubble; anything else is a reply. `via` (\"voice\" or \"text\") draws a small 🎤/⌨ mark. A later line with the SAME `at` and `fix: true` replaces that piece's words — a correction, not a second message. `place: {module, id}` swaps the words for a `ux/Content` module's own card. Below: a voice line, a typed line, a reply, the voice line corrected, and a Question card — all from one log, mixed with an OLD-shape entry to show both still work together.");

		demo(() => {
			const t0 = Date.parse("2026-09-25T12:00:00Z"), entries = [];
			const say = (i, c) => entries.push({ chat: { at: new Date(t0 + i * 4000).toISOString(), session: "demo", path: "/framework/ext/Chat/", ...c } });
			say(0, { from: { kind: "owner" }, via: "voice", text: "so the cards should like show one bubble" });
			say(1, { from: { kind: "owner" }, via: "text", text: "and keep the log the same shape it already is" });
			say(2, { from: { kind: "assistant", id: "assistant-fast" }, text: "Got it — this line's own format, one shape for voice and typed both." });
			entries.push({ chat: { at: new Date(t0).toISOString(), session: "demo", from: { kind: "owner" }, via: "voice",
				text: "So the cards should show one bubble per turn.", fix: true } });   // corrects the FIRST line above, same `at`
			entries.push({ type: "reply", by: "assistant-demo", id: "old-shape", at: new Date(t0 + 16000).toISOString(), text: "The old `{type, by, text}` shape still draws — nothing about it changed." });
			entries.push({ chat: { at: new Date(t0 + 20000).toISOString(), session: "demo", from: { kind: "assistant", id: "assistant-fast" },
				place: { module: "/framework/ux/Content/Question/Question.js", id: "demo-chat-line-question", ask: "Which of these feels most like a card?" } } });
			chat({ source: () => entries }).sync();
		}, "A voice line, a typed line, a reply, that first voice line corrected in place (`fix: true`, same `at`), an old-shape entry drawn beside them, and a Question card in a reply's place.");
	},
});
