import { div, a, span } from "/app.js";

// Real urls, so Router.mark_links() paints `.in-path` on every ancestor of
// wherever you are reading this — and `.page-link` turns that into the accent.
// The trail marks itself; nothing here looks at the current url.
const trail = [
	["Framework", "/framework/"],
	["Styles", "/framework/styles/"],
	["Components", "/framework/styles/components/"],
];

export default () => div.c("flex wrap v-center h4", () => {
	trail.forEach(([text, url]) => {
		a.c("page-link", text).href(url).style("textDecoration", "none");
		span("/").style("color", "var(--subtle)");
	});
	span("Breadcrumbs").style("color", "var(--subtle)");
}).style("gap", "0.5em");
