import os from "os";
import path from "path";
import { browser as launch } from "../browser.mjs";

/** One element of one page, as a png on disk, so a headless turn can look at it. */
export default async function shot({ url, selector, width = 1400, height = 1000 }){
    const file = path.join(os.tmpdir(), `ask-shot-${Date.now()}.png`);
    let browser;
    try { browser = await launch(); }
    catch (e) { throw new Error("shot(): " + e.message); }

    try {
        const page = await browser.newPage({ viewport: { width, height } });
        await page.goto(url, { waitUntil: "networkidle" });

        const target = selector ? page.locator(selector).first() : page;
        if (selector && !await page.locator(selector).count())
            throw new Error(`shot(): nothing matched "${selector}" on ${url}.`);

        await target.screenshot({ path: file });
    } finally {
        await browser.close();
    }

    return file;
}
