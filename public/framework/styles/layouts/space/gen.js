import { AUTHOR } from "/framework/ext/LayoutTool/taste/ranges.js";
import { SHAPES, CLAIM, COUNTS, DEPTHS, INNER, TONES } from "./model.js";
import { draws } from "./draw.js";

/**
 * (seed, opts) → a layout, as spec text. An integer is an ADDRESS: the same pair is
 * the same layout forever, in any browser, so a point in the space is a link.
 *
 *     gen(7)                              // the model, at its own depth
 *     gen(7, 3)                           // depth 3 — the old signature, still live
 *     gen(7, { depth: 3, chaos: 0.4 })    // …and 40% of the way to uniform noise
 *
 * Every structural draw comes from `model.js` and every size from the rulebook's
 * `AUTHOR` bands (`ext/LayoutTool/taste/ranges.js`) — the same table `taste.rate()`
 * grades the result against. `chaos` is the distance from that model: 0 is strictly
 * on it, 1 is uniform over everything the format can say.
 *
 * ⚠ `opts` may be a NUMBER. `ext/Panel/generate.js` calls `gen(seed, depth)` and is
 *   owned by another session — that signature is a compatibility promise.
 *
 * ⚠ AN ADDRESS IS ONLY STABLE AGAINST A FIXED MODEL. A seed replays exactly, in any
 *   browser, forever — but retuning a weight in `model.js` re-addresses the whole
 *   space, and seed 7 becomes a different layout. Measured: seed 85 was the best roll
 *   in a 600-roll search and the next weight fit moved it from `shell` to `rail`. So
 *   a seed is a citation within one version, and the URL hash — which carries the
 *   TEXT — is what survives a retune. Keep a layout you like as its text.
 *
 * Design record: readme.md.
 */

const CAP = 80;

// The two parts that are a run of prose, wherever the model happens to put them.
const PROSE = /^(sections|notes)\b/;

