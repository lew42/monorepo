/* `node public/framework/ux/Dictate/test/active-session.mjs <base url> [repo dir]` (Playwright via Server/Browser.mjs).
 * Servex is mocked (no real session starts). For each moment (first open, switch, New session, reload) it asserts that the three
 * readers of "the active session" agree: where a typed sentence is POSTed, what chat.active() says (the view), and which
 * /api/session/<id>/stream the Sheet's read-aloud opens. Exit 1 on any failure. */
import Browser from "../../../../../Server/Browser.mjs";
const [base, repo] = process.argv.slice(2);
const WT = process.env.WT || repo;   // serve THIS checkout's chat.js and Sheet.js in place of the main tree's
const b = await Browser.browser({});
const p = await (await b.newContext({ viewport: { width: 400, height: 800 } })).newPage();
await p.route(/\/(cards\?|api\/agents)/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "[]" }));   // core/Page/ai/work.js wants an array; unstubbed the fence answers 502
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

// 5. voice-session-mixup: "the last session" is the newest voice session by when it last spoke, never the oldest-started or a non-voice row
const picked = await p.evaluate(async () => {
	const { latest_voice } = await import("/framework/ux/Dictate/chat.js");
	const h = n => new Date(Date.now() - n * 3600000).toISOString();
	return latest_voice([{ session: "v-old", at: h(22), last_at: h(22) }, { session: "v-long", at: h(30), last_at: h(0.1) }, { session: "agent-x", at: h(1), last_at: h(0) }, { session: "v-mid", at: h(3), last_at: h(2) }])?.session;
});
const guard = await p.evaluate(async () => { const { is_other_session: o } = await import("/framework/ux/Dictate/chat.js"); return [o({ chat: { session: "v-A" } }, "v-B"), o({ chat: { session: "v-B" } }, "v-B"), o({ chat: {} }, "v-B"), o({ chat: { session: "v-A" } }, "unset"), o({ react: 1 }, "v-B")]; });
check("5 draw guard: only a line stamped for ANOTHER watched session is dropped", JSON.stringify(guard) === "[true,false,false,false,false]", JSON.stringify(guard));
check("5 latest_voice: newest last_at among v- sessions (started long ago is fine, a non-voice row is skipped)", picked === "v-long", `picked=${picked}`);

// 6. switching twice with no pause: each sentence goes to the session selected at that moment
await p.evaluate(() => window.__chat.resume("v-A"));
await type("to A");
check("6 switch A: sentence goes to A", last(said) === "v-A", `said=${last(said)}`);
await p.evaluate(() => window.__chat.resume("v-B"));
await type("to B straight after the switch");
check("6 switch B: sentence goes to B, no pause needed", last(said) === "v-B" && (await active()).session === "v-B", `said=${last(said)}`);
await p.evaluate(() => window.__chat.resume("v-A"));
await type("back to A");
check("6 switch back: sentence goes to A", last(said) === "v-A" && followed() === "v-A", `said=${last(said)} follows=${followed()}`);

check("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log(results.every(Boolean) ? "ALL PASS" : `FAILURES: ${results.filter(x => !x).length}`);
await Browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
