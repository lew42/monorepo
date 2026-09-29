import { Page, md, div } from "/app.js";
import PageOverview from "../../../../core/Page/page.js";
import { page_object } from "../../../../core/Page/object.js";

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
		md("**One line in `Page`'s own constructor — `Page.track(this)` — and any `Page` this site ever builds can be looked at, live.** This box is the real instance behind [`/framework/core/Page/`](/framework/core/Page/). Open `.children` below: those are its actual children, fetched the moment you click, the same way a file tree opens a folder — nothing here is a snapshot or a mock-up.");

		div.c("flex v gap", $box => {
			// `load_all_children(1)` — the SAME fetch a real visit to
			// /framework/core/Page/ pays for — so `.children` opens onto real Page
			// objects instead of the "declared but not yet resolved" `null` a fresh
			// import starts with. No DOM after the await: the box is captured here,
			// filled once the fetch settles.
			PageOverview.load_all_children(1).loading.then(() => {
				$box.append(() => page_object(PageOverview));
			});
		});

		md.details(import.meta, "../doc/default-view.md", "How this works");
	},
});
