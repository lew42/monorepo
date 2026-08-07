import { Page, p, div, a, label, input, select, option } from "/app.js";
import { code, section } from "../../ui.js";
import { recipe } from "../recipe.js";

/* A settings screen — the tabs case done with real content: four sections, one
 * of which has sub-sections, and a form whose unsaved state has to survive
 * navigating away and back.
 */
const nav = () => ({
	meta: import.meta,
	title: "Settings",

	children: "notifications",       // the one section deep enough to need a file

	initialize(){
		this.add("account",  { title: "Account",  content(){ account(); } });
		this.add("billing",  { title: "Billing",  content(){ billing(); } });
		this.add("advanced", { title: "Advanced", content(){ advanced(); } });

		// The documented opt-in, and a settings bar is what it is FOR: without
		// it the bar reads "Account notifications Billing Advanced", because a
		// lazy child has no title until something imports it. One request buys
		// a bar that is correct on first paint.
		this.load_all_children();
	},

	content(){
		this.$tabs = this.tabs("account notifications billing advanced");
		this.notes();
	},
});

export default new Page(nav(), {

	notes(){
		recipe(nav);

		section("Can a settings screen live with url-only state? Yes — and better than expected");

		code(`
selection   /patterns/settings/billing/     a colleague can be sent the screen
form        unsaved input survives leaving and coming back
reload      unsaved input is GONE — which is correct, not a gap
per-set     "which sub-tab was I on" is deliberately not remembered`);

		p("Pages are built once and only hidden, so the DOM holding a half-typed form is never thrown away. Fill in the account form, open Billing, come back: it is all still there. Reload and it is not, which is what an unsaved form should do.");

		section("…with one bug, and it is the sub-section one");

		code(`
/patterns/settings/notifications/push/

outer bar     no tab carries .active, so CSS lights the FIRST one — Account
outer panel   .page-account.default AND .page-notifications, both displayed
inner bar     Email [push] digest — correct, because push IS the leaf`,
			"measured");

		p("`mark_links()` writes `.active` on an exact match only, so at a nested url no tab is active and `.tab-bar:not(:has(.tab.active)) > .tab:first-child` lights the first one. The panel rule has the same shape: `:not(:has(> .page.active-page))` is true when the tab is an ANCESTOR rather than the leaf, so it also shows its default. Every settings screen has sub-sections, so this is not an edge case.");

		section("…and it takes url-is-the-state down with it");

		code(`
/patterns/settings/notifications/push/

reload         Notifications › Push   then   Account
click your way Account                then   Notifications › Push`,
			"the two sections, in two different orders");

		p("`order` was removed from `Router.mark()` on the grounds that pages are appended root-to-leaf and never moved, so DOM order is already chain order — and that same-depth siblings are never visible together, so their order cannot be observed. The first half is true. The second half is what this bug falsifies: two siblings ARE visible together here, and their order is arrival order. Fix the panel rule and the ordering problem disappears with it, which is why this is one bug and not two.").ac("note");

		div.c("row", () => {
			a.c("page-link", "see it: notifications › push").href("/patterns/settings/notifications/push/");
			a.c("page-link", "the dashboard →").href("/patterns/dashboard/");
		});
	},
});

/* The sections. Plain content functions — none of them knows it is a tab, which
 * is the part worth keeping: which children are tabs was decided at placement.
 */
function account(){
	section("Account");

	field("Display name", () => input().attr("value", "Ada Lovelace").attr("size", 24));
	field("Email", () => input().attr("type", "email").attr("value", "ada@example.com").attr("size", 24));
	field("Timezone", () => select(() =>
		["Europe/London", "UTC", "America/New_York", "Asia/Tokyo"].forEach(z => option(z))));

	p("Type in any of those, open Billing, come back. Nothing was saved and nothing was lost.").ac("note");
}

function billing(){
	section("Billing");

	code(`
plan       Team · $24 per seat per month
seats      12 of 20
renews     3 March 2027
card       •••• 4242, expires 09/28`);

	field("Seats", () => input().attr("type", "number").attr("value", "12").attr("size", 4));

	p("A second set on this page would link every tab to its own url — only the FIRST `tabs()` call can own the page's url, because a page's url means one thing.").ac("note");
}

function advanced(){
	section("Advanced");

	field("Retention", () => select(() => ["30 days", "90 days", "1 year", "forever"].forEach(d => option(d))));
	field("Beta features", () => input().attr("type", "checkbox"));

	code(`
Danger zone

  Export everything      a .zip, emailed when it is ready
  Transfer ownership     requires the new owner to accept
  Delete workspace       irreversible after 30 days`);
}

// one row of a form, and the only reason it exists is that three sections
// needed the same two lines
export function field(text, control){
	return div.c("row", () => label(text + " "), control());
}
