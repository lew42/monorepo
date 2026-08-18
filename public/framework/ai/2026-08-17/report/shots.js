import { div, a, img, p, figure, figcaption } from "/app.js";

const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith(".localhost");

/* A shot taken outside the repo (RULE#12) is reachable only through the
   loopback-only /screenshot route; one taken into a task dir is a static asset
   and works everywhere. `tmp()` marks the first kind, so off localhost it says
   so instead of painting a broken frame. */
export const tmp = path => "/screenshot?path=" + encodeURIComponent(path);

const unreachable = src => src.startsWith("/screenshot") && !LOCAL;

/**
 * One shot, its caption, clickable to full size in a new tab.
 * ⚠ `[w, h]` is the PNG's own size and is not optional: a lazy image with no
 * intrinsic size leaves a 2px-tall link until it loads, so the page reflows
 * under the reader — `hit-size` reported exactly that, twice.
 */
export function shot([src, [w, h], caption]){
	return figure.c("report-shot flex v gap", () => {
		if (unreachable(src)) div.c("report-gone surface muted pad", "This shot lives outside the repo — open the report on localhost to see it.");
		else a.c("report-frame surface").href(src).attr("target", "_blank")
			.append(() => img.c("report-img").attr("src", src).attr("width", w).attr("height", h)
				.attr("loading", "lazy").attr("alt", caption));

		figcaption.c("muted", caption);
	});
}

/** Before beside after — one basis, no breakpoint, so a narrow region stacks them. */
export function pair(before, after){
	return div.c("report-pair", () => { shot(before); shot(after); });
}

/** The evidence row under a claim: the number first, its name muted under it. */
export function figures(rows){
	return div.c("report-figures", () => rows.forEach(([label, value]) =>
		div.c("report-fig surface pad flex v", () => { p.c("report-fig-n", value); p.c("h4 muted", label); })));
}
