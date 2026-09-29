import View, { div, span, small } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "ai.css");

/**
 * view(thing) — the smallest live picture of a real JS value: every property
 * shown with a leading dot (`.session_id`), its value beside it, and a nested
 * object indented one level in and drawn the same way, all the way down.
 *
 * This is a STAND-IN. task-mastermind-item-ui is building the real default
 * instance view at /framework/ux/Content/Object/DefaultView.js, exporting the
 * same `view(thing)` shape (it picks `Thing.View` when a class defines one,
 * else this default) — see public/framework/ai/2026-09-29/item-ui/. Once that
 * lands, every page using this file switches with a one-line import change:
 * swap `from "./ObjectView.js"` for `from "/framework/ux/Content/Object/DefaultView.js"`.
 * Kept under 60 lines on purpose — this is scaffolding, not a feature.
 */
export function view(thing, depth = 0){
	if (thing === null || typeof thing !== "object") return leaf(thing);
	if (depth >= 4) return leaf(Array.isArray(thing) ? `Array(${thing.length})` : "{…}");

	const entries = Array.isArray(thing) ? thing.map((v, i) => [`[${i}]`, v]) : Object.entries(thing).map(([k, v]) => [`.${k}`, v]);

	return div.c("ai-ov flex v gap-25", () => {
		if (!entries.length) small.c("muted", Array.isArray(thing) ? "[]" : "{}");
		entries.forEach(([key, value]) => row(key, value, depth));
	});
}

function row(key, value, depth){
	const nested = value !== null && typeof value === "object";
	div.c("ai-ov-row flex" + (nested ? " v" : " v-center gap-25"), () => {
		span.c("ai-ov-key muted", key);
		if (nested) view(value, depth + 1); else leaf(value);
	});
}

function leaf(value){
	if (value === undefined) return span.c("ai-ov-val muted", "undefined");
	return span.c("ai-ov-val", typeof value === "string" ? value : JSON.stringify(value));
}
