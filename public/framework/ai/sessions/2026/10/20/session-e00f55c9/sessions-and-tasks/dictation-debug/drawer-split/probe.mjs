// node probe.mjs <base url> <width> <height> <tag>   e.g. http://qf-3.localhost 400 844 after
// Docs -> AI round trip in the drawer (phone sheet below 52em, desktop dock above); measures the tab area and the chat.
import { browser } from "../../../../../../../../../../../Server/Browser.mjs";
const BASE = process.argv[2] || process.env.BASE, W = +(process.argv[3] || 400), H = +(process.argv[4] || 844), tag = process.argv[5] || "x";
const phone = W < 832;
const b = await browser();
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
p.on("pageerror", e => console.log("pageerror", e.message));
await p.goto(BASE + "/framework/ext/drawer/ai/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
const dir = new URL("./shots/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const measure = async label => {
  const m = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.height)]; };
    return { sheet: r(".drawer-rail-sheet"), tabs: r(".drawer-rail-sheet-tabs"), tabbody: r(".drawer-rail-sheet-tabbody"), dock: r(".drawer-tabs"), body: r(".drawer-body"), chat: r(".drawer-ai-chat, .chatbox"), url: location.pathname };
  });
  console.log(label, JSON.stringify(m));
  await p.screenshot({ path: dir + `${tag}-${label}-${W}.png` });
};
const pick = async name => {
  if (phone){ await p.click(".drawer-rail-sheet-title"); await p.waitForTimeout(300); await p.locator(".drawer-rail-sheet-menu-item", { hasText: name }).first().click(); }
  else await p.locator(".drawer-tab", { hasText: new RegExp("^" + name) }).first().click();
  await p.waitForTimeout(1500);
};
if (!phone && !(await p.locator(".drawer-tab").count())){ await p.click(".drawer-menu"); await p.waitForTimeout(1500); }
await measure("0-start");
await pick("Docs"); await measure("1-docs");
await pick("AI"); await measure("2-back-on-ai");
await b.close();
