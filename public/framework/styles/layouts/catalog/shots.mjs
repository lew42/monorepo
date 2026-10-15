// Screenshots for the catalog: node public/framework/styles/layouts/catalog/shots.mjs [name...]
// Needs the dev site up (monorepo.localhost). Writes shots/<name>.jpg (1200 wide, the demo stage if the page has one).
import { browser, close } from "../../../../../Server/Browser.mjs";
import LayoutCatalog from "./LayoutCatalog.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const dir = dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const b = await browser();
const page = await b.newPage({ viewport: { width: 1200, height: 800 } });
for (const e of LayoutCatalog.entries){
	if (only.length && !only.includes(e.name)) continue;
	await page.goto("http://monorepo.localhost" + e.demo, { waitUntil: "networkidle" });
	await page.waitForTimeout(1800);
	const stage = page.locator(".demo-stage.wide").first();
	const target = await stage.count() ? stage : page;
	await target.screenshot({ path: join(dir, "shots", e.name + ".jpg"), type: "jpeg", quality: 72, clip: await stage.count() ? undefined : { x: 0, y: 0, width: 1200, height: 800 } });
	console.log("shot", e.name);
}
await close();
