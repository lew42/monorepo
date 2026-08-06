import View, { div, p, pre, code, span, button, select, option, icon, is } from "../../core/View/View.js";
import { source, dedent } from "../../util/source/source.js";
import { markup } from "../../util/markup/markup.js";

View.stylesheet(import.meta, "demo.css");

/**
 * demo — show the code, run it, and let the reader push it around. One box.
 *
 *   demo(() => {
 *       div.c("card", () => {
 *           h1("Title");
 *           p("Body");
 *       });
 *   });
 *
 *   demo("Label above", () => { … });
 *   demo(() => { … }, "Caption below the result.");
 *   demo(() => { … }, { html: true });      // the HTML pane open from the start
 *   demo(() => { … }).ac("stack");          // never put the panes side by side
 *
 * Strings before the function label the box; strings after caption it. The
 * caption is the important one: a doc page leads with code, and the sentence
 * that explains it reads *after* you've seen it.
 *
 * The source is `fn.toString()`, so the code you read is literally the code that
 * ran — there is no second copy to fall out of date. The function runs with the
 * `.demo-render` as captor, like any capture fn, so examples are written exactly
 * the way real page code is written.
 *
 * ⚠ The stage is a DIV, so it tests INTRINSIC responsiveness — `auto-fit`, `%`,
 * `flex-wrap`, container queries. A `@media` query inside an example still reads
 * the real browser viewport and will not change no matter how narrow you drag it.
 * Simulating a viewport properly needs an iframe; see readme.md.
 *
 * Design record: framework/ext/demo/readme.md.
 */
export default function demo(...args){
	const i = args.findIndex(is.fn);

	// visible and non-fatal, like md-error: a broken example shouldn't take the
	// page down, but it must not fail silently either
	if (i === -1)
		return div.c("demo demo-error", "demo() needs a function");

	const fn    = args[i];
	const opts  = args.find(is.pojo) ?? {};
	const label = args.slice(0, i).filter(is.str).join(" ");
	const note  = args.slice(i + 1).filter(is.str).join(" ");

	return div.c("demo", $demo => {
		let $html, $stage, $render, $size;

		// Placed now, filled last. Every control on it points at something further
		// down the box, and `append(fn)` re-establishes the captor — so the toolbar
		// is written where its targets already exist, and still lands at the top.
		const $bar = div.c("demo-bar");

		div.c("demo-panes", () => {
			pre.c("demo-code", () => source_code(source(fn)));
			$html = pre.c("demo-html");
		});

		/* Three boxes, and each one earns itself: the STAGE is what you resize and
		 * what the handle is positioned against, the SCREEN is the viewport that
		 * scrolls, and the RENDER is the bare content whose width gets reported.
		 *
		 * They cannot be merged. Scrolling on the stage clips the handle (it hangs
		 * over the right edge) and turns the overhang into scrollable width; and
		 * `overflow-x` on the render forces `overflow-y` off `visible` too, which
		 * would quietly put a scrollbar around every demo that overflows on purpose
		 * — a tooltip, a popover, anything sticky. */
		div.c("demo-stage", $view => {
			$stage = $view;

			div.c("demo-screen", () => { $render = div.c("demo-render", fn); });

			$size = div.c("demo-size");
			resizer($stage);
		});

		if (note) caption(note);

		/* ONE function for the HTML pane, so the button and the `html: true` flag
		 * cannot end up disagreeing about the state.
		 *
		 * Read on SHOW rather than now: a demo whose content arrives from a promise
		 * has not finished building when demo() returns, and a click is always later
		 * than that. The flag re-reads a microtask later for the same reason — the
		 * shape toc() uses, after render() returns and before the browser paints. */
		let $toggle;

		const html = on => {
			$demo[on ? "ac" : "rc"]("show-html");
			$toggle[on ? "ac" : "rc"]("on");
			if (on) $html.empty(() => source_code(markup($render.el), "html"));
		};

		const measure = ruler($render, $size);

		$bar.append(() => {
			if (label) span.c("demo-label", label);

			div.c("demo-spacer");

			zoom($render, measure);

			$toggle = btn("<>", "The HTML this built", () => html(!$demo.hc("show-html")));

			btn(() => icon("open_in_full"), "Fill the window", function(){
				this.tc("on");
				$demo.tc("max");
			});
		});

		if (opts.html) queueMicrotask(() => html(true));
	});
}

