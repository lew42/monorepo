import { Page, md, h2, code, div } from "/app.js";
import MemorySaver from "/framework/ext/Saver/MemorySaver.js";
import { workspace, Panel } from "/framework/ext/Panel/workspace.js";

// The seam, at its smallest: three regions and a two-panel seed, over a saver that
// writes to a variable — so this demo touches neither file the editor uses.
const REGIONS = {
	one: { draw(){ div.c("pad h2", "one"); } },
	two: { draw(){ div.c("pad h2", "two"); } },
	three: { draw(){ div.c("pad h2", "three"); } },
};

const seed = root => root.add(
	new Panel({ data: { template: "one" } }),
	new Panel({ data: { template: "two" } }));

export default new Page({
	meta: import.meta,
	title: "Editor × panel",
	description: "The editor's shell became a persisted panel workspace: split, drag, close, restore — a second document that never meets the first.",
	icon: "design_services",

	content(){

		md("**The [editor](/framework/ext/editor/)'s shell is now a [panel](/framework/ext/Panel/) workspace.** Palette, canvas, layers, properties and status are regions you can split, resize, drag beside each other, close and put back from `T` — and the arrangement reloads out of `/data/editor-panels.json`, a second document that never meets the one you are editing.");

		h2("The seam, at its smallest");

		code.js(`const REGIONS = {
    one:   { draw(){ div.c("pad h2", "one");   } },
    two:   { draw(){ div.c("pad h2", "two");   } },
    three: { draw(){ div.c("pad h2", "three"); } },
};

workspace({ saver: new MemorySaver(), templates: REGIONS, seed });`);

		workspace({ saver: new MemorySaver(), templates: REGIONS, seed })
			.ac("wide").style("--panel-height", "13em");

		md("That is the whole integration, running. **Open a `T` menu**: it offers `one two three` — not the site's fifteen section bands, and not `random`. Split, drag, close: same `Panel`, same verbs, same saver. The editor hands `workspace()` five regions instead of three, and each one closes over `doc / sel / nodes / history`.");

		h2("What shipped");

		md(`| file | change |
|---|---|
| [\`ext/editor/page.js\`](/framework/ext/editor/) | the shell is \`workspace({ saver, templates, seed })\`; six regions in a closure; five guarded painters |
| \`ext/editor/editor.css\` | \`.editor\` is the frame + \`--panel-height\`; \`.editor-region\` is one line. Three dead rules deleted |
| \`ext/editor/readme.md\` | the record: where a region's \`draw\` lives, and what the two drag systems cost |
| [\`ext/Panel/workspace.js\`](/framework/ext/Panel/) | \`workspace(options)\`; \`vocab\`/\`content\`/\`offer\`; one clause in \`PanelDrag.drop_check\` |
| \`ext/Panel/panel.css\` | one line: a hugging panel's body is \`0 0 auto\` too |`).ac("wide");

		h2("Three things the browser found");

		md(`- **A hugging panel's body measured 0px.** \`.panel.hug\` is \`flex: 0 0 auto\`, and a \`flex: 1 1 0\` body inside a box with no height of its own resolves to nothing — the status strip rendered and was clipped away. \`.panel.hug, .panel.hug > .panel-body { flex: 0 0 auto }\` is the fix, and it makes \`mode: "hug"\` work for the first time.
- **\`Draggable.registry\` is one \`WeakMap\` for the whole document,** so \`locate()\` offered a dragged \`Panel\` an editor \`Block\` as a drop target — one \`item.move()\` and the two trees cross. Both \`drop_check\`s now test \`target.item?.root() === this.item.root()\`. That also closes a live defect on [\`/framework/ext/Panel/\`](/framework/ext/Panel/), where a workspace panel could be dropped into the \`panel(fn)\` demo further down the page.
- **\`layout.bar\` floats over the bottom-right corner of every panel body,** which is exactly where a properties region puts its last knob — the control under it is unreachable. A workspace carrying its own regions no longer gets one; a content workspace still does, unchanged.`);

		h2("Acceptance — real browser, both schemes");

		md(`Playwright against the dev server, at 900 / 1600 / 3440, light and dark, **zero console errors** and no horizontal overflow:

- the editor renders as a workspace: 5 regions, the canvas holding the live document, the badge reading \`saved\`
- split the layers region → a \`blank\` sibling; drag properties beside the palette by its grip; drag a divider → grow fractions \`1.773 / 1.227\`; **reload → identical**, out of \`/data/editor-panels.json\`
- close the canvas → layers, properties and the badge all keep working; restore it from a \`T\` menu → the document is back; reload → still there
- **full editor replay:** a \`Text\` dragged into a \`Card\` nested inside a \`Grid\` inside a \`Section\`; reload → still there; **Ctrl+Z** undid it and **Ctrl+Shift+Z** redid it; a chip edit and a text edit both survived a reload; the read-only badge still reads \`save()\`'s return value
- a block dragged onto a panel grip changes **nothing** — and a panel dragged into the standalone \`panel(fn)\` demo is refused
- [\`/framework/ext/Panel/\`](/framework/ext/Panel/) and [\`/full/\`](/framework/ext/Panel/full/) re-ran their own ten-point acceptance: 24-entry \`T\` menu intact, split-twice → three columns, fractions, \`hero\` + tone, cross-split drag, close-and-unwrap, reload, 3386×1346 of a 3440 window`);

		h2("Dissents and open questions");

		md(`- **Dissent (ruling 3):** the two-line saver chooser became \`store(path, key)\` applied twice. Ruling 15 wants the \`LocalStorageSaver\` mount visible in one line; it is, and there is now one of it rather than two to keep in step.
- **Dissent (ruling 7):** the pre-approved fix was a \`min-height\` on \`.panel\`. Measurement said the problem was \`hug\`, not nesting, so the line that shipped is \`.panel.hug > .panel-body { flex: 0 0 auto }\`. No \`min-height\` was needed anywhere.
- **The \`T\` menu is a \`<select>\` of names, not icons.** \`panel.js\` reads only \`draw\` from a template entry — \`templates.js\`'s \`icon\` keys are currently unread — so the editor's registry declares none.
- **Two canvases over one document is undefined,** as the brief allowed: the last one drawn owns \`$canvas\`, the other goes stale until the next structural redraw. Keying the registry by instance rather than by name is the fix if it ever matters.
- **\`ext/Panel/readme.md\` still documents \`workspace()\` as taking no arguments.** Three lines out of date, and outside this wave's ownership — the source comments carry it in the meantime.
- **A first-ever load logs one 404** for \`/data/editor-panels.json\` before the seed is written. \`FileSaver.load()\` is a plain \`fetch\`, and \`/framework/ext/Panel/\` has had the same property since it shipped.
- **Chrome is thick.** Every \`Panel\` draws a bar, splits included, so three bars stack above the palette. A split's bar carries only its two divide icons and a close — worth asking whether a container needs one at all.`);

		md("Design record, question → options → verdict: [`ext/editor/readme.md`](/framework/ext/editor/). Brief: `framework/ai/2026-08-13/editor-panels/requirements.md`.");
	},
});
