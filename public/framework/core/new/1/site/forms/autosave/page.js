import { Page, p, a, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../field.js";
import { draft, autosave } from "../draft.js";
import { this_file } from "../this_file.js";

export default new Page({
	meta: import.meta,
	title: "Autosave",
	classes: "forms",

	content(){
		demo(() => {
			const $saved = p.c("forms-status", "");

			this.$post = autosave(
				field("Type, then reload the page. Then close the tab and come back.", {
					name: "post", rows: 4 }),
				"autosave-demo",
				value => $saved.text(`saved ${value.length} chars at ${new Date().toLocaleTimeString()}`));

			button("reload").click(() => location.reload());
			button("clear the draft").click(() => {
				draft("autosave-demo").clear();
				this.$post.el.value = "";
				$saved.text("cleared");
			});
		}, "It survives the one exit that memoization cannot: a reload. Restore on the way in, debounced write on every keystroke — that is the entire mechanism, and it needs nothing from `Router` at all.");

		section("The whole implementation");

		code(`
export function autosave($control, key, saved){
    const store = draft(key);
    let timer;

    $control.el.value = store.read();

    return $control.on("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            store.write($control.el.value);
            saved?.($control.el.value);
        }, 300);
    });
}`, "site/forms/draft.js");

		section("What each mechanism is actually for");

		code(`
memoization    in-app navigation      free, automatic, already true today
autosave       reload, crash, later   ~15 lines, no framework involvement
beforeunload   closing the tab        the last line, and the only thing left`,
			"three layers, and only the middle one is yours to write");

		md("Read down that column: memoization covers everything a navigation guard could have covered, autosave covers everything memoization cannot except one row, and `beforeunload` covers that row. **A guard in `Router` has no row of its own.**").ac("note");

		section("The argument");

		p("A framework with no navigation guard is quietly recommending this, and it is right to. A guard asks the reader a question they are badly placed to answer — *do you want to lose this?* — at the moment they have already decided to leave. Autosave never asks, because there is nothing to decide.").ac("note");

		p("It also produces a better failure. A guard that fails, fails by losing work. Autosave that fails, fails by keeping a stale draft — recoverable, inspectable, and nobody's afternoon.").ac("note");

		section("The honest costs");

		code(`
every keystroke is committed    so the safety net you now need is UNDO, not confirm
sessionStorage dies with the    which is exactly the row beforeunload covers, and
  tab                             exactly why it is still needed
localStorage instead            survives closing the tab, but two tabs on one form
                                  fight over one key, and nothing ever cleans it up
a draft can outlive its point   restoring last week's text into an empty form is
                                  its own small horror — drafts want an expiry`,
			"nothing is free");

		p("`sessionStorage` is the right default: per-tab, so two tabs cannot collide, and automatically cleaned up. The tab-close hole is real and is the one place `beforeunload` earns its arming — see `/forms/unload/`. Two mechanisms, neither sufficient alone, and still no `Router` change between them.").ac("note");

		section("The verdict of this section");

		code(`
needs a navigation guard in Router?     NO
needs replaceState in Router?           YES — one method, /forms/submit/
needs an app-level surface for late
  failures?                             YES — one region, /forms/optimistic/`,
			"one refusal, two small asks");

		p("The full argument, the two rejected designs and the recorded dissent are in the Registrar's report.").ac("note");

		a.c("page-link", "back to the section →").href("/forms/");

		this_file(import.meta);
	},
});
