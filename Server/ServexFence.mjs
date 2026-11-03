/* A browser test must never reach the real Servex (2026-11-02 00:31: Dictate scripts posting to the live /api/session/say with
 * made-up session ids ended up crashing it). `fence_servex(browser)` makes every context of a Playwright browser answer any
 * request to Servex's own address (127.0.0.1:8090, localhost:8090, servex.localhost) with a harmless stub instead of letting it out.
 * It is a CONTEXT route, so it runs last: a script's own page.route() stubs win, and a request they `fallback()` on (not `continue()`,
 * which goes to the network) lands here. Switched on by FENCE_SERVEX=1 (TestRunner sets it); Server/Browser.mjs and
 * core/Test/playwright-fenced.mjs both call this. Doc: Servex/doc/restart.md, "Tests must not hit the live Servex". */
const SERVEX = /^(https?:\/\/(127\.0\.0\.1|localhost):8090|https?:\/\/servex\.localhost(:\d+)?)(\/|$)/;
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };

export const fenced = new Map();   // "METHOD /path" -> count, printed once at exit so a test log shows what it tried

function answer(route){
	const req = route.request(), url = new URL(req.url()), key = `${req.method()} ${url.pathname}`;
	fenced.set(key, (fenced.get(key) ?? 0) + 1);
	if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
	if (/\/(stream|whisper\/stream)$/.test(url.pathname)) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: CORS, body: "retry: 60000\n\n" });
	return route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ ok: true, fenced: true, sessions: [], marks: [] }) });
}

let hooked = false;
function report(){
	if (hooked) return; hooked = true;
	process.once("exit", () => { if (fenced.size) console.error("servex fence: kept off the live Servex: " + [...fenced].map(([k, n]) => `${k} x${n}`).join(", ")); });
}

export async function fence_context(ctx){
	report();
	await ctx.route(u => SERVEX.test(u.href), answer);
	return ctx;
}

/** Patch a launched Browser in place so each context it makes (and each page of newPage()) is fenced. */
export function fence_servex(browser){
	if (browser.__fenced) return browser;
	browser.__fenced = true;
	const newContext = browser.newContext.bind(browser);
	browser.newContext = async (...a) => fence_context(await newContext(...a));
	browser.newPage = async (...a) => { const ctx = await browser.newContext(...a); return ctx.newPage(); };
	return browser;
}
