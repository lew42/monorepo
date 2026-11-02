/* node Server/ServexFence.test.mjs — a fenced browser answers any request to Servex's address itself and never lets it out.
 * Proof it was the fence: the reply carries `fenced: true`, which the live Servex never sends. */
import assert from "node:assert";
import { pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import path from "node:path";
import Browser from "./Browser.mjs";

process.env.FENCE_SERVEX = "1";
let n = 0;
const t = (ok, what) => { assert.ok(ok, what); n++; };

const b = await Browser.browser({});
const page = await (await b.newContext()).newPage();
await page.goto("about:blank");
const ask = (url, init) => page.evaluate(async ([u, i]) => {
	const r = await fetch(u, i); return { status: r.status, text: await r.text() };
}, [url, init]);

const say = await ask("http://127.0.0.1:8090/api/session/say", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
t(say.status === 200 && JSON.parse(say.text).fenced === true, "POST /api/session/say is answered by the fence");
const sessions = await ask("http://127.0.0.1:8090/api/sessions?host=dictate-red-tests.localhost");
t(JSON.parse(sessions.text).fenced === true, "GET /api/sessions is answered by the fence");
const stream = await ask("http://localhost:8090/api/session/v-fake/stream");
t(stream.text.startsWith("retry:"), "a session stream is an empty event stream");
const named = await ask("http://servex.localhost/api/session/new", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
t(JSON.parse(named.text).fenced === true, "servex.localhost is fenced too");

// A script's own page.route() stub wins over the fence; fallback() reaches the fence.
await page.route(/\/api\/session\/mine$/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"own":true}' }));
t(JSON.parse((await ask("http://127.0.0.1:8090/api/session/mine")).text).own === true, "a page.route stub still wins");
await page.route(/\/api\/session\/passes$/, r => r.fallback());
t(JSON.parse((await ask("http://127.0.0.1:8090/api/session/passes")).text).fenced === true, "route.fallback() lands on the fence");

// The wrapper TestRunner hands to scripts as PWENTRY does the same for a plain chromium.launch().
await Browser.close();
const real = path.join(path.dirname(execSync("npm root -g", { encoding: "utf8", windowsHide: true }).trim()), "node_modules/playwright/index.mjs");
process.env.PW_REAL = real;
const { chromium } = await import(pathToFileURL(path.resolve("public/framework/core/Test/playwright-fenced.mjs")).href);
const raw = await chromium.launch({ channel: "chromium" });
try {
	const p2 = await (await raw.newContext()).newPage();
	await p2.goto("about:blank");
	const r = await p2.evaluate(async () => (await fetch("http://127.0.0.1:8090/api/session/say", { method: "POST", body: "{}" })).json());
	t(r.fenced === true, "PWENTRY wrapper fences a plain chromium.launch()");
} finally { await raw.close(); }

console.log(`servex fence: ${n} checks passed`);
