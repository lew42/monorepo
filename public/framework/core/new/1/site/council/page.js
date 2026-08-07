import { Page, p, div, a } from "/app.js";
import { code, section } from "../ui.js";

/* The council's reports, as routes.
 *
 * Every seat writes its design record to agents/<seat>/page.js — beside its own
 * scratch, which is where a record belongs. Those files are real pages but not
 * real urls, because `meta: import.meta` derives a url from where a file SITS,
 * and agents/ is not under the site root. Each child here is a four-line wrapper
 * that lends one its url. Lazy, so reading one report imports one report.
 */
export default new Page({
	meta: import.meta,
	title: "The council",

	children: "steve eric tim librarian urls async a11y chrome content patterns motion perf forms versus",

	content(){
		code(`
site/<seat>/           what the seat built — pages you can navigate
agents/<seat>/         what the seat concluded — the design record
site/council/<seat>/   four lines lending the record a url`, "three directories per seat");

		p("Fourteen seats, working in parallel with no contact with each other. Each owns one section of the recipe library and one report. The reports are the deliverable that outlives the demos.").ac("note");

		section("Read the records");

		this.previews();

		section("What the parallelism was for");

		p("Seats could not read each other while working, which is the whole method: agreement between two of them is evidence, because neither could have copied it. Three convergences came out of this round.").ac("note");

		code(`
fetch(import.meta.url)   Steve and Eric independently chose the SAME anti-drift
                         mechanism and rejected demo(fn) and code.fn() on the
                         same reasoning — a code block written any other way is
                         a second copy of code that already exists.

the lazy-title trap      hit from THREE directions — previews() showing a name
                         instead of a title, a tab bar reading differently per
                         entry point, and a nav that cannot be derived without
                         importing everything. One shape, three costumes.

state that survives      the async seat and the forms seat found the same thing
                         from opposite ends: render() memoizes, so DOM state
                         persists for the session without anyone asking for it.`);

		section("Settled this round");

		code(`
container()          KEEP, unchanged, at two levels        Eric, 10 recipes
async capturing      CLOSED — blocked on TC39 AsyncContext  the async seat
iframe over a 2nd    RATIFIED — forced by 4 measurements    the librarian
  Page instance
alias() shadowing    FIXED in Page.class.js                 Steve
util/source arrows   FIXED — sliced at a NESTED arrow       the librarian
.page-link.active    FIXED in styles.css                    Eric
container() logging  APPLIED — observable, not declarative  Eric`);

		p("A verdict to *keep* something is recorded here as deliberately as a change. A written-down \"we considered this and said no, because…\" is what stops an idea being re-litigated.").ac("note");

		div.c("row", () => {
			a.c("page-link", "the recipes →").href("/");
			a.c("page-link", "the layout library →").href("/library/");
		});
	}
});
