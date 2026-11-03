import { span, button, select, option, label, input } from "../../core/View/View.js";

export default class LayoutControls {
	/* The four controls the bar and the panel both draw. Imports flow one way —
	   layout.js and Panel/workspace.js both read this file, and it reads neither. */

	// One of a set. `on` is which one the target already wears — a bar handed a grid
	// must not open claiming to be a flex, and nothing is pressed when it is neither.
	static pick(words, choose, on){
		const $btns = words.map(word => LayoutControls.btn(word, function(){
			$btns.forEach($btn => $btn.rc("on"));
			this.ac("on");
			choose(word);
		}));

		$btns[words.indexOf(on)]?.ac("on");
		return $btns;
	}

	/* A menu once the set is long enough that four chips would be a row of noise.
	   ⚠ `on` is written to `.el.value` after the options exist — an `option` marked
	   selected while the list is still building is silently the wrong one. */
	static menu(words, choose, on){
		const $menu = select.c("layout-pick auto", () => words.forEach(word => option(word)))
			.on("change", function(){ choose(this.el.value); });

		$menu.el.value = on ?? words[0];
		return $menu;
	}

	// Pressed means the class is on the target — read once at build, rewritten on click.
	static toggle($el, word){
		return LayoutControls.btn(word, function(){
			$el.tc(word);
			this[$el.hc(word) ? "ac" : "rc"]("on");
		}).ac($el.hc(word) && "on");
	}

	static chips($el, words){
		words.split(" ").filter(Boolean).forEach(word => LayoutControls.toggle($el, word));
	}

	static knob($box, token, value, max, step){
		let $out;

		value = LayoutControls.read($box, token) ?? value;

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

			$out = span.c("layout-out", value + "em");
		});
	}

	/* ⚠ A knob READS at build and writes only on input. Stamping its own default was
	   worth a paragraph: a bar over a page wrote `--measure` the moment it drew itself
	   and narrowed the page nobody had touched. Inline value first, then whatever the
	   cascade already gives the target — which is empty for a tree not yet mounted. */
	static read($box, token){
		const own = parseFloat($box.el.style.getPropertyValue(token));
		if (!isNaN(own)) return own;

		const cascade = parseFloat(getComputedStyle($box.el).getPropertyValue(token));
		return isNaN(cascade) ? null : cascade;
	}

	static btn(text, fn){
		return button.c("layout-btn", text).click(fn);
	}

}
