// node probe-find.mjs <base url> <out dir> — Sessions: the routine chips, a chip click, and the search reaching every session.
import { browser as launch, close } from "../../../../../../../../../../Server/browser.mjs";
const [base = "http://monorepo.localhost/", out = "."] = process.argv.slice(2);
const b = await launch();
const results = [];
for (const [w, h] of [[3440, 1440], [1920, 1080], [400, 800]]){
	const page = await b.newPage({ viewport: { width: w, height: h } });
	const errors = [];
	page.on("pageerror", e => errors.push(e.message));
	await page.goto(new URL("/framework/ai/sessions/", base).href, { waitUntil: "networkidle" });
	await page.waitForSelector(".sessions-kinds .sessions-chip", { timeout: 20000 }).catch(() => {});
	await page.waitForTimeout(800);
	const state = () => page.evaluate(() => ({
		chips: [...document.querySelectorAll(".sessions-kinds .sessions-chip")].map(c => c.textContent),
		shown: document.querySelector(".sessions-counts span")?.textContent.split(" · ")[0],
		first: [...document.querySelectorAll(".sessions-page .datagrid-body .sessions-row-title, .sessions-page .datagrid-rail .sessions-row-title")].slice(0, 3).map(t => t.textContent.slice(0, 50)),
		first_row_top: Math.round(document.querySelector(".sessions-page .datagrid-body > *")?.getBoundingClientRect().top ?? -1),
	}));
	const rest = await state();
	await page.screenshot({ path: `${out}/find-${w}.png` });
	await page.click(".sessions-kinds .sessions-chip");
	await page.waitForTimeout(500);
	const chip_on = await state();
	await page.click(".sessions-kinds .sessions-chip");   // back off
	await page.fill(".sessions-search", "server-query");
	await page.waitForTimeout(900);
	const search = await state();
	await page.screenshot({ path: `${out}/find-${w}-search.png` });
	await page.fill(".sessions-search", "clarity");
	await page.waitForTimeout(900);
	const routine = await state();
	results.push({ w, rest, chip_on, search, routine, errors });
	await page.close();
}
await close();
console.log(JSON.stringify(results, null, 1));
