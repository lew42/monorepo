import { Page, p, div } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, when, cost } from "../../compound/recipe.js";
import fixed, { panel } from "./fixed/page.js";

export default new Page({
	meta: import.meta,
	title: "Slots",

	// EAGER on purpose — I import the module to get at its `panel` factory, so
	// pretending its default export is lazy would be a lie. See the verdict.
	children: [fixed],

	initialize(){
		this.add("both", panel({
			title: "Both slots filled",
			header(){ p("HEADER — a function the parent passed in."); },
			footer(){ p("FOOTER — likewise, and neither is a mechanism."); },
		}));

		this.add("bare", panel({ title: "Nothing supplied" }));

		this.add("top", panel({
			title: "Header only",
			header(){ p("Just the one. A slot nobody fills is `undefined`, and `?.` is the whole fallback story."); },
		}));
	},

	content(){
		when("several pages share one arrangement and differ only in what goes into named holes — a doc layout, a settings shell, a wizard step frame.");

		section("Slots already exist. They are called assign()");

		code(`
// the LAYOUT names its slots by calling them
content(){
    this.header ? this.header() : p("(no header supplied)");
    p("the layout's own body");
    this.footer ? this.footer() : p("(no footer supplied)");
}

// the PARENT fills them by passing functions
this.add("both", panel({
    header(){ p("HEADER — a function the parent passed in."); },
    footer(){ p("FOOTER — likewise."); },
}));`, "the entire slot system");

		p("Measured: a function passed to the constructor becomes a method, with `this` bound to the page. That is not a feature anyone added for slots — it is `Object.assign`, which was chosen for options merging, doing exactly what it says.");

		this.$pages = div.c("pages cols show-all", () => {
			this.children.forEach(child => child.render());
		});

		section("What a real slot system would have added");

		code(`
a <slot name> registry        assign() already keys by name
default content               ?. and a ternary, in the layout
named vs. default slots       property names ARE the names
render-time resolution        the layout calls it; there is no phase
scoped styles                 nothing here is scoped, by design

Nothing. It would have added API surface and taken nothing away.`);

		p("So the rejection in my last report stands, and now for a stronger reason than 'we do not need it'. A slot system would be a second way to do what the constructor already does — and CLAUDE.md's own rule is that an option is API surface forever while the override lever usually already covers it. Here the override lever is the language.").ac("note");

		section("Where it genuinely stops");

		p("You can fill the slots of a page you construct. You cannot fill the slots of a page that constructs itself — a file-backed `export default new Page(…)` has already run by the time you have a reference to it, and its `content()` has closed over whatever it was given.");

		p("`Fixed` above is the answer to that, and it is one word long: `export function panel(fill)`. The layout is exported as a factory, the default export is one instance of it, and a consumer chooses. The cost is stated plainly in this file's `children:` — I import the module to reach the factory, so that child is eager and I said so rather than pretending.").ac("note");

		code(`
export function panel(fill){ return { ...fill, content(){ … } }; }
export default new Page(panel({ meta: import.meta, title: "Fixed" }));

walk to it     ->  lazy, one instance, slots as its own file left them
import it      ->  eager, and you may build as many filled ones as you like`);

		section("The hazard on the other side of the same coin");

		p("Every prototype method is assignable, which is what makes slots free — and it is also what makes `activate` fillable. Measured: `new Page({ activate(){…} })` shadows the method that mounts the page, the page never appears, and nothing throws. Three writers share one namespace on every `Page`: the prototype, your constructor object, and `alias()` writing your children's names onto it.");

		code(`
the prototype    activate render container chain add child link preview tabs
your options     anything you pass — INCLUDING those
alias(name)      every child's name, with dashes turned into underscores

alias() already guards with: if (!(key in this))
The constructor does not, and cannot — overriding is the point.`);

		p("That asymmetry is correct, not a bug: `alias()` is the framework writing, and it must not clobber; the constructor is you writing, and clobbering is the feature. The one thing worth adding is a name — these four are load-bearing, and a page that assigns one is almost certainly making a mistake it will not see.").ac("note");

		section("The file");

		this_file(import.meta);

		cost("a slot is invisible from the layout's file until someone fills it, and invisible from the filler's file until you read the layout. That is the same action-at-a-distance `container()` has, in a smaller room — and unlike `container()`, it is at least always between two files you chose to put together.");
	}
});
