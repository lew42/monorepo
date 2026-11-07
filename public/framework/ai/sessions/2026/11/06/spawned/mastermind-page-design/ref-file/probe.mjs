import Browser from "../../../../../../../../../../Server/Browser.mjs";
import fs from "node:fs";

const BASE = "http://localhost:59081";
const DIR = "C:/Code/lew42/worktrees/pd-ref-file/public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/ref-file";
const THING = "C:/Code/lew42/worktrees/pd-ref-file/public/live/item-test/thing.jsonl";

const browser = await Browser.browser();
const page = await browser.newPage();
const out = {};

await page.goto(BASE + "/live/item-test/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
out.item_card_text = await page.locator(".live-item").first().innerText({ timeout: 5000 }).catch(e => "ERR:" + e.message);
await page.screenshot({ path: DIR + "/shot-1-before.png", fullPage: true });

// Append a line to thing.jsonl and see it tail live, no reload.
fs.appendFileSync(THING, JSON.stringify({ text: "Tailed at " + new Date().toISOString() }) + "\n");
await page.waitForTimeout(2000);
out.item_card_text_after = await page.locator(".live-item").first().innerText({ timeout: 5000 }).catch(e => "ERR:" + e.message);
await page.screenshot({ path: DIR + "/shot-2-after-tail.png", fullPage: true });

// The route /live/item-test/thing (no trailing slash) as a LivePage.
const resp = await page.goto(BASE + "/live/item-test/thing", { waitUntil: "networkidle" }).catch(e => null);
out.thing_route_status = resp?.status() ?? "no response";
out.thing_route_url = page.url();
out.thing_has_live_page_class = await page.locator(".live-page").count();
out.thing_h1 = await page.locator(".live-page h1").last().innerText().catch(e => "ERR:" + e.message);
await page.screenshot({ path: DIR + "/shot-3-thing-route.png", fullPage: true });

console.log(JSON.stringify(out, null, 2));
await page.close();
await Browser.close();
