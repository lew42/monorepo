import { Page, p, md, demo, div } from "/app.js";
import { ChatPanel } from "../ChatPanel.js";
import { chat } from "../Chat.js";
import { composer } from "../Composer.js";

// A few dozen fake entries, for the "already a long conversation" screenshots.
// Alternating owner/reply, like the entries a real thread would hand `source()`.
function seed(n){
	const t0 = Date.parse("2026-09-29T12:00:00Z"), out = [];
	for (let i = 1; i <= n; i++){
		out.push({
			type: i % 2 ? "prompt" : "reply",
			by: i % 2 ? "owner" : "assistant-demo",
			id: "p" + i,
			at: new Date(t0 + i * 20000).toISOString(),
			text: i % 2 ? `Message ${i}.` : `Reply to message ${i}.`,
		});
	}
	return out;
}

// A box that pretends to be a host of a given size, so the panel's `--chatbox-panel-max`
// (a percentage of ITS OWN height, or a fixed vh) has something real to be capped inside.
function frame(width, height, cb){
	div.c("card pad").style({ width: width + "px", maxWidth: "100%", height: height ? height + "px" : "", display: "flex", flexDirection: "column" }).append(cb);
}

export default new Page({
	meta: import.meta,
	title: "Chat Panel",
	description: "The log, the composer and the mic as one component — the same widget in the desktop drawer and the mobile sheet, its height starting small and growing to a cap before it scrolls.",
	icon: "chat",

	content(){
		p("`ChatPanel` is `chat()` (the scrolling log) plus `composer()` (the box, the mic, Send) as ONE class, so the drawer's AI tab and the mobile sheet can build the exact same widget instead of two hand-rolled ones. `new ChatPanel({ source, deliver })` — with neither, it keeps its own list, which is all this page needed to show it.");

		md("**Variable height, no JS measuring:** the panel is only as tall as its content, up to a ceiling (`--chatbox-panel-max`, set by whatever hosts it) — a short conversation stays short; a long one stops growing and only the log scrolls, the composer staying put at the bottom. Below, the same panel with 1 message and with 30, at two widths: narrow like the mobile sheet (its ceiling `70vh`), wide like the desktop drawer (its ceiling the drawer's own height, simulated here as the frame's).");

		demo(() => {
			div.c("flex wrap gap", () => {
				frame(360, 500, () => {
					p.c("muted", "sheet width · 1 message");
					const panel = new ChatPanel({ placeholder: "say something" }).style("--chatbox-panel-max", "70vh");
					seed(1).forEach(e => panel.say(e));
				});
				frame(360, 500, () => {
					p.c("muted", "sheet width · 30 messages — capped, then scrolls");
					const panel = new ChatPanel({ placeholder: "say something" }).style("--chatbox-panel-max", "70vh");
					seed(30).forEach(e => panel.say(e));
				});
			});
		}, "`new ChatPanel({ placeholder })` — a fresh panel, seeded with `.say(entry)`. 1 message: short. 30: the log fills the ceiling and scrolls; the composer never moves.");

		demo(() => {
			div.c("flex wrap gap", () => {
				frame(520, 640, () => {
					p.c("muted", "drawer height · 1 message");
					const panel = new ChatPanel({ placeholder: "ask about this page" }).style("--chatbox-panel-max", "100%");
					seed(1).forEach(e => panel.say(e));
				});
				frame(520, 640, () => {
					p.c("muted", "drawer height · 30 messages — capped, then scrolls");
					const panel = new ChatPanel({ placeholder: "ask about this page" }).style("--chatbox-panel-max", "100%");
					seed(30).forEach(e => panel.say(e));
				});
			});
		}, "The same component, a taller ceiling (`--chatbox-panel-max: 100%` of a full-height host, the way the drawer will set it) — a short thread still starts short; the panel never claims the whole frame just because it is allowed to.");

		md("**Human in the loop (2026-09-29):** tap any bubble to select it — a border shows it, a second tap or Esc clears it. With a bubble selected, its own Rename button (or typing \"rename this\" in the box below) turns its title into ux/Rename's own dropdown of 5 names; picking one updates it everywhere the log is read. Behind `marks: true` (below), your own lines get a quiet check mark or a yellow question mark from ux/Understand, and an unclear one drops its own clarification card right into the flow.");

		demo(() => {
			frame(420, 560, () => {
				p.c("muted", "marks: true — tap a bubble to select it; try \"rename this\" once one is selected");
				const panel = new ChatPanel({ placeholder: "say something", marks: true }).style("--chatbox-panel-max", "70vh");
				panel.say({ chat: { at: "2026-09-29T20:00:00Z", from: { kind: "owner" }, text: "Let's ship the basic version first." } });
				panel.say({ chat: { at: "2026-09-29T20:00:05Z", from: { kind: "owner" }, text: "Maybe we should also handle the edge case, I think." } });
				panel.say({ chat: { at: "2026-09-29T20:01:00Z", from: { kind: "owner" }, text: "um so i think we should uh go with option two" } });
				panel.say({ chat: { at: "2026-09-29T20:01:05Z", from: { kind: "owner" }, text: "Let's go with option two.", re: "2026-09-29T20:01:00Z", level: "edit" } });
				panel.say({ chat: { at: "2026-09-29T20:01:30Z", from: { kind: "assistant" }, text: "# Objective marks for each statement\nSounds good, I'll mark each sentence as we go." } });
			});
		}, "Select any bubble (the last one has a heading — its own title to rename); the revision pair (`re` + `level`) draws the tidied-up line right under its raw words; the hedging sentence should pick up a yellow question mark and its own clarification card once `marks()` answers (fixtures today, `/api/hitl` once Servex is restarted).");

		md("**Drill in (2026-09-30):** tap a card that has something inside it, then its **Open ⤢** button: the chat goes full screen (over the desktop drawer, its full height) as its own small page, with Back. A card inside that page opens one level deeper. Each level is its own url (`#chat=drill-demo~…`), so reload or the browser's back lands in the same place. `drill: false` is v1: no button. How it works: [doc/drill.md](../doc/drill.md).");

		demo(() => {
			frame(420, 620, () => {
				p.c("muted", "tap a card, then Open — try the first (a merged run), the second (refined: its sections open to the raw words), the third (a card placed in the chat)");
				const panel = new ChatPanel({ placeholder: "say something", session: "drill-demo" }).style("--chatbox-panel-max", "70vh");
				const t = s => "2026-09-30T10:" + s + "Z";
				panel.say({ chat: { at: t("00:00"), from: { kind: "owner" }, text: "First, the sheet should go full screen when I dig into a card." } });
				panel.say({ chat: { at: t("00:04"), from: { kind: "owner" }, text: "Then a card inside it opens one level deeper." } });
				panel.say({ chat: { at: t("00:08"), from: { kind: "owner" }, text: "And every level needs its own url, so a reload keeps my spot." } });
				[["r1", "01:00", "um so the the cards are kind of pages themselves right"], ["r2", "01:03", "they don't need a directory of their own though"], ["r3", "01:06", "and back should always get me out"]]
					.forEach(([id, s, text]) => panel.say({ type: "prompt", by: "owner", id, at: t(s), text }));
				panel.say({ type: "refined", at: t("01:30"), of: ["r1", "r2", "r3"], sections: [
					{ text: "**A card is a tiny page**, with no directory of its own.", from: ["r1", "r2"] },
					{ text: "**Back always gets you out.**", from: ["r3"] },
				] });
				panel.say({ chat: { at: t("02:00"), from: { kind: "assistant" }, place: {
					module: "/framework/ux/Content/Decision/Decision.js", id: "drill-demo-where",
					ask: "On desktop, where should an opened card go?",
					options: [{ say: "Over the drawer, full height" }, { say: "The page's main area" }],
				} } });
				panel.say({ type: "reply", by: "assistant-demo", at: t("03:00"), text: "# How it is addressed\nBy the session and the card's own `at`: `#chat=drill-demo~2026-09-30T10:00:00Z`. No folder is made." });
			});
		}, "`new ChatPanel({ session })`: `session` names the panel in the url. Open a card, click a section, then reload: the same level comes back.");

		p("**v1, kept reachable:** before `ChatPanel`, the drawer's AI tab wired `chat()` and `composer()` by hand, with the log's own fixed `30vh` ceiling — that assembly still works, unchanged, below. `ChatPanel` is v2: the same two parts, now one class, a variable ceiling instead of a fixed one.");

		demo(() => {
			div.c("flex wrap gap", () => {
				frame(360, 420, () => {
					p.c("muted", "v1 — chat() + composer(), by hand, 30vh log ceiling");
					const talk = chat({ source: () => entries });
					const entries = seed(30);
					composer();
					talk.sync();
				});
				frame(360, 420, () => {
					p.c("muted", "v2 — new ChatPanel(), variable ceiling");
					const panel = new ChatPanel().style("--chatbox-panel-max", "70vh");
					seed(30).forEach(e => panel.say(e));
				});
			});
		}, "Same 30 messages, same two parts. v1's log stops at a fixed 30vh no matter how tall its frame is; v2's panel fills up to `--chatbox-panel-max` first and only then scrolls.");
	},
});
