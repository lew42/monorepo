import { Page, View, p, div } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, when, cost } from "../../compound/recipe.js";

// A FRAGMENT: a function returning a view. Called twice, you get two views.
function badge(text){ return p.c("note", "▸ " + text); }

/* THE TRAP: a view held at module scope. One object, therefore one place.
 * `capture: false` is load-bearing — a bare `p.c(…)` at module scope appends
 * itself into whatever happens to be capturing at import time, which during a
 * navigation is `app.$pages`. A stray paragraph, in the app, from a `const`. */
const SHARED = new View({ tag: "p", capture: false }).ac("note")
	.text("▸ I am ONE view, held in a const. Whoever appended me LAST has me.");

export default new Page({
	meta: import.meta,
	title: "Fragments",

	initialize(){
		["alpha", "beta"].forEach(name => this.add(name, {
			title: name,
			content(){
				div.c("embed-box", () => {
					div.c("code-label", "badge() — a function");
					badge(`${name} called it, and got its own view`);
				});

				div.c("embed-box", () => {
					div.c("code-label", "SHARED — a const");
					this.append_shared();
				});
			},
			// both columns run this; only the second one keeps it
			append_shared(){ View.captor.append(SHARED); }
		}));
	},

	content(){
		when("two pages say the same thing and neither should own it — a disclaimer, a status badge, a formatted date, a link row.");

		p("Both columns below run the same two lines. `badge()` is a function, so each column gets its own view. `SHARED` is a `const`, so there is one view and the column that appended it last is holding it. Look at Alpha's second box: it is empty, and nothing threw.");

		this.$pages = div.c("pages cols show-all", () => {
			this.children.forEach(child => child.render());
		});

		section("The ladder");

		code(`
a function          no identity, no state, no url    ->  a fragment
a View subclass     methods and state of its own     ->  a widget
a Page              a url, a chain, a lifecycle      ->  a destination

Stop at the first one that works. Nothing on this site has needed
the second, and that is worth knowing rather than assuming.`);

		p("So: is anything more than a plain function ever warranted? Yes, twice, and the framework already has both. The moment a fragment needs methods and internal state it is a `View` subclass — `classify()` even names its CSS class for it. The moment it needs a url or a hook for entering and leaving, it is a `Page`. There is no fourth thing, and there is no Fragment class worth writing, because a function returning a view already has zero API surface and cannot be misused.").ac("note");

		section("The rule that generates this whole page");

		code(`
a function returning a view   ->  a VALUE   ->  compose freely
a view held anywhere          ->  a PLACE   ->  exactly one owner`);

		section("The file");

		this_file(import.meta);

		cost("nothing, so long as you never hoist a view to module scope to 'avoid rebuilding it'. That optimisation is the bug: it turns a value into a place, and the failure is silent — an empty box, no error, and it only appears when the fragment is used twice.");
	}
});
