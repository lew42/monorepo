/* Themes from a seed — four numbers in, a token set out.
 *
 * OKLCH is the whole reason this is possible: its L is PERCEPTUAL lightness, so
 * "put the ink far enough from the floor" is one number instead of a guess per
 * hue. `oklch()` is native CSS, but the tokens here are emitted as hex, because
 * the point of the exercise is to MEASURE the contrast, and measuring means
 * getting to sRGB anyway.
 *
 * What generation guarantees: every ink token is SOLVED against the surface it
 * will actually sit on, so `--prim-ink` cannot ship at 2.2:1 — the defect the
 * colour study found live on this site in two places. What it cannot: taste.
 */

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// OKLCH → sRGB bytes. Out-of-gamut clips per channel, which is what a browser
// does too — so the hex below is what you would actually see.
export function rgb(L, C, H){
	const h = H * Math.PI / 180, a = C * Math.cos(h), b = C * Math.sin(h);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;

	return [
		 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
	].map(v => Math.round(255 * clamp(v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)));
}

export const hex = c => "#" + c.map(v => v.toString(16).padStart(2, "0")).join("");

const lum = c => c.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
	.reduce((t, v, i) => t + v * [0.2126, 0.7152, 0.0722][i], 0);

// WCAG relative contrast, either order.
export function ratio(a, b){
	const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
}

/* Solve for the LIGHTNESS that hits a contrast target against `on` (whose own
 * lightness is `onL`, so the search never crosses to the far side, where ratio
 * starts climbing again and monotonicity would break). Twenty bisections land it
 * to five decimals. When the target is out of reach the bound is returned and
 * the MEASURED ratio — never the target — is what gets reported; a generator
 * that printed the number it asked for would be worth nothing. */
export function solve(on, onL, target, C, H, lighter){
	let lo = lighter ? onL : 0, hi = lighter ? 1 : onL;

	for (let i = 0; i < 20; i++){
		const mid = (lo + hi) / 2, pass = ratio(rgb(mid, C, H), on) >= target;
		if (lighter) pass ? hi = mid : lo = mid;
		else         pass ? lo = mid : hi = mid;
	}
	return lighter ? hi : lo;
}

/* seed → the token set. Four dials: hue, chroma, which end of the lightness
 * curve the surfaces sit on, and the contrast floor every ink is solved to. */
export function generate({ hue: H, chroma: C, curve, contrast }){
	const dark = curve === "dark";
	const near = Math.min(C * 0.1, 0.012);           // the surfaces' whisper of the hue
	const at = (L, c = near) => rgb(L, c, H);

	const washL = dark ? 0.18 : 0.965, surfL = dark ? 0.27 : 1;
	const wash    = at(washL);
	const tint    = at(dark ? 0.23 : 0.985);
	const surface = at(surfL);
	const prim    = at(dark ? 0.76 : 0.66, C);       // a FILL — placed for punch, never solved

	// Every one of these is SOLVED, not chosen. `--prim-ink` keeps the seed's full
	// chroma so it still reads as the accent; it just cannot come out too pale.
	const ink     = at(solve(surface, surfL, contrast + 2.5, C * 0.2, H, dark), C * 0.2);
	const subtle  = at(solve(wash,    washL, contrast,       C * 0.2, H, dark), C * 0.2);
	const primInk = at(solve(wash,    washL, contrast,       C,       H, dark), C);

	const tokens = {
		"--prim": hex(prim), "--prim-ink": hex(primInk),
		"--ink": hex(ink), "--subtle": hex(subtle),
		"--line": hex(at(dark ? 0.32 : 0.885)),
		"--wash": hex(wash), "--tint": hex(tint), "--surface": hex(surface),
		"--bg": hex(at(dark ? 0.36 : 0.32, C * 0.3)),
		"--card-shadow": dark ? "rgba(0,0,0,.55)" : "rgba(0,0,0,.13)",
		"--card-ring": dark ? hex(at(0.32)) : "transparent",
		"--code-bg": hex(at(0.16, C * 0.15)), "--code-ink": hex(at(0.92, C * 0.05)),
		"--syn-comment": hex(at(0.6, 0.02)), "--syn-keyword": hex(prim),
		"--syn-string": hex(rgb(0.85, C * 0.6, H + 60)),
		"--radius": (C * 4).toFixed(2) + "em",       // taste, faked: more colour, softer corners
		"--font": dark ? "ui-monospace, Menlo, Consolas, monospace" : "system-ui, -apple-system, sans-serif",
	};

	return { tokens, measured: {
		ink:     ratio(ink, surface),
		subtle:  ratio(subtle, wash),
		prim_ink: ratio(primInk, wash),
		prim_as_text: ratio(prim, wash),             // the trap, measured — see the page
	} };
}

export const SEEDS = [
	{ name: "indigo", hue: 264, chroma: 0.14, curve: "light", contrast: 4.5 },
	{ name: "moss",   hue: 145, chroma: 0.10, curve: "dark",  contrast: 7 },
	{ name: "ember",  hue: 42,  chroma: 0.17, curve: "light", contrast: 7 },
	{ name: "orchid", hue: 330, chroma: 0.15, curve: "dark",  contrast: 4.5 },
	{ name: "slate",  hue: 220, chroma: 0.03, curve: "light", contrast: 4.5 },
	{ name: "acid",   hue: 110, chroma: 0.20, curve: "dark",  contrast: 7 },
];
