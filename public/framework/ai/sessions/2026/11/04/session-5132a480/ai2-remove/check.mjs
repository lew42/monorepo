import { browser } from "../../../../../../../../../Server/Browser.mjs";
const base = process.argv[2];
const urls = ["/framework/ai2/", "/framework/ai2/log/", "/framework/ai2/2026/10/20/session-e00f55c9/", "/framework/ai/", "/framework/dev/DevBar/"];
const b = await browser();
for (const u of urls) {
	const p = await b.newPage();
	const errs = [];
	p.on("console", m => m.type() === "error" && errs.push(m.text()));
	p.on("pageerror", e => errs.push("pageerror " + e.message));
	p.on("requestfailed", r => errs.push("failed " + r.url()));
	await p.goto(base + u, { waitUntil: "load" });
	await p.waitForTimeout(3000);
	console.log(u, "->", new URL(p.url()).pathname, "| title:", await p.title(), "| errors:", JSON.stringify(errs.filter(e => !/page-work|favicon|jsonl|Servex|socket|WebSocket/i.test(e))));
	await p.close();
}
await b.close();
