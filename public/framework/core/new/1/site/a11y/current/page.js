import { Page, p, div, el } from "/app.js";
import demo from "/framework/ext/demo/demo.js";
import { section } from "../../ui.js";
import { js, transcript } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "aria-current",
	classes: "a11y-page",

	content(){

		js(function mark_links(here = this.active?.url){
			if (!here) return;

			this.root().querySelectorAll("a[href]").forEach(link => {
				if (link.origin !== location.origin) return;
				const active = link.pathname === here;                            // ← named, so the next line can reuse it
				link.classList.toggle("active", active);
				link.classList.toggle("in-path", !active && link.pathname !== "/" && here.startsWith(link.pathname));
				active ? link.setAttribute("aria-current", "page")                 // ← the request
				       : link.removeAttribute("aria-current");
			});
		}, "Router.js — the whole request");

		p("One line. `mark_links()` is already the site's single source of navigational truth — no view is allowed to compare `window.location` itself — so the semantic twin of `.active` belongs in the same pass and cannot drift from it.").ac("note");

		section("What it looks like now");

		transcript(`
at /columns/child/grandchild/

  a.nav-link.in-path        /columns/                    aria-current  null
  a.page-preview.in-path    /columns/                    aria-current  null
  a.page-preview.in-path    /columns/child/              aria-current  null
  a.page-preview.active     /columns/child/grandchild/   aria-current  null
  a.page-link.in-path       /columns/child/              aria-current  null

  document.querySelectorAll("[aria-current]").length   →   0`, "measured");

		p("Five links carry the site's own \"you are here\" classes and not one of them says so to a screen reader. The sidebar link for the section you are reading is announced as an ordinary link, identical to the nineteen you are not reading.").ac("note");

		section("Audited live, on this document");

		demo(() => {
			// The container is placed NOW, while the captor is still ours. It fills
			// after app.ready, because Router.mark() runs AFTER every content() in
			// the entering slice — read the classes any earlier and you read the
			// previous navigation's.
			div.c("audit", async $audit => {
				await this.app.ready;

				const here = this.app.router.active?.url;
				const rows = [...this.app.$app.el.querySelectorAll("a[href]")]
					.filter(link => link.origin === location.origin)
					.filter(link => link.classList.contains("active") || link.classList.contains("in-path"))
					.map(link => [link.getAttribute("href"), link.className,
						link.getAttribute("aria-current") ?? "—",
						link.pathname === here ? "page" : "—"]);

				$audit.append(() => el.c("table", "grid", () => {
					el("tr", () => ["href", "class", "aria-current now", "proposed"].forEach(h => el("th", h)));
					rows.forEach(row => el("tr", () => row.forEach((cell, i) =>
						el("td", cell).ac(i > 1 && "num").ac(i === 3 && cell === "page" && "pass"))));
				}));
			});
		}, "Every in-app link the marking pass touched on *this* page, and what the one-line change would add.");

		section("Does `.in-path` have a twin? No.");

		transcript(`
aria-current="location"   "the current location within an environment"
                          — a step in a flowchart, a point on a site map

.in-path at depth 3       three links carry it at once

→ three links each announcing "current location" is three answers to
  a question with one answer. There is one place you are; the trail
  that got you there is already in the url and, if a site wants it
  spoken, in a breadcrumb.`, "the verdict, and it is a decline");

		p("`.in-path` is a **visual** affordance — a highlighted trail so the eye can find its way back up. Giving it a role would make three links compete to be the one that says \"you are here\". Ship `page`, ship nothing for `in-path`.").ac("note");

		section("The one honest cost");

		transcript(`
/columns/child/grandchild/   links matching the url exactly:
   a.page-preview.active     the drill-down card

/tabs/api/                   links matching the url exactly:
   a.tab.active              the tab

but a site with a sidebar link AND a breadcrumb AND a card for one url
gets aria-current="page" on all three. Allowed; noisy.`);

		p("That is not new — it is exactly what `.active` already does, and the site already accepts it. Worth knowing before someone reports it as a bug.").ac("note");

		p("Next: **Open #3** — `full` covers the chrome, and twenty links are still tabbable under it.").ac("note");
	},
});
