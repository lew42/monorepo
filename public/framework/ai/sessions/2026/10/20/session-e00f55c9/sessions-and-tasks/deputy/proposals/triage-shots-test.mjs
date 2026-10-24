import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const base = "http://qf-1.localhost", out = "C:/Code/lew42/worktrees/qf-1/public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/proposals/shots/";
const M = "/framework/ai/asks/scratch-triage/triage.jsonl";
const b = await chromium.launch();
for (const w of [400, 1200]){
	const pg = await b.newPage({ viewport: { width: w, height: 800 } });
	const errs = []; pg.on("pageerror", e => errs.push(String(e)));
	await pg.goto(base + "/framework/ai/asks/undone/", { waitUntil: "networkidle" });
	await pg.waitForSelector(".triage-card");
	// The real page has no manifest yet, so mount a second card on the scratch manifest (two copies) next to it.
	await pg.evaluate(async M => {
		const V = await import("/framework/core/View/View.js"), PT = (await import("/framework/ai/asks/ProposalTriage.js")).default;
		const host = V.div.c("pad", () => new PT({ manifest: M }).draw());
		document.querySelector(".triage-card").parentElement.prepend(host.el);
	}, M);
	await pg.waitForFunction(() => document.querySelector(".triage-approve-all"), null, { timeout: 15000 });
	await pg.locator(".triage-chip").last().click();
	await pg.waitForTimeout(500);
	const card = pg.locator(".triage-card").first();
	console.log(w, (await card.innerText()).replace(/\n/g, " | "), errs);
	await card.screenshot({ path: `${out}triage-card-${w}.png` });
	if (w === 1200){
		await pg.click(".triage-approve-all");
		await pg.waitForTimeout(1500);
		console.log("after press:", (await card.innerText()).replace(/\n/g, " | "));
		await card.screenshot({ path: `${out}triage-card-pressed-1200.png` });
	}
}
await b.close();
