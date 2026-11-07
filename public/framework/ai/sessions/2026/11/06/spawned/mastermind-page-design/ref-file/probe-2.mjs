import Browser from "file:///C:/Code/lew42/worktrees/pd-ref-file/Server/Browser.mjs";
import fs from "node:fs";
const BASE = "http://localhost:59081", WT = "C:/Code/lew42/worktrees/pd-ref-file";
const DIR = WT + "/public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/ref-file";
const F = WT + "/public/live/items-proof", J = ".jsonl";
fs.mkdirSync(F, { recursive: true });
const L = o => JSON.stringify(o) + "\n";
fs.writeFileSync(F + "/page" + J, L({ title: "Items proof", class: "/live/LivePage.js" }) + L({ content: { add: { id: "c1", type: "part-card", title: "A card", text: "The items list draws below the content." } } }) + L({ items: { add: { file: "thing" + J } } }) + L({ items: { add: { title: "Note", text: "An embedded member, no file." } } }));
fs.writeFileSync(F + "/thing" + J, L({ title: "Thing" }) + L({ text: "First line of text." }));
const out = {}, errors = [];
const browser = await Browser.browser(), page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
page.on("pageerror", e => errors.push(String(e.message))); page.on("response", r => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
try {
  await page.goto(BASE + "/live/items-proof/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  out.rows = await page.locator(".live-item").allInnerTexts();
  await page.screenshot({ path: DIR + "/shot-1-before.png", fullPage: true });
  const stamp = "Tailed at " + new Date().toISOString();
  fs.appendFileSync(F + "/thing" + J, L({ text: stamp }));
  const t0 = Date.now();
  await page.locator(".live-item", { hasText: stamp }).waitFor({ timeout: 5000 }).catch(() => {});
  out.tail_ms = Date.now() - t0;
  out.tailed = (await page.locator(".live-item").allInnerTexts()).some(t => t.includes(stamp));
  await page.locator(".live-items, .live-item").first().scrollIntoViewIfNeeded().catch(() => {});
  await page.screenshot({ path: DIR + "/shot-2-after-tail.png", fullPage: true });
  await page.locator(".live-item .live-card-go").first().click();
  await page.waitForTimeout(1500);
  out.opened_url = page.url();
  out.opened_live_page = await page.locator(".live-page").count();
  out.opened_text = await page.locator(".live-page").last().innerText();
  await page.screenshot({ path: DIR + "/shot-3-thing-route.png", fullPage: true });
} finally {
  out.errors = errors;
  fs.writeFileSync(DIR + "/probe-out.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  await page.close(); await Browser.close();
  fs.rmSync(F, { recursive: true, force: true });
}
