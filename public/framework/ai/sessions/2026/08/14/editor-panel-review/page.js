import { AITask, md, h2, ui } from "/app.js";
import MemorySaver from "/framework/ext/Saver/MemorySaver.js";
import { workspace } from "/framework/ext/Panel/workspace.js";
import ledger from "./ledger.js";

/* The template, extended. `AITask` renders this dir's log, checklist and spend;
   `extra()` is the review itself. The findings are data — findings.js. */
export default new AITask({
	meta: import.meta,
	title: "Editor × Panel review",
	label: "Editor × Panel — review",
	description: "Where both modules actually stand: 27 findings you can filter, and the ruling on the capital E.",
	icon: "fact_check",

	extra(){

		md("**Both modules work, and neither exists.** `git log` on [`ext/editor`](/framework/ext/editor/) and [`ext/Panel`](/framework/ext/Panel/) returns nothing — 13 files and 1,568 lines that live only in this working tree. That is the headline; everything below it is a note about code that has never been committed.");

		ui.table(
			["", "files", "lines", "over 100", "commits", "state"],
			[
				["ext/Panel", "8", "962", "4", "0", "shipped, arranged, proven in a browser"],
				["ext/editor", "5", "606", "2", "0", "shipped on top of it, one file carrying three jobs"],
			]
		);

		h2("The ledger");

		md("Filter by module and by kind. **defect** is wrong, **gap** is missing, **debt** is over budget, **open** is known and deferred, **done** is verified — a review that only lists complaints is not a status. The rail down each row's left edge is severity: red high, orange medium, grey low.");

		ledger();

		h2("The capital E");

		md("**The rule already exists**, and the 2026-08-14 renames wave wrote it down: *a directory is capitalized to match the class it exports.* Sixteen of eighteen ext modules obey it.");

		ui.table(
			["what you import", "case", "modules"],
			[
				["a class", "Capital ✓", "AITask · Draggable · JSONL · Panel · Saver · Timeline"],
				["a function", "lower ✓", "catalog · classdoc · demo · files · highlight · layout · markdown · tabs · toc"],
				["a function", "Capital ✗", "Ask · LayoutTool — both drifted on 2026-08-14"],
				["nothing at all", "lower", "editor — and that is the finding"],
			]
		);

		md("So the wave was right to leave it lowercase, and the reason is a defect rather than a preference: **`ext/editor` is the only ext with no door.** `editor()` is a closure private to `page.js`. Nothing outside the directory can construct one, embed one, or name one in an import.");

		md("**Ruling: rename it — but the rename is the split, not a `git mv`.** Capitalizing the directory on its own would make `editor` the third module wearing a capital it has not earned. The move that earns it is the one its own readme has carried as open since the day it shipped:");

		md("```\next/editor/                    ext/Editor/\n  page.js        318 lines      Editor.js     ~170   class Editor — the widget\n                                page.js       ~150   the doc page\n  blocks.js       38            blocks.js       38\n  History.js      46            History.js      46\n  editor.css      42            editor.css      42\n```");

		md("The closure is already a class: eleven methods (`draw select layers properties badge marks sync insert cut swap changed`) and seven fields, written as `let`. Turning it into one is a transcription, not a redesign — and it is what closes the *two canvases over one document* open item, because a region registry keyed by instance is only possible once there is an instance.");

		md("**The cost is four references outside the directory** — smaller than the rename that already happened to `ext/panel`:");

		ui.table(
			["file", "what changes"],
			[
				["framework/ext/page.js:9", "the `children:` string"],
				["framework/ext/Panel/page.js:39", "the Next link — whose label already reads *Editor*"],
				["framework/ext/LayoutTool/audit/pages.js:43", "the crawl url"],
				["framework/core/Item/readme.md:66", "one prose mention"],
			]
		);

		md("⚠ **On Windows the directory rename is a two-step** — NTFS folds `editor` and `Editor` into one name, and this exact trap destroyed the old `panel.js` mid-rename on 2026-08-14. `git mv editor _editor && git mv _editor Editor`, and `Editor.js` must never share the directory with an `editor.js`.");

		md("**Proposed, not done** — a directory name, an API name and a dozen doc references is the working agreement's *ask in three lines and wait*. Say the word and it is one wave.");

		h2("The thing itself, running");

		md("A live [`ext/Panel`](/framework/ext/Panel/) workspace — on a **`MemorySaver`**, deliberately, because mounting the default one here is exactly the third-mount defect three rows up. Split it, drag a panel by its grip onto another's edge, pick from **T**. Nothing is written.");

		// ⚠ No `bleed` — inside AITask's own wrapper the class is inert (only a direct
		// child of `.page.standard` gets the grid column), and an inert marker reads
		// as a behaviour that is not there.
		workspace({ saver: new MemorySaver() }).style("--panel-height", "24em");

		md("Design records, both long-form: [`ext/Panel/readme.md`](/framework/ext/Panel/) · [`ext/editor/readme.md`](/framework/ext/editor/). Prior tasks: [Panel](/framework/ai/2026-08-13/panel/) · [Editor × panel](/framework/ai/2026-08-13/editor-panels/) · [Ext renames](/framework/ai/2026-08-13/renames/).");
	},
});
