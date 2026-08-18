import { Doc, View, md, code, h2, section } from "/app.js";
import depth from "./depth.js";

export default new Doc({
	meta: import.meta,
	title: "Depth",
	description: "A page becomes a 3D scene; layers drift against each other as you scroll.",
	icon: "layers",

	// The ext patches View.prototype.depth, so View is the subject — the API tab then
	// shows the live patched source and says where it came from. Same as ext/catalog.
	subject: View,
	methods: "depth",

	files: "depth.js depth.css page.js readme.md",
	notes: "decisions",

	content(){

		depth();

		code.js(`import depth from "/framework/ext/depth/depth.js";

content(){
    depth();                                          // scene + the two sliders
    section.c("surface pad", () => { … }).depth(1);   // a layer, one step forward
}`).depth(2);

		md("**This page is the demo.** Scroll it, move the pointer, and drag the two sliders above — the code block you just read is a layer, and so are the two boxes below. Nothing else on the page moved.");

		section.c("surface pad", () => {
			h2("What a layer is");

			md("A class and a number. `.depth(2)` puts an element two steps toward the reader, and the two boxes here are at **1** and **3** — far enough apart that they visibly slide past each other, close enough that neither leaves the page.");

			md("`--depth` is **relative to the enclosing layer**, because `preserve-3d` composes the two `translateZ` values. A heading at `.depth(1)` inside a section at `.depth(1)` is two steps out, not one.");
		}).depth(1);

		md("**Two sliders, and they are genuinely different knobs.** `Depth` is `--depth-scale`, which multiplies every layer's `z` — that is how far apart the layers sit, and it buys growth and scroll parallax together because those are the same number. `Motion` is `--depth-motion`, which multiplies how hard the page *reacts*: the pointer lean, the tilt, the shadow throw, and how fast the vanishing point travels as you scroll.");

		md("Both are one custom property each, so no layer knows either exists. Drag **Motion to 0** and the page stops reacting to the pointer entirely — the honest way to see what the effect is doing. ⚠ Motion's *scroll* gain is clamped at 1 from below: under that the vanishing point would **lag** the reading line and produce more drift, not less, which is the one place the slider would fight its own label.");

		md("⚠ **Depth bottoms out at 0.75, and that floor is not taste.** Below it the layers go nearly coplanar — and a tilted plane that is nearly coplanar with its parent *intersects* it inside the card's own extent. `preserve-3d` then splits the geometry along that intersection line and interleaves the halves, so a card renders sliced down a hard diagonal with half of it behind its own parent. It looks like clipping, and nothing warns. More z separation moves the intersection outside the card, which is the entire fix.");

		section.c("surface pad", () => {
			h2("Why it isn't distracting");

			md("Perspective magnifies a near layer by `P/(P − z)`. Every layer here **counter-scales by `(P − z)/P`** — so at the default, apparent size never depends on depth. A heading can be the closest thing to the reader and still render at the size its type scale says.");

			md("What survives is the *movement*, which is the effect. What is removed is the *size change*, which is the distraction — and the reason a card cannot grow past the measure just by coming forward. `--depth-flatten` is how much of that cancelling to apply, so a page that *wants* the growth can have it; see below.");
		}).depth(3);

		h2("The vanishing point rides the reading centre");

		md("A layer's displacement is `(distance from the perspective origin) × z/(P − z)`. Left at the box's own middle, that distance is half the document: on a 4000px page an element at `translateZ(200px)` with `perspective: 1200px` lands **400px** from where it belongs. The sketch this was ported from swept the origin `0% → 200%` on scroll, which is worse.");

		md("So `perspective-origin` follows `scrollTop + clientHeight/2`. Displacement is ~0 where the eye already is and opens up gently toward the edges, and the scroll parallax survives — a layer drifts through the reading line faster than the page does.");

		h2("What it does to the page it is on");

		md("`perspective` makes the scene a **containing block for `position: fixed`** descendants, and a stacking context. And `transform-style: preserve-3d` silently becomes `flat` on any element with `overflow` other than `visible`, `opacity < 1`, a `filter`, `clip-path`, or `contain: paint` — so a `.page.fill` cannot be a scene, and a layer that grows one of those flattens its own children with nothing in the console.");

		h2("Growth and drift are the same number");

		md("Perspective magnifies a layer by `P/(P − z)` and displaces it by `(distance from the origin) × z/(P − z)`. **That is one factor, not two** — you cannot buy \"comes toward you\" without paying \"slides away from the vanishing point\", and lowering the perspective raises both.");

		md("`--depth-flatten` is the only lever that separates them, and it cuts the size half alone: `1` cancels the growth entirely (pure parallax), `0` lets it all through. So a page that wants a layer to come at you rather than run off the page runs a **low flatten and a low `--depth-step`**, then buys its motion back from the pointer — `--depth-lean` and `--depth-tilt` cost no displacement at all. That is exactly what [the résumé](/resume/) does.");

		h2("The pointer moves the camera, and turns the layers");

		md("Lean slides the vanishing point; **tilt rotates each layer about its own centre**. Rotating the whole scene is the thing that is not safe — a `rotateY` about the middle of a 4000px-tall box throws its far ends hundreds of pixels in `z`, which is the failure the reading-centre fix exists to prevent. A single card is small enough that the same rotation costs nothing.");

		md("⚠ **Tilt compounds.** `preserve-3d` applies a layer's rotation to everything inside it, so three nested tiers at `2.5deg` turn the innermost card `7.5deg` — far enough that it renders as a trapezoid sliding out from under its own text. Budget the total: *deepest tier × tilt* under about `3deg`.");

		md("Seen in the wild: [the résumé](/resume/), where the name is the closest layer and each section is a card one step off the page.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
