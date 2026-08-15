import { execSync } from "child_process";
import { createRequire } from "module";
import os from "os";
import path from "path";

let driver;

/* ⚠ Playwright resolves from the GLOBAL install, never package.json — a browser
 * driver is tooling for the person at the keyboard. Absent, `shot` says so and
 * the turn is refused rather than silently going blind. */
function chromium(){
    if (driver !== undefined) return driver;
    try {
        const root = execSync("npm root -g", { encoding: "utf8" }).trim();
        driver = createRequire(path.join(root, "index.js"))("playwright").chromium;
    } catch {
        driver = null;
    }
    return driver;
}

/** One element of one page, as a png on disk, so a headless turn can look at it. */
export default async function shot({ url, selector, width = 1400, height = 1000 }){
    const launcher = chromium();
    if (!launcher) throw new Error("shot(): playwright is not installed globally — `npm i -g playwright`.");

    const file = path.join(os.tmpdir(), `ask-shot-${Date.now()}.png`);
    const browser = await launcher.launch();

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
