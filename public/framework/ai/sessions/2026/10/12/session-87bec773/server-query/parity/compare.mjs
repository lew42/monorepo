// node compare.mjs <base> - Sessions page, default (remote) vs ?source=files, at 400 and 1920: counts, cost, first rows, screenshots beside this file.
import { browser, close } from "file:///C:/Code/lew42/worktrees/server-query-parity/Server/browser.mjs";
import path from "node:path"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), base = process.argv[2], b = await browser();
for (const [name, q] of [["remote", ""], ["files", "?source=files"]]) for (const width of [400, 1920]) {
	const ctx = await b.newContext({ viewport: { width, height: 900 } }), page = await ctx.newPage(), errs = [];
	page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/404/.test(m.text())) errs.push(m.text()); });
	await page.goto(base + "/framework/ai/sessions/" + q, { waitUntil: "commit" });
	await page.waitForSelector("a.sessions-row, .datagrid-card, .sessions-bucket", { timeout: 90000, state: "attached" });
	await page.waitForTimeout(6000);
	const info = await page.evaluate(() => ({ counts: document.querySelector(".sessions-counts")?.textContent.split(" · ").slice(0, 2).join(" · "), attn: document.querySelector(".sessions-filters")?.textContent.replace(/\s+/g, " ").slice(0, 90), first: [...document.querySelectorAll("a.sessions-row, .sessions-bucket, .datagrid-card")].slice(0, 12).map(e => e.textContent.replace(/\s+/g, " ").slice(0, 90)) }));
	await page.screenshot({ path: path.join(here, `parity-${name}-${width}.png`) });
	console.log(name, width, JSON.stringify(info), errs.slice(0, 3));
	await ctx.close();
}
await close();