export function roll(seed, opts = {}){
	const o = typeof opts === "number" ? { depth: opts } : opts;
	const d = draws(seed, o.chaos ?? 0);
	const max = o.depth ?? 3;
	const fit = o.fit ?? d.pick({ screen: 3, page: 2 });
	const choices = { seed, fit, depth: max, chaos: o.chaos ?? 0 };

	const out = [];
	const line = (at, text) => { if (out.length < CAP) out.push("  ".repeat(at) + text.replace(/\s+/g, " ").trim()); };

	line(0, `full ${fit === "screen" ? "fill " : ""}flex v --pad:${d.em(AUTHOR.pad)} --gap:${d.em(AUTHOR.gap)}`);

	if (d.odds(0.85)) line(1, `${tone(d)} > ${choices.masthead = d.role("masthead")}`);

	const shape = SHAPES[choices.shape = d.pick(weights(SHAPES, fit))];
	const tracks = shape.vary ? d.some(shape.tracks) : shape.tracks;

	line(1, `flex ${shape.dir === "v" ? "v" : "wrap"} gap flex-1${fit === "screen" ? " scroll" : ""}`);
	tracks.forEach(role => block(2, role, d.level(DEPTHS, max), shape.dir, true));

	if (d.odds(0.55)) line(1, `${tone(d)} > ${choices.foot = d.role("foot")}`);

	return { text: out.join("\n"), choices, seed };

	/* One track. At depth 0 it is a leaf wearing its role's part; above that it is a
	   row or a column of two or three, each drawing a fresh depth below this one —
	   which is what makes one band flat and its neighbour three deep.
	   ⚠ Only a TOP-LEVEL track declares a tone. `--tone` inherits, so a subtree
	     deepens one colour rather than turning into a rainbow. */
	function block(at, role, depth, dir, top){
		const paint = top ? tone(d) : "tone";

		if (role === "stack") return column(at, depth, paint);

		// ⚠ A fixed-measure role is a LEAF, whatever the depth dial says. A rail that
		//   splits is two rails; and a fixed container hands its children a fraction
		//   of an already-small share the moment ext/Panel translates it.
		if (depth <= 0 || !INNER[role]){
			const drawn = part(role);
			return line(at, `${claim(role, dir, true, drawn)} pad ${inset(top)} ${paint} > ${drawn}`);
		}

		const inner = d.odds(0.45) ? "v" : "h";
		line(at, `flex ${inner === "v" ? "v" : "wrap"} gap ${claim(role, dir, false)} ${top ? "pad " + inset(top) : ""} ${paint}`);

		// A FRESH depth per child, drawn below this one — so one branch runs deep and
		// its neighbour is flat, which is the uneven mix a real page is. A flat
		// `depth − 1` fills the whole tree and every roll looks the same.
		for (let i = 0, n = d.count([2, 3]); i < n; i++)
			block(at + 1, d.pick(INNER[role]), d.level(DEPTHS, depth - 1), inner, false);
	}

	// The one composite: a bar over a body, inside a row. `presets.shell` is the
	// shape, and it is the one thing a row of tracks cannot say.
	function column(at, depth, paint){
		line(at, `flex v gap fluid ${paint}`);
		line(at + 1, `> ${d.role("masthead")}`);
		block(at + 1, "main", Math.max(0, depth - 1), "v", false);
	}

	/* What a track claims of the line it is on — and the claim is a fact about the
	   PARENT'S axis, not about the role. In a column nothing claims a share: a band
	   is its content's height, and `fluid` there is `flex-basis: 24em` on the
	   vertical axis, which stretches every band to the same size.
	   ⚠ A fixed measure belongs to a LEAF. `ext/Panel`'s `share()` reads `--basis` as
	     a FRACTION of the row where here it is a minimum, so a fixed container that
	     then splits hands its children a fraction of an already-small share —
	     measured at 3440: columns down to 20px, headings one letter a line. */
	function claim(role, dir, leaf, drawn = ""){
		const kind = CLAIM[role] ?? "fluid";

		/* ⚠ A measure follows the PART, not the role. `sections` is prose wherever it
		   lands, and a `main` track holding it is a reading column whether the model
		   called it one — measured at 1920 without this: 117 characters a line, from a
		   generator whose own rulebook says 68. */
		const measure = leaf && (kind === "measure" || PROSE.test(drawn))
			? `flow measure start --measure:${d.em(AUTHOR.measure)}` : "";

		if (dir === "v") return measure;
		if (measure) return `${measure} fluid scroll`;
		if (!leaf || kind === "fluid" || kind === "full" || kind === "measure") return "fluid";

		return `basis --basis:${d.em(AUTHOR[kind])}${role === "aside" ? " stick" : ""} scroll`;
	}

	/* A band pads more than a card does — and every leaf says so ITSELF, because
	   `--pad` inherits. One `--pad: 3em` on a wide track is 3em on the 300px card
	   inside it too, which the rulebook rates as badly over-padded: measured, that one
	   cascade cost nine points of mean fitness across a sweep. So a top-level track
	   claims the band inset and every leaf under it reclaims a card's. */
	function inset(top){ return `--pad:${d.em(top ? AUTHOR.bandpad : AUTHOR.pad)}`; }

	function part(role){
		return `${d.role(role)} ${d.count(COUNTS[role] ?? COUNTS.main)}`;
	}
}

export const gen = (seed, opts) => roll(seed, opts).text;

const tone = d => `tone --tone:${d.pick(TONES)}`;

/* `fit` bends the shape draw, and that is the whole difference between the two kinds
 * of thing this generator is asked for. A FIXED area — a panel, a card, a dashboard
 * tile — wants a row of tracks, because a column of bands in a box with a definite
 * height gets crushed into slivers. A SCROLLING page wants the column: bands are what
 * a document is made of, and there is always more room below. Twice the weight, not
 * an exclusion, so a rail on a scrolling page is still reachable. */
const weights = (table, fit) => Object.fromEntries(Object.entries(table)
	.map(([k, v]) => [k, v.w * (v.dir === (fit === "screen" ? "h" : "v") ? 2 : 1)]));

export default gen;
