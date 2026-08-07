import { Page, p, a, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { code as js } from "/framework/ext/highlight/highlight.js";   // js.fn(fn) — shown, never run
import { field } from "../field.js";
import { post } from "../post.js";
import { this_file } from "../this_file.js";

export default new Page({
	meta: import.meta,
	title: "Submit, then navigate",
	classes: "forms",

	initialize(){
		this.add("done", {
			title: "Accepted",
			content(){
				p("Now press the browser's Back button.").ac("note");
				p("Arrived by `go()` — you land back on the filled form, which is a page that says *submit* about work that has already been submitted. Arrived by `replace` — you skip it entirely.").ac("note");
				a.c("page-link", "← the form").href("/forms/submit/");
			},
		});
	},

	content(){
		demo(() => {
			this.$order = field("Order note", { name: "order", value: "two of everything" });
			this.$status = p.c("forms-status", `history.length = ${history.length}`);

			button("submit, then go() — pushState").click(async () => {
				this.$status.text("posting…");
				await post({ note: this.$order.el.value });
				this.app.router.go("/forms/submit/done/");
			});

			button("submit, then replace — replaceState").click(async () => {
				this.$status.text("posting…");
				await post({ note: this.$order.el.value });

				// Router.go(), with one word changed. This is the entire proposal.
				const router = this.app.router;
				if (await router.load("/forms/submit/done/"))
					history.replaceState({}, "", "/forms/submit/done/");
			});
		}, "Both post the same thing and land on the same page. The difference is only visible when you press Back: `go()` leaves this form in history, `replace` does not. There is no server — `post()` is a promise and a `setTimeout`.");

		code(`
land on /columns/, navigate to /forms/submit/, submit:

go()      -> /forms/submit/done/   history.length 3 -> 4   Back: /forms/submit/
replace   -> /forms/submit/done/   history.length 3 -> 3   Back: /columns/`,
			"measured — one entry, and which page Back returns to");

		section("The gap");

		code(`
async go(url){
    if (await this.load(url)){
        history.pushState({}, "", url);       // <- the ONLY history call in Router
    } else {
        location.assign(url);
    }
}`, "Router.js — there is no replaceState anywhere");

		md("Yes, this is a gap, and it is a real one rather than a theoretical one: **every** post-submit redirect wants it, and it is the oldest fix in web navigation. Today a page has to reach past the Router and call `history.replaceState` itself, which means duplicating `go()`'s load-then-push order and getting the failure branch wrong.").ac("note");

		section("The minimum fix");

		js.fn(() => {
			// Router.js — go() keeps its name and its meaning; the shared body moves
			// down one level and gains no options object.
			class Router {
				go(url){ return this.navigate(url, "pushState"); }
				replace(url){ return this.navigate(url, "replaceState"); }

				async navigate(url, how){
					if (await this.load(url)) history[how]({}, "", url);
					else location.assign(url);
				}
			}
		});

		md("Two lines added, one moved. No options object, no flag, no third state — and **zero new vocabulary**, because `pushState` and `replaceState` are the two names the History API already has. `router.replace('/done/')` reads as a sentence, and `Page.go()` gains an obvious twin if anyone ever wants one.").ac("note");

		section("Why not a flag");

		code(`
go(url, { replace: true })     an option on the hot path, forever
go(url, "replaceState")        a string that must be spelled exactly
router.replace(url)            a name`, "three ways to say it");

		p("An option is API surface forever and every reader of `go()` then has to know what the second argument does. Two named methods cost one extra line and nothing to remember.").ac("note");

		a.c("page-link", "next: optimistic, then navigate →").href("/forms/optimistic/");

		this_file(import.meta);
	},
});
