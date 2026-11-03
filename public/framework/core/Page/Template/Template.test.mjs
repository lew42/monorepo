// Run: node public/framework/core/Page/Template/Template.test.mjs [site url]
// Template needs a DOM, so the checks run in headless Chromium against a running site
// (default http://monorepo.localhost). The DOM-free half is ../../Property/Property.test.mjs.
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, dirname } from "node:path";

const site = (process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost").replace(/\/$/, "");
const repo = join(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const { browser, close } = await import(pathToFileURL(join(repo, "Server/Browser.mjs")).href);

const page = await (await browser()).newPage();
await page.goto(`${site}/framework/core/Page/Template/`);
const results = await page.evaluate(async () => {
	const { Template } = await import("/framework/core/Page/Template/Template.js");
	const out = [];
	const t = (ok, msg) => out.push([!!ok, msg]);
	class T extends Template { draw(){ this.show("x"); } }
	const text = v => v.el.textContent;

	// A grandclone reads through two layers.
	const base = new T({ x: "a" }), a = base.clone(), g = a.clone();
	const gv = g.render();
	t(text(gv) === "a", "grandclone reads the base value");
	base.set("x", "b");
	t(text(g.views[0]) === "b", "a base write reaches the grandclone");

	// The middle layer overrides: the grandclone inherits from IT now.
	a.set("x", "c");
	t(text(g.views[0]) === "c", "a middle override reaches the grandclone");
	a.set("x", "d");
	t(text(g.views[0]) === "d", "and its next write too");
	a.unset("x");
	t(text(g.views[0]) === "b", "a middle unset falls the grandclone back to the base");
	base.set("x", "e");
	t(text(g.views[0]) === "e", "and the base drives it again");
	t(base.listeners("x") === 1, "one listener, none left on dead Properties");

	// A clone's listeners are its own, made lazily on its first on().
	const k = base.clone(), before = base._on?.render?.length ?? 0;
	t(!Object.hasOwn(k, "_on") || k._on === null, "no listener object until one is added");
	k.on("render", () => {});
	t((base._on?.render?.length ?? 0) === before && k._on.render.length === 1, "a clone's listener stays on the clone");
	k.dispose();

	// A hard copy draws the same layout and never hears the base again.
	const h = base.copy(), hv = h.render();
	base.set("x", "f");
	t(text(hv) === "e" && !base.clones.includes(h), "a copy is unlinked and unlisted");
	h.set("x", "own");
	t(text(hv) === "own" && h.overrides().join() === "x", "a copy writes to itself");
	h.dispose();

	// dispose(): a clone that dies takes its views, listeners and record with it.
	const c = base.clone(); c.render(); c.render();
	t(base.listeners("x") === 3, "two more views, two more listeners");
	if (typeof c.dispose !== "function"){ t(false, "dispose() exists"); return out; }
	c.dispose();
	t(base.listeners("x") === 1 && !base.clones.includes(c) && c.views.length === 0, "dispose unbinds and leaves the record");
	a.dispose();
	t(base.listeners("x") === 0 && g.views.length === 0, "dispose takes the clones that read through it");
	return out;
});
await page.close();
await close();

let failed = 0;
for (const [ok, msg] of results){ if (!ok) failed++; console.log(`${ok ? "ok  " : "FAIL"} ${msg}`); }
console.log(`Template.test.mjs: ${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
