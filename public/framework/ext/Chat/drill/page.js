import { Page, md, p, demo, div } from "/app.js";
import { ChatPanel } from "../ChatPanel.js";

// A box that pretends to be the ✦ sheet, so the panel has a width to live in.
function frame(width, height, cb){
	div.c("card pad").style({ width: width + "px", maxWidth: "100%", height: height + "px", display: "flex", flexDirection: "column" }).append(cb);
}

export default new Page({
	meta: import.meta,
	title: "Drill in",
	description: "Open a chat card as its own full-screen page: Back, paging one level deeper, and a url for every level.",
	icon: "open_in_full",

	content(){
		md("**Drill in (2026-09-30):** tap a card that has something inside it, then its **Open ⤢** button: the chat goes full screen (over the desktop drawer, its full height) as its own small page, with Back. A card inside that page opens one level deeper. Each level is its own url (`#chat=drill-demo~…`), so reload or the browser's back lands in the same place. `drill: false` is v1: no button. How it works: [doc/drill.md](/framework/ext/Chat/doc/drill.md).");

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

	},
});
