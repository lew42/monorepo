import { div, span, button } from "/framework/core/View/View.js";
import dropdown from "/framework/ext/Dropdown/dropdown.js";
import { Box, Flex } from "./items.js";
import { list, list_layouts, local } from "./documents.js";

// value: "full" is `undefined`-safe (never a real preset), so it never collides with a px number.
const PRESETS = [["400", 400], ["768", 768], ["1280", 1280], ["⤢", "full"]];

/* One row over the canvas (design.md §6). `document ▾` and `insert ▾` are `ext/Dropdown`s —
 * a top-layer popover, so the narrow canvas column never clips them — built fresh on every
 * open from `documents.js`, which is the only place a doc/layout list can change. */
export function toolbar(pg){
	return div.c("pg-toolbar flex", () => {
		pg.$doc_slot = div.c("pg-toolbar-slot pg-toolbar-group pg-doc-slot");
		pg.$insert_slot = div.c("pg-toolbar-slot pg-toolbar-group pg-insert-slot");

		// One + only (pg-placeholder brief item 5) — a Box under the existing add rule
		// (`pg.add`), a Flex on Shift-click (pg-shift, same rule as the canvas's own
		// `.pg-add` — explicit beats magic, no auto-convert). Type switching to Grid
		// stays the sidebar's job.
		div.c("pg-toolbar-group flex gap", () => {
			button.c("pg-btn", "+").attr("title", "Add Box (Shift: Flex)").click(e => pg.add(e.shiftKey ? Flex : Box));
		});

		div.c("pg-toolbar-group flex gap", () => {
			button.c("pg-btn", "⧉").attr("title", "Duplicate selected").click(() => pg.duplicate());
			button.c("pg-btn", "✕").attr("title", "Remove selected").click(() => pg.remove());
		});

		div.c("pg-toolbar-group flex gap", () => {
			button.c("pg-btn", "{}").attr("title", "Copy selected as JSON").click(() => pg.copy());
			button.c("pg-btn", "paste").attr("title", "Paste JSON").click(() => pg.paste());
		});

		// documents.js raced Socket.ready and lost — saving to this tab only, this session.
		// playground.css is a sibling's right now, so `color` is a minimal inline style
		// (pg-save task log).
		if (local) span.c("pg-toolbar-group", "● saving locally")
			.attr("title", "Dev server unreachable — saving to this browser only, this session.")
			.style("color", "var(--warn)");

		pg.$viewport_slot = div.c("pg-toolbar-slot pg-toolbar-group flex gap pg-viewport-slot");
		paint_viewport_slot(pg);   // no fetch needed — paint it now, not after the doc loads
	});
}

// Redraws the document + insert slots — the one place a doc/layout list change and what
// the two triggers show can never drift apart. Called after every mutation that could
// change either list (`swap`, `create`, `delete_current`, `save_selected_as_layout`).
export async function refresh_toolbar(pg){
	const [docs, layouts] = await Promise.all([list(), list_layouts()]);
	paint_doc_slot(pg, docs);
	paint_insert_slot(pg, layouts);
}

function paint_doc_slot(pg, docs){
	pg.$doc_slot.empty(() => {
		dropdown({
			options: [
				...docs.map(d => ({ value: d.slug, label: d.name, icon: "description" })),
				{ value: "__new__", label: "New document", icon: "add" },
				{ value: "__delete__", label: "Delete this document", icon: "delete" },
				{ value: "__save_layout__", label: "Save selection as layout…", icon: "save" },
			],
			value: pg.slug, title: "Document — new · open · delete · save as layout",
			pick: value => pick_doc(pg, value),
		});
	});
}

async function pick_doc(pg, value){
	if (value === "__new__") return pg.create();
	if (value === "__delete__") return pg.delete_current();
	if (value === "__save_layout__"){
		const name = prompt("Save the selected subtree as a layout named:");
		return name?.trim() ? pg.save_selected_as_layout(name.trim()) : undefined;
	}
	return pg.swap(value);
}

function paint_insert_slot(pg, layouts){
	pg.$insert_slot.empty(() => {
		dropdown({
			options: [
				{ value: "", label: "Insert layout", icon: "view_quilt" },
				...layouts.map(l => ({ value: l.name, label: l.name, icon: "dashboard" })),
			],
			value: "", title: "Insert a saved layout under the selection",
			pick: name => name && pg.insert_layout(name),
		});
	});
}

// No fetch — `pg.viewport` is all this needs, so `set_viewport()` can call it alone.
export function paint_viewport_slot(pg){
	pg.$viewport_slot.empty(() => {
		PRESETS.forEach(([label, value]) => {
			button.c("pg-btn pg-preset-btn", label).ac(pg.viewport === value && "on")
				.attr("title", value === "full" ? "Full width" : `${value}px`)
				.click(() => pg.set_viewport(value));
		});
	});
}

export default toolbar;
