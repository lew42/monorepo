import { div, h3, p } from "/framework/core/View/View.js";
import files from "/framework/ext/files/files.js";
import Quotation from "/framework/ux/Content/Quotation/Quotation.js";

/*
 * A CARD'S OWN content.js — the card draws whatever this file draws.
 *
 * The card's page.jsonl has one line that places it:  {"place": {"module": "content.js"}}
 * core/Page/Log.js `draw_module()` imports this file and, since the default export has no
 * `render`, calls it as `content(page, box, data)` with the box already captured — so the
 * factories below land inside the card, even the ones that fill in later.
 *
 * Import any module on the site and render it. This one shows two: the owner's words as a
 * Quotation (ux/Content), and this card's own folder as a file browser (ext/files).
 */
export default function content(page, box, data){
	div.c("flow", () => {
		p("This card draws itself: everything below comes from its own content.js, which imports two site modules and renders them.");

		h3("What you asked for (ux/Content/Quotation)");
		new Quotation({
			text: "Each card could have a content.js where it imports modules and renders different things.",
			at: "2026-09-28T14:10:00-05:00",
			via: "dictation",
			url: "/framework/ai2/2026/09/28/agent-work-on-every-page-sanity-checks-c/",
		});

		h3("This card's own folder (ext/files)");
		// Paths resolve against this file, never the document (the SPA makes the document url a route).
		files(import.meta, "content.js page.jsonl", { route: false });
	});
}
