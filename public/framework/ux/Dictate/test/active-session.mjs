/* `node public/framework/ux/Dictate/test/active-session.mjs <base url> [repo dir]` (Playwright via Server/Browser.mjs).
 * Servex is mocked (no real session starts). For each moment (first open, switch, New session, reload) it asserts that the three
 * readers of "the active session" agree: where a typed sentence is POSTed, what chat.active() says (the view), and which
 * /api/session/<id>/stream the Sheet's read-aloud opens. Exit 1 on any failure. */
import Browser from "../../../../../Server/Browser.mjs";
const [base, repo] = process.argv.slice(2);
const WT = process.env.WT || repo;   // serve THIS checkout's chat.js and Sheet.js in place of the main tree's
const b = await Browser.browser({});
const p = await (await b.newContext({ viewport: { width: 400, height: 800 } })).newPage();
const errs = [], said = [], streams = [];
if (WT) for (const f of ["ux/Dictate/chat.js", "ext/drawer/Sheet.js"])
	await p.route(new RegExp("/framework/" + f.replace(/[./]/g, "\\$&") + "(\\?.*)?$"), r => r.fulfill({ path: WT + "/public/framework/" + f, contentType: "application/javascript" }));
const now = () => new Date().toISOString();
let n = 0;
const json = (route, body) => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
await p.route(/127\.0\.0\.1:8090\/api\/session/, route => {
	const url = route.request().url(), verb = url.split("/api/")[1];
	if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" } });
	if (/^sessions\?/.test(verb)) return json(route, { ok: true, sessions: [{ session: "v-old", title: "old", at: now(), last_at: now() }] });
	if (/^session\/v-[\w-]+\/stream/.test(verb)){ streams.push(verb.split("/")[1]); return route.abort(); }
	const body = JSON.parse(route.request().postData() || "{}");
	if (verb === "session/new"){ const id = "v-new" + ++n; return json(route, { ok: true, session: id, file: "/nofile-" + id + ".jsonl" }); }
	if (verb === "session/resume") return json(route, { ok: true, session: body.session, file: "/nofile-" + body.session + ".jsonl" });
	if (verb === "session/say"){ said.push(body.session); return json(route, { ok: true, at: now() }); }
	return json(route, { ok: true });
});
p.on("pageerror", e => errs.push(String(e)));
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(ok ? "PASS" : "FAIL", name, extra); };
const wait = ms => p.waitForTimeout(ms);
const last = a => a[a.length - 1];

await p.goto(base + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
await p.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
await p.reload({ waitUntil: "networkidle" });
await wait(800);
await p.evaluate(async () => {
	const { default: chat } = await import("/framework/ux/Dictate/chat.js");
	const el = document.createElement("div"); el.id = "t-chat"; document.body.append(el);
	window.__chat = chat; window.__m = chat(el, { keep: true });
});
const active = () => p.evaluate(() => window.__chat.active());
async function type(text){
	const ta = p.locator("#t-chat textarea").first();
	await ta.fill(text); await ta.press("Enter"); await wait(1200);
}
const followed = () => last(streams);

// 1. first open, no session: the first sentence joins the recent voice session (v-old); read-aloud follows the same one
await type("first sentence");
check("1 first open: sentence goes to the session the view shows", last(said) === (await active()).session, `said=${last(said)} view=${(await active()).session}`);
check("1 first open: read-aloud follows it", followed() === last(said), `follows=${followed()}`);

// 2. switch session
await p.evaluate(() => window.__chat.resume("v-picked")); await wait(1500);
await type("after switch");
check("2 switch: sentence goes to the picked session", last(said) === "v-picked" && (await active()).session === "v-picked", `said=${last(said)}`);
check("2 switch: read-aloud follows it", followed() === "v-picked", `follows=${followed()}`);

// 3. New session: none until the first sentence, and read-aloud must NOT fall back to an older session
const before = streams.length;
await p.evaluate(() => window.__chat.reset()); await wait(1500);
const a3 = await active();
check("3 new session: view has no session, marked fresh", a3.session === null && a3.fresh === true, JSON.stringify(a3));
check("3 new session: read-aloud opens no older session's stream", streams.length === before, `new streams: ${streams.slice(before)}`);
await type("first of new");
check("3 new session: the next sentence starts a new session", /^v-new/.test(last(said)) && last(said) === (await active()).session, `said=${last(said)}`);
check("3 new session: read-aloud follows the new one", followed() === last(said), `follows=${followed()}`);

// 4. reload: the tab's saved session carries; sentence, view and read-aloud agree
const saved = (await active()).session;
await p.reload({ waitUntil: "networkidle" }); await wait(1500);
await p.evaluate(async () => {
	const { default: chat } = await import("/framework/ux/Dictate/chat.js");
	const el = document.createElement("div"); el.id = "t-chat"; document.body.append(el); window.__chat = chat; chat(el, { keep: true });
});
await type("after reload");
check("4 reload: sentence goes to the saved session", last(said) === saved && (await active()).session === saved, `said=${last(said)} saved=${saved}`);
check("4 reload: read-aloud follows it", followed() === saved, `follows=${followed()}`);

check("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log(results.every(Boolean) ? "ALL PASS" : `FAILURES: ${results.filter(x => !x).length}`);
await Browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
