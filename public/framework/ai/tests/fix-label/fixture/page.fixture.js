import { Page, div, p } from "/app.js";

/* Deliberately broken for the openrouter test library
 * (Servex/ext/openrouter/evals/library/fix-label/test.json): the button's
 * label has one typo, "Sumbit" instead of "Submit" — the one, self-evident
 * fix. Never fix this file directly: library.mjs copies it into a fresh run
 * dir per test run. */
export default new Page({
	meta: import.meta,
	title: "Contact form",
	description: "A tiny form — one typo on purpose, for the model test library.",

	content(){
		p("Send us a message.");
		div.c("btn", "Sumbit");
	}
});
