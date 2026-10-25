#!/usr/bin/env node
// Server/JsonlPerf.mjs: where does a JSONL record spend its time? Read-only on the real files, writes only to COPIES.
//   node Server/JsonlPerf.mjs [--top 8] [--json] [--item [--source <session.jsonl>]] [--http <page url>]
// Per file: KB, lines, ms to read, ms to parse, ms to append one line to a copy in os.tmpdir() (raw fs append, the floor).
// With --item, the largest session.jsonl / task.jsonl is also copied to a scratch public/ tree in os.tmpdir() (SERVEX_PUBLIC) and three writes go
// through the item tool's own function (Servex/agents/page_tools.js run_item, in-process), timed; the folder is removed after.
// Doc: public/framework/ai/tracking/readme.md ("JSONL perf"). Thresholds: read+parse over 200 ms, a write over 2 s.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(process.env.TRACKING_ROOT || path.join(HERE, ".."));
const SESSIONS = path.join(REPO, "public", "framework", "ai", "sessions");
export const LIMITS = { read_ms: 200, write_ms: 2000 };

const ms = t0 => Math.round(Number(process.hrtime.bigint() - t0) / 1e4) / 100;   // 2 decimals
const timed = fn => { const t = process.hrtime.bigint(); const v = fn(); return [v, ms(t)]; };

function jsonl_files(dir, out = [], depth = 0){
	let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
	for (const d of list){
		const p = path.join(dir, d.name);
		if (d.isDirectory()){ if (depth < 9 && d.name !== "node_modules") jsonl_files(p, out, depth + 1); }
		else if (d.name.endsWith(".jsonl")) try { out.push({ file: p, size: fs.statSync(p).size }); } catch {}
	}
	return out;
}

/** The N largest jsonl files, each read, parsed and (on a tmp copy) appended to once. */
export function measure_files(top = 8){
	const all = jsonl_files(SESSIONS).sort((a, b) => b.size - a.size).slice(0, top), tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jsonlperf-"));
	const rows = all.map(({ file, size }, i) => {
		const [text, read] = timed(() => fs.readFileSync(file, "utf8"));
		const [lines, parse] = timed(() => text.split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }));
		const copy = path.join(tmp, i + "-" + path.basename(file));
		fs.copyFileSync(file, copy);
		const [, append] = timed(() => fs.appendFileSync(copy, JSON.stringify({ log: { text: "JsonlPerf probe" }, ts: new Date().toISOString() }) + "\n"));
		return { file: path.relative(SESSIONS, file).replace(/\\/g, "/"), kb: Math.round(size / 1024), lines: lines.length, bad: lines.filter(l => !l).length, read_ms: read, parse_ms: parse, append_ms: append, over: read + parse > LIMITS.read_ms };
	});
	fs.rmSync(tmp, { recursive: true, force: true });
	return rows;
}

/** Three item-tool writes on a scratch copy of the largest session record; each answers in `ms`. null if the tool cannot be loaded here. */
export async function measure_item(source = null){
	const src = source ? { file: path.resolve(source), size: fs.statSync(source).size } : jsonl_files(SESSIONS).filter(f => ["session.jsonl", "task.jsonl"].includes(path.basename(f.file))).sort((a, b) => b.size - a.size)[0];
	if (!src) return null;
	const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "jsonlperf-pub-")), dir = path.join(scratch, "framework", "ai", "sessions", "zz-jsonlperf");   // SERVEX_PUBLIC (page_tools.js) points the item tool at a scratch public/ tree
	process.env.SERVEX_PUBLIC = scratch;
	if (!/SERVEX_PUBLIC/.test(fs.readFileSync(path.join(REPO, "Servex", "agents", "page_tools.js"), "utf8"))){ fs.rmSync(scratch, { recursive: true, force: true }); return { error: "this checkout's page_tools.js ignores SERVEX_PUBLIC; --item skipped so no probe lands in the real records", writes: [] }; }
	const clean = () => fs.rmSync(scratch, { recursive: true, force: true });
	process.once("exit", clean);
	fs.mkdirSync(dir, { recursive: true });
	try {
		fs.copyFileSync(src.file, path.join(dir, "session.jsonl"));
		const { run_item } = await import(pathToFileURL(path.join(REPO, "Servex", "agents", "page_tools.js")).href);
		const url = "/" + path.relative(scratch, dir).replace(/\\/g, "/") + "/session.jsonl", out = [];
		for (const n of [1, 2, 3]) { const delta = { tasks: { add: { title: "JsonlPerf probe task " + n, state: "idle" } } };
			const t = process.hrtime.bigint(); let r, err = null;
			try { r = await run_item({ path: url, delta }, { caller: "JsonlPerf" }, true); } catch (e){ err = e.message; }
			out.push({ delta: Object.keys(delta)[0], ms: ms(t), ok: !!r?.ok, why: err ?? r?.why ?? null, answer_bytes: JSON.stringify(r ?? {}).length });
		}
		return { source: path.relative(SESSIONS, src.file).replace(/\\/g, "/"), kb: Math.round(src.size / 1024), writes: out, over: out.some(w => w.ms > LIMITS.write_ms) };
	} finally { clean(); process.off("exit", clean); }
}

