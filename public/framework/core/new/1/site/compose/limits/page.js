import { Page, p, div, a, button } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, cost } from "../../compound/recipe.js";

export default new Page({
	meta: import.meta,
	title: "Where it runs out",

	ticks: 0,

	initialize(){
		this.add("before", {
			title: "Before",
			content(){
				p("I am a real page at `/compose/limits/before/`. I am also permanently on screen beside my sibling, which `Router.mark()` cannot say — it marks exactly one leaf.");
				p("Click my link and nothing moves: I was already placed in the region `container()` was going to hand me.").ac("note");
				this.link("my own url");
			}
		});

		this.add("after", {
			title: "After",
			content(){
				p("The other pane. Independent scroll, independent content, its own url, its own place in the chain.");
				p("Drag the bar between us. The split is one custom property written by a drag and read by a grid — no measurement, no layout code, no resize bookkeeping.").ac("note");
				this.link("my own url");
			}
		});
	},

	// SAFE to override: the base does nothing load-bearing, and this is the
	// documented place to release a timer. Contrast with activate(), below.
	deactivate(){
		clearInterval(this.timer);
		this.timer = null;
		return this;
	},

	content(){
		p("Ten compound recipes and every one was expressible. This page is the attempt to find one that is not — a split view with two live urls, independent scroll and a draggable divider, plus a persistent timer, plus every way I could think of to make one page be in two places.");

		section("The arrangement that should have broken it");

		p("Two real pages, side by side, both permanently visible, each addressable, with a draggable split. Three things the framework explicitly does not have a concept for: two leaves at once, a named pane, and a resizable anything.");

		let $before, $after;

		this.$split = div.c("split", () => {
			$before = div.c("pane show-all");
			this.$handle = div.c("split-handle");
			$after = div.c("pane show-all");
		});

		/* `regions` is a Map of name -> view that `container()` checks FIRST.
		 * tabs() writes it; nothing says tabs() is the only thing allowed to.
		 * Two named panes is two entries, and that is the whole split view. */
		this.regions = new Map([["before", $before], ["after", $after]]);

		$before.append(this.before.render());
		$after.append(this.after.render());

		// the divider: eight lines, and the only state is one CSS variable
		this.$handle.on("pointerdown", e => {
			e.preventDefault();
			const move = ev => this.$split.style("--split",
				Math.max(120, ev.clientX - this.$split.el.getBoundingClientRect().left) + "px");
			const up = () => {
				document.removeEventListener("pointermove", move);
				document.removeEventListener("pointerup", up);
			};
			document.addEventListener("pointermove", move);
			document.addEventListener("pointerup", up);
		});

		code(`
this.regions = new Map([["before", $before], ["after", $after]]);
$before.append(this.before.render());
$after.append(this.after.render());`, "the whole split view");

		p("It holds, and it holds for a reason worth stating: `container()` is asked where to mount, the panes answer, and because each page was already placed in the region it would have been given, `activate()` finds `parentNode === container.el` and does nothing at all. Navigating between the panes moves zero DOM.").ac("note");

		section("The timer that survives everything");

		this.$ticks = p.c("note");
		this.timer ??= setInterval(() => this.$ticks?.text(`${++this.ticks} seconds since this page first rendered.`), 1000);

		p("Nothing tears a page down, so a timer, a socket or a playing `<audio>` keeps going when you navigate away — `display: none` is the only thing that happened to it. `deactivate()` exists precisely for this and I override it above, safely.");

		section("So what DID break");

		p("Four things. The first two are the same fact wearing different clothes, and it is not a policy anyone chose — it is what `render()` memoizing into `this.view` plus a DOM node having one parent add up to.");

		p("1 — One instance cannot be in two places. Watch it happen:");

		const $box = div.c("embed-box", () => div.c("code-label", "a second box, wanting the same page"));

		div.c("row", () => {
			button("move `before` in here").click(() => $box.append(this.before.view));
			button("put it back").click(() => $before.append(this.before.view));
		});

		p("The left pane empties. Not a copy — a move, silently, with no error. A View is a place, not a value.").ac("note");

		p("2 — One instance cannot live at two urls. This runs for real, on throwaway pages, when you click it:");

		const $out = div.c("embed-box", () => div.c("code-label", "live, on two throwaway parents"));

		div.c("row", () => button("adopt one page twice").click(() => {
			const shared = new Page({ title: "Shared" });
			const x = new Page({ url: "/x/", name: "x" });
			const y = new Page({ url: "/y/", name: "y" });

			x.add("settings", shared);
			const first = `${shared.url}   chain: ${shared.chain().map(pg => pg.name).join(" › ")}`;
			y.add("settings", shared);
			const second = `${shared.url}   chain: ${shared.chain().map(pg => pg.name).join(" › ")}`;

			$out.empty(() => {
				div.c("code-label", "live, on two throwaway parents");
				p(`after x.add:  ${first}`).ac("note");
				p(`after y.add:  ${second}`).ac("note");
				p(`x still lists it: ${x.children.get("settings") === shared}`).ac("note");
			});
		}));

		code(`
after x.add   /x/settings/   chain: x › settings
after y.add   /x/settings/   chain: y › settings
              ^^^^^^^^^^^^          ^^^
              the url did NOT follow the new parent

x.children still holds it. The page now has one url, a different
chain, and two parents that both claim it. Nothing threw.`);

		p("`naming()` uses `??=`, so a url that already exists is never re-derived. `add()` reassigns `parent` regardless. The result is a page whose `link()` and whose crumb trail disagree with each other — permanently, silently. This is the one thing in three files I would call a bug rather than a trade.").ac("note");

		p("3 — There is a safe hook for leaving and none for entering. `deactivate()` does nothing in the base, so overriding it is free. `activate()` mounts the page, so overriding it silently produces a blank screen unless you remember `Page.prototype.activate.call(this)`. My ticker above dies on the way out and cannot restart on the way back in without taking that risk.");

		p("4 — Two independent history stacks cannot exist. The two panes above share one url and therefore one Back button. This is the web's limit rather than the framework's — one url is one history entry, and no SPA has ever had two — but it is the honest ceiling on 'the url is the only state', and a split view is exactly where a user expects otherwise.");

		section("The verdict, in the terms it was asked for");

		p("I could not break it. CSS-plus-two-classes did not run out: showing a page the Router never marked is one selector, a named pane is one Map, and a resizable split is one custom property. Every arrangement I could describe, I could build, and five of the ten compound recipes needed no CSS at all.");

		p("What ran out is not CSS and not the Router. It is identity — a `View` is a place and a `Page` has one parent — and that is the correct place for a limit to live, because it is the one limit that is a fact rather than a decision. Composition failed exactly where composition should fail: when you ask one object to be two.").ac("note");

		section("The file");

		this_file(import.meta);

		cost("the split above spends the one thing `/compound/` never had to: it writes `regions` by hand. That is a public mechanism being used by something other than `tabs()`, and if the council would rather it stayed private, this arrangement is the reason to say so out loud rather than by omission.");

		div.c("row", () => a.c("page-link", "← back to Compose").href("/compose/"));
	}
});
