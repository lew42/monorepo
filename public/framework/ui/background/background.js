import { div, span, icon, is } from "../../core/View/View.js";
import { css } from "../parts.js";

/**
 * background(kind, options) — one line that drops a swappable layer behind
 * whatever a box already holds.
 *
 *     div.c("hero", () => {
 *         background("dots");
 *         h1("Title");
 *     });
 *
 *     background("scatter", { icons: ["star", "bolt"], count: 24, seed: 7 });
 *     background(() => { div.c("my-own-layer"); });   // a raw function is its own kind
 *
 * `kind` is one of KIND_NAMES below, or a function — `draw($layer, options)` — for a
 * one-off. Call it INSIDE any box, as the first thing you build in it (see readme.md
 * for why order doesn't actually matter here — `.background` always paints at the
 * back regardless of where in the DOM it sits, because z-index puts it there).
 *
 * The box this sits in — the "host" — needs nothing beyond `:has(> .background)`
 * reading (automatic, below) OR the class `.has-background` when the layer isn't a
 * literal direct child. Nothing else to remember; that's the whole contract.
 *
 * Design record: readme.md, doc/decisions.md.
 */
export function background(kind, options = {}){
	const draw = is.fn(kind) ? kind : KINDS[kind];

	return div.c("background", $bg => {
		$bg.attr("aria-hidden", "true");

		if (draw) draw($bg, options);
		else span.c("background-unknown", `background(): no such kind "${kind}"`);
	});
}

/* ---- the host contract ------------------------------------------------------
   `.background` is `position: absolute`, so IT needs a positioned ancestor to
   measure `inset: 0` against — the host. `:has(> .background)` finds that host
   with zero work from whoever calls `background()`: the one-line promise above
   holds with NO second class to remember. `.has-background` rides the same rule
   for the one case `:has()` can't reach — the layer isn't a literal direct child
   (composed by a subclass, teleported by a framework, built before its parent is
   attached). `:where()` keeps the whole selector at zero specificity, so a host's
   own layout classes are never outweighed by this. doc/decisions.md #1. */
