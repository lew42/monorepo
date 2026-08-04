import { Page, div, h2, p } from "/app.js";
import { md, visit } from "../../ui.js";

// Three anchors far enough apart that a failure to scroll is unmistakable.
const filler = n => div(() => { for (let i = 0; i < n; i++) p(`Line ${i + 1} of ${n}. Scroll position is the whole measurement on this page.`); });

export default new Page({
	meta: import.meta,
	title: "A page with anchors",

	content(){
		md(`Three targets: \`#top\`, \`#middle\`, \`#bottom\`. A deep link to any of them must land there on a click **and** on a reload.`);

		visit(["/urls/hash/long/#top", "/urls/hash/long/#middle", "/urls/hash/long/#bottom", "/urls/hash/"]);

		h2.c("section", "Top").attr("id", "top");
		filler(30);

		h2.c("section", "Middle").attr("id", "middle");
		md(`If you arrived by clicking \`#middle\` from \`/urls/hash/\`, or by reloading this url, you are reading this without having scrolled.`);
		filler(30);

		h2.c("section", "Bottom").attr("id", "bottom");
		md(`Same test, further down. \`scrollIntoView({ block: "start" })\` runs once \`app.ready\` resolves — after \`inject()\`, which is the first moment this element is both built and in the document.`);
		filler(10);
	},
});
