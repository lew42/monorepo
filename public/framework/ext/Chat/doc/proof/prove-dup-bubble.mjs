// Proof for ext/Chat/doc/duplicate-bubbles.md — mounts the REAL shared chat() widget (ux/Dictate/chat.js), mocks only
// Servex's session endpoints, and makes the stream/poll copy of the owner's line arrive BEFORE the send call answers.
// Counts the owner's bubbles and how often the text appears. Usage: node prove-dup-bubble.mjs <base url> [tag]
const { browser, close } = await import(new URL("../../../../../../Server/browser.mjs", import.meta.url).href);
const BASE = process.argv[2] || "http://localhost:54923", TAG = process.argv[3] || "run";
const SHOTS = new URL("./shots/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const b = await browser();
let bad = 0;

async function run(name, { via, text, reload = false, navigate = false, width = 1200 }){
	const ctx = await b.newContext({ viewport: { width, height: 800 } }), page = await ctx.newPage();
	page.on("pageerror", e => console.log("PAGEERROR", e.message)); page.on("console", m => m.type()==="error" && console.log("CONSOLE", m.text().slice(0,150)));
	const lines = []; let said = false;
	await page.route("http://127.0.0.1:8090/api/**", route => route.fulfill({ json: { ok: true, sessions: [] } }));
	await page.route("http://127.0.0.1:8090/api/session/*", async route => {
		const verb = route.request().url().split("/").pop();
		const body = JSON.parse(route.request().postData() || "{}");
		if (verb === "new") return route.fulfill({ json: { ok: true, session: "v-test", file: BASE + "/mock/v-test.jsonl", resumed: false } });
		if (verb === "say"){
			const at = new Date().toISOString();
			lines.push(JSON.stringify({ chat: { at, session: "v-test", from: { kind: "owner" }, via: body.via, text: body.text } }));
			said = true;
			await new Promise(r => setTimeout(r, 2600));      // the answer is slow: the poll copy lands first
			return route.fulfill({ json: { ok: true, at } });
		}
		return route.fulfill({ json: { ok: true } });
	});
	await page.route(BASE + "/mock/v-test.jsonl", route => route.fulfill({ body: lines.join("\n") + "\n", contentType: "text/plain" }));
	await page.goto(BASE + "/framework/ext/Chat/", { waitUntil: "load" });
	await page.evaluate(k => { window.__keep = k; sessionStorage.clear(); }, navigate);
	await page.evaluate(async () => {
		const { default: chat } = await import("/framework/ux/Dictate/chat.js");
		const el = document.createElement("div"); el.id = "proof"; el.style.cssText = "height:520px;margin:1em";
		document.body.prepend(el); window.mount = chat(el, { placeholder: "say", keep: !!window.__keep });
	});
	await page.waitForTimeout(400);
	// warm-up send: the session exists before the line under test, as in the owner's long-open chat
	await page.evaluate(() => window.mount.panel.submit_entry({ text: "warm up line", via: "typed" }));
	await page.waitForTimeout(3600); lines.length && null;
	await page.evaluate(({ via, text }) => { const w = window.mount.widget ?? window.mount.panel ?? window.mount; (w.submit_entry ? w : w.widget).submit_entry({ text, via, raw: text }); }, { via, text });
	if (reload){ await page.waitForTimeout(3500); await page.evaluate(() => window.mount.reset?.()); }
	for (let i = 0; i < 7; i++){ await page.waitForTimeout(700); if (process.env.TRACE) console.log(i, JSON.stringify(await page.evaluate(() => document.querySelector("#proof").innerText.split(String.fromCharCode(10)).join(" / ").slice(0, 160)))); }
	if (navigate){   // the owner moved to another page: the old mount goes, a new one on the SAME session draws the history
		await page.evaluate(async () => {
			window.mount.remove(); document.querySelector("#proof").remove();
			const { default: chat } = await import("/framework/ux/Dictate/chat.js");
			const el = document.createElement("div"); el.id = "proof"; el.style.cssText = "height:520px;margin:1em";
			document.body.prepend(el); window.mount = chat(el, { placeholder: "say", keep: true });
		});
		await page.waitForTimeout(4000);
	}
	const found = await page.evaluate(t => {
		const root = document.querySelector("#proof"), txt = root.innerText;
		return { count: txt.split(t).length - 1, bubbles: [...root.querySelectorAll("*")].filter(e => e.children.length === 0 && e.textContent.includes(t)).length };
	}, text);
	await page.screenshot({ path: `${SHOTS}${TAG}-${name}-${width}.png`, clip: undefined });
	const dup = found.count !== 1;
	if (dup) bad++;
	console.log((dup ? "DUPLICATE " : "ok        ") + name + " @" + width + "  text shown " + found.count + "x");
	await ctx.close();
}
for (const w of [1920, 400]){
	await run("typed", { via: "typed", text: "ask not what your country can do for you", width: w });
	await run("voice", { via: "voice", text: "so the green checkmark comes after the first line", width: w });
	await run("navigate", { via: "voice", text: "What is minion-kaq?", navigate: true, width: w });
}
await close();
process.exit(bad ? 1 : 0);
