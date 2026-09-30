import { View, div, span } from "../core/View/View.js";
import { item } from "../ui/item/item.js";
import DefaultView, { view } from "/framework/ux/Content/Object/DefaultView.js";

View.stylesheet(import.meta, "Part.css");

/**
 * class Part — the shared shape every audio/ class is built on: an assign-based
 * constructor (`code` skill §2), plus `thing.view` (the item-ui pattern, `code`
 * skill §9) so any part can be dropped straight into a page with no per-class
 * "how do I show this" code. A class opts into a look of its own with
 * `Klass.View = class extends View { … }`; with none, `.view` falls back to the
 * generic property tree (`ux/Content/Object/DefaultView.js`).
 *
 *   class Widget extends Part { … }
 *   Widget.View = class extends View { render(){ … this.subject … } };
 *   const w = new Widget();
 *   w.view                          // → a Widget.View, ready to draw
 */
export default class Part {
	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/** The default view for this instance — `Klass.View` when the class (or an
	 *  ancestor) declared one, else a generic property tree. A getter, not a
	 *  method: it costs nothing until read, and "reached as `thing.view`" is the
	 *  brief's own words for this. */
	get view(){ return view(this); }

	/** The three sizes the owner asked every audio class to show its live state
	 *  at (2026-09-29, relayed by task-mastermind-audio): a bare icon with small
	 *  flags, a one-line row (icon + name + a key value or two), and a full
	 *  panel. All three are the SAME `Klass.View`, just built at a different
	 *  `size` — see `PartView` below. */
	get icon_view(){ return new this.constructor.View({ subject: this, size: "icon" }); }
	get row_view(){ return new this.constructor.View({ subject: this, size: "row" }); }
	get panel_view(){ return new this.constructor.View({ subject: this, size: "panel" }); }
}

/**
 * class PartView extends View — the base every `Klass.View` in `audio/` extends,
 * so "three sizes" is one small render switch instead of three hand-built
 * layouts per class. Built on `ui/item/item.js` (never a new row shape) and
 * falls back to `ux/Content/Object/DefaultView.js`'s own property tree for the
 * panel size, so "as much of the data as you can show" costs no new code.
 *
 *   class Foo extends Part { … }
 *   Foo.View = class extends PartView {
 *       glyph(){ return "mic"; }                         // icon size, always
 *       flags(){ return [["clipping", this.subject.hot]]; }   // icon size: little dots
 *       stat(){ return this.subject.level.toFixed(2); }   // row size: one key value
 *   };
 *
 * `details()` is the one hook worth overriding for panel size — the default
 * (a generic property tree) already shows every own property, but a class
 * with something better to say (a table of Whisper requests, say) can draw it
 * itself and skip the generic tree entirely.
 */
export class PartView extends View {

	size = "row";   // icon | row | panel

	render(){
		this.ac("audio-partview audio-partview-" + this.size);
		if (this.size === "icon") this.icon();
		else if (this.size === "panel") this.panel();
		else this.row();
	}

	/** A glyph plus small lit/unlit flags — "recording", "clipping", whatever
	 *  `flags()` names for this class. No text at all: this size is for a
	 *  toolbar or a dense row of many instances. Element refs are kept
	 *  (`this.$flags`) so a subclass's own event (a level tick, a state change)
	 *  can call `refresh()` and repaint cheaply — a full `item()` rebuild on
	 *  every audio frame would be real, needless work. */
	icon(){
		item({ icon: this.glyph(), name: "", end: () => { this.$flags = this.flag_row(); } });
	}

	/** One line: the icon, the class's own name for itself, and `stat()` — the
	 *  one or two numbers that matter most right now (a level, a device label,
	 *  a duration). */
	row(){
		const $row = item({ icon: this.glyph(), name: this.label(), end: () => { this.$stat = span.c("item-end muted", this.stat()); } });
		// A raw DOM ref, not a View wrapper — `item()` builds the name as a plain
		// `span.c("item-name", …)` with no ref of its own, and `refresh()` needs to
		// reach it directly. Without this the name froze at whatever `label()`
		// said at first render — "no microphone open" stayed on screen through an
		// entire hold-to-talk take, because `refresh()` only ever touched
		// `$stat`/`$flags` (found from `demo-live-1920.png`, 2026-09-30).
		this.$name = $row.el.querySelector(".item-name");
	}

	/** The row, then everything else worth knowing — `details()` by default:
	 *  the generic property tree, so "as much of the data as you can show"
	 *  needs no per-class code until a class wants to say it better. */
	panel(){
		div.c("flex v gap-50", () => { this.row(); div.c("audio-partview-panel", () => { this.details(); }); });
	}

	flag_row(){ return div.c("flex gap-25", () => this.flags().forEach(([name, on]) => this.flag(name, on))); }
	flag(name, on){ return span.c("audio-partview-flag" + (on ? " on" : "")).attr("title", name); }

	/** Cheap live repaint: text + flag classes only, never a rebuild — call this
	 *  from whatever event the subclass already subscribes to (a level tick, a
	 *  state change). Safe to call at any size; it only touches refs the size
	 *  actually built. */
	refresh(){
		if (this.$name) this.$name.textContent = this.label();
		this.$stat?.text(this.stat());
		if (this.$flags){
			this.$flags.el.innerHTML = "";
			this.$flags.append(() => this.flags().forEach(([name, on]) => this.flag(name, on)));
		}
	}

	glyph(){ return "graphic_eq"; }
	label(){ return this.subject.constructor.name; }
	stat(){ return ""; }
	flags(){ return []; }
	details(){ return new DefaultView({ subject: this.subject }); }
}

export { Part };
