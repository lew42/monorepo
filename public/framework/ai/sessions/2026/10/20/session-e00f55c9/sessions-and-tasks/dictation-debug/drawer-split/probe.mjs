import { browser } from "file:///C:/Code/lew42/worktrees/qf-3/Server/Browser.mjs";
const BASE = process.env.BASE || "http://qf-3.localhost";
const W = +(process.argv[2] || 400), H = +(process.argv[3] || 844);
const tag = process.argv[4] || "x";
const b = await browser();
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const stub = async r => r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
await p.route(/\/(servex|api)\/.*(post|prompt)/, stub);
p.on("pageerror", e => console.log("pageerror", e.message));
await p.goto(BASE + "/framework/ext/drawer/ai/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
const dir = new URL(".", import.meta.url).pathname.slice(1);
const measure = async label => {
  const m = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.height)]; };
    const sheet = document.querySelector(".drawer-rail-sheet");
    return {
      sheetCls: sheet?.className, sheet: r(".drawer-rail-sheet"), panel: r(".drawer-rail-sheet-panel"), tabs: r(".drawer-rail-sheet-tabs"),
      tabbody: r(".drawer-rail-sheet-tabbody"), grip: [...document.querySelectorAll("[class*=grip]")].map(e => e.className + ":" + JSON.stringify(e.getBoundingClientRect().toJSON())),
      url: location.pathname,
    };
  });
  console.log(label, JSON.stringify(m));
  await p.screenshot({ path: dir + `${tag}-${label}-${W}.png` });
};
await measure("0-start");
const pick = async name => { await p.click(".drawer-rail-sheet-title"); await p.waitForTimeout(300); await p.locator(".drawer-rail-sheet-menu-item", { hasText: name }).first().click(); await p.waitForTimeout(1500); };
await pick("Docs"); await measure("1-docs");
await pick("AI"); await measure("2-back-on-ai");
await b.close();
