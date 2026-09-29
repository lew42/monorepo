import { Page, md, div } from "/app.js";
import PageOverview from "../../../../core/Page/page.js";
import { page_object } from "../../../../core/Page/object.js";
import { item } from "../../../../ui/item/item.js";

/**
 * "The Page object" — proof, live, that `core/Page/Page.class.js`'s ONE new line
 * (`Page.track(this)`, in the constructor) is enough to make any `Page` this site
 * builds lookable-at: this is the real instance behind
 * [`/framework/core/Page/`](/framework/core/Page/), the exact object the router
 * hands out when you navigate there — not a copy, not a description.
 */
export default new Page({
	meta: import.meta,
	title: "The Page object",
	description: "A real, live Page — /framework/core/Page/'s own instance — drawn as an item tree instead of described.",
	icon: "description",

	content(){
		md("**One line in `Page`'s own constructor — `Page.track(this)` — and any `Page` this site ever builds can be looked at, live.** This box is the real instance behind [`/framework/core/Page/`](/framework/core/Page/). It's actually a `Doc` (a `Page` subclass core/Page/page.js builds, one class more specific than plain `Page`) — so the header below honestly says \"a Doc\", not \"a Page\"; same object, same `.title`/`.children`/`.url`, just its real, more specific class name. Open `.children`: those are its actual children, fetched the moment you click, the same way a file tree opens a folder — nothing here is a snapshot or a mock-up.");

		div.c("flex v gap", $box => {
			// `load_all_children(1)` — the SAME fetch a real visit to
			// /framework/core/Page/ pays for — so `.children` opens onto real Page
			// objects instead of the "declared but not yet resolved" `null` a fresh
			// import starts with. No DOM after the await: the box is captured here,
			// filled once the fetch settles.
			PageOverview.load_all_children(1).loading.then(() => {
				$box.append(() => {
					page_object(PageOverview);

					// `track` in action, not just claimed: `Page.instances()` is the OTHER
					// half of deliverable 7 — every live `Page` this session has built so
					// far, found because `Page.track(this)` ran in each one's constructor.
					const found = Page.instances();
					md(`**\`track()\` in action:** \`Page.instances()\` already finds **${found.length}** live \`Page\`s — every page this session has built, this one and its children included. A few, each a real link into its own page:`);
					div.c("flex v gap", () => found.slice(0, 8).forEach(p =>
						item({ icon: p.icon ?? "description", name: p.title ?? p.name ?? p.url ?? "(untitled)", href: p.url })));
				});
			});
		});

		md.details(import.meta, "../doc/default-view.md", "How this works");
	},
});
