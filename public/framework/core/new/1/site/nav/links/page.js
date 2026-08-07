import { Page, p, a, span, button } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "A link",

	content(){
		source(import.meta);

		p("A link is an `<a href>`. No Link component, no router call at the site, no attribute to opt in. `Router` listens on `document` and either upgrades the click or declines it.");

		section("The verdicts below are computed by the real link_clicked()");

		// The framework's own predicate, called with a hand-made event. It only
		// answers "is this click ours" — it never navigates, so probing is free.
		const verdict = (el, event) => this.app.router.link_clicked({ target: el, button: 0, ...event })
			? "Router.go()  — stays in the app, no reload"
			: "the browser  — full page load, we let it go";

		// The anchor is built inside the <p> so it captures there. The verdict is
		// filled on the next frame, because go() pushes history AFTER the load —
		// mid-navigation the browser still shows the url we are leaving, and the
		// #hash rule reads location.pathname.
		const probe = (build, event) => p(() => {
			const $a = build();
			const $verdict = span();
			requestAnimationFrame(() => $verdict.text("   →   " + verdict($a.el, event)));
		});

		probe(() => a.c("page-link", "/nav/replace/").href("/nav/replace/"));
		probe(() => a.c("page-link", "example.com").href("https://example.com/"));
		probe(() => a.c("page-link", "target=_blank").href("/nav/replace/").attr("target", "_blank"));
		probe(() => a.c("page-link", "download").href("/nav/replace/").attr("download", ""));
		probe(() => a.c("page-link", "#section").href(this.url + "#section"));
		probe(() => a.c("page-link", "/…/readme.md").href("/framework/core/new/1/readme.md"));
		probe(() => a.c("page-link", "same href, ctrl held").href("/nav/replace/"), { ctrlKey: true });
		probe(() => a.c("page-link", "same href, middle button").href("/nav/replace/"), { button: 1 });

		p("Six rules and a modifier check. Every one of them declines — the Router's job is to take the ordinary case and stay out of the way of the six that a browser already does better.").ac("note");

		section("page.link()");

		// No parent, no app, no render. A Page is dormant until something places
		// it, so a link to one costs nothing.
		new Page({ url: "/nav/tabs/", title: "Tabs" }).link();

		p("`link(text?)` is `a.c(\"page-link\", title).href(url)` and nothing else. It works on a page that was never rendered, never adopted and never given an `app`.").ac("note");

		section("The programmatic twin");

		button("router.go(\"/nav/replace/\")").click(() => this.app.router.go("/nav/replace/"));

		p("`page.go()` is `this.app.router.go(this.url)`. It needs `.app`, which a page receives on the walk — so a page you have never navigated to cannot `go()` to itself yet. `link()` has no such gap.").ac("note");

		p("Next: `/nav/replace/` — what happens once you arrive.").ac("note");

		a.c("page-link", "Replace →").href("/nav/replace/");
	}
});
