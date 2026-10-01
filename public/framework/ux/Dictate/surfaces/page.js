import { Page, md, code, div, h3, a } from "/app.js";
import chat from "../chat.js";

/* SURFACES (one-dictation, merge 4): the one chat, live, then each real place it is
 * mounted: a screenshot of that surface beside the one call it makes. */
const SHOT = "/framework/ux/Dictate/surfaces/";
const SURFACES = [
	{ name: "The ✦ phone sheet", file: "/framework/ext/drawer/rail.js",
		says: "On a phone, the ✦ at the bottom opens it. Drag its top edge down and it shrinks to one line.",
		shots: ["sheet-400.png", "sheet-collapsed-400.png"],
		call: `chat(this.$slot.el, { path: drawer.page(), card: this.card_ref?.id })` },
	{ name: "The ☰ drawer's AI tab", file: "/framework/ext/drawer/tabs/ai.js",
		says: "On a desktop, the ☰ at the top right opens it. The chat fills the drawer's full height.",
		shots: ["drawer-ai-1920.png"],
		call: `chat($slot.el, { path: page, card: card?.id })` },
	{ name: "An AI 2 card's sidebar", file: "/framework/ai2/card.js",
		says: "Every card page has it on the right, under a line naming the card.",
		shots: ["card-sidebar-1920.png"],
		call: `chat(slot.el, { path: this.url, card: this.id })` },
	{ name: "AI 2's Live card", file: "/framework/ai2/page.js",
		says: "Open the Live card's fold to ask about what is running.",
		shots: ["live-fold-1920.png"],
		call: `chat(slot.el, { path: root.url + id + "/", card: id })` },
	{ name: "The dev bar", file: "/framework/dev/DevBar/ask.js",
		says: "On localhost only, the dev bar's AI tab.",
		shots: [],
		call: `chat(slot.el, { path: url })` },
];

export default new Page({
	meta: import.meta,
	title: "Surfaces",
	description: "The one chat, live, and the five places on the site that mount it.",
	icon: "dashboard",

	content(){
		md("**One chat, five places, one conversation.** This box is the real chat. Say something into it, then open the ✦ or the ☰: the same words are there.");
		div.c("ux-dictate-surfaces-live", $slot => { chat($slot.el, { path: location.pathname }); });

		SURFACES.forEach(s => {
			h3(s.name);
			md(s.says);
			s.shots.forEach(f => md(`![${s.name}](${SHOT}${f})`));
			code.js(s.call);
			a.c("muted").href(s.file).text(s.file.replace("/framework/", ""));
		});

		md.details(import.meta, "readme.md", "Readme");
	},
});
