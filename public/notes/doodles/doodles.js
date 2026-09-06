import { View } from "/app.js";

/* The doodles from the owner's notebook, redrawn by hand as SVG.
 *
 * Every entry below is one drawing: `box` is its viewBox, `d` is the markup —
 * a few <path> elements, nothing else. None of them is a traced photograph.
 * Each was drawn by eye against the crop of the same name in ref/, so the
 * proportions are the notebook's and the line is a line, not an outline.
 *
 * Two rules keep them all interchangeable:
 *   - No colour anywhere. `.doodle` in doodles.css paints them with
 *     `currentColor`, so a doodle is whatever colour its text is, in dark
 *     mode and light alike.
 *   - No stroke width or line cap here either — same reason. One rule in the
 *     stylesheet sets them for all twenty-three, so they are one family.
 *
 * ⚠ Every path carries `pathLength="100"`. It costs nothing to draw and it is
 * what makes the drawn-on animation work: with the length normalised, one CSS
 * rule (`stroke-dasharray: 100`) animates any of them without measuring
 * anything. See doodles.css `.doodle-draw`. */
const shapes = {

	// ── the small marks, in the margins ──────────────────────────────────────
	star: { box: "0 0 24 24", note: "the scratched four-point star — the mark that recurs most",
		d: 'M11.6 2.9 C12.5 8.5 12.9 15.3 12.3 21.1 M2.8 12.6 C8.3 12 16 11.6 21.3 12.3'
			+ ' M7.4 7.6 C9.3 9.7 13.3 14.1 16.5 16.9 M16.7 7.4 C14.6 9.6 10.2 14.2 7.5 16.8' },

	pentagram: { box: "0 0 24 24", note: "the five-point star, drawn without lifting the pencil",
		d: 'M12.1 2.6 L16.4 20.5 L2.8 9.1 L21.4 9.7 L7.5 20.8 Z' },

	zigzag: { box: "0 0 24 24", note: "the lightning stroke, drawn down the margin",
		d: 'M7.6 2.4 L16.4 6.5 L7.3 10.2 L16.6 14.1 L7.5 17.9 L16.2 21.6'
			+ ' M8.7 4.2 L15.3 5 M8.5 15.9 L15.5 16.7' },

	diamonds: { box: "0 0 24 24", note: "a diamond inside a diamond, corners overshooting",
		d: 'M12.1 2.4 L21.5 12.1 L11.9 21.6 L2.6 11.9 Z M12 7.4 L16.7 12.1 L12 16.8 L7.3 12 Z'
			+ ' M2.6 11.6 L5.2 9.1 M21.4 12.4 L18.8 15' },

	squares: { box: "0 0 24 24", note: "squares inside squares, tilted, with a tail",
		d: 'M3.4 5.3 L18.9 3.1 L21 18.5 L5.4 20.8 Z M7 8.6 L15.5 7.3 L16.8 15.8 L8.2 17.1 Z'
			+ ' M10.4 11.7 L12.9 11.3 L13.3 13.8 L10.8 14.1 Z M13.3 13.8 L16.4 16.7' },

	bowtie: { box: "0 0 24 24", note: "an hourglass — an X capped top and bottom",
		d: 'M5.6 4.2 L18.4 3.9 M5.7 4.3 L18.2 19.6 M18.3 4 L5.6 19.7 M5.6 19.8 L18.4 19.4' },

	wave: { box: "0 0 24 24", note: "the squiggle that joins two thoughts",
		d: 'M2.4 14.7 C4.6 8.3 8.3 7.4 10.9 11.8 C13.4 16.3 16.7 17 19 13.1 C19.9 11.6 20.9 10.4 21.6 9.8' },

	// ── the working marks, in the sentences ──────────────────────────────────
	arrow: { box: "0 0 24 24", note: "the arrow — the busiest mark in the notebook",
		d: 'M2.6 13.2 C8 11.4 14.6 10.8 21.2 11.4 M15.4 7.6 L21.4 11.5 L15.2 15.3' },

	hook: { box: "0 0 24 24", note: "the turn-down arrow that hangs a note under a line",
		d: 'M8.2 3.4 C7.6 8 7.8 12.4 8.4 16.6 M8.4 16.6 C11.6 17.1 15.4 17 19.4 16.4'
			+ ' M15.4 12.8 L19.6 16.4 L15.2 19.8' },

	check: { box: "0 0 24 24", note: "the ticked box, drawn with the tick running out of it",
		d: 'M3.8 5.4 L18.6 4.4 L19.4 18.8 L4.6 19.9 Z M7.2 12.4 L10.6 16.8 L21.2 2.8' },

	span: { box: "0 0 24 24", note: "the measure bar — this much, from here to here",
		d: 'M4.2 12.1 C9 11.7 15.6 11.7 19.9 12.2 M4.2 7.6 C4 9.8 4.1 14.4 4.2 16.6'
			+ ' M19.9 7.4 C20.1 9.6 20 14.2 19.8 16.5 M7.6 9.4 L4 12.1 L7.5 14.7'
			+ ' M16.4 9.5 L20 12.2 L16.5 14.8' },

	spike: { box: "0 0 24 24", note: "the jagged line that goes up and to the right",
		d: 'M2.6 20.4 L5.8 15.2 L8.2 17.4 L11.4 11.6 L14 13.6 L17.4 6.8 L19.9 3.2'
			+ ' M15.4 3.7 L20 3.1 L20.5 7.7' },

	// ── the sketching marks, in the wireframes ───────────────────────────────
	scribble: { box: "0 0 24 24", note: "two lines of writing, stood in for",
		d: 'M2.6 8.4 L4.9 4.6 L7.2 9 L9.4 4.4 L11.7 8.8 L14 4.5 L16.2 8.9 L18.5 4.6 L20.8 8.6'
			+ ' M2.8 18.2 L5.1 14.4 L7.3 18.8 L9.6 14.2 L11.9 18.6 L14.2 14.3 L16.4 18.7 L18.7 14.4 L21 18.4' },

	crossed: { box: "0 0 24 24", note: "the crossed box — where a picture goes",
		d: 'M2.6 5.2 L21.4 4.6 L21.2 19.4 L2.8 19.8 Z M2.8 5.4 L21.1 19.2 M21.3 5 L2.8 19.6' },

	frame: { box: "0 0 24 24", note: "a storyboard frame with somebody in it",
		d: 'M2.6 6.4 L20.4 3.2 L21.4 17.4 L3.6 20.7 Z'
			+ ' M8.4 9.2 C11.6 7.4 15.6 9.2 15.8 12.4 C16 15.6 12.6 17.6 9.8 16.4 C7.2 15.3 6.4 10.4 8.4 9.2 Z'
			+ ' M11.2 10.2 C12.6 9.6 13.8 10.6 13.5 11.8 C13.2 13 11.5 13.3 10.9 12.4 C10.4 11.6 10.5 10.5 11.2 10.2 Z'
			+ ' M9.9 15.9 C10.2 14.2 11 13.3 12.2 13.3 C13.4 13.3 14.3 14.2 14.6 15.4' },

	wireframe: { box: "0 0 64 36", note: "a page, sketched: two rails and a picture",
		d: 'M2.4 3.6 L61.6 2.8 L61.2 33.2 L2.8 33.8 Z'
			+ ' M18.6 3.4 C18.8 13 18.7 24 18.6 33.6 M46.4 3 C46.2 12.6 46.3 23.8 46.4 33.4'
			+ ' M5.4 9.2 L15.6 8.8 M5.5 13 L14 12.8 M5.4 16.6 L15.4 16.4 M5.6 24.6 L15.2 24.4'
			+ ' M22.6 8.4 L42.6 7.8 L42.4 28.2 L22.8 28.6 Z'
			+ ' M32.6 13.2 L33 22.9 M27.9 18.2 L37.6 17.8 M29.3 14.5 L36.4 21.6 M36.6 14.4 L29.2 21.4'
			+ ' M49.6 8.6 L58.6 8.2 M49.7 12.4 L57.4 12.2 M49.6 16 L58.4 15.8' },

	// ── the drawings, one of each ────────────────────────────────────────────
	/* ⚠ Quadratics, not cubics. The first draft drew this star with C curves whose
	   control points sat almost on the line between their ends, and every arm
	   collapsed into the spine — it rendered as a vertical scratch. A Q curve with
	   one control point pulled hard toward the centre is what makes a star arm
	   concave, and it cannot degenerate the same way. */
	compass: { box: "0 0 48 48", note: "the big four-point star, drawn twice over with an eye",
		d: 'M24 2 Q26 20 30 22.5 Q34 24 46 24 Q34 24.2 30 25.6 Q26 28.2 24.2 46'
			+ ' Q22.2 28.2 18.2 25.6 Q14 24.2 2 24 Q14 23.8 18 22.4 Q22 19.8 24 2 Z'
			+ ' M24 11 Q25.2 20.6 27.6 22.4 Q30 23.8 37 24 Q30 24.3 27.6 25.7 Q25.2 27.6 24 37.4'
			+ ' Q22.8 27.6 20.4 25.7 Q18 24.3 11 24 Q18 23.8 20.4 22.4 Q22.8 20.6 24 11 Z'
			+ ' M22.5 22.6 C24 21.3 25.7 22.4 25.5 24.2 C25.3 26.1 23.4 26.7 22.5 25.7'
			+ ' C21.6 24.7 21.6 23.3 22.5 22.6 Z' },

	truss: { box: "0 0 28 64", note: "the lattice tower, drawn down a whole margin",
		d: 'M7.6 12.5 C7.2 26 7.4 39 7.8 51.4 M20.4 12.2 C20.8 25.8 20.6 39 20.2 51.6'
			+ ' M14 2.4 L20.4 12.2 L14 15.4 L7.6 12.5 Z M7.8 51.4 L14 48.4 L20.2 51.6 L14 61.4 Z'
			+ ' M7.6 12.5 L20.6 25.6 M20.4 12.2 L7.5 25.8 M7.5 25.8 L20.5 38.8 M20.6 25.6 L7.6 38.9'
			+ ' M7.6 38.9 L20.2 51.6 M20.5 38.8 L7.8 51.4'
			+ ' M7.5 25.8 L20.6 25.6 M7.6 38.9 L20.5 38.8' },

	camera: { box: "0 0 48 40", note: "the phone in a cage on a selfie stick",
		d: 'M15.6 13.4 L33.6 10.8 L35.6 24.6 L17.6 27.2 Z'
			+ ' M15.6 13.4 C20.4 9.4 26.4 7.4 31.4 7.2 L33.6 10.8'
			+ ' M16.2 13.7 L30.8 7.7'
			+ ' M31.4 7.2 L44.4 5.4 L45.4 13.2 L34.6 14.8 Z'
			+ ' M17.4 26.8 C12.6 30.4 7.2 34.6 3.4 38.4'
			+ ' M15.8 25 C11.2 28.4 5.9 32.6 2.2 36.4' },

	cube: { box: "0 0 24 24", note: "the Lewis Cube — a wireframe box, drawn three times over",
		d: 'M4.4 7.8 L14.6 7.4 L14.9 20.6 L4.6 20.9 Z'
			+ ' M7.8 7.6 L8 20.8 M11.2 7.5 L11.4 20.7 M4.5 12.2 L14.7 11.9 M4.6 16.4 L14.8 16.1'
			+ ' M4.4 7.8 L8.6 3.6 M14.6 7.4 L18.8 3.3 M14.9 20.6 L19.1 16.5'
			+ ' M8.6 3.6 L18.8 3.3 L19.1 16.5'
			+ ' M7.8 7.6 L12 3.5 M11.2 7.5 L15.4 3.4 M14.7 11.9 L18.9 7.8 M14.8 16.1 L19 12.1' },

	heli: { box: "0 0 48 32", note: "the Heli — a pod with a ducted rotor on the nose",
		d: 'M13.4 12.4 C20.6 10.6 32.4 10.8 39.6 12.8 C44.6 14.2 44.8 19.4 39.8 20.8'
			+ ' C32 23 20.4 22.8 13.6 20.8 C9.4 19.6 9 13.6 13.4 12.4 Z'
			+ ' M12.4 8.4 C16.8 8.4 20.4 11.6 20.4 16.4 C20.4 21.2 16.8 24.6 12.4 24.6'
			+ ' C8 24.6 4.4 21.2 4.4 16.4 C4.4 11.6 8 8.4 12.4 8.4 Z'
			+ ' M12.4 14.8 C13.4 14.8 14.2 15.5 14.2 16.5 C14.2 17.5 13.4 18.2 12.4 18.2'
			+ ' C11.4 18.2 10.6 17.5 10.6 16.5 C10.6 15.5 11.4 14.8 12.4 14.8 Z'
			+ ' M14.1 15.6 Q17.6 15.2 18.6 11.6 M13.4 18 Q15.4 20.8 13.8 23.6'
			+ ' M10.8 17.6 Q7.4 18.4 6 21.6 M11.4 15.1 Q9.6 12.2 11.2 9.4'
			+ ' M40.4 15.6 C43.6 15 45.6 15.4 46.4 16.6'
			+ ' M17.4 22.4 C18.4 26.6 22.4 28.8 28.6 29 C34 29.2 38.4 28 40.8 26.4' },

	/* The blades are nine copies of one arc, each turned 40° and swept 56° back —
	   worked out on paper, then written here as flat path data so the library
	   stays a list of drawings and not a little geometry engine. */
	fan: { box: "0 0 24 24", note: "the rotor, nine blades and a hub",
		d: 'M12 2.4 C17.4 2.4 21.7 6.7 21.7 12 C21.7 17.3 17.3 21.7 12 21.7'
			+ ' C6.7 21.7 2.3 17.3 2.3 12 C2.3 6.7 6.6 2.4 12 2.4 Z'
			+ ' M12 9.4 C13.5 9.4 14.6 10.6 14.6 12.1 C14.6 13.6 13.4 14.6 12 14.6'
			+ ' C10.5 14.6 9.4 13.5 9.4 12 C9.4 10.5 10.5 9.4 12 9.4 Z'
			+ ' M14.6 12.3 Q17.3 15 16.4 20.2 M13.8 13.9 Q14.1 17.7 10.1 21.1'
			+ ' M12.2 14.6 Q9.9 17.7 4.7 17.7 M10.5 14.1 Q6.7 15 2.7 11.7'
			+ ' M9.5 12.6 Q6 10.9 5.1 5.8 M9.7 10.9 Q8.1 7.3 10.7 2.8'
			+ ' M10.9 9.6 Q12 5.9 16.9 4.1 M12.7 9.5 Q15.9 7.3 20.8 9.1'
			+ ' M14.2 10.5 Q18 10.9 20.6 15.5' },

	note: { box: "0 0 24 24", note: "two eighth notes, beamed",
		d: 'M8.3 17.4 C8.4 12.8 8.3 7.6 8.4 3.4 M17.7 15.6 C17.8 11 17.7 6.2 17.8 2.2'
			+ ' M8.4 3.4 C11.4 2.9 15 2.4 17.8 2.2 M8.4 5.9 C11.4 5.4 15 4.9 17.8 4.7'
			+ ' M8.3 17.4 C8.3 20.6 5.6 22.4 4 21.4 C2.6 20.5 3.4 18 5.4 17 C6.6 16.4 8.2 16.4 8.3 17.4 Z'
			+ ' M17.7 15.6 C17.7 18.8 15 20.6 13.4 19.6 C12 18.7 12.8 16.2 14.8 15.2 C16 14.6 17.6 14.6 17.7 15.6 Z' },
};

