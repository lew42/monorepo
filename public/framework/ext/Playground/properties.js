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

	pg.$readout = div.c("pg-readout");
	paint_readout(pg, item.styles(), pg.last_change?.key, pg.last_change?.before);
}

/* The readout, one line per declaration, so the LAST CHANGE can be pointed at instead of
 * hidden inside a semicolon-joined string (ux proposal §Learnability 1 — "`apply_change(key)`
 * already knows the key"). `before` is the node's own previous `style` attribute; the diff
 * of the two IS the attribution, so no key → CSS-property lookup table has to exist or stay
 * in sync with `items.js`. Omit `before` (the first paint of a selection) and nothing is
 * highlighted — there is no "last change" to name yet.
 *
 * The honest third case is the interesting one: plenty of words write NO declaration at all
 * (`hug` on a flex main axis, `fill` on a stretching cross axis — six of eighteen cells,
 * items.js). Saying so out loud is the lesson; silence would read as a broken control. */
export function paint_readout(pg, style, key, before){
	const was = (before ?? "").split("; ").filter(Boolean);
	const now = style.split("; ").filter(Boolean);
	const fresh = now.filter(d => !was.includes(d));
	const gone = was.filter(d => !now.includes(d));

	pg.$readout.empty(() => {
		now.forEach(d => div.c("pg-decl", d).ac(before !== undefined && fresh.includes(d) && "pg-decl-new"));
		if (key === undefined) return;
		div.c("pg-decl-note", fresh.length ? `↑ ${key}`
			: gone.length ? `${key} — removed ${gone.join("; ")}`
			: `${key} — writes no CSS here (the default already does it)`);
	});
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

/* auto | flex | grid — switching CONVERTS the selected item in place, same id, same data,
 * children moved onto the new instance (`Playground.js#convert`, pg-sidebar brief §2).
 *
 * Choosing `grid` WRITES `1fr 1fr` into `columns` (pg-edges item 4). A grid still costs two
 * gestures — a template is information, not a click — but the second one is now an edit of a
 * real value already on screen and already drawn, instead of finding an empty field and
 * inventing the syntax. It never overwrites a template the document already had. */
function type_field(item, pg){
	div.c("pg-field", () => {
		label.c("pg-field-label", "type");
		div.c("pg-seg", () => {
			const current = item instanceof Grid ? "grid" : item instanceof Flex ? "flex" : "auto";
			Object.keys(TYPES).forEach(opt => {
				button.c(`pg-seg-btn${current === opt ? " pg-seg-active" : ""}`, opt)
					.click(() => {
						const made = pg.convert(item, TYPES[opt]);
						if (TYPES[opt] === Grid && !made.get("columns")){
							made.set("columns", "1fr 1fr");
							pg.paint_properties();   // the field itself has to show the value it was just given
						}
					});
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
