// Load of the phone sheet's chat, measured. node load.mjs <base> <page> <session-file> [runs]
// Cold context (no cache), 390 px phone, a saved session in sessionStorage (what a reload has), every Servex call stubbed.
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
const [base = "http://monorepo.localhost", page_path = "/framework/ext/drawer/", file = "/ai/v-yxnts4l.jsonl", RUNS = "3", tag = "sheet"] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const repo = path.resolve(here, "../../../../../../../../../../..");
const { default: Browser } = await import(pathToFileURL(path.join(repo, "Server/Browser.mjs")).href);
const browser = await Browser.browser({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const session = path.basename(file, ".jsonl");

async function one(i){
	const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, permissions: ["microphone"] });
	const page = await ctx.newPage();
	await ctx.addInitScript(({ session, file }) => {
		try { sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session, file })); } catch {}
		window.$m = { marks: {}, long: [] };
		const mark = k => { if (!(k in window.$m.marks)) window.$m.marks[k] = performance.now(); };
		window.$mark = mark;
		try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.$m.long.push({ start: e.startTime, dur: e.duration, attr: (e.attribution || []).map(a => a.containerSrc || a.name) }); }).observe({ type: "longtask", buffered: true }); } catch {}
		const scan = () => {
			if (document.querySelector(".drawer-rail-sheet.on")) mark("sheet_in_dom");
			const s = document.querySelector(".drawer-rail-sheet.on");
			if (s && !("sheet_visible" in window.$m.marks) && s.getBoundingClientRect().height > 50) mark("sheet_visible");
			if (document.querySelector(".drawer-rail-sheet.on .ux-dictate-widget")) mark("widget");
			if (document.querySelector(".drawer-rail-sheet.on .ux-dictate-widget-thread")) mark("thread");
			const b = document.querySelectorAll(".drawer-rail-sheet.on .chatbox");
			if (b.length && !("first_bubble" in window.$m.marks)){ mark("first_bubble"); requestAnimationFrame(() => requestAnimationFrame(() => mark("bubble_painted"))); }
			window.$m.bubbles = b.length;
			if (b.length) window.$m.last_bubble_at = performance.now();
		};
		new MutationObserver(scan).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
	}, { session, file });
	const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
	const json = (route, out) => route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) }).catch(() => {});
	await page.route(/127\.0\.0\.1:8090\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
		if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
		return json(route, verb === "new" || verb === "resume" ? { ok: true, session, file } : { ok: true });
	});
	let hitl = 0;
	await page.route(/127\.0\.0\.1:8090\/api\/hitl/, async route => {   // stubbed: each one is a paid model call on the real Servex
		if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
		hitl++; await new Promise(r => setTimeout(r, 300));
		return json(route, { ok: true, marks: [{ i: 0, mark: "ok", purpose: "stub" }] });
	});
	await page.route(/127\.0\.0\.1:8090\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));

	const cdp = await ctx.newCDPSession(page);
	await cdp.send("Network.enable");
	await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
	if (process.env.THROTTLE) await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.THROTTLE) });
	await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 500 });
	const reqs = new Map(); let base_ts = null, base_wall = null;
	cdp.on("Network.requestWillBeSent", e => { if (base_ts === null){ base_ts = e.timestamp; } reqs.set(e.requestId, { url: e.request.url, method: e.request.method, type: e.type, start: (e.timestamp - base_ts) * 1000, initiator: e.initiator?.type, data_chunks: 0 }); });
	cdp.on("Network.responseReceived", e => { const r = reqs.get(e.requestId); if (r){ r.status = e.response.status; r.first_byte = (e.timestamp - base_ts) * 1000; r.mime = e.response.mimeType; r.encoding = e.response.headers["content-encoding"] ?? e.response.headers["Content-Encoding"]; } });
	cdp.on("Network.dataReceived", e => { const r = reqs.get(e.requestId); if (r){ r.data_chunks += e.encodedDataLength; r.body_chunks = (r.body_chunks ?? 0) + e.dataLength; } });
	cdp.on("Network.loadingFinished", e => { const r = reqs.get(e.requestId); if (r){ r.end = (e.timestamp - base_ts) * 1000; r.size = e.encodedDataLength; } });
	cdp.on("Network.loadingFailed", e => { const r = reqs.get(e.requestId); if (r){ r.end = (e.timestamp - base_ts) * 1000; r.failed = e.errorText; } });

	const t_nav = Date.now();
	await page.goto(base + page_path, { waitUntil: "load" });
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	const t_btn = await page.evaluate(() => performance.now());
	await page.waitForTimeout(1500);   // the page settles before the press, as it does for a person
	await cdp.send("Profiler.start");
	const t_click = await page.evaluate(() => { window.$mark("click"); return performance.now(); });
	await page.click(".drawer-rail-ai");
	await page.waitForFunction(() => window.$m.marks.bubble_painted, null, { timeout: 40000 }).catch(() => {});
	await page.waitForTimeout(4000);
	const prof = (await cdp.send("Profiler.stop")).profile;
	const m = await page.evaluate(() => ({ ...window.$m, now: performance.now(), nav: performance.getEntriesByType("navigation")[0]?.toJSON?.() }));
	const bubbles_end = await page.evaluate(() => ({ bubbles: document.querySelectorAll(".drawer-rail-sheet.on .chatbox").length, text: (document.querySelector(".drawer-rail-sheet.on .ux-dictate-widget-thread")?.textContent ?? "").length }));
	await ctx.close();

	// self time per file:function in the profile
	const self = new Map(); const byId = new Map(prof.nodes.map(n => [n.id, n]));
	const dt = prof.timeDeltas; for (let k = 0; k < prof.samples.length; k++){ const n = byId.get(prof.samples[k]); const cf = n.callFrame; const key = `${cf.functionName || "(anon)"} ${cf.url.replace(/^https?:\/\/[^/]+/, "")}:${cf.lineNumber + 1}`; self.set(key, (self.get(key) ?? 0) + (dt[k] ?? 0) / 1000); }
	const parent = new Map(); for (const n of prof.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
	const keyOf = n => { const cf = n.callFrame; return `${cf.functionName || "(anon)"} ${cf.url.replace(/^https?:\/\/[^/]+/, "")}:${cf.lineNumber + 1}`; };
	const incl = new Map(), callers = new Map();
	for (let k = 0; k < prof.samples.length; k++){
		const ms = (dt[k] ?? 0) / 1000; let id = prof.samples[k]; const seen = new Set();
		const leaf = byId.get(id), fn = leaf.callFrame.functionName;
		if (fn === "getBoundingClientRect" || fn === "querySelector" || fn === "setProperty"){ const par = byId.get(parent.get(id)); const ck = fn + " <- " + (par ? keyOf(par) : "?"); callers.set(ck, (callers.get(ck) ?? 0) + ms); }
		while (id != null){ const n = byId.get(id); const key = keyOf(n); if (n.callFrame.url && !seen.has(key)){ seen.add(key); incl.set(key, (incl.get(key) ?? 0) + ms); } id = parent.get(id); }
	}
	const incl_top = [...incl].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => ({ at: k, incl_ms: Math.round(v) }));
	const callers_top = [...callers].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => ({ at: k, self_ms: Math.round(v) }));
	const top = [...self].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => ({ at: k, self_ms: Math.round(v) }));
	const list = [...reqs.values()].map(r => ({ ...r, start: Math.round(r.start), end: r.end == null ? null : Math.round(r.end), first_byte: r.first_byte == null ? null : Math.round(r.first_byte) }));
	const total_loading = list.reduce((s, r) => s + (r.size ?? 0), 0), total_chunks = list.reduce((s, r) => s + r.data_chunks, 0);
	const mk = m.marks;
	const sec = {
		page_load_ms: Math.round(m.nav?.loadEventEnd ?? 0), click_at: Math.round(t_click),
		sheet_visible_after_click: mk.sheet_visible != null ? Math.round(mk.sheet_visible - mk.click) : null,
		widget_after_click: mk.widget != null ? Math.round(mk.widget - mk.click) : null,
		first_bubble_dom_after_click: mk.first_bubble != null ? Math.round(mk.first_bubble - mk.click) : null,
		first_bubble_painted_after_click: mk.bubble_painted != null ? Math.round(mk.bubble_painted - mk.click) : null,
		hitl_calls: hitl, throttle: Number(process.env.THROTTLE || 1),
				bubbles_end: bubbles_end.bubbles,
	};
	return { run: i, summary: sec, marks: Object.fromEntries(Object.entries(mk).map(([k, v]) => [k, Math.round(v)])), requests: list, files: list.length, total_bytes_loading_finished: total_loading, total_bytes_data_received: total_chunks, long_tasks: m.long.map(l => ({ start: Math.round(l.start), dur: Math.round(l.dur) })), cpu_top: top, cpu_inclusive: incl_top, native_callers: callers_top };
}

const out = [];
for (let i = 1; i <= Number(RUNS); i++){ const r = await one(i); out.push(r); console.log(JSON.stringify({ run: i, ...r.summary, files: r.files, bytes: r.total_bytes_loading_finished, bytes2: r.total_bytes_data_received })); }
fs.writeFileSync(path.join(here, `load-${tag}.json`), JSON.stringify({ base, page_path, file, runs: out }, null, 1));
await Browser.close();
