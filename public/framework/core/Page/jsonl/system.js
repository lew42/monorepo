import { p, h2, div, a, span, icon, pre } from "/app.js";

/* Placed by the line {"place": {"module": "system.js"}} — level 1 of the page.jsonl
   SYSTEM, not just the format. The owner, 2026-09-29: "the core slash page slash, maybe
   the page should be called JSON L and it's just, it's a system... document the page
   JSON, adding logs to it, who adds logs to it, the timing, any caveats or conflicts."
   And: "familiar structure — the icon, the name, and what it means... should become
   familiar." So: five tiles, same icon language as the rest of core/Page (Format reuses
   the "data_object" icon this very file's own page.jsonl already wears), each one click
   from its doc/*.md. The v1 two-line example (note.md, placed by the line right above
   this one) stays exactly where it was — this page still demonstrates itself. */

const TILES = [
	{ name: "Format", ic: "data_object", meaning: "One line = one JSON object = one method call. Line 1 builds the page.", href: "/framework/core/Page/doc/jsonl/" },
	{ name: "Who writes", ic: "edit_note", meaning: "Five different writers append lines — none of them by hand, on purpose.", href: "doc/writers/" },
	{ name: "Timing", ic: "schedule", meaning: "A line lands the moment it's appended; localhost streams it in with no reload.", href: "doc/timing/" },
	{ name: "Caveats", ic: "warning", meaning: "Duplicate lines and a swept-in server write are known, not bugs.", href: "doc/caveats/" },
	{ name: "Size", ic: "monitor_weight", meaning: "484 files, one over 100 KB; a purge is proposed, not built yet.", href: "doc/size/" },
];

// The same small "icon, name, one-line meaning" card `core/Page/navigation/page.js`
// built for the same reason: `ux/Content/structure`'s iconCard has no caption slot.
function tile(name, ic, meaning, href){
	return a.c("card flex v gap-35").href(href)
		.style({ textDecoration: "none", color: "var(--ink)" })
		.append(() => {
			icon(ic).style({ fontSize: "2rem" });
			span(name).style({ fontWeight: "700" });
			span.c("muted", meaning);
		});
}

export default function(page, box, data){
	p("`page.jsonl` isn't just a file format — it's a whole system: who is allowed to add a line, when each writer's line actually lands, what happens when two lines collide, and how big these files are allowed to get. This page is a live `page.jsonl` page, so it can show its own system instead of just describing one.");

	div.c("flex wrap gap-50", () => TILES.forEach(t => tile(t.name, t.ic, t.meaning, t.href)));

	h2("This page's own file");
	p("Below is `page.jsonl` for the folder you're looking at right now, fetched live — every tile above, the note beneath, and the files listed at the bottom of this page all came from these exact lines. Nothing here is a mockup.");
	const $source = pre.c("page-log-source", "…loading…");
	$source.style({ "white-space": "pre-wrap", "overflow-wrap": "anywhere" });
	fetch(page.jsonl_url).then(res => res.text()).then(text => $source.text(text.trim()));

	p.c("muted", "The class that reads these lines one at a time is `Log.js`, beside `Page.class.js` (`Page extends PageLog`); the loader is `PageLog.jsonl()` in that same file.");
}
