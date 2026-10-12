// node proof.mjs setup | shoot <port>: builds the demo page core/Page/jsonl/part-link-demo/ with three cards, promotes one, then shoots 4 widths.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Subpages from "../../../../../Servex/agents/Subpages.js";
import Promote from "../../../../../Servex/agents/Promote.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const [mode, port = "51900"] = process.argv.slice(2);
const parent = "/framework/core/Page/jsonl/";

if (mode === "setup"){
	const subs = Subpages.at(parent);
	subs.add({ name: "part-link-demo", title: "part-link demo", icon: "link", description: "Three cards built through the page tools; one promoted to its own child page.", class: "../../parts/Parts.js" });
	const demo = Subpages.at(parent + "part-link-demo/");
	for (const [id, title, text] of [["c1", "Cache", "Hit rate 92%."], ["c2", "Notes worth a page", "This card grew into its own page, with its own url."], ["c3", "Queue", "Depth 4."]])
		demo.append({ content: { add: { type: "part-card", id, title, text } } });
	console.log(JSON.stringify(new Promote(demo).promote({ id: "c2", name: "notes" })));
}

if (mode === "shoot"){
	const { browser } = await import("../../../../../Server/browser.mjs");
	const b = await browser();
	for (const w of [400, 1200, 1920, 3440]){
		const page = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
		const errors = [];
		page.on("pageerror", e => errors.push(e.message));
		await page.goto(`http://localhost:${port}${parent}part-link-demo/`, { waitUntil: "load" });
		await page.waitForTimeout(2500);
		const info = await page.evaluate(() => ({ cards: document.querySelectorAll(".part-card").length, link: document.querySelector(".part-link")?.innerText, href: document.querySelector(".part-link")?.getAttribute("href"), ids: [...document.querySelectorAll(".page-content-row[id]")].map(e => e.id) }));
		await page.screenshot({ path: path.join(here, `proof-${w}.png`) });
		console.log(w, JSON.stringify(info), errors.join("|"));
		if (w === 1200){
			await page.goto(`http://localhost:${port}${parent}part-link-demo/notes/`, { waitUntil: "load" });
			await page.waitForTimeout(2000);
			console.log("child", JSON.stringify(await page.evaluate(() => ({ title: document.title, text: document.body.innerText.slice(0, 200) }))));
			await page.screenshot({ path: path.join(here, "proof-child-1200.png") });
			await page.goto(`http://localhost:${port}${parent}part-link-demo/#c3`, { waitUntil: "load" });
			await page.waitForTimeout(2000);
			console.log("hash", await page.evaluate(() => Math.round(document.getElementById("c3")?.getBoundingClientRect().top)));
		}
	}
	process.exit(0);
}
