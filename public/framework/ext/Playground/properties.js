import { div, label, input, button, span } from "/framework/core/View/View.js";
import dropdown from "/framework/ext/Dropdown/dropdown.js";
import { Box, Flex, Grid } from "./items.js";

/* No engine (design.md §5) for the two GENERIC controls (`seg`/`text`/`num`) — same as
 * before. Everything else here is bespoke because it does more than read/write one key:
 * `type` CONVERTS the node, `width`/`height` show a third field only when `fixed`, `bg`
 * is a dropdown, `pad` carries a quick-add button. Those four call `pg.paint_properties()`
 * after writing — the ONE place this module breaks design §4's "change never repaints"
 * rule, because only they can change which fields are even on screen (pg-sidebar brief §1).
 * The readout drawn here is only the FIRST paint; a later plain `change` (label, gap, a
 * text/num/seg field) updates it in place via Playground.js's `apply_change`. */

const CONTROLS = { seg, text, num };
const TYPES = { auto: Box, flex: Flex, grid: Grid };

// Theme tokens only (pg-sidebar brief §5) — the swatch shows the colour, the value IS the
// CSS `background-color` (Data IS the CSS, decisions.md). Read straight off `lew42.css`;
// not exhaustive, the obvious surface/ink set.
const BG_TOKENS = [
	{ value: "", label: "none" },
	{ value: "var(--surface)", label: "surface" },
	{ value: "var(--tint)", label: "tint" },
	{ value: "var(--wash)", label: "wash" },
	{ value: "var(--bg)", label: "bg" },
	{ value: "var(--sidebar-bg)", label: "sidebar" },
	{ value: "var(--prim)", label: "prim" },
	{ value: "var(--line)", label: "line" },
].map(o => ({ ...o, icon: () => span.c("pg-swatch").style("background", o.value || "transparent") }));

export function properties(item, pg){
	div.c("pg-props-head", `${item.wire()}${item.data.label ? ` "${item.data.label}"` : ""}`);

	always_on(item, pg);

	if (item.constructor.fields?.length){
		section(item.wire().toLowerCase(), () => item.constructor.fields.forEach(([key, control, options]) => (CONTROLS[control] ?? text)(item, key, options)));
	}

	const child_fields = item.parent?.constructor.childFields;
	if (child_fields?.length){
		section("in parent", () => child_fields.forEach(([key, control, options]) => (CONTROLS[control] ?? text)(item, key, options)));
	}

	div.c("pg-readout", item.styles());
}

// Always-on (pg-sidebar brief §1): label, type, gap and pad (outside flex/grid per the
// owner's own words), the two size axes, bg. Nothing else lives here — a Flex/Grid's own
// config and a child's "in parent" fields are conditional sections, drawn above.
function always_on(item, pg){
	text(item, "label");
	type_field(item, pg);
	text(item, "gap");
	pad_field(item, pg);
	axis_field(item, "width", pg);
	axis_field(item, "height", pg);
	bg_field(item, pg);
}

function section(title, fn){
	div.c("pg-section", () => { div.c("pg-section-head", title); fn(); });
}

// auto | flex | grid — switching CONVERTS the selected item in place, same id, same data,
// children moved onto the new instance (`Playground.js#convert`, pg-sidebar brief §2).
function type_field(item, pg){
	div.c("pg-field", () => {
		label.c("pg-field-label", "type");
		div.c("pg-seg", () => {
			const current = item instanceof Grid ? "grid" : item instanceof Flex ? "flex" : "auto";
			Object.keys(TYPES).forEach(opt => {
				button.c(`pg-seg-btn${current === opt ? " pg-seg-active" : ""}`, opt)
					.click(() => pg.convert(item, TYPES[opt]));
			});
		});
	});
}

// hug | fill | fixed, one axis. `fixed` alone reveals the length input — the reason this
// (and not the generic `seg`) has to call `paint_properties()`: the field it draws changes.
function axis_field(item, axis, pg){
	const raw = item.get(axis) || "hug";
	const is_len = raw !== "hug" && raw !== "fill";

	div.c("pg-field", () => {
		label.c("pg-field-label", axis);
		div.c("pg-seg", () => {
			["hug", "fill", "fixed"].forEach(opt => {
				const active = opt === "fixed" ? is_len : raw === opt;
				button.c(`pg-seg-btn${active ? " pg-seg-active" : ""}`, opt)
					.click(() => {
						item.set(axis, opt === "fixed" ? (is_len ? raw : "1em") : opt);
						pg.paint_properties();
					});
			});
		});
		if (is_len){
			input.c("pg-field-input").attr("type", "text").attr("value", raw)
				.on("change", e => { item.set(axis, e.target.value || "1em"); pg.paint_properties(); });
		}
	});
}

// Padding's own field: the honest value in the input (never the 0.25em floor — that's
// `styles()`'s job alone, decisions.md), plus the owner's one-click "make it visible" ask.
function pad_field(item, pg){
	div.c("pg-field", () => {
		label.c("pg-field-label", "pad");
		div.c("pg-seg", () => {
			input.c("pg-field-input").attr("type", "text").attr("value", item.get("padding") ?? "")
				.on("change", e => item.set("padding", e.target.value));
			button.c("pg-seg-btn", "1em").attr("title", "Quick-add 1em padding")
				.click(() => { item.set("padding", "1em"); pg.paint_properties(); });
		});
	});
}

function bg_field(item, pg){
	div.c("pg-field", () => {
		label.c("pg-field-label", "bg");
		dropdown({
			options: BG_TOKENS, value: item.get("bg") ?? "", title: "Background token",
			pick: value => { item.set("bg", value); pg.paint_properties(); },
		});
	});
}

function seg(item, key, options){
	div.c("pg-field", () => {
		label.c("pg-field-label", key);
		div.c("pg-seg", () => {
			const current = item.get(key) ?? "";
			options.forEach(opt => {
				button.c(`pg-seg-btn${current === opt ? " pg-seg-active" : ""}`, opt || "none")
					.click(() => item.set(key, opt));
			});
		});
	});
}

function text(item, key){
	div.c("pg-field", () => {
		label.c("pg-field-label", key);
		input.c("pg-field-input").attr("type", "text").attr("value", item.get(key) ?? "")
			.on("change", e => item.set(key, e.target.value))
			.on("focus", e => e.target.select());   // baseline paper cut: naive retype produced "headerBox"
	});
}

// `options[0]`, when given, is a unit suffix (design §5, "num" = "number + unit") —
// stripped for the field, reattached on write. No current field passes one; unit is "".
function num(item, key, options){
	const unit = options?.[0] ?? "";
	const raw = item.get(key) ?? "";
	div.c("pg-field", () => {
		label.c("pg-field-label", key);
		input.c("pg-field-input").attr("type", "number").attr("value", unit && raw ? raw.replace(unit, "") : raw)
			.on("change", e => item.set(key, e.target.value === "" ? "" : e.target.value + unit));
	});
}

export default properties;
