import View, { div, icon } from "../../core/View/View.js";
import { words, draw, BOX, PAGE } from "./words.js";
import { btn } from "./controls.js";
import { select, context } from "./panel.js";

/* css: .layout, .layout-box, .layout-bar, .layout-region, .layout-hot, .layout-selected,
   .layout-name, .layout-btn, .layout-pick, .layout-knob, .layout-range, .layout-tag,
   .layout-out, .layout-sect, .layout-chips, .layout-code, .layout-empty — plus
   `flex`/`grid`/`gap`/`auto`, framework.css. The RAIL those last few draw into is
   `ext/drawer`'s (`.drawer*`), reached through panel.js. */
View.stylesheet(import.meta, "layout.css");

/* layout(fn) — a box you can re-arrange, under a toolbar that stays out of the way
   until you point at it. Design record: readme.md. */
export default function layout(fn){
	return div.c("layout", () => {
		const $box = div.c("layout-box flex gap auto", fn)
			.style({ "--gap": "1em", "--column": "14em" });

		layout.bar($box);
	});
}

/* The universal toolbar: over a View, a bare element, or a live Page. `list` names
   the controls (`layout.words`); left out, a page gets its shape vocabulary and
   anything else gets a container's. An element target also becomes selectable. */
layout.bar = function(target, list){
	const $bar = div.c("layout-bar");

	/* ⚠ A microtask, not now: `page.view` is assigned only AFTER content() returns,
	   so a page's controls would otherwise read an element that does not exist. */
	queueMicrotask(() => {
		const $el = view_of(target);
		if (!$el) return;

		const page = !(target.el || target.nodeType);
		if (!page) region($el);

		$bar.append(() => {
			draw($el, list ?? (page ? PAGE : BOX));
			btn(() => icon("tune"), () => select($el)).attr("title", "Open the panel");
		});
	});

	return $bar;
};

layout.words = words;
layout.context = context;

// A View, a bare element, or a Page — whose element exists only once it has rendered.
const view_of = target => target.el ? target
	: target.nodeType ? new View({ el: target, capture: false })
	: target.view;

// Point at a region and the element under the pointer lights up; click it to select.
function region($box){
	const root = $box.el;

	return $box.ac("layout-region")
		.on("mouseover", e => mark(pointed(root, e.target)))
		.on("mouseleave", () => mark(null))
		.click(e => select(new View({ el: pointed(root, e.target), capture: false })));
}

/* What is selectable: the region itself, its direct items, and the items of any
   nested `flex`/`grid` inside it — never deeper, or every span in a sentence
   would be a target. */
function pointed(root, el){
	while (el && el !== root){
		const up = el.parentElement;

		if (!up) return root;
		if (up === root || up.classList.contains("flex") || up.classList.contains("grid")) return el;

		el = up;
	}

	return root;
}

let hot;
function mark(el){
	hot?.classList.remove("layout-hot");
	hot = el;
	el?.classList.add("layout-hot");
}

export { layout };
