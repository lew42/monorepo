import { p, h2, h3, div, a, span, icon, pre } from "/app.js";

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
	{ name: "Who writes", ic: "edit_note", meaning: "Five different writers append lines — none of them by hand, on purpose.", href: "md/doc/writers/" },
	{ name: "Timing", ic: "schedule", meaning: "A line lands the moment it's appended; localhost streams it in with no reload.", href: "md/doc/timing/" },
	{ name: "Caveats", ic: "warning", meaning: "Duplicate lines and a swept-in server write are known, not bugs.", href: "md/doc/caveats/" },
	{ name: "Size", ic: "monitor_weight", meaning: "484 files, one over 100 KB; a purge is proposed, not built yet.", href: "md/doc/size/" },
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

// Placed in TWO parts, so the v1 note can sit between them (the `placed` line at the
// end of page.jsonl sets the order: tiles, note.md, source). A placement with no `part`
// draws both, as it did before that line existed.
//   {"module": "system.js", "part": "tiles"}   intro + the five tiles + the example's heading
//   {"module": "system.js", "part": "source"}  this page's own page.jsonl, fetched live
export default function(page, box, data = {}){
	if (data.part !== "source") tiles();
	if (data.part === "tiles") example_heading();
	if (data.part !== "tiles") source(page);
}

function tiles(){
	p("`page.jsonl` isn't just a file format — it's a whole system: who is allowed to add a line, when each writer's line actually lands, what happens when two lines collide, and how big these files are allowed to get. This page is a live `page.jsonl` page, so it can show its own system instead of just describing one.");

	// An even grid INSIDE the reading column (a page.jsonl page draws in `main`, and
	// `width: "wide"` does not reach log_view): Format, the one to read first, spans
	// every track; the other four share the tracks below it — 2 × 2 at 1920.
	div.c("grid auto gap", () => TILES.forEach((t, i) => {
		const $t = tile(t.name, t.ic, t.meaning, t.href);
		if (i === 0) $t.style({ gridColumn: "1 / -1" });
	})).style("--column", "16rem");
}

function example_heading(){
	h3("The smallest example");
	p.c("muted", "The two lines this page began with: line 1 builds it, and `{\"place\": \"note.md\"}` draws the paragraph below.");
}

function source(page){
	h2("This page's own file");
	p("Below is `page.jsonl` for the folder you're looking at right now, fetched live — every tile above, the note, and the files listed at the bottom of this page all came from these exact lines. Nothing here is a mockup.");
	const $source = pre.c("page-log-source", "…loading…");
	$source.style({ "white-space": "pre-wrap", "overflow-wrap": "anywhere" });
	fetch(page.jsonl_url).then(res => res.text()).then(text => $source.text(text.trim()));

	p.c("muted", "The class that reads these lines one at a time is `Log.js`, beside `Page.class.js` (`Page extends PageLog`); the loader is `PageLog.jsonl()` in that same file.");
}
