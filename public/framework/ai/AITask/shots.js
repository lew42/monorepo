import { div, a, img, p, span } from "../../core/View/View.js";
import "../../ui/panel/panel.js";

const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith(".localhost");

/**
 * The wall of screenshots a worker logged this run — ext/JSONL's `shot` verb.
 * Lazy-loaded thumbnails, clickable to full size via `/screenshot`
 * (`Server/plugins/Screenshots.js`, dev-only). Off localhost — or before a
 * server restart has picked the route up — a shot renders its label over a
 * plain swatch rather than a request that's guaranteed to fail.
 */
export function shot_wall(list, base){
	if (!list?.length) return;
	div.c("ai-header", () => span.c("ai-group-title muted", `Screenshots · ${list.length}`));
	div.c("ai-shots", () => list.forEach(s => thumb(s, base)));
}

/** One thumbnail on its own — what an ask card shows when its task produced a picture. */
export const shot_thumb = s => thumb(s);

/** Where a shot's image is: a file outside the repo (`path`, served by /screenshot, which only serves the OS temp folder);
    an image committed beside its task (`url`); or, in older logs, a `path` inside `public/` or one relative to the task's
    own folder (`base`), which the site serves directly (through /screenshot they drew a 403). */
export function shot_src(s, base){
	const p = s.path?.replaceAll("\\", "/");
	if (p?.startsWith("public/")) return p.slice(6);
	if (p && base && !/^([a-z]:)?\//i.test(p)) return base + p;
	if (p) return "/screenshot?path=" + encodeURIComponent(s.path);
	return /\.(png|jpe?g|webp|gif)$/i.test(s.url ?? "") ? s.url : null;
}

function thumb(s, base){
	const src = shot_src(s, base);
	if (!src) return div.c("surface ai-shot missing", () => div.c("ui-panel-foot ai-shot-label muted", s.label ?? "screenshot"));
	let $shot;
	const body = () => {
		if (LOCAL) img.c("ai-shot-img").attr("src", src).attr("loading", "lazy")
			.attr("alt", s.label ?? s.url ?? "screenshot")
			.on("error", () => $shot.ac("missing"));
		div.c("ai-shot-fallback muted", "no image");
	};
	$shot = div.c("surface ai-shot" + (LOCAL ? "" : " missing"), () => {
		LOCAL ? a.c("ai-shot-frame").href(src).attr("target", "_blank").append(body)
			: div.c("ai-shot-frame", body);
		div.c("ui-panel-foot ai-shot-label muted", [s.label, s.width && s.width + "px"].filter(Boolean).join(" · "));
	});
}
