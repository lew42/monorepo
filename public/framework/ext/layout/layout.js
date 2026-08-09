import View, { div, span, button, select, option, label, input } from "../../core/View/View.js";

/* css: .layout, .layout-bar, .layout-btn, .layout-pick, .layout-knob,
   .layout-range, .layout-tag, .layout-out — plus `flex`/`grid`/`gap`/`auto`,
   framework.css. */
View.stylesheet(import.meta, "layout.css");

const MODES  = ["flex", "grid"];
const SHAPES = ["sheet", "grid", "pad", "full"];
const FLAGS  = ["fill", "flow"];

/* layout(fn) — a box you can re-arrange, under a toolbar that stays out of the way
   until you point at it. Design record: readme.md. */
export default function layout(fn){
	return div.c("layout", () => {
		const $box = div.c("layout-box flex gap auto", fn)
			.style({ "--gap": "1em", "--column": "14em" });

		layout.bar($box);
	});
}

/* The same toolbar, steering a container the CALL SITE built. Place it inside a
   `.layout` for floating chrome; without one it is a quiet strip in the flow. */
layout.bar = function($box){
	return div.c("layout-bar", () => {
		pick(MODES, mode => $box.rc(MODES.join(" ")).ac(mode), MODES.find(m => $box.hc(m)));
		knob($box, "--gap", 1, 4, 0.25);
		knob($box, "--column", 14, 44, 1);
	});
};

/* Pointed at a live page's own shape words instead of a box's tokens.
   ⚠ `page.view` exists only AFTER content() returns, so every read of it is late —
   reading it eagerly re-enters render(). */
layout.page = function(page){
	let $flags;
	const sync = () => $flags.forEach(($btn, word) => $btn[page.view?.hc(word) ? "ac" : "rc"]("on"));

	const $bar = div.c("layout-bar", () => {
		span.c("layout-tag", "shape");

		menu(SHAPES, word => page.view.rc(SHAPES.join(" ")).ac(word !== "sheet" && word));

		$flags = new Map(FLAGS.map(word => [word, btn(word, () => {
			page.view.tc(word);

			/* ⚠ `.page.fill` carries `overflow: hidden`, so a page taller than its
			   region clips with no scrollbar — and this bar goes with it. */
			if (word === "fill")
				page.view.style("overflow", page.view.hc("fill") ? "auto" : "");

			sync();
		})]));
	});

	queueMicrotask(sync);
	return $bar;
};

// One of a set. `on` is which one the container already wears — a bar handed a
// grid must not open claiming to be a flex.
function pick(words, choose, on){
	const $btns = words.map(word => btn(word, function(){
		$btns.forEach($btn => $btn.rc("on"));
		this.ac("on");
		choose(word);
	}));

	$btns[Math.max(0, words.indexOf(on))].ac("on");
	return $btns;
}

// A menu once the set is long enough that four chips would be a row of noise.
function menu(words, choose){
	return select.c("layout-pick", () => words.forEach(word => option(word)))
		.on("change", function(){ choose(this.el.value); });
}

/* ⚠ Seeded from the box, not from `value`: a bar handed a container would
   otherwise overwrite the token that container was built with the moment it drew
   its own knob. */
function knob($box, token, value, max, step){
	let $out;

	value = parseFloat($box.el.style.getPropertyValue(token)) || value;

	const set = v => {
		$box.style(token, v + "em");
		$out.text(v + "em");
	};

	label.c("layout-knob", () => {
		span.c("layout-tag", token.slice(2));

		input.c("layout-range")
			.attr("type", "range").attr("min", 0).attr("max", max).attr("step", step)
			.attr("value", value)
			.on("input", function(){ set(this.el.value); });

		$out = span.c("layout-out");
	});

	set(value);
}

function btn(text, fn){
	return button.c("layout-btn", text).click(fn);
}

export { layout };
