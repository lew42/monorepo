import { div, span, a, img, p } from "/app.js";

const AXES = ["layout", "typography", "contrast", "density", "hierarchy"];
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith(".localhost");

/* Same formula as human-ranking/rank/duel.js's `src()` — the loopback-only
   /screenshot route (Server/plugins/Screenshots.js) is the only way to reach a
   shot that lives outside the repo (RULE#12). */
const src = image => "/screenshot?path=" + encodeURIComponent(image);

export function row(entry, rank, shot){
	div.c("vision-row surface pad", () => {
		head(entry, rank);
		div.c("vision-body flex gap-2em wrap", () => {
			picture(entry, shot);
			div.c("vision-axes grid auto gap flex-1", () => AXES.forEach(axis => block(entry, axis)))
				.style("--column", "20em");
		});
	});
}

function head(entry, rank){
	div.c("vision-head flex split gap wrap v-baseline", () => {
		div.c("flex gap v-baseline", () => {
			span.c("vision-rank muted", "#" + rank);
			a.c("vision-url", entry.url).href(entry.url).attr("target", "_blank");
		});
		div.c("flex v", () => {
			span.c("vision-overall-n", entry.overall);
			span.c("h4 muted", "overall");
		});
	});
}

/* ⚠ Real width/height, always — a lazy image with no intrinsic size leaves its
   box 2px tall until the bytes land (today's CLS bug on the report page). */
function picture(entry, shot){
	if (!LOCAL) return div.c("vision-gone surface muted pad", "Screenshot unavailable off localhost.");

	a.c("vision-shot").href(src(entry.image)).attr("target", "_blank")
		.append(() => img.c("vision-img").attr("src", src(entry.image)).attr("width", shot.width).attr("height", shot.height)
			.attr("loading", "lazy").attr("alt", entry.url));
}

function block(entry, axis){
	div.c("vision-axis flex v gap", () => {
		div.c("flex split gap v-baseline", () => {
			span.c("h4 muted", axis);
			span.c("vision-score", entry.scores[axis]);
		});
		p(entry.feedback[axis]);
	}).style("--gap", ".35em");
}