css(`@layer theme {
	:where(.has-background, :has(> .background)) { position: relative; isolation: isolate; }

	/* THE PRIMITIVE. z-index: 0 (not -1): a layer that is ALSO meant to sit in
	   front of the host's own flat fill (a ground under a texture, say) needs a
	   real stacking level, and isolation: isolate on the host keeps that level
	   from leaking past it either way. overflow: hidden clips every kind below
	   to the host's own box — a blob or a wave never bleeds past its corner.
	   pointer-events: none + aria-hidden are what make "never intercepts a
	   click" true BY CONSTRUCTION, proven in doc/decisions.md #3: a click always
	   reaches whatever is under the cursor next, even in the one layout (plain,
	   unpositioned content, no wrapper) where the layer still PAINTS on top of it. */
	.background {
		position: absolute;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
	}

	/* THE HABIT — doc/decisions.md #2. Content that wants to be seen, not just
	   clicked, takes this: position: relative gives it a real stack level (the
	   same one .background has), and z-index: 1 breaks the tie in its favour
	   — two siblings at a real stack level paint in DOM order, and .background
	   is always first. The padding rides here too, never on the host: padding on
	   the host would inset .background's inset: 0 right along with it (inset
	   resolves against the PADDING box of a positioned ancestor), pulling the
	   layer off the host's true edge. */
	.background-content { position: relative; z-index: 1; }

	.background-unknown {
		display: flex; align-items: center; justify-content: center;
		height: 100%; padding: 1em; text-align: center;
		border: 1px dashed var(--line); box-sizing: border-box;
		color: var(--subtle); font-size: 0.85em;
	}

	/* ---- the kinds ---- */

	/* 1. ground — one flat token. Never the bare colour: every kind reads a
	   token so dark mode is free and a theme swap moves every card at once. */
	.background-ground { background: var(--ground, var(--surface)); }

	/* 2. gradient — two stops of the SAME ladder used everywhere else on the
	   site (--darken/--lighten), so it has no opinion framework.css doesn't
	   already have. */
	.background-gradient {
		background: linear-gradient(var(--angle, 135deg), var(--darken-2), var(--surface) 55%, var(--lighten-2));
	}

	/* 3. dots — a radial-gradient repeated as its own background-image, em
	   sized so the dot grid keeps its density at any zoom instead of the pixel
	   grid px would give it. --darken-3 is already the alpha the colour
	   system rates as "reads as its own surface" — no extra opacity to tune. */
	.background-dots {
		background-image: radial-gradient(currentColor 0.08em, transparent 0.08em);
		background-size: 1.4em 1.4em;
		color: var(--darken-3);
	}

	/* 4. grid — two repeating hairlines, one each axis. */
	.background-grid {
		background-image:
			repeating-linear-gradient(to right, var(--darken-2) 0 1px, transparent 1px 2.2em),
			repeating-linear-gradient(to bottom, var(--darken-2) 0 1px, transparent 1px 2.2em);
	}

	/* 5. stripes — the same repeating-linear-gradient trick, on the diagonal. */
	.background-stripes {
		background-image: repeating-linear-gradient(45deg, var(--darken-1) 0 0.6em, transparent 0.6em 1.6em);
	}

	/* 6. texture — the site's OWN icon font, tiled. .background-texture-grid
	   is a plain auto-fill grid: it asks CSS for as many columns as the host is
	   wide, em-sized, so it densifies rather than pixelating at 3440 — see
	   doc/decisions.md #4 for why em over a cqi container query here.
	   --rotate is the one thing background() sets per call; the colour and
	   opacity are fixed, because they are the number doc/decisions.md #5
	   measured against real body text and will not survive every value. */
	.background-texture-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(2.4em, 1fr));
		gap: 0.4em;
		width: 100%; height: 100%;
	}
	.background-texture-grid .icon {
		font-size: 1.5em;
		color: var(--ink);
		opacity: 0.09;
		transform: rotate(var(--rotate, -15deg));
		justify-self: center;
	}

	/* 7. scatter — several icons, seeded (background.js's scatter()), so the
	   SAME layout paints every load. Sparse by default (18 of them) and the
	   same low, measured opacity as the texture. */
	.background-scatter .icon {
		position: absolute;
		color: var(--ink);
		opacity: 0.16;
	}

	/* 8. blobs — three plain divs, blurred. --prim needs its own opacity (it is
	   the one OPAQUE token here); --darken-3/--lighten-3 already carry theirs.
	   ⚠ Found on the wall at 400px: the FIRST size tried (14/18/10em, a 2.2em
	   blur) was sized for a hero and swallowed an 11em-tall demo card whole — one
	   grey smear, no corners, the "text sits away from the blobs" assumption in
	   doc/decisions.md #5 false at that size. Smaller and tighter reads as three
	   corner glows at both a card and a hero. */
	.background-blobs { width: 100%; height: 100%; }
	.background-blob { position: absolute; border-radius: 999px; filter: blur(1.5em); }
	.background-blob:nth-child(1) {
		top: -3em; left: -3em; width: 8em; height: 8em;
		background: var(--prim); opacity: 0.16;
	}
	.background-blob:nth-child(2) {
		bottom: -3.5em; right: -2.5em; width: 10em; height: 10em;
		background: var(--darken-3);
	}
	.background-blob:nth-child(3) {
		top: 60%; left: 72%; width: 6em; height: 6em;
		background: var(--lighten-3);
	}

	/* 9. wave — one SVG path, filled from CSS (an SVG presentation ATTRIBUTE
	   does not reliably read var(), a class on the path does). */
	.background-wave { position: absolute; left: 0; right: 0; bottom: 0; height: 35%; }
	.background-wave svg { display: block; width: 100%; height: 100%; }
	.background-wave-path { fill: var(--darken-2); }

	/* 10. spotlight — a radial-gradient anchored on two custom properties, so
	   it can be re-centred with nothing but a style() call — background("spotlight",
	   { follow: true }) does exactly that, live, off the pointer. */
	.background-spotlight {
		background: radial-gradient(28em circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--lighten-3), transparent 65%);
	}
}`);

