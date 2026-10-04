import View, { div } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import grip from "../../ext/grip/grip.js";

View.stylesheet(import.meta, "Shell.css");

/**
 * Shell — a CSS grid of five optional regions around one main area:
 *
 *   new Shell({ header, left, right, footer, main, frame, dark, name });
 *
 *   header / left / right / footer / main   each one a function (rendered into
 *       its region, captor style — write it exactly like a page's own content())
 *       or a View (appended straight in). Leave one out and it takes NO SPACE —
 *       there is no empty box left behind. `main` can be another `new Shell(…)`,
 *       so shells nest.
 *   frame    true = this shell is `position: fixed; inset: 0` around the whole
 *       window, its `main` cell is an empty, click-through hole (`pointer-events:
 *       none`) so the real page shows through it, and it writes each region's
 *       own size onto <html> as four tokens — `--shell-top/-left/-right/-bottom`
 *       — a page underneath can pad itself by, the same way `--devbar` already
 *       works. Off (the default) is a plain grid you put inside any page.
 *   dark     true = the whole shell is `color-scheme: dark` (the site's own
 *       tokens are `light-dark()` pairs, so this one line is the whole dark
 *       theme — see framework.css and dev/DevBar/devbar.css's own `.dev-bar`).
 *       An array (`dark: ["left", "right"]`) darkens only those regions.
 *   name     one word. With it, a dragged left/right width is remembered in
 *       localStorage under that name and restored next time; without it, sizes
 *       are for this visit only. `View.classify()` also stamps `name` on as a
 *       plain CSS class — the same rule every View already follows.
 *
 * Left and right are resizable by their own inner edge (`ext/grip`, the same
 * handle `core/Sidebar` and `/layouts/shell/` use), 12rem to half the room,
 * double-click to reset.
 *
 * Below 34em there is no room for a row of regions: left and right STACK above
 * and below `main` instead of beside it (not a toggled sheet — the simpler of
 * the two, chosen because a demo-sized shell has nowhere to put a sheet's own
 * scrim and close button; `dev/DevShell` can still lay its own sheet on top of
 * a plain Shell if it wants one).
 *
 * Every part is its own method — `header()`, `left()`, `main()`, `right()`,
 * `footer()` — so a subclass overrides one without forking the rest. The
 * content you PASS to the constructor lives under `this.content`, one level
 * down from those method names on purpose: `new Shell({ header: fn })` would
 * otherwise overwrite the `header()` method itself (`Object.assign` in the
 * constructor cannot tell "data" from "a method with the same name" apart —
 * `code` skill §7, "names that collide with core") and a subclass would have
 * nothing left to override.
 *
 * Design record: readme.md, doc/decisions.md.
 */
export class CoreShell extends View {

	assign(...args){
		const merged = Object.assign({}, ...args);
		const { header, left, right, footer, main, ...rest } = merged;

		this.content = { header, left, right, footer, main };

		return Object.assign(this, rest);
	}

	render(){
		this.restore_sizes();

		div.c("core-shell-grid", () => {
			this.header();
			this.left();
			this.main();
			this.right();
			this.footer();
		});

		this.apply_dark();

		if (this.frame) this.watch_frame();
	}

	header(){ return this.$head = this.slot("head", this.content.header); }
	footer(){ return this.$foot = this.slot("foot", this.content.footer); }

	left(){ return this.$left = this.slot("left", this.content.left, "start"); }
	right(){ return this.$right = this.slot("right", this.content.right, "end"); }

	// `frame` mode never shows real content in the middle — it is the hole the
	// real page shows through (doc/decisions.md), so it skips whatever `main`
	// content was passed rather than drawing it on top of the page.
	main(){
		if (this.frame) return this.$main = div.c("core-shell-main");
		return this.$main = this.slot("main", this.content.main);
	}

