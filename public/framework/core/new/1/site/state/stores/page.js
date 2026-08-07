import { Page, p, div, a, input } from "/app.js";
import { code, section } from "../../ui.js";

/* css: .async-render, .async-num — lab.js is where async.css is loaded.
   Not a dead import: it is the loading edge for the classes used below. */
import "../../async/lab.js";

// MODULE SCOPE. One per module, shared by every Page this file ever makes —
// which is one page, except under route(), where it is all of them.
let module_visits = 0;
let claims = 0;

export default new Page({
	meta: import.meta,
	title: "Six stores",

	instance_visits: 0,          // the PAGE INSTANCE — an ordinary property

	/* Two Page instances from one module. This is the ONLY case where module
	 * scope and the Page instance differ, so it is worth being able to click. */
	route(name){
		const built_at = ++claims;

		return {
			title: `claimed: ${name}`,
			content(){
				p(`I have no file. \`route("${name}")\` built me on the spot.`);

				code(`
module-scope counter when I was built:  ${built_at}
my own instance:                        a different object from every sibling`,
					`/state/stores/${name}/`);

				p("Open the other one and compare the first number. One module, many pages — the counter is shared because it belongs to the file, not to me.").ac("note");

				div.c("row", () => {
					a.c("page-link", "claimed: a").href("/state/stores/a/");
					a.c("page-link", "claimed: b").href("/state/stores/b/");
					a.c("page-link", "← stores").href("/state/stores/");
				});
			},
		};
	},

	activate(){
		Page.prototype.activate.call(this);

		module_visits++;
		this.instance_visits++;
		this.bump("state-session", sessionStorage);
		this.bump("state-local", localStorage);
		this.refresh();

		return this;
	},

	bump(key, storage){
		const next = Number(storage.getItem(key) ?? 0) + 1;
		storage.setItem(key, next);
		return this[key.replace("-", "_")] = next;
	},

	// Only .text() calls — no factory call, so there is nothing for the captor
	// to lose. Runs on every activation, which content() cannot do.
	refresh(){
		this.$counts?.text(
			`url            ${this.url}\n` +
			`memoized view  ${this.$typed?.el.value ? `"${this.$typed.el.value}"` : "(type below)"}\n` +
			`Page instance  ${this.instance_visits} activation(s)\n` +
			`module scope   ${module_visits} activation(s)\n` +
			`sessionStorage ${this.state_session}\n` +
			`localStorage   ${this.state_local}`);

		return this;
	},

	content(){
		p("Every number below is read live. Navigate away and back, press Back, reload, then open this url in a new tab — each store drops out at a different point.");

		div.c("async-render", () => {
			this.$counts = div.c("counts state-counts async-num");

			this.$typed = input.c("typed state-input")
				.attr("placeholder", "type here, then navigate away and come back")
				.on("input", () => this.refresh());
		});

		section("What each one is");

		code(`
the url            location.pathname. Router walks it. Survives everything.
the memoized view  render() caches this.view, so the DOM — and every value,
                   scroll offset and open <details> in it — is kept as-is.
the Page instance  an ordinary object. Lives as long as the module registry.
module scope       a \`let\` in a page.js. One per FILE.
sessionStorage     survives reload, dies with the tab.
localStorage       survives everything except a different browser.`);

		p("The first is the framework's central claim. The second is the one nobody chose — see `accident`. The rest are ordinary JavaScript and the framework has no opinion about them.").ac("note");

		section("One module, many pages");

		p("`route()` is the case that separates module scope from the Page instance. Both urls below are built by this one file, and neither has a directory:");

		div.c("row", () => {
			a.c("page-link", "claimed: a").href("/state/stores/a/");
			a.c("page-link", "claimed: b").href("/state/stores/b/");
		});

		code(`
let claims = 0;                     // module scope — shared by every claim

route(name){
    const built_at = ++claims;      // 1 for the first url, 2 for the second
    return { title: \`claimed: \${name}\`, content(){ … } };
}`, "stores/page.js — verbatim");

		section("Why refresh() is a method and not part of content()");

		code(`
activate(){
    Page.prototype.activate.call(this);
    module_visits++;
    this.instance_visits++;
    this.refresh();
    return this;
}`, "stores/page.js — verbatim");

		p("`content()` runs exactly once, because `render()` caches `this.view`. Anything that must be current when you come BACK to a page cannot live in `content()` — it needs `activate()`, which means shadowing a core method and calling through the prototype. Same gap the async seat reported against `deactivate()`.").ac("note");

		a.c("page-link", "accident →").href("/state/accident/");
	}
});
