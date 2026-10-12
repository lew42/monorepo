/* node public/framework/ai/2026-10-12/voice-asks-2/proof.mjs [scratch]
 * One batched proof of the four Servex changes, on a PRIVATE Servex (ports 8190/8189/8188, no whisper):
 *   A  Echo mirror    — Echo.process() writes raw/clean/structure onto the voice page (stub model, in-process)
 *   B  whisper stream — GET /api/whisper/stream sends the status at once, as SSE
 *   C  card to board  — POST /api/voice/card makes a board card + a queued ask; a second POST finds the same one
 *   D  clean_live     — /api/refine {clean_live:true} lands the clean stage sentence by sentence, with a measured cost
 * Test pages land under public/framework/ai/sessions/ (untracked); the card and ask line are real files, so run it in a worktree. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const SCRATCH = path.resolve(process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), "voice-asks2-")));
const BASE = "http://127.0.0.1:8190";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now(), say = s => console.log(`[${String(Date.now() - t0).padStart(6)}ms] ${s}`);
const post = async (u, b) => (await fetch(BASE + u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) })).json();
const results = [], check = (name, ok, detail = "") => { results.push(ok); console.log((ok ? "PASS " : "FAIL ") + name + (detail ? " - " + detail : "")); };
const body_of = l => l.content?.add ?? Object.values(l)[0] ?? {};

/* A: Echo, in-process, with a stub model: the voice page must get raw, clean and structure. */
{
	const { default: Echo } = await import(pathToFileURL(REPO + "/Servex/agents/Echo.js").href);
	const { default: VoicePage } = await import(pathToFileURL(REPO + "/Servex/ext/refine/VoicePage.js").href);
	const seen = [];
	VoicePage.listeners.add((s, line) => seen.push(line));
	const session = randomUUID(), at = new Date().toISOString();
	const echo = Object.create(Echo.prototype);
	Object.assign(echo, { servex: { say: m => console.log("   servex.say:", m) }, call: async () => ({ answer: "", cost_usd: 0 }), pending: new Map(), session_cost: new Map() });
	process.env.SERVEX_ECHO_LOCAL = "0";
	await echo.process(session, "/framework/ai/sessions/" + session + "/", "item1", at, "So the editor path should look like the browser. It should show the same stages.").catch(e => console.log("   (Echo stopped after the voice writes, expected with a stub: " + String(e.message).slice(0, 80) + ")"));
	await new Promise(r => setTimeout(r, 500));
	check("A. Echo writes the voice page (raw, then final clean)", seen.length >= 3 && seen.some(l => body_of(l).raw) && seen.some(l => body_of(l).clean_final), seen.length + " lines");
	const first = seen[0]?.content?.add;
	check("A. same item shape as Refine (id voice-t..., source vscode)", /^voice-t/.test(first?.id ?? "") && first?.source === "vscode", first?.id + " " + first?.source);
	await new Promise(r => setTimeout(r, 100)); VoicePage.listeners.clear();
}

/* Private Servex for B-D. */
const local = path.join(SCRATCH, "localappdata");
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "voice asks 2 proof\n");
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8190", SERVEX_PROXY_PORT: "8189", SERVEX_PROXY_INTERNAL: "8188", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8187" };
for (const k of ["SERVEX_HOME", "SERVEX_NO_ASSISTANT", "SERVEX_NO_LAYERS", "SERVEX_NO_MONITOR", "PORT"]) delete env[k];
const log = fs.openSync(path.join(SCRATCH, "servex.log"), "a");
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", log, log], windowsHide: true });
const kill = () => { try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch {} };
process.on("exit", kill);
try {
	let up = false;
	for (let i = 0; i < 60 && !up; i++){ try { up = Array.isArray(await (await fetch(BASE + "/api/agents")).json()); } catch {} if (!up) await sleep(500); }
	if (!up) throw new Error("Servex did not come up; see " + SCRATCH + "/servex.log");
	say("private Servex up");

	{ // B
		const res = await fetch(BASE + "/api/whisper/stream"), reader = res.body.getReader();
		const { value } = await Promise.race([reader.read(), sleep(3000).then(() => ({ value: null }))]);
		const text = value ? new TextDecoder().decode(value) : "";
		await reader.cancel().catch(() => {});
		check("B. whisper stream sends the status at once", res.headers.get("content-type")?.includes("text/event-stream") && /^data: \{.*"status"/.test(text), text.trim().slice(0, 120));
	}

	{ // C
		const session = randomUUID(), prompt = "ptest" + Date.now().toString(36);
		const body = { session, prompt, index: 0, title: "Voice proof card (safe to delete)", items: ["first point", "second point"], cites: [1, 2] };
		const [a, b] = await Promise.all([post("/api/voice/card", body), post("/api/voice/card", body)]);   // two presses at the same moment
		console.log("   first:", JSON.stringify(a), "\n   second:", JSON.stringify(b));
		check("C. card created and an ask line queued", a.ok && a.card, a.card);
		check("C. two presses at once make ONE card (the other finds it)", a.ok && b.ok && a.card === b.card, a.card + " / " + b.card);
		const c3 = await post("/api/voice/card", body);
		check("C. a later press finds the same card too", c3.ok && c3.fresh === false && c3.card === a.card);
		const bad = await post("/api/voice/card", { session: "nope" });
		check("C. a bad request is refused, not crashed", bad.ok === false, bad.why);
		const asks = fs.readFileSync(path.join(REPO, "public/framework/ai/asks.jsonl"), "utf8").split("\n").filter(l => l.includes(a.id));
		check("C. exactly one asks.jsonl line for it", asks.length === 1, asks[0]?.slice(0, 160));
	}

	if (!process.env.SKIP_D) { // D (costs about $0.20: three small model calls; SKIP_D=1 leaves it out)
		const session = randomUUID(), prompt = "plive" + Date.now().toString(36);
		const text = "So the page should fill in as I talk. Um each sentence gets its own small clean. And the cost shows beside it.";
		const lines = [];
		fetch(BASE + "/api/voice/stream?session=" + session).then(async r => { const rd = r.body.getReader(), dec = new TextDecoder(); for (;;){ const { value, done } = await rd.read(); if (done) break; for (const l of dec.decode(value).split("\n")) if (l.startsWith("data: ")) lines.push(JSON.parse(l.slice(6))); } }).catch(() => {});
		await sleep(300);
		await post("/api/voice", { session, prompt, text, final: true, source: "proof" });
		const r = await post("/api/refine", { text, session, prompt, clean_live: true });
		await sleep(1500);
		const flat = lines.flat().map(body_of);
		const live = flat.filter(d => d.clean && d.clean_final === false);
		console.log("   refine ok:", r.ok, "clean_live:", JSON.stringify(r.clean_live)?.slice(0, 400));
		check("D. clean_live returns a measured cost per sentence", r.ok && r.clean_live?.rows?.length >= 2 && r.clean_live.cost_usd >= 0, r.clean_live?.rows?.length + " sentences, $" + r.clean_live?.cost_usd);
		check("D. sentences land on the page one by one (live updates before the final)", live.length >= 3, live.length + " updates (1 draft + one per sentence)");
		const fin = flat.filter(d => d.clean_final === true && d.cost);
		check("D. final clean carries cost beside the time", fin.length >= 1 && fin[0].cost.clean >= 0, JSON.stringify(fin[0]?.cost));
		check("D. the page still got structure and cards", flat.some(d => d.cards));
	}
} finally { kill(); }
console.log(results.every(Boolean) ? "\nALL PASS" : "\nSOME FAILED");
process.exit(results.every(Boolean) ? 0 : 1);