	// One region: a named box (`core-shell-<area>`), with `content` appended into
	// it captor-style — `View.append()` already knows how to take a function
	// (calls it with this box as captor) or a View (appends its element
	// directly, which is how `main` can hold a nested `Shell`). No `content` at
	// all means no box — the grid's own `auto` track for that area then has
	// nothing in it and takes zero space, which is the whole "optional" trick;
	// nothing here needs to size it by hand.
	slot(area, content, grab_from){
		if (!content) return;

		return div.c(`core-shell-${area}`, $box => {
			$box.append(content);
			// Bare, on purpose: `$box` is the live captor right here (we are
			// inside `div.c`'s own callback), so the grip element `grip()`
			// builds appends itself into `$box` the moment it's constructed —
			// the same auto-capture every plain factory call relies on. No
			// need to hand `$box.append(...)` the result back.
			if (grab_from) this.grab(area, grab_from);
		});
	}

	// THE HANDLE — `ext/grip`, shared with `core/Sidebar` and `/layouts/shell/`.
	// `write` sets the width token on every frame of the drag (no `done` needed
	// for that half); `done` fires once, on release, with the one width worth
	// remembering; `reset` is the double-click.
	grab(area, from){
		return grip({
			from,
			write: px => this.size(area, px, false),
			done: px => this.size(area, px, true),
			reset: () => this.size(area, null, true),
		});
	}

	// The width, in one place: sets the CSS variable (inherited down from the
	// shell's own root element to `.core-shell-left`/`-right`, so it does not
	// matter that it's set here rather than on the box itself), and remembers it
	// — but only when this shell has a `name`; an unnamed shell's sizes are for
	// this visit alone. `null` (double-click, or nothing ever saved) clears the
	// override and CSS's own clamp default answers instead.
	size(area, px, save){
		const width = px ? Math.round(px) : null;

		this.style(`--core-shell-${area}-w`, width ? width + "px" : "");
		if (save && this.name) this.store().patch({ [area]: width });

		return width;
	}

	// The saved widths, read back before the first paint — `render()` calls this
	// before drawing a single region, so a returning visitor never sees the
	// default width flash before the remembered one replaces it.
	restore_sizes(){
		if (!this.name) return;

		const saved = this.store().get({});
		if (saved.left) this.style("--core-shell-left-w", saved.left + "px");
		if (saved.right) this.style("--core-shell-right-w", saved.right + "px");
	}

	// One localStorage record per shell `name` — reusing `Page.Prefs`'s own
	// guarded read/write (private mode, a full quota: it falls back to memory
	// and warns once, never throws) instead of a second hand-rolled try/catch
	// (doc/decisions.md).
	store(){ return new Page.Prefs({ id: `shell:${this.name}` }); }

	// `dark: true` darkens the whole shell (color-scheme is inherited, so every
	// `light-dark()` token under it flips at once); `dark: ["left","right"]`
	// darkens only the boxes named. Nothing here ever names a colour.
	apply_dark(){
		if (!this.dark) return;

		if (this.dark === true){
			this.ac("core-shell-dark");
			return;
		}

		for (const area of this.dark){
			this[`$${area}`]?.ac("core-shell-dark");
		}
	}

	// `frame`: this shell IS the window frame. Each region writes its own size
	// onto <html> as one token, so `.app` (or anything else) can pad itself in —
	// exactly how `--devbar` already docks the dev rail. A `ResizeObserver` per
	// region, not one on the whole shell, because dragging left/right changes
	// THEIR box, never the shell's own (a `position: fixed; inset: 0` box never
	// resizes on its own). Every token is written `0px` first, so a region that
	// is not in this shell at all still answers a real number, never "unset".
	watch_frame(){
		this.ac("core-shell-frame");

		const root = document.documentElement;
		const regions = [
			["head", "top", "offsetHeight"],
			["left", "left", "offsetWidth"],
			["right", "right", "offsetWidth"],
			["foot", "bottom", "offsetHeight"],
		];

		// `publish: false` keeps the frame look without pushing the page — for a
		// frame shown as a DEMO inside a box (core/Shell's own page did push the
		// whole site in by 192px until this existed; review, 2026-09-30).
		if (this.publish === false) return;

		for (const [area, token, prop] of regions){
			root.style.setProperty(`--shell-${token}`, "0px");

			const el = this[`$${area}`]?.el;
			if (!el) continue;

			const set = () => root.style.setProperty(`--shell-${token}`, el[prop] + "px");
			new ResizeObserver(set).observe(el);
			set();
		}
	}
}

export default CoreShell;
export { CoreShell as Shell };
