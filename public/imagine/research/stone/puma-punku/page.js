import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Puma Punku",
	description: "Tiwanaku's interlocking H-blocks: andesite and sandstone, dated AD 580-720, replicated to ~1mm with stone hammers — and the geopolymer claim that says they were never carved at all.",
	icon: "square_foot",
	width: "large",

	content(){ return md.file(import.meta, "../puma-punku.md", { h1: false }); },
});
