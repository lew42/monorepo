import { div, a, img, p, span } from "../../core/View/View.js";

const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith(".localhost");

/**
 * The wall of screenshots a worker logged this run — ext/JSONL's `shot` verb.
 * Lazy-loaded thumbnails, clickable to full size via `/screenshot`
 * (`Server/plugins/Screenshots.js`, dev-only). Off localhost — or before a
 * server restart has picked the route up — a shot renders its label over a
 * plain swatch rather than a request that's guaranteed to fail.
 */
export function shot_wall(list){
	if (!list?.length) return;
	div.c("ai-header", () => span.c("ai-group-title muted", `Screenshots · ${list.length}`));
	div.c("ai-shots", () => list.forEach(thumb));
}

function thumb(s){
	const src = "/screenshot?path=" + encodeURIComponent(s.path);
	let $shot;
	const body = () => {
		if (LOCAL) img.c("ai-shot-img").attr("src", src).attr("loading", "lazy")
			.attr("alt", s.label ?? s.url ?? "screenshot")
			.on("error", () => $shot.ac("missing"));
		div.c("ai-shot-fallback muted", "no image");
	};
	$shot = div.c("ai-shot" + (LOCAL ? "" : " missing"), () => {
		LOCAL ? a.c("ai-shot-frame").href(src).attr("target", "_blank").append(body)
			: div.c("ai-shot-frame", body);
		p.c("ai-shot-label muted", [s.label, s.width && s.width + "px"].filter(Boolean).join(" · "));
	});
}
