import { Page } from "/app.js";
import { section } from "../ui.js";
import { md, claim } from "./ui.js";
import "./proposals.js";

export default new Page({
	meta: import.meta,
	title: "URLs",

	// LAZY. Eight investigations, none of them imported until you walk to one.
	children: "schema slash alias query hash dimension ugly static",

	content(){

		claim(() => new Page({
			meta: import.meta,        // /urls/schema/page.js  ->  url "/urls/schema/"
			title: "Schema",
			children: "inverse",      // a name IS a segment  ->  "/urls/schema/inverse/"
			route(name){              // …and anything not declared may still be claimed
				return new Page({ title: `Claimed: ${name}` });
			},
		}), ["/urls/schema/", "/urls/schema/inverse/", "/urls/schema/anything-at-all/"]);

		md(`Three lines of a page, and every url below it. **The url is not an address for a page — it is the state, entirely and exclusively**, so the schema that produces urls is the most consequential API this framework has.`);

		section("The rules, in one block");

		md(`
| rule | |
|---|---|
| **A page url always ends in \`/\`.** | \`naming()\` has no other shape. There is no \`.page.js\` sibling form in this tier. |
| **A segment is a \`children\` key.** | \`/a/b/\` means \`root.child("a").child("b")\`. Nothing else is consulted. |
| **The filesystem is the router.** | \`/a/b/\` ← \`/a/b/page.js\`. One branch, both directions. |
| **Only a declared name hits the network.** | \`route()\` claims the rest, and structurally cannot shadow a file. |
| **The url the page reports is the canonical one.** | \`/tabs\`, \`/tabs//\` and \`/tabs/./\` all resolve; only \`/tabs/\` is the url. |
`);

		section("Eight investigations");

		this.previews();

		md(`Each one ends with a measured table, not an opinion. The two positions this section had to take — **where non-path state belongs** and **whether redirects come back** — are in \`/urls/query/\` and \`/urls/alias/\`.`).ac("note");

		section("This section patches the Router");

		md(`\`urls/proposals.js\` installs four proposed changes so they can be measured rather than described. Every one is inert until its trigger fires, so a page with no hash, no query and no \`aliases\` behaves identically. Sources are on the pages that propose them.`).ac("note");
	},
});