/* ---- kind implementations ---------------------------------------------------
   Each takes ($layer, options) and builds inside it — the captor is already
   `$layer` (background()'s own div.c() callback), so a factory call here lands
   in the right place with no extra wiring, the same as any other capture fn. */

const TEXTURE_COUNT = 240;    // enough columns × rows for a 3440 hero; overflow: hidden clips the rest
const SCATTER_ICONS = ["star", "bolt", "favorite", "circle", "diamond", "eco"];

function texture($layer, { icon: name = "star", rotate = -15 } = {}){
	$layer.ac("background-texture").style("--rotate", `${rotate}deg`);
	div.c("background-texture-grid", () => {
		for (let i = 0; i < TEXTURE_COUNT; i++) icon(name);
	});
}

// mulberry32 — a tiny seeded PRNG (public domain shape). Deterministic: the same
// seed draws the same sequence every load, every reader, forever — no dependency.
function mulberry32(seed){
	let a = seed >>> 0;
	return function(){
		a |= 0; a = (a + 0x6D2B79F5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function scatter($layer, { icons = SCATTER_ICONS, count = 18, seed = 1 } = {}){
	const rand = mulberry32(seed);

	$layer.ac("background-scatter");

	for (let i = 0; i < count; i++){
		const name = icons[Math.floor(rand() * icons.length)];
		const left = (rand() * 96).toFixed(1);
		const top = (rand() * 88).toFixed(1);
		const size = (0.9 + rand() * 1.5).toFixed(2);
		const rotate = Math.round(rand() * 360);

		icon(name).style({
			left: `${left}%`,
			top: `${top}%`,
			fontSize: `${size}em`,
			transform: `rotate(${rotate}deg)`,
		});
	}
}

const WAVE_SVG = `<svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">` +
	`<path class="background-wave-path" d="M0 22 C 40 2, 60 42, 100 22 S 160 2, 200 22 L200 40 L0 40 Z"></path>` +
	`</svg>`;

// html_unsafe(), not html(): the Sanitizer API (View.html()'s default) strips a
// bare `class` attribute off an SVG <path> — found live, the path fell back to
// the SVG default fill (black), a solid bar across the card, nothing thrown. This
// string is 100% our own static markup, never user input, so raw is the right tool.
function wave($layer){
	div.c("background-wave").html_unsafe(WAVE_SVG);
}

function spotlight($layer, { follow = false } = {}){
	$layer.ac("background-spotlight");

	// Off by default — a static centred glow. `follow: true` re-centres it on the
	// POINTER over the host, proving "can follow a CSS variable" live rather than
	// only saying so: the whole interaction is two custom properties.
	if (!follow) return;

	const $host = $layer.el.parentElement;
	if (!$host) return;

	$host.addEventListener("pointermove", e => {
		const box = $host.getBoundingClientRect();
		$layer.style("--spot-x", `${((e.clientX - box.left) / box.width * 100).toFixed(1)}%`);
		$layer.style("--spot-y", `${((e.clientY - box.top) / box.height * 100).toFixed(1)}%`);
	});
}

function ground($layer, { tone = "surface" } = {}){
	$layer.ac("background-ground").style("--ground", `var(--${tone})`);
}

function gradient($layer, { angle = "135deg" } = {}){
	$layer.ac("background-gradient").style("--angle", angle);
}

function blobs($layer){
	div.c("background-blobs", () => {
		span.c("background-blob");
		span.c("background-blob");
		span.c("background-blob");
	});
}

export const KINDS = {
	ground,
	gradient,
	dots: $layer => $layer.ac("background-dots"),
	grid: $layer => $layer.ac("background-grid"),
	stripes: $layer => $layer.ac("background-stripes"),
	texture,
	scatter,
	blobs,
	wave,
	spotlight,
};

export const KIND_NAMES = Object.keys(KINDS);

export default background;
