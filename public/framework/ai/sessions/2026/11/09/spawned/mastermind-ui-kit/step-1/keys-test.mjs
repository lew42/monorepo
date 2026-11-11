import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";

const BASE = "http://127.0.0.1:52596";

const b = await Browser.browser();
const page = await b.newPage();
await page.goto(BASE + "/framework/library/?at=ui/card", { waitUntil: "networkidle" });
await page.waitForTimeout(400);

await page.keyboard.press("ArrowRight");
await page.waitForTimeout(250);
const url1 = await page.evaluate(() => location.pathname + location.search);

await page.keyboard.press("ArrowDown");
await page.waitForTimeout(250);
const url2 = await page.evaluate(() => location.pathname + location.search);

console.log("after ArrowRight (siblings, from ui/card base):", url1);
console.log("after ArrowDown (into that item's own variants):", url2);

await Browser.close();
