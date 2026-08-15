import { AITask, md, h2, code } from "/app.js";
import panel, { workspace } from "/framework/ext/Panel/workspace.js";

/* The template, extended. `AITask` renders this dir's manifest, checklist, spend
   and session log; `extra()` is where this one task's own page goes. */
export default new AITask({
	meta: import.meta,
	title: "Panel",
	description: "A panel system on the persistence stack: divide, drag, drop-inside, align, fill — persisted.",
	icon: "dashboard_customize",

	extra(){

		md("**[`ext/Panel`](/framework/ext/Panel/) shipped.** Everything below is the module itself, running — not a screenshot of it.");

		workspace().ac("bleed").style("--panel-height", "26em");

		md("That is the **persisted workspace**, the same document as [`/framework/ext/Panel/`](/framework/ext/Panel/) and [`/framework/ext/Panel/full/`](/framework/ext/Panel/full/). Split it, drag a panel by its grip onto another panel's **edge**, drag a divider, pick from **T** — then reload the page.");

		h2("What shipped");

		md(`| file | what it is |
|---|---|
| \`Panel.js\` | \`class Panel extends Item\` — two verbs (\`divide\`, \`close\`) plus \`absorb\` |
| \`workspace.js\` | \`panel(fn)\`, \`workspace()\`, the recursive view, the bar, \`scatter()\` |
| \`PanelDrag.js\` | \`PanelDrag\`, the grip, \`coalesce()\` |
| \`panel.css\` | structure only |
| \`templates.js\` + \`templates.css\` | the **T** vocabulary: 23 entries, all fifteen [section bands](/framework/styles/sections/) plus scenes |`).ac("wide");

		md("**No new mechanism.** A panel is an [`Item`](/framework/core/Item/); a drag is one `item.move()` through [`Sortable`](/framework/ext/Draggable/); the bar reuses [`ext/layout`](/framework/ext/layout/)'s own `pick`/`menu`/`btn` and drops `layout.bar($body)` into every leaf; the document writes through a [`Saver`](/framework/ext/Saver/).");

		h2("One verb does the thing Mike asked for twice");

		code.js(`divide(dir)   // my parent already runs this way? a new sibling.
              // it doesn't? I become the split, my content moves down to a first child.`);

		md("*\"Clicking a second time adds another column\"* is not a second feature — it is what the one honest verb already does, because the second click finds a parent that already runs that way. **Drag-to-edge is the same call** with the dragged panel supplied as `made` and a `before` flag for the low side.");

		h2("panel(fn) — the default container door");

		panel(() => { md("`panel(fn)` wraps anything in **one** managed leaf: the same bar, the same alignment picker, the same `Panel` class. No saver, so `save()` resolves `false` — which is the honest answer."); }).ac("wide").style("--panel-height", "12em");

		h2("What works");

		md(`Verified in a real browser (Playwright, 1600 / 3440 / 390), zero console errors:

- split-V twice → three columns; split-H inside one → rows in a column
- grip drag resizes and writes **grow fractions**, not px — proportions survive a container resize (0.354 → 0.354 across a 500px window change)
- alignment and template picks repaint **one** panel, never the tree
- **T → hero** renders the real section band; the tone menu retints it
- drag a panel by its grip across splits — axis-aware placeholder, commit on drop
- **drop inside**: the outer fifth of a leaf's body splits that leaf on that side, previewed by the placeholder absolutely positioned in the zone
- ✕ closes; a container left with one child **absorbs** it
- reload → structure, fractions, templates, tones and alignment all come back, through **both** backends: \`FileSaver\` on localhost (\`public/data/panels.json\`, gitignored) and \`LocalStorageSaver\` off it
- \`/full/\` fills a 3440×1440 window with no horizontal overflow`);

		h2("Open questions, and one dissent");

		md(`- **Two live workspaces on one document.** \`/framework/ext/Panel/\` and its \`/full/\` route each \`Item.open()\` the same path, and \`Page\` caches views, so after visiting both there are two mounted documents and the last writer wins. The editor has the same property. A shared-document registry is the fix if it bites.
- **"Intelligent" fill is not built.** \`scatter()\` runs before any element exists, so it has nothing to measure. A size-aware roll wants a second pass after layout — a design, not a tweak.
- **Dissent, recorded:** the ruling said the default \`template\` is \`"random"\`. Shipped as **\`"blank"\`**. With \`"random"\` as the default, every \`divide()\` handed its new sibling a panel that then rolled itself into a random sub-split — one click produced three nested columns. \`"random"\` is what *seeding* and the **T** menu ask for, and both now ask explicitly.
- **Dissent, minor:** the drag handle is the grip icon, not the whole bar. A bar-wide handle makes \`pointerdown\` on every button start a drag, and \`grab()\`'s \`preventDefault\` eats the click. The tone menu is also always on a leaf's bar rather than only for tone-aware templates — making it conditional means deleting a \`<select>\` from inside its own change handler.
- **Resolved 2026-08-14 (renames wave):** \`panel.js\` was 205 code lines, against the house rule — one file carrying six responsibilities (the door, the workspace, the view, the bar, drag/drop, the grip). Split into \`workspace.js\` (door, workspace, view, bar) and \`PanelDrag.js\` (drag/drop, grip, \`coalesce\`); \`Panel.class.js\` became \`Panel.js\` and the directory capitalized to \`ext/Panel\` at the same time.`);

		md("Design record, with the question → options → verdict entries: [`ext/Panel/readme.md`](/framework/ext/Panel/).");
	},
});
