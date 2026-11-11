// node Server/OwnCSS.test.mjs: counting, the kit line, and the refusal (no git)
import assert from "node:assert";
import OwnCSS from "./OwnCSS.mjs";

assert.strictEqual(OwnCSS.declarations("a:hover { color: red; padding: 0 }"), 2);
assert.strictEqual(OwnCSS.declarations("/* x: y; */ @media (max-width: 600px) { .a { --k: 1em } }"), 1);
assert.strictEqual(OwnCSS.count("css(`.b { margin: 0; }`); const x = { a: 1 };", "public/live/x.js"), 1);
assert.strictEqual(OwnCSS.count("const s = 'color: red;';", "public/live/x.js"), 0);
assert.ok(OwnCSS.is_kit("public/framework/ui/row/row.css"));
assert.ok(!OwnCSS.is_kit("public/framework/ui/row/page.js"));
assert.ok(OwnCSS.counts("public/live/LivePage.css"));
assert.ok(!OwnCSS.counts("public/framework/framework.css"));
assert.ok(!OwnCSS.counts("public/framework/ai/sessions/2026/x.css"));
assert.strictEqual(OwnCSS.refusal([]), null);
assert.match(OwnCSS.refusal([{ file: "public/live/LivePage.css", before: 3, after: 5 }]), /3 → 5/);
console.log("OwnCSS.test.mjs: ok");