/* One toolbar control. Every button here is a toggle, and `.on` is the pressed
 * state — the caller flips it, because the caller is what knows the state. */
function btn(content, title, fn){
	return button.c("demo-btn", content).attr("title", title).click(fn);
}

/* Zoom, as CSS `zoom` and not `transform: scale()`. Scale would look identical
 * and lie about the layout: a scaled box still occupies its unscaled size, so
 * nothing around it moves and nothing inside it re-lays-out. `zoom` really does
 * change the element's own coordinate system, which is what makes the readout
 * below mean something — the example is laid out at stage-width ÷ zoom. */
const ZOOMS = [25, 50, 75, 100, 150, 200];

function zoom($render, measure){
	const $zoom = select.c("demo-zoom", () =>
		ZOOMS.forEach(z => option(z + "%").attr("value", z / 100)));

	$zoom.el.value = "1";

	return $zoom.attr("title", "Zoom the render").on("change", function(){
		$render.style("zoom", this.el.value);
		measure();
	});
}

/* Drag the stage's right edge. What you set is what you SEE; the example lays
 * out at that width divided by the zoom, which is the number `.demo-size` reports.
 *
 * Right-click clears it and the stage goes back to filling its column. That is
 * the only way back to "whatever fits" — a reset button in the toolbar would be
 * a control whose whole job is undoing another control. */
function resizer($stage){
	return div.c("demo-handle")
		.attr("title", "Drag to resize · right-click to reset")
		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);

			// the gap between the pointer and the stage's right edge, held constant
			// for the drag — so the handle doesn't jump to the cursor on grab
			const offset = $stage.el.getBoundingClientRect().right - e.clientX;

			const drag = ev => $stage.style("width",
				Math.max(160, ev.clientX + offset - $stage.el.getBoundingClientRect().left) + "px");

			this.el.addEventListener("pointermove", drag);
			this.el.addEventListener("pointerup",
				() => this.el.removeEventListener("pointermove", drag), { once: true });
		})
		.on("contextmenu", function(e){
			e.preventDefault();
			$stage.style("width", "");
		});
}

/* How wide the example is actually laid out — `offsetWidth`, which is the
 * element's OWN box and so is unaffected by `zoom`: a 700px stage at 50% reads
 * 1400. That is the number a reader wants, because it is the width the CSS inside
 * the demo is responding to.
 *
 * Deliberately not the ResizeObserver entry's `contentRect`: what that reports
 * under `zoom` has moved between browser versions, and `offsetWidth` has not. */
function ruler($render, $size){
	const measure = () => $size.text(Math.round($render.el.offsetWidth) + "px");

	new ResizeObserver(measure).observe($render.el);
	measure();

	return measure;
}

/* The caption is prose, so it wants markdown — but demo/ must not depend on
 * markdown/. Soft dependency instead: if ext/markdown has been imported it has
 * patched View.prototype.md, so use it; otherwise fall back to p()'s backticks. */
function caption(text){
	const view = p.c("demo-note");
	return view.md ? view.md(text) : view.backtick_append(text);
}

/* The same deal with ext/highlight: if it's loaded the source is highlighted, if
 * not it's a plain code block, which is what this always was. The captor here is
 * a <pre>, so code.js() returns a bare <code> — exactly the element this used to
 * build by hand. */
function source_code(src, lang = "js"){
	return code[lang] ? code[lang](src) : code(src);
}

/* source()/dedent() moved to util/source — ext/highlight's code.fn() needs the
   identical transform. Re-exported here because that's where they've always been
   imported from. */
export { source, dedent };

export { demo };