const NS = "http://www.w3.org/2000/svg";
let uid = 0;

/* One doodle, as an <svg> View. `size` is any CSS length and sets the drawing's
 * HEIGHT — the width follows from the viewBox, so a tall doodle stays tall.
 * Omit it and the doodle is 1em, the size of the text beside it.
 *
 * ⚠ aspect-ratio is set here, from the viewBox, rather than in the stylesheet:
 * three of the twenty are not square, and this is the one place that already
 * knows the shape of each. */
function build(name, size){
	const shape = shapes[name];
	if (!shape) throw new Error('doodles: no doodle named "' + name + '"');

	const el = document.createElementNS(NS, "svg");
	el.setAttribute("viewBox", shape.box);
	el.setAttribute("aria-hidden", "true");
	el.innerHTML = shape.d.split(" M").map((d, i) =>
		'<path pathLength="100" d="' + (i ? "M" + d : d) + '"/>').join("");

	const [, , w, h] = shape.box.split(" ");
	el.style.aspectRatio = w + " / " + h;
	if (size) el.style.setProperty("--doodle-size", size);

	return new View({ el }).ac("doodle", "doodle-" + name);
}

/* The library: one factory per doodle. `doodles.star()` draws a star at 1em;
 * `doodles.compass("6em")` draws the compass six times that. The named exports
 * below are the same functions, for `import { star } from "./doodles.js"`. */
