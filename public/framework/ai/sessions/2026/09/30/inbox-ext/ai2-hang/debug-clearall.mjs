import { browser, close } from "../../../../../../Server/browser.mjs";
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
page.on("console", m => console.log("[console]", m.type(), m.text()));
page.on("pageerror", e => console.log("[pageerror]", e.message));
page.on("dialog", d => { console.log("[dialog]", d.message()); d.accept(); });
page.on("requestfinished", async r => {
	if (r.url().includes("/card/append")) console.log("[request]", r.url(), "->", (await r.response())?.status());
});
await page.goto(process.argv[2], { waitUntil: "load", timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));
await page.locator(".ai2-clear-all").click();
await new Promise(r => setTimeout(r, 4000));
await close();
