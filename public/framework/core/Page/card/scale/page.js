import { Page, p, h4, div, table, thead, tbody, tr, th, td, demo } from "/app.js";

const ROWS = [
	["Small (`.size-small`)", "One line: a title, maybe one icon or chip. No body paragraph — there isn't room to read one comfortably.", "A chip-sized status card, a rail row (AI 2)."],
	["Default (`.size-regular`)", "A title and a short paragraph or two, maybe one small piece of data (a chip, a number). What almost every card on the site already holds.", "A page preview, a Decision card, a Question card."],
	["Large (`.size-large`)", "A title, a longer body, and room for a second thing inside it — another card, a small table, a row of chips.", "The object card (`ux/Content/Object`), a document's own summary card."],
];

export default new Page({
	meta: import.meta,
	title: "Scale",
	description: "Small, default and large — the one --size knob framework.css already has, and what content actually fits at each.",
	icon: "photo_size_select_large",

	content(){
		p("Nothing new here: `.size-small`, `.size-regular` and `.size-large` already exist site-wide. A card reads them for free, because `--pad-card` is already `calc(... * var(--size))` — no separate \"tight\" word needed for a card the way one was for other boxes.");

		demo(() => div.c("flex wrap gap", () => {
			div.c("card size-small", () => p("Small"));
			div.c("card size-regular", () => p("Default"));
			div.c("card size-large", () => p("Large"));
		}), "The same card markup, three sizes — only the class changed.");

		h4("What content fits each");
		table(() => {
			thead(() => tr(() => { th("Size"); th("Content it holds"); th("Example"); }));
			tbody(() => ROWS.forEach(([size, content, example]) => tr(() => { td(size); td(content); td(example); })));
		});
	},
});
