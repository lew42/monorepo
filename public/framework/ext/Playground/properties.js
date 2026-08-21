import { div, label, input, button } from "/framework/core/View/View.js";

/* No engine (design.md §5): each Item class declares `static fields = [[key, control,
 * options?], …]`. This module only knows how to draw three controls and read/write
 * `item.get`/`item.set` — `item.set()` emits `change`, and Playground.js's change path
 * (no repaint) does the rest, including the readout. The readout drawn here is only the
 * FIRST paint, for a freshly selected item; a later `change` updates it in place. */

const CONTROLS = { seg, text, num };

export function properties(item){
	div.c("pg-props-head", `${item.wire()}${item.data.label ? ` "${item.data.label}"` : ""}`);

	(item.constructor.fields ?? []).forEach(([key, control, options]) => {
		(CONTROLS[control] ?? text)(item, key, options);
	});

	div.c("pg-readout", item.styles());
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
			.on("change", e => item.set(key, e.target.value));
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
