/* Colour arithmetic, in one file, with no dependency on the page that uses it.
 *
 * Everything here operates on what the BROWSER computed, never on a token name — a
 * page that reasoned about `--wash` would be documenting its own guess. `getComputedStyle`
 * returns colours already resolved through `light-dark()`, `color-mix()` and the cascade,
 * so parsing its string is reading the cascade's answer.
 *
 * ⚠ Compositing happens in gamma-encoded sRGB, which is what a browser actually does for
 *   normal `background-color` blending — NOT in linear light. Linearising first gives a
 *   different (and wrong) answer for what the eye will see on screen.
 */

/** "rgb(242, 242, 242)" / "rgba(0, 0, 0, 0.08)" / "color(srgb …)" → [r, g, b, a] */
export function parse(css){
	if (!css) return [0, 0, 0, 0];
	const n = css.match(/[\d.]+%?/g);
	if (!n) return [0, 0, 0, 0];
	const v = n.map(s => s.endsWith("%") ? parseFloat(s) / 100 : parseFloat(s));
	// `color(srgb r g b / a)` gives 0–1 channels; rgb() gives 0–255.
	const scale = css.startsWith("color(") ? 255 : 1;
	return [v[0] * scale, v[1] * scale, v[2] * scale, v.length > 3 ? v[3] : 1];
}

/** source-over: fg painted on bg. Returns an opaque triple. */
export function over(fg, bg){
	const a = fg[3];
	return [0, 1, 2].map(i => fg[i] * a + bg[i] * (1 - a));
}

/** CIE L*, 0–100. The honest "how light is this" number; ΔL* between two fills is
 *  what decides whether you can see the edge between them. */
export function lightness(rgb){
	const lin = rgb.map(c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
	const y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
	return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y;
}

/** WCAG 2 contrast ratio, 1–21. For a LABEL on its fill; the bar is 4.5. */
export function ratio(a, b){
	const lum = rgb => {
		const lin = rgb.map(c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
		return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
	};
	const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
}

export function hex(rgb){
	return "#" + rgb.slice(0, 3).map(c => Math.round(c).toString(16).padStart(2, "0")).join("");
}

/* The first ancestor that paints something. A chip's floor is not its parent — it is
 * whatever is underneath after every transparent box in between has been composited. */
export function floorOf(el){
	let stack = [], node = el.parentElement;
	while (node){
		const bg = parse(getComputedStyle(node).backgroundColor);
		if (bg[3] > 0) { stack.push(bg); if (bg[3] === 1) break; }
		node = node.parentElement;
	}
	// walk back down: the deepest opaque layer first, each translucent one over it
	let out = stack.pop() || [255, 255, 255, 1];
	while (stack.length) out = over(stack.pop(), out);
	return out;
}

/* How visible is this element against the floor beneath it?
 *
 * ⚠ `max(fill, border)`, never fill alone — a button whose fill matches the card but
 *   whose hairline does not is faint, not invisible, and a scan that ignores the border
 *   flags every default button on the site and teaches nothing. The framework knows this
 *   already: inline `code` carries an inset ring for exactly this reason (framework.css).
 */
export function visibility(el, floor){
	const c = getComputedStyle(el);
	const fill = over(parse(c.backgroundColor), floor);
	let best = Math.abs(lightness(fill) - lightness(floor)), via = "fill";

	const w = ["Top", "Right", "Bottom", "Left"].map(s => parseFloat(c["border" + s + "Width"]) || 0);
	if (Math.max(...w) >= 0.5){
		const edge = over(parse(c.borderTopColor), floor);
		const d = Math.abs(lightness(edge) - lightness(floor));
		if (d > best) { best = d; via = "border"; }
	}
	// an inset ring is a border drawn as a shadow — three modules use one, so it counts
	const ring = c.boxShadow && c.boxShadow.includes("inset") && c.boxShadow.match(/(rgba?\([^)]+\)|color\([^)]+\))/);
	if (ring){
		const d = Math.abs(lightness(over(parse(ring[0]), floor)) - lightness(floor));
		if (d > best) { best = d; via = "ring"; }
	}
	return { edge: best, via, fill, floor, text: ratio(over(parse(c.color), fill), fill) };
}

/* The bar. ΔL* of 3 is roughly "you notice it without looking for it" on a screen —
 * calibrated on this site against a KNOWN-bad pair (a default `button` on a `.surface`
 * card: fill ΔL 0.00, hairline ΔL 2.7) and a known-good one (`button.prim` on the same
 * card: ΔL 29). Both land on the right side of 3, which is the only claim being made. */
export const BAR = 3;
