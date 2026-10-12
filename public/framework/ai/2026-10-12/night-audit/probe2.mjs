import {browser} from "../../../../../Server/browser.mjs";
const b = await browser(); const ctx = await b.newContext({viewport:{width:1200,height:900}});
const chk = async (u, fn, w=1200) => { const p = await ctx.newPage(); await p.setViewportSize({width:w,height:900}); await p.goto("http://monorepo.localhost"+u,{waitUntil:"load"}); await p.waitForTimeout(3000); console.log(u, w, JSON.stringify(await p.evaluate(fn))); await p.close(); };
await chk("/framework/ai/", () => ({chips:[...document.querySelectorAll("*")].filter(e=>/^(blocking|review|fyi)$/i.test(e.textContent.trim())&&e.children.length==0).length}));
await chk("/framework/core/Page/", () => ({openTasks:/open tasks? on this page/i.test(document.body.innerText)}));
await chk("/framework/core/Page/parts/", () => ({len:document.body.innerText.length, h:document.querySelectorAll("h1,h2,h3").length}));
await chk("/framework/ux/Dictate/", () => ({asks:/asks/i.test(document.body.innerText)}), 400);
await chk("/framework/ai/sessions/", () => ({tier:(document.body.innerText.match(/warm|cold|fresh/gi)||[]).length}));
process.exit(0);
