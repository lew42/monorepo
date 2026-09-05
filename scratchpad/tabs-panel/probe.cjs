const { chromium } = require("playwright");

async function main(){
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
	await page.goto("http://localhost:8095/framework/ext/Panel/", { waitUntil: "networkidle" });
	await page.waitForTimeout(400);

	const info = await page.evaluate(() => {
		const bar = document.querySelector(".page.doc-page > .tabs > .tab-bar");
		const panel = document.querySelector(".page.doc-page > .tabs > .tab-panel");
		const active = document.querySelector(".page.doc-page > .tabs > .tab-bar > .tab.active, .page.doc-page > .tabs > .tab-bar > .tab.in-path");
		const g = el => el ? (({ background, border, borderTop, borderBottom, borderRadius, padding, className }) =>
			({ background, border, borderTop, borderBottom, borderRadius, padding, className }))(getComputedStyle(el)) : null;
		return {
			barClass: bar?.className,
			panel: g(panel),
			active: active ? { className: active.className, ...g(active) } : null,
			tabsClass: document.querySelector(".page.doc-page > .tabs")?.className,
		};
	});
	console.log(JSON.stringify(info, null, 2));
	await browser.close();
}
main();
