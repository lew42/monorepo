/* node Server/review.test.mjs — widthsFor() and splitPatch(), no git, no network, no fs writes.
 * The owner's own sentence this is making true: "it doesn't make sense to take three extra
 * screenshots when one would do … depends on the width of the content." */
import assert from "node:assert/strict";
import { widthsFor, splitPatch } from "./review.mjs";

let n = 0;
const t = (cond, what) => { assert.ok(cond, what); n++; };
const eq = (a, b, what) => { assert.deepEqual(a, b, `${what} — got ${JSON.stringify(a)}, wanted ${JSON.stringify(b)}`); n++; };

// 1. only .md, or text in a page.js, no css -> 1200 alone
eq(widthsFor([{ status: "M", f: "public/framework/ai/2026-10-01/x/readme.md" }], [{ added: 4, deleted: 1, f: "public/framework/ai/2026-10-01/x/readme.md" }], []),
	[1200], "md-only change");
eq(widthsFor([{ status: "M", f: "public/framework/ux/Thing/page.js" }], [{ added: 3, deleted: 0, f: "public/framework/ux/Thing/page.js" }], ["/framework/ux/Thing/"]),
	[1200], "page.js text-only change, no css");

// 2. a layout word in a changed css/js file's own patch, or a core layout dir -> all four
eq(widthsFor([{ status: "M", f: "public/framework/ux/Thing/Thing.css", patch: "+ .box { display: grid; }" }],
	[{ added: 1, deleted: 0, f: "public/framework/ux/Thing/Thing.css" }], ["/framework/ux/Thing/"]),
	[400, 1200, 1920, 3440], "css patch mentions grid");
eq(widthsFor([{ status: "M", f: "public/framework/core/Sidebar/Sidebar.css", patch: "+ .rail { padding: 2px; }" }],
	[{ added: 1, deleted: 0, f: "public/framework/core/Sidebar/Sidebar.css" }], []),
	[400, 1200, 1920, 3440], "any file under core/Sidebar, even with a plain patch");

// 3. one css file, scoped to one component, its patch has a max-width -> 400 alone
eq(widthsFor([{ status: "M", f: "public/framework/ux/Thing/Thing.css", patch: "+ .card { max-width: 40em; }" }],
	[{ added: 1, deleted: 0, f: "public/framework/ux/Thing/Thing.css" }], ["/framework/ux/Thing/"]),
	[400], "one component's css, capped with max-width");

// 4. otherwise -> 400 and 1920
eq(widthsFor([{ status: "M", f: "public/framework/ux/Thing/Thing.js", patch: "+ console.log('hi');" }],
	[{ added: 1, deleted: 0, f: "public/framework/ux/Thing/Thing.js" }], ["/framework/ux/Thing/"]),
	[400, 1920], "a plain js change, nothing layout-shaped");

// 5. a mixed change (text plus a layout-word css file) -> all four, the broader signal wins
eq(widthsFor(
	[{ status: "M", f: "public/framework/ux/Thing/readme.md" }, { status: "M", f: "public/framework/ux/Thing/Thing.css", patch: "+ .row { display: flex; }" }],
	[{ added: 2, deleted: 0, f: "public/framework/ux/Thing/readme.md" }, { added: 1, deleted: 0, f: "public/framework/ux/Thing/Thing.css" }],
	["/framework/ux/Thing/"]),
	[400, 1200, 1920, 3440], "mixed change: docs plus a layout-word css file");

// pages.length > 1: a broader change even with nothing layout-shaped in the words
eq(widthsFor([{ status: "M", f: "public/framework/ux/Thing/Thing.js", patch: "+ console.log('hi');" }],
	[{ added: 1, deleted: 0, f: "public/framework/ux/Thing/Thing.js" }], ["/framework/ux/A/", "/framework/ux/B/"]),
	[400, 1200, 1920, 3440], "two pages touched is a broad change regardless of the words");

// no patch at all still resolves (falls through to the safe default, never throws)
eq(widthsFor([{ status: "M", f: "public/framework/ux/Thing/Thing.css" }], [{ added: 1, deleted: 0, f: "public/framework/ux/Thing/Thing.css" }], []),
	[400, 1920], "a css file with no patch text given falls through to the default, not a crash");

// splitPatch: a two-file unified diff splits cleanly, keyed by the NEW (b/) path
{
	const diff = [
		"diff --git a/public/x/a.css b/public/x/a.css",
		"index 111..222 100644",
		"--- a/public/x/a.css",
		"+++ b/public/x/a.css",
		"@@ -1,1 +1,1 @@",
		"-old",
		"+new grid",
		"diff --git a/public/x/b.md b/public/x/b.md",
		"index 333..444 100644",
		"--- a/public/x/b.md",
		"+++ b/public/x/b.md",
		"@@ -1,1 +1,1 @@",
		"-old text",
		"+new text",
	].join("\n");
	const patches = splitPatch(diff);
	t(patches.get("public/x/a.css").includes("+new grid"), "splitPatch: first file's own patch text");
	t(patches.get("public/x/b.md").includes("+new text"), "splitPatch: second file's own patch text");
	t(!patches.get("public/x/a.css").includes("new text"), "splitPatch: files don't bleed into each other");
}
eq(splitPatch("").size, 0, "splitPatch of an empty diff is an empty map, not a throw");

console.log(`review.test.mjs: ${n} checks passed`);
