/* node public/layouts/decide/shoot.mjs <base url>
   Screenshots each demo's `.std-decide-live` element at 1920 and 3440 into <demo>/shots/.
   Headless Playwright. Run gen-questions.mjs too after changing questions.js. */
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
// Playwright is a GLOBAL npm module here, not a repo dependency: find it at run time.
const root = execSync("npm root -g", { encoding: "utf8", windowsHide: true }).trim();
const { chromium } = await import(pathToFileURL(path.join(root, "playwright", "index.mjs")).href);
const here = path.dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? "http://localhost:80";
const browser = await chromium.launch();
for (const slug of ["equal", "short", "centred", "amount"]){
	for (const w of [1920, 3440]){
		const page = await browser.newPage({ viewport: { width: w, height: 1400 } });
		const errors = [];
		page.on("pageerror", e => errors.push(e.message));
		await page.goto(`${base}/layouts/decide/${slug}/`, { waitUntil: "networkidle" });
		const box = page.locator(".std-decide-live").first();
		await box.waitFor();
		await box.screenshot({ path: path.join(here, slug, "shots", `${slug}-${w}.jpg`), quality: 80, type: "jpeg" });
		console.log(slug, w, (await box.boundingBox()).width | 0, errors.join(" | "));
		await page.close();
	}
}
await browser.close();
