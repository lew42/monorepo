// Proof for ext/Chat/doc/scroll.md: sticky_scroll() locked by default, pinned through growth, unlocked only by a reader gesture,
// the newest button relocks, the last line lands above a fixed bottom bar, no horizontal scroll. Usage: node prove-scroll.mjs <base url>
const { browser, close } = await import(new URL("../../../../../../Server/Browser.mjs", import.meta.url).href);
const BASE = process.argv[2] || "http://monorepo.localhost";
const b = await browser(), page = await (await b.newContext({ viewport: { width: 400, height: 700 } })).newPage();
await page.goto(BASE + "/framework/ext/Chat/", { waitUntil: "load" });
const r = await page.evaluate(async () => {
	const { sticky_scroll } = await import("/framework/ext/Chat/Chat.js"), wait = ms => new Promise(r => setTimeout(r, ms));
	document.body.innerHTML = "";
	const box = document.createElement("div"); box.style.cssText = "position:fixed;left:0;right:0;top:0;height:400px;overflow:auto;padding:4px";
	const bar = document.createElement("div"); bar.style.cssText = "position:fixed;left:0;right:0;top:340px;height:60px;z-index:5";
	document.body.append(box, bar);
	const s = sticky_scroll(box), out = {}, jump = box.querySelector(".chatbox-jump");
	for (let i = 0; i < 30; i++){ const d = document.createElement("div"); d.textContent = "line " + i; d.style.minHeight = "30px"; box.insertBefore(d, jump); }
	await wait(200);
	const last = () => [...box.children].filter(c => c !== jump).pop(), gap = () => 340 - (last().lastElementChild ?? last()).getBoundingClientRect().bottom;
	out.gap_after_fill = gap();
	last().append(Object.assign(document.createElement("div"), { style: "height:90px" })); await wait(200); out.gap_after_grow = gap();
	last().replaceChildren("x"); await wait(200); out.gap_after_shrink = gap();
	box.dispatchEvent(new WheelEvent("wheel", { deltaY: -100 })); box.scrollTop -= 300; await wait(200);
	out.unlocked_after_wheel_up = !s.locked(); const st = box.scrollTop;
	last().append(Object.assign(document.createElement("div"), { style: "height:100px" })); await wait(200); out.moved_while_unlocked = box.scrollTop - st;
	jump.click(); await wait(200);
	out.relocked_by_button = s.locked(); out.gap_after_button = gap(); out.hscroll = box.scrollWidth > box.clientWidth;
	return out;
});
const fail = [];
if (Math.abs(r.gap_after_fill - 4) > 2) fail.push("fill gap " + r.gap_after_fill);
if (Math.abs(r.gap_after_grow - 4) > 2) fail.push("grow gap " + r.gap_after_grow);
if (Math.abs(r.gap_after_shrink - 4) > 2) fail.push("shrink gap " + r.gap_after_shrink);
if (!r.unlocked_after_wheel_up) fail.push("did not unlock on a wheel-up");
if (r.moved_while_unlocked) fail.push("moved while unlocked: " + r.moved_while_unlocked);
if (!r.relocked_by_button || Math.abs(r.gap_after_button - 4) > 2) fail.push("button: " + r.relocked_by_button + " gap " + r.gap_after_button);
if (r.hscroll) fail.push("horizontal scroll");
console.log(JSON.stringify({ ...r, fail }));
await close?.(); process.exit(fail.length ? 1 : 0);
