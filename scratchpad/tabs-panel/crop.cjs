const { chromium } = require("playwright");
async function main(){
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1280, height: 400 } });
	await page.goto("http://localhost:8095/framework/ext/Panel/", { waitUntil: "networkidle" });
	await page.waitForTimeout(400);
	await page.screenshot({ path: "shots/panel-doc-crop-top.png", clip: { x: 228, y: 0, width: 400, height: 160 } });
	await browser.close();
}
main();
