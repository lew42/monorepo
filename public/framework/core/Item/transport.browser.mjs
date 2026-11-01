// Two real browser tabs on one Item page, over the real dev server's socket. Not a unit test (it needs the site running):
//   PORT=8105 node server.js &      then      node public/framework/core/Item/transport.browser.mjs 8105
// The page is /framework/core/Item/live/ (a List saved to live/demo.jsonl, "open it in a second tab: it follows"). Checks:
//   1. "Add" in tab A writes ONE line to demo.jsonl and tab B shows it
//   2. tab A's socket is cut and "Add" is pressed straight away: after the reconnect the line is in the file once and B shows it
//   3. tab A's outbox is empty afterwards (everything acked)
// It puts demo.jsonl back the way it found it. Screenshots: SHOTS=<dir>.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const PORT = process.argv[2] || "8105";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const FILE = path.join(ROOT, "public/framework/core/Item/live/demo.jsonl");
const URL_ = `http://localhost:${PORT}/framework/core/Item/live/`;
const original = fs.readFileSync(FILE, "utf8");
const lines = () => fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
const ok = (cond, what) => { if (!cond) failed++; console.log(`${cond ? "pass" : "FAIL"}  ${what}`); };
async function until(fn, what, ms = 10000){
	const end = Date.now() + ms;
	while (Date.now() < end){ if (await fn()) return true; await sleep(100); }
	console.log(`  (timed out waiting for: ${what})`);
	return false;
}

const browser = await chromium.launch();
try {
	const open = async () => {
		const page = await (await browser.newContext({ viewport: { width: 1100, height: 700 } })).newPage();
		await page.goto(URL_);
		await page.getByRole("button", { name: "Add" }).waitFor();
		await page.waitForFunction(() => document.querySelectorAll(".page-content-tail-line").length > 0);
		return page;
	};
	const A = await open(), B = await open();
	const tail_has = (page, id) => page.evaluate(id => [...document.querySelectorAll(".page-content-tail-line")].some(el => el.textContent.includes(id)), id);
	const added_id = () => JSON.parse(lines().at(-1))?.add?.id;

	// 1. Add in A.
	const before = lines().length;
	await A.getByRole("button", { name: "Add" }).click();
	await until(() => lines().length > before, "the line in the file");
	await sleep(500);
	ok(lines().length === before + 1, `one Add wrote one line (${before} -> ${lines().length})`);
	const first = added_id();
	ok(await until(() => tail_has(B, first), "B shows the line"), `tab B shows the new row (${first})`);

	// 2. Cut A's socket and press Add straight away: the line may be on the wire when the socket dies.
	const n = lines().length;
	await A.evaluate(async () => { const { default: Socket } = await import("/framework/dev/Socket/Socket.js"); Socket.singleton().ws.close(); });
	await A.getByRole("button", { name: "Add" }).click();
	ok(await until(() => lines().length > n, "the line reaches the file after the reconnect"), "the line pressed while the socket was cut reaches the file");
	await sleep(1500);
	ok(lines().length === n + 1, `and it is there exactly once (${n} -> ${lines().length})`);
	const second = added_id();
	ok(second !== first && await until(() => tail_has(B, second), "B shows the second line"), `tab B shows it too (${second})`);

	// 3. Everything acked.
	const pending = await A.evaluate(async () => (await import("/framework/core/Item/Outbox.js")).default.shared().pending());
	ok(pending === 0, `tab A's outbox is empty (${pending} pending)`);

	if (process.env.SHOTS){
		fs.mkdirSync(process.env.SHOTS, { recursive: true });
		await A.screenshot({ path: path.join(process.env.SHOTS, "tab-a.png") });
		await B.screenshot({ path: path.join(process.env.SHOTS, "tab-b.png") });
	}
} finally {
	await browser.close();
	fs.writeFileSync(FILE, original);
}
console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
