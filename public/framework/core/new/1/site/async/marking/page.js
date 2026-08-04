import { Page, p, div, a } from "/app.js";
import { code, section } from "../../ui.js";
import { live, wait } from "../lab.js";

// what the marking pass actually wrote, read back off the DOM
const marks = $links => [...$links.el.querySelectorAll("a")]
	.map(link => `${link.pathname} → ${[...link.classList].filter(cls => cls !== "nav-link").join(" ") || "(nothing)"}`)
	.join("\n");

export default new Page({
	meta: import.meta,
	title: "Late links",

	content(){
		p("`Router.mark()` runs inside `activate()`: it writes `.active-page` / `.active-ancestor`, then sweeps every `a[href]` under `$app` for `.active` and `.in-path`. Anything rendered after an `await` has already missed it.");

		section("The gap");

		live(() => {
			const $report = div.c("async-landed", "…");

			div.c("async-results", async $links => {
				await wait(300);

				$links.append(() => {
					a.c("nav-link", "/async/").href("/async/");
					a.c("nav-link", "/async/marking/").href("/async/marking/");
					a.c("nav-link", "/tabs/").href("/tabs/");
				});

				$report.text(marks($links));
			});
		}, "links built after an await — the pass is long over");

		p("`/async/` should be `.in-path` and `/async/marking/` should be `.active`. Both are bare. The links work — they are plain `<a href>` and the Router upgrades the click — they just do not look like where you are.").ac("note");

		section("The fix the framework already ships");

		live(() => {
			const $report = div.c("async-landed ok", "…");

			div.c("async-results", async $links => {
				await wait(300);

				$links.append(() => {
					a.c("nav-link", "/async/").href("/async/");
					a.c("nav-link", "/async/marking/").href("/async/marking/");
					a.c("nav-link", "/tabs/").href("/tabs/");
				});

				this.app?.router?.mark_links();          // ← the one line

				$report.text(marks($links));
			});
		}, "one line at the end of the fill");

		code(`
mark_links(here = this.active?.url){
    if (!here) return;
    this.root().querySelectorAll("a[href]").forEach(link => { … });
}`, "Router.js — the default argument is what makes the re-run possible");

		p("`Page.tabs()` calls exactly this at the end of its fill, and says so in a comment. It is the framework's own worked example — which is also the evidence that it is easy to forget: it had to be discovered as a bug first.").ac("note");

		section("Should every author remember that line?");

		code(`
no    it is invisible from the call site. Nothing about \`$bar.append(links)\`
      suggests a second call is owed to a class in another file

no    it fails silently and cosmetically. Links still work, they just look
      wrong — the cheapest possible bug to ship and the hardest to notice

no    it is not composable. Every fill that MIGHT contain a link owes the
      call, including fills that contain links only sometimes`);

		p("Three noes. The line is correct, it is just the wrong party's job — the Router owns link marking, and it is the only thing that knows when the answer changed.").ac("note");

		section("Proposed: the Router watches for links");

		code(`
listen(){
    document.addEventListener("click", e => this.click(e));
    window.addEventListener("popstate", () => { … });
    this.watch_links();
}

/* Links built after an await have missed mark(). One observer re-runs the pass
 * when anchors appear, so nothing rendering late has to remember. Batched to a
 * microtask: a fill appending 40 links marks once, and microtasks run BEFORE
 * paint — so there is no frame in which a late link is unmarked. */
watch_links(){
    let queued = false;

    new MutationObserver(() => {
        if (queued) return;
        queued = true;
        queueMicrotask(() => { queued = false; this.mark_links(); });
    }).observe(this.root(), { childList: true, subtree: true });
}`, "Router.js — the proposed addition, 12 lines");

		p("No loop: `mark_links()` only calls `classList.toggle`, which is an attribute mutation, and the observer watches `childList` only. The microtask batch is what rules out `requestAnimationFrame` — rAF runs after a paint and would flash.").ac("note");

		section("It works — here is the prototype, running");

		p("Same code, scoped to one container on this page so nothing outside `/async/marking/` is affected. The links below are appended a moment after this paragraph and are never marked by hand.");

		live(() => {
			const $report = div.c("async-landed ok", "…");

			div.c("async-results", $watched => {
				let queued = false;

				new MutationObserver(() => {
					if (queued) return;
					queued = true;
					queueMicrotask(() => { queued = false; window.app.router.mark_links(); });
				}).observe($watched.el, { childList: true, subtree: true });

				setTimeout(() => {
					$watched.append(() => {
						a.c("nav-link", "/async/").href("/async/");
						a.c("nav-link", "/async/marking/").href("/async/marking/");
					});

					setTimeout(() => $report.text(marks($watched)), 0);
				}, 400);
			});
		}, "the observer prototype — no mark_links() call in this code");

		p("`window.app` appears here only because a prototype in a page cannot reach the Router any other way; the real version is a method on `Router`, which has `this`. Framework code must never read `window.app`.").ac("note");

		section("The cheaper alternative, recorded");

		code(`
keep the manual call, but make it findable — a named Page method whose
existence is the documentation:

    filled(){ this.app?.router?.mark_links(); return this; }

still something to remember, but now it has a name you can grep for, and
tabs() would call it instead of reaching into Router`);

		p("Weaker: it fixes discoverability, not the forgetting. Recorded because it is one line against twelve, and someone will propose it.").ac("note");

		a.c("page-link", "stream →").href("/async/stream/");
	}
});
