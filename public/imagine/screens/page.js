import { Page, md } from "/app.js";

/* Container: /imagine/'s column row, one `large` column. Size: 28–64em. Own layout:
   a line of prose and core's previews wall. Regions: one, core's. Preview: the default
   card on the rail.

   This index is an ordinary column ON PURPOSE — it is the last thing you see before a
   screen takes over, so it keeps its head, its × and its nav rows. Everything it links
   to has none of them. */

export default new Page({
	meta: import.meta,
	title: "Screens",
	description: "Full-screen experiences — how navigation transforms a whole screen.",
	icon: "fullscreen",
	width: "large",
	index: true,

	children: "divide stack title read deck uneven quad mix",

	content(){
		md("**Eight tiny demos of one question: when you click through to something new, what happens to the screen you were just looking at?** Click any card below — each is a real page. Sometimes your old screen disappears and the new one takes over; sometimes it shrinks and the two sit side by side. The eight demos are the eight ways that can go.");

		md("The short version: a click either **replaces** what you were looking at, or **joins** it and the two split the space evenly. The cards below sketch the shape each demo builds, step by step — the technical rundown is in the [readme](/imagine/screens/readme/).");

		this.previews();
	},
});
