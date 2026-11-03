import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Predynastic Vases",
	description: "Thin-walled hardstone vessels from 4000 BCE and Petrie's drill-core 'Core 7' — a 2025 metrology study versus the lathe-symmetry claim.",
	icon: "square_foot",
	width: "large",

	content(){ return md.file(import.meta, "../predynastic-vases.md", { h1: false }); },
});
