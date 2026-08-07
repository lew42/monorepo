import { Page, p, a, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../field.js";
import { this_file } from "../this_file.js";

export default new Page({
	meta: import.meta,
	title: "The unguarded exit",
	classes: "forms",

	content(){
		demo(() => {
			this.$letter = field("Write four hundred words. Then click the link underneath.", {
				name: "letter", rows: 5 });

			a.c("page-link", "Columns").href("/columns/");
		}, "One click. No prompt, no confirmation, no hook that could have produced one. `Router.click()` calls `e.preventDefault()` and then `go()` unconditionally — there is no line between those two where anything gets to say no.");

		section("The code that cannot refuse");

		code(`
click(e){
    const link = this.link_clicked(e);
    if (!link) return;

    e.preventDefault();
    this.go(link.pathname);      // <- nothing between here and the navigation
}`, "Router.js, verbatim");

		section("…and the twist");

		demo(() => {
			const $out = p.c("forms-status", "not probed yet");

			button("read the OTHER page's input").click(() => {
				const node = document.querySelector(".forms-input.essay");
				$out.text(node
					? `found it — value ${JSON.stringify(node.value)} · visible ${!!node.offsetParent}`
					: "not in the document — visit /forms/survives/ first, type something, then come back");
			});
		}, "That input belongs to `/forms/survives/`. You are not on that page. It is in the document right now, holding its value, `display:none`. **Nothing was lost.**");

		section("Is that better or worse?");

		p("Smaller, in one sense: the bytes are recoverable, and navigating back to the exact url shows them again untouched. Worse in every other sense, and this is the honest answer:").ac("note");

		code(`
what the user sees      their work vanish
what the user knows     nothing — there is no indicator, no toast, no undo
how they recover        navigate back to the exact url, by memory
what they usually do    reload the page, or close the tab

both of which destroy it for real`, "the recovery path nobody will find");

		md("Memoization does not save the work. It **defers the loss and removes the alarm**. Immediate visible loss at least tells you, at the moment it happens, while your hand is still on the mouse. A silent deferral means the user wanders off, does the natural thing when confused — reload — and only then loses it, now with no idea what caused it.").ac("note");

		p("So: the framework's one genuinely good property here also removes the signal that would have prompted a save. That argues for making the work durable, not for making the exit noisy — see `/forms/autosave/`.").ac("note");

		section("The one that really does lose it");

		demo(() => {
			button("reload — this destroys the heap").click(() => location.reload());
		}, "Type into the letter above first, then press it. This is the boundary: `render()`'s memo lives in a module instance, and a reload throws the whole module graph away. `Router` never hears about this click at all — `location.reload()` is not a link.");

		a.c("page-link", "next: a guard, designed properly →").href("/forms/guard/");

		this_file(import.meta);
	},
});
