import { Page, p, div, a, input, select, option } from "/app.js";
import { code, section } from "../../../ui.js";
import { recipe } from "../../recipe.js";
import { field } from "../page.js";

/* The section with sub-sections — and a FILE rather than an inline child, which
 * is not a style choice. See the note at the bottom: an inline page that adds
 * inline children of its own computes their urls before it has one itself.
 */
const nav = () => ({
	meta: import.meta,
	title: "Notifications",

	initialize(){
		this.add("email",  { title: "Email",  content(){ email(); } });
		this.add("push",   { title: "Push",   content(){ push(); } });
		this.add("digest", { title: "Digest", content(){ digest(); } });

		// Free here — every child is already an object — and without it the bar
		// reads "Email push digest". See the note below.
		this.load_all_children();
	},

	content(){
		this.$tabs = this.tabs("email push digest");
		this.notes();
	},
});

export default new Page(nav(), {

	notes(){
		recipe(nav);

		section("Why this one was a file — and no longer has to be");

		code(`
this.add("notifications", { initialize(){ this.add("email", …); } });

BEFORE   add()  ->  new Page(opts)              -> initialize() runs with no parent
                    page.assign({ parent }).naming()   -> url arrives too late
                    the inner child computed "undefinedemail/"

AFTER    add()  ->  new Page(opts, { name, parent, app })
                    later args win, so initialize() runs WITH a url

measured, live:  parent /probe-parent/   child /probe-parent/kid/`,
			"found independently by the url seat; fixed while this section was being written");

		p("An inline page gets its url from its parent at adoption, and `initialize()` used to run before that — so an inline child OF an inline child was named against a parent with no url. Adoption now goes in through the constructor, which is the same `assign(...args)` merge as `new Router(this.router, { app: this })`, and the ordering problem is gone.");

		p("This page stays a directory anyway: a settings section with three sub-sections and four forms has earned a file. The point of recording it is that a nested tab set was the shape that surfaced it, and every `route()`-built page was in exactly the same position.").ac("note");

		section("…and why this bar needs load_all_children()");

		code(`
without   Email push digest      ← the first tab's title, then declared names
with      Email Push Digest      ← and it costs ZERO requests`, "measured");

		p("The rule that prints declared names is right for lazy children: a title only exists once something imports that page, and which pages are imported depends on the url you arrived at, so a bar built from titles would read differently per entry point. None of that is true of an inline child — it is an object in memory from the constructor onwards, on every entry point. `tabs()` cannot tell the two apart because `children` forgets: a lazy name is `null` until it resolves and then it is just a Page, like any other.").ac("note");
	},
});

function email(){
	section("Email");

	field("Mentions", () => input().attr("type", "checkbox").attr("checked", "checked"));
	field("Replies to my comments", () => input().attr("type", "checkbox").attr("checked", "checked"));
	field("Weekly summary", () => input().attr("type", "checkbox"));
	field("Send to", () => select(() => ["ada@example.com", "ada+work@example.com"].forEach(e => option(e))));
}

function push(){
	section("Push");

	field("Direct messages", () => input().attr("type", "checkbox").attr("checked", "checked"));
	field("Deploy finished", () => input().attr("type", "checkbox"));
	field("Quiet hours", () => input().attr("type", "time").attr("value", "22:00"));

	p("Look up at the top bar while you are here: Account is lit and its content is showing above this. That is the nested-tabs bug, on the screen it was reported on.").ac("note");

	div.c("row", () => a.c("page-link", "← Settings").href("/patterns/settings/"));
}

function digest(){
	section("Digest");

	field("Frequency", () => select(() => ["Daily", "Weekly", "Never"].forEach(f => option(f))));
	field("Include", () => select(() => ["Everything", "Only my teams", "Only mentions"].forEach(f => option(f))));
}
