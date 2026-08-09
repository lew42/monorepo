import { div } from "../../core/View/View.js";
import { component } from "../parts.js";

/**
 * stats(["npm deps", "3"], ["build steps", "0"], …) — a tile strip.
 *
 * `grid auto` wraps on `--column`, so shrinking that token turns a card wall
 * into a row of tiles with no new selector. Retune it: `.style("--column", "12em")`.
 */
export const stats = component((...items) => div.c("ui-stats grid gap auto", () =>
	items.forEach(([label, value]) => div.c("ui-stat ui-surface pad flex v gap", () => {
		div.c("h4 ui-muted", label);
		div.c("h2", value);
	}).style("--gap", "0.1em"))).style("--column", "9em"));

export default stats;
