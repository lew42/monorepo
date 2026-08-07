/* The sweep, as code you can run rather than a number you have to trust.
 *
 * Everything here reads the LIVE document — the same six checks that produced
 * the ranked table in the report, against whatever is on screen right now. So a
 * seat fixing their section can watch the count go down instead of asking me.
 */

const luminance = ([r, g, b]) => {
	const channel = c => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const rgb = value => (value.match(/\d+/g) ?? [0, 0, 0]).slice(0, 3).map(Number);

// the nearest ancestor that actually paints, because a transparent parent is not the backdrop
const behind = node => {
	for (let up = node; up; up = up.parentElement){
		const colour = getComputedStyle(up).backgroundColor;
		if (colour && !/rgba\(0, 0, 0, 0\)|transparent/.test(colour)) return rgb(colour);
	}
	return [255, 255, 255];
};

export const contrast = (front, back) => {
	const [light, dark] = [luminance(front), luminance(back)].sort((a, b) => b - a);
	return (light + 0.05) / (dark + 0.05);
};

const visible = node => node.getClientRects().length > 0;

// 18.66px bold or 24px plain is "large text", and large text only needs 3:1
const large = style => parseFloat(style.fontSize) >= 24
	|| (parseFloat(style.fontSize) >= 18.66 && +style.fontWeight >= 700);

/* One element per colour+class pair, because a page with forty .note paragraphs
 * has one finding, not forty. Only elements with their OWN text: a wrapper
 * inherits its children's text and would report a colour it never paints.
 */
export function contrast_failures(root = document.querySelector(".app")){
	const found = new Map();

	root.querySelectorAll("*").forEach(node => {
		if (!visible(node)) return;
		if (![...node.childNodes].some(child => child.nodeType === 3 && child.textContent.trim())) return;

		const style = getComputedStyle(node);
		const ratio = contrast(rgb(style.color), behind(node));
		const needs = large(style) ? 3 : 4.5;
		if (ratio >= needs) return;

		const key = (node.className || node.tagName) + style.color;
		if (!found.has(key)) found.set(key, {
			selector: node.tagName.toLowerCase() + (node.className ? "." + String(node.className).trim().split(/\s+/).join(".") : ""),
			ratio: Math.round(ratio * 100) / 100,
			needs,
			size: Math.round(parseFloat(style.fontSize) * 10) / 10,
			text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 30),
		});
	});

	return [...found.values()].sort((a, b) => a.ratio - b.ratio);
}

/* A horizontally scrollable box is keyboard-operable in Chrome, which makes it a
 * tab stop. With no role and no name, that stop is announced as its entire text.
 */
export function unnamed_scrollers(root = document.querySelector(".app")){
	return [...root.querySelectorAll("pre, div, section, td")]
		.filter(visible)
		.filter(node => node.scrollWidth > node.clientWidth + 1)
		.filter(node => !node.getAttribute("aria-label") && node.tabIndex < 0)
		.map(node => ({
			tag: node.tagName.toLowerCase(),
			width: Math.round(node.scrollWidth - node.clientWidth),
			text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 40),
		}));
}

export const controls = (root = document.querySelector(".app")) =>
	[...root.querySelectorAll("a[href], button, input, select, textarea, summary")].filter(visible);

// SC 2.5.8 wants 24×24 CSS px
export function small_targets(root){
	return controls(root).map(node => ({ node, box: node.getBoundingClientRect() }))
		.filter(({ box }) => box.height < 24 || box.width < 24)
		.map(({ node, box }) => ({
			text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 24) || "(no text)",
			size: `${Math.round(box.width)}×${Math.round(box.height)}`,
		}));
}

// SC 4.1.2 / 2.4.4 — a control nobody can name is a control nobody can use
export function nameless_controls(root){
	return controls(root)
		.filter(node => !(node.getAttribute("aria-label") ?? node.getAttribute("title") ?? node.textContent.trim()))
		.map(node => ({ tag: node.tagName.toLowerCase(), cls: node.className || "(no class)", html: node.innerHTML.slice(0, 30) }));
}

export function landmarks(root = document.querySelector(".app")){
	const selector = "main, nav, header, footer, aside, [role=main], [role=navigation], [role=region], [role=banner], [role=contentinfo]";
	return [...root.querySelectorAll(selector)].filter(visible)
		.map(node => `${node.tagName.toLowerCase()}${node.getAttribute("role") ? `[${node.getAttribute("role")}]` : ""} "${node.getAttribute("aria-label") ?? ""}"`);
}

// a level skipped is a level a screen reader user thinks they missed
export function heading_skips(root = document.querySelector(".app")){
	const levels = [...root.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible).map(node => +node.tagName[1]);
	return levels.filter((level, i) => i && level - levels[i - 1] > 1).length;
}

export const reflow = () => document.documentElement.scrollWidth > window.innerWidth + 1;

/* Everything, in one object. The report's ranked table is this, run once per
 * section, sorted — nothing in it was typed by hand. */
export function sweep(root = document.querySelector(".app")){
	return {
		contrast: contrast_failures(root),
		scrollers: unnamed_scrollers(root),
		small: small_targets(root),
		nameless: nameless_controls(root),
		landmarks: landmarks(root),
		skips: heading_skips(root),
		reflow: reflow(),
		controls: controls(root).length,
	};
}
