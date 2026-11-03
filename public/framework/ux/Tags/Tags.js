import View, { span, input } from "../../core/View/View.js";

/* `.ui-pill` and `.ui-tags-input` are the TEMPLATE's and stay in `ui/parts.js` —
 * splitting is the usual answer, not moving (ux/doc/system.md). This import is for
 * that stylesheet; the class wears those same classes so the two tiers cannot drift
 * apart. A ux imports a ui template; ui NEVER imports a ux. */
import "../../ui/parts.js";

/**
 * class Tags extends View — `ui/tags`'s chip row, opened up: the × and the field were
 * INERT in the template (ui/tags/page.js, "There is no ui.tags()"); this is what wiring
 * them looks like.
 *
 *   const t = new Tags({ tags: ["core", "no-build"], onChange(tags){ … } });
 *   t.add("esm")      type-to-add — Enter in the field calls this too
 *   t.drop("esm")     x-to-remove — the chip's × calls this too
 *
 * `tags` is a plain array of strings; the caller still owns it.
 */
export default class Tags extends View {

	render(){
		this.style("--gap", "0.4em");
		this.draw();
	}

	/* Full rebuild — the Tree precedent: the caller owns the list, and diffing
	 * strings in vs. out is complexity this doesn't need. */
	draw(tags){
		this.tags = tags ?? this.tags;
		return this.empty(() => { this.list(); this.field(); });
	}

	list(){ this.tags.forEach(name => this.chip(name)); }

	// ⚠ NOT `{ name }` — `View.classify()` stamps `this.name` as an extra CSS class
	// when it's set (`if (this.name) this.ac(this.name)`), so a chip holding its
	// text as `name` would silently wear the tag's own text as a class ("core").
	chip(name){ return new this.constructor.Chip({ tags: this, value: name }); }

	field(){
		return this.$input = input().ac("ui-tags-input flex-1").attr("placeholder", "add a tag…")
			.on("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); this.add(this.$input.el.value); } });
	}

	/* type-to-add. Refocuses the freshly-built field after a redraw, so typing
	 * several tags in a row never needs a click back into the box. */
	add(name){
		name = name.trim();

		if (name && !this.tags.includes(name)){
			this.tags.push(name);
			this.draw();
			this.$input.el.focus();
			this.changed();
		} else {
			this.$input.el.value = "";
		}

		return this;
	}

	/* ⚠ Not `remove()` — that is View's own (detaches an element from ITS parent);
	 * shadowing it here would silently break `.remove()` on a Tags instance itself. */
	drop(name){
		this.tags = this.tags.filter(t => t !== name);
		this.draw();
		this.changed();
		return this;
	}

	changed(){
		this.onChange?.(this.tags);
		return this.tags;
	}
}

/* ⚠ Prototype, not class fields — see ux/Menu/Menu.js for why. */
Tags.prototype.tag = "div";
Tags.prototype.classes = "surface pad flex wrap v-center gap";
Tags.prototype.tags = [];

/* The chip: a real part, unlike Menu's items or Pagination's buttons — it owns its
 * OWN listener (the ×), not just a class toggle the parent drives centrally. */
Tags.Chip = class TagsChip extends View {

	render(){
		this.style("--gap", "0.4em");
		span(this.value);
		this.x();
	}

	x(){ return span.c("muted", "×").style("cursor", "pointer").click(() => this.tags.drop(this.value)); }
};

Tags.Chip.prototype.tag = "span";
Tags.Chip.prototype.classes = "ui-pill h4 flex v-center gap";

export { Tags };
