import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("response", async (res) => {
    if (res.url().includes("/api/dev/login")) {
        const headers = res.headers();
        console.log("status", res.status());
        console.log("set-cookie header:", JSON.stringify(headers["set-cookie"]));
        console.log("all headers:", JSON.stringify(headers));
    }
});

await page.goto("http://localhost:8787/api/dev/login?as=alice&to=/imagine/platform/local/");
console.log("final url:", page.url());
console.log("cookies:", await page.context().cookies());

await browser.close();
