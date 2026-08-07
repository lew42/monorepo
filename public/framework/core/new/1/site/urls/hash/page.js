import { Page } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../ui.js";
import { scroll_to_the_hash } from "../proposals.js";

export default new Page({
	meta: import.meta,
	title: "The hash",
	children: "long",

	content(){

		claim(() => {
			// Router.link_clicked — the rule that makes in-page anchors work
			if (link.hash && link.pathname === location.pathname) return null;
		}, null, "Correct, and deliberately so: a link to `#section` on the page you are already on is the browser's job, and intercepting it would re-render instead of scrolling.");

		md(`**The bug is the other half.** A link whose hash points at a *different* page is intercepted — and then \`click()\` calls \`this.go(link.pathname)\`, so the hash is not merely un-scrolled, it never reaches the address bar at all.`);

		section("Measured, before the fix");

		md(`
| | \`location.hash\` after | scrolled |
|---|---|---|
| click \`<a href="/urls/hash/long/#bottom">\` from here | **\`\`** — dropped by \`click()\` | no |
| type \`/urls/hash/long/#bottom\` and press enter | \`#bottom\` | **no** |
| click \`#bottom\` while already on \`/urls/hash/long/\` | \`#bottom\` | yes — never intercepted |
`);

		md(`Row two is the interesting one, and it is not a Router bug at all. The browser looks for \`#bottom\` when the document parses; at that moment the page is still a name in a \`children\` map. By the time \`activate()\` has built the DOM, the browser has long since given up — and \`inject()\` has not even run, so \`$app\` is still detached and nothing is scrollable anyway.`).ac("note");

		section("The fix");

		claim(scroll_to_the_hash, null, "Installed. `app.ready` is the only correct moment: it resolves after `inject()`, which is when the target both exists and is in the document.");

		md(`\`first ? location.hash : to.hash\` is the whole of the ordering. On a cold load the browser's own hash is the truth; after that, the hash is whatever the click asked for — because \`go()\` has not pushed yet, so \`location.hash\` still belongs to the page being left.`).ac("note");

		section("Try it");

		visit(["/urls/hash/long/#middle", "/urls/hash/long/#bottom", "/urls/hash/long/"]);

		md(`Click one, then **reload** it. Both must land in the same place, and both must land there from a cold start — that is the test the original could not pass.`).ac("note");

		section("What is still not covered");

		md(`
| case | state |
|---|---|
| click, cold load, reload | fixed |
| **Back/Forward onto a hash** | not fixed here |
| \`#\` to a target rendered *after* paint (async content) | not fixed — nothing can be, without a target to wait for |
`);

		md(`Back/Forward is a limitation of the *prototype*, not the proposal: \`listen()\` binds its popstate handler in the constructor, which has already run by the time this section is imported. In the framework the fix is one argument — \`this.load(location.pathname + location.hash)\` — and then popstate takes the same path as everything else.`).ac("note");

		visit(["/urls/dimension/", "/urls/ugly/"]);
	},
});
