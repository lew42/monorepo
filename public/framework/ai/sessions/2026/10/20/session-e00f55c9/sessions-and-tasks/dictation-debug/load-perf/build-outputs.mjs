import fs from "fs";
const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const out = {};
for (const tag of ["home-1x", "home-4x"]){
	const j = JSON.parse(fs.readFileSync(`load-${tag}.json`, "utf8"));
	const painted = j.runs.map(r => r.summary.first_bubble_painted_after_click);
	const m = med(painted), run = j.runs.find(r => r.summary.first_bubble_painted_after_click === m);
	const click = run.marks.click;   // page clock; requests are on the network clock (from the first request)
	const reqs = run.requests.map(r => ({ url: r.url.replace(/^https?:\/\/[^/]+/, m => m), method: r.method, type: r.type, status: r.status ?? null, size: r.size ?? 0, body_bytes: r.body_chunks ?? 0, start_ms: r.start, end_ms: r.end, failed: r.failed ?? undefined }));
	const total = reqs.reduce((s, r) => s + r.size, 0), body = reqs.reduce((s, r) => s + r.body_bytes, 0);
	if (total !== run.total_bytes_loading_finished) throw new Error("total mismatch " + total + " vs " + run.total_bytes_loading_finished);
	out[tag] = { runs_first_bubble_painted_ms: painted, median_run: run.run, median_ms: m, summary: run.summary, marks_ms_page_clock: run.marks, files: reqs.length, total_bytes_on_wire: total, total_body_bytes: body, check: "total_bytes_on_wire is the sum of the per-request size fields", requests: reqs };
}
fs.writeFileSync("waterfall.json", JSON.stringify({ page: "/ (home), 390 px phone, cold cache, saved session v-yxnts4l (509 lines, 207 bubbles, 237,389 B)", note: "start_ms/end_ms are on the network clock (0 = first request of the page). size = wire bytes incl. headers (Network.loadingFinished encodedDataLength). marks are the page clock (ms since navigation start); click = the tap on the sparkle.", ...out }, null, 1));
const s = JSON.parse(fs.readFileSync("waterfall.json", "utf8"));
for (const t of ["home-1x", "home-4x"]) console.log(t, s[t].median_ms, s[t].files, s[t].total_bytes_on_wire, s[t].total_body_bytes, JSON.stringify(s[t].summary), JSON.stringify(s[t].marks_ms_page_clock));
// longtasks.json
const lt = {};
for (const tag of ["freeze-1x", "freeze-4x", "hand-1x", "hand-4x"]){ const o = JSON.parse(fs.readFileSync(tag + ".json", "utf8")); lt[tag] = { mode: o.mode ?? (tag.startsWith("hand") ? "hand" : "real"), throttle: o.throttle, seconds: o.seconds, bubbles_before: o.bubbles_before, says: o.says, whisper_calls: o.whisper_calls, long_over_50: o.long_over_50, longest_ms: o.longest_ms, total_blocked_ms: o.total_blocked_ms, long_tasks: o.long_tasks.map(l => ({ at_ms: l.start, dur_ms: l.dur, trigger_entry: l.entry, top_inclusive: l.inclusive.slice(0, 5) })), window_self_top: o.window_self_top, window_inclusive_top: o.window_inclusive_top }; }
// add the load-time long tasks
const loads = {};
for (const tag of ["home-1x", "home-4x"]){ const j = JSON.parse(fs.readFileSync(`load-${tag}.json`, "utf8")); loads[tag] = j.runs.map(r => ({ run: r.run, long_tasks: r.long_tasks, cpu_inclusive_top: r.cpu_inclusive.slice(0, 8) })); }
fs.writeFileSync("longtasks.json", JSON.stringify({ note: "dictation: 60 s at 390 px over a 208-bubble saved session; throttle = CDP CPU slowdown (4 = a mid phone, estimated). real = Chrome fake mic + stubbed Whisper (the beep never pauses, so one long segment); hand = scripted captions + sentences (log_prompt, send_screen) with the real mic also opened by the sheet at 1x. Attribution is the sampling profile in each task's window (approximate: layout done by the engine itself is counted under (program) or the JS call that forced it). Load: the same measure while opening the sheet.", dictation: lt, open_sheet: loads }, null, 1));