export const doodles = {};
export const names = Object.keys(shapes);
names.forEach(name => { doodles[name] = size => build(name, size); });

// What each doodle is, in a phrase — the wall's captions read from here so the
// drawing and its description can never drift apart.
export const notes = Object.fromEntries(names.map(n => [n, shapes[n].note]));

export const { star, pentagram, zigzag, diamonds, squares, bowtie, wave, arrow, hook,
	check, span, spike, scribble, crossed, frame, wireframe, compass, truss, camera, cube, heli, fan, note } = doodles;

/* A doodle tiled as a background texture, for painting a band behind something.
 *
 * It returns an <svg> that fills its parent — give the parent `position: relative`
 * (`.doodle-band` in doodles.css does) and the tiles sit behind its content. The
 * pattern is faint on purpose: at 8% it reads as paper, not as a picture.
 *
 *   texture("star")                       — the default tiling
 *   texture("star", { tile: 60, opacity: 0.14, angle: -8 })
 *
 * ⚠ Each call mints its own pattern id. Two textures on one page with the same
 * id would both paint whichever pattern the browser saw last. */
export function texture(name, { tile = 52, size = 22, opacity = 0.08, angle = -6 } = {}){
	const shape = shapes[name];
	if (!shape) throw new Error('doodles: no doodle named "' + name + '"');

	const id = "doodle-tile-" + name + "-" + (++uid);
	const [, , w, h] = shape.box.split(" ").map(Number);
	const scale = size / Math.max(w, h);
	const inset = (tile - size) / 2;

	const el = document.createElementNS(NS, "svg");
	el.setAttribute("aria-hidden", "true");
	el.innerHTML =
		'<defs><pattern id="' + id + '" width="' + tile + '" height="' + tile + '"'
		+ ' patternUnits="userSpaceOnUse" patternTransform="rotate(' + angle + ')">'
		+ '<g transform="translate(' + inset + ' ' + inset + ') scale(' + scale + ')">'
		+ shape.d.split(" M").map((d, i) => '<path d="' + (i ? "M" + d : d) + '"/>').join("")
		+ '</g></pattern></defs>'
		+ '<rect width="100%" height="100%" fill="url(#' + id + ')"/>';

	el.style.opacity = opacity;
	return new View({ el }).ac("doodle-texture");
}

export default doodles;
