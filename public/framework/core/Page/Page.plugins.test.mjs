// Page takes plugins: `class Page extends Pluggable(Item)` (fold-2, core/Plugin/Plugin.js).
// Run: node public/framework/core/Page/Page.plugins.test.mjs
//   1. Page.use(X) reaches every new page
//   2. page.ext(name) turns a plugin on for THAT page only (core/Page/ext/PluginsFixture, a node-safe fixture)
//   3. page.plugins lists it; Page.plugins (class-wide) shows it available but off
import assert from "node:assert";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..", "..");
register(pathToFileURL(path.join(ROOT, "Servex", "agents", "site-hooks.mjs")).href);   // site-absolute imports ("/framework/…") map to public/

const { default: Page } = await import("./Page.class.js");

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// ---- 1. Page.use(X) reaches every new page ----
{
	class X { static attach(page){ page.used_seen = true; } }
	Page.use(X);
	const page = new Page({ title: "use-test" });
	ok(page.used_seen === true, "Page.use(X) reaches a freshly built page");
	Page.unuse(X);   // leave Page as this file found it, for the checks below
}

// ---- 2 & 3. page.ext(name) turns the fixture on for THAT page only; page.plugins and Page.plugins both show it ----
{
	const { default: PluginsFixture } = await import("./ext/PluginsFixture/PluginsFixture.js");
	const p1 = new Page({ title: "ext-test-1" });
	const p2 = new Page({ title: "ext-test-2" });

	p1.ext("PluginsFixture");
	await Promise.all(p1.ext_ready);

	ok(p1.fixture_seen === 1, "page.ext(name) attached the fixture to the page that asked");
	ok(!p2.fixture_seen, "a different page never got it");

	ok(p1.plugins.find("PluginsFixture") !== undefined, "p1.plugins lists it");
	ok(p1.overrides.PluginsFixture?.enabled === true, "p1's own override says it switched the plugin on for itself");
	ok(Page.plugins.find("PluginsFixture")?.get("enabled") === false, "Page.plugins (class-wide) shows it available but off — no other page reaches it");

	Page.unuse(PluginsFixture);
}

console.log(`Page.plugins: ${checks} checks passed`);
