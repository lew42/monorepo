import { div } from "/app.js";
import { surface } from "../parts.js";

const stats = [["npm deps", "3"], ["build steps", "0"], ["core classes", "5"], ["tokens", "16"]];

// `--column` is what `grid auto` wraps on, so retuning it turns a card wall into
// a tile strip with no new selector.
export default () => div.c("grid gap auto", () => stats.forEach(([label, value]) =>
	div.c("pad flex v", () => {
		div.c("h4", label).style("color", "var(--subtle)");
		div.c("h2", value);
	}).style({ ...surface, gap: "0.1em" })
)).style("--column", "7em");