/** Three item writes through Servex's own HTTP door (POST /mcp, tools/call item) on `url`: the whole route, locks and fan-out included. Writes real lines: point it at a scratch record. */
export async function measure_http(url, host = "http://localhost"){
	const out = [];
	for (let i = 1; i <= 3; i++){
		const t = process.hrtime.bigint(); let ok = false, why = null, bytes = 0;
		try {
			const res = await fetch(host + "/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
				body: JSON.stringify({ jsonrpc: "2.0", id: i, method: "tools/call", params: { name: "item", arguments: { path: url, delta: { tasks: { add: { title: "JsonlPerf http probe " + i + " " + Date.now(), state: "idle" } } } } } }) });
			const text = await res.text(); bytes = text.length; ok = res.ok && !/"isError":true/.test(text) && /\\"ok\\":true/.test(text); if (!ok) why = text.slice(0, 160);
		} catch (e){ why = e.message; }
		out.push({ delta: "tasks", ms: ms(t), ok, why, answer_bytes: bytes });
	}
	return { source: url, writes: out, over: out.some(w => w.ms > LIMITS.write_ms) };
}

export function verdict(files, item, http){
	const stages = [];
	for (const f of files) stages.push({ stage: "read", ms: f.read_ms, file: f.file }, { stage: "parse", ms: f.parse_ms, file: f.file }, { stage: "raw append", ms: f.append_ms, file: f.file });
	for (const w of item?.writes ?? []) stages.push({ stage: "item write (" + w.delta + ")", ms: w.ms, file: item.source });
	for (const w of http?.writes ?? []) stages.push({ stage: "item write over HTTP", ms: w.ms, file: http.source });
	const s = stages.sort((a, b) => b.ms - a.ms)[0];
	return s ? `slowest stage: ${s.stage}, ${s.ms} ms, on ${s.file}` : "no jsonl files found";
}

/** What TrackingCheck puts in report.json: slowest reads and the item-write timing, each with its threshold flag. */
export async function perf_report({ top = 8, item = true, source = null, http = null } = {}){
	const files = measure_files(top), w = item ? await measure_item(source).catch(e => ({ error: e.message, writes: [] })) : null;
	const h = http ? await measure_http(http).catch(e => ({ error: e.message, writes: [] })) : null;
	return { limits: LIMITS, http: h, files: files.sort((a, b) => (b.read_ms + b.parse_ms) - (a.read_ms + a.parse_ms)), item: w, verdict: verdict(files, w, h) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = n => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : null; };
	const r = await perf_report({ top: Number(arg("top")) || 8, item: process.argv.includes("--item"), source: arg("source"), http: arg("http") });
	if (process.argv.includes("--json")) console.log(JSON.stringify(r, null, 1));
	else {
		const pad = (v, n) => String(v).padEnd(n);
		console.log(pad("file", 78) + pad("KB", 7) + pad("lines", 7) + pad("read", 9) + pad("parse", 9) + "append(ms)");
		for (const f of r.files) console.log(pad(f.file.slice(-76), 78) + pad(f.kb, 7) + pad(f.lines, 7) + pad(f.read_ms, 9) + pad(f.parse_ms, 9) + f.append_ms + (f.over ? "  OVER" : ""));
		if (r.item) { console.log(`\nitem tool, ${r.item.source ?? ""} (${r.item.kb ?? "?"} KB):`); for (const w of r.item.writes) console.log(`  ${pad(w.delta, 8)} ${pad(w.ms + " ms", 12)} ${w.ok ? "ok" : "refused: " + w.why} (${w.answer_bytes} B answer)`); if (r.item.error) console.log("  error: " + r.item.error); }
		if (r.http){ console.log(`
item tool over Servex HTTP (POST /mcp), ${r.http.source}:`); for (const w of r.http.writes) console.log(`  ${pad(w.ms + " ms", 12)} ${w.ok ? "ok" : "failed: " + w.why} (${w.answer_bytes} B)`); if (r.http.error) console.log("  error: " + r.http.error); }
		console.log("\n" + r.verdict);
	}
}
