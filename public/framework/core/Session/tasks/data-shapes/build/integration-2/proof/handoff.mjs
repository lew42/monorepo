// Check 4: a parent shows a child session's task through a Ref (as SessionTasks.child_refs does), and the child hands that task off
// (move_item, through the item tool's move key: the same mover spawn_agent's task: {from, id} uses). Does the Ref follow, or say gone?
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs"; import { spawnSync } from "node:child_process";
const WT = "C:/Code/lew42/worktrees/data-shapes-2", BASE = "/framework/core/Session/tasks/data-shapes/build/integration-2/handoff-probe/";
const C = BASE + "child/", G = BASE + "grandchild/", ROOT = `${WT}/public${BASE}`;
fs.rmSync(ROOT, { recursive: true, force: true }); fs.mkdirSync(`${WT}/public${C}`, { recursive: true });
const LINES = "C:/Users/mike/AppData/Local/Temp/int2/handoff-lines.json";
fs.writeFileSync(LINES, JSON.stringify([{ assign: { session_id: "00000000-0000-4000-8000-000000000c01", agent: "child-probe", role: "minion", title: "Child probe" } }]));
const a = spawnSync(process.execPath, [`${WT}/.claude/hooks/append.mjs`, `${WT}/public${C}session.jsonl`, LINES], { cwd: WT, env: { ...process.env, RECORD_ENTRY: "http://127.0.0.1:9/api/item" }, windowsHide: true, encoding: "utf8" });
const { run_item } = await import(`file:///${WT}/Servex/agents/page_tools.js`);
const made = await run_item({ path: C, delta: { tasks: { add: { title: "Hand me off" } } } }, { caller: "probe-agent" }), K = made.ids?.[0];
const out = { append: (a.stdout || a.stderr).trim().split("\n")[0], task: K };
const browser = await chromium.launch(), page = await browser.newPage(), logs = [];
page.on("pageerror", e => logs.push("pageerror: " + e.message));
await page.goto("http://localhost:53219/framework/core/Item/", { waitUntil: "load" }); await page.waitForTimeout(1500);
const row = () => page.evaluate(() => ({ text: window._rv.el.textContent.trim().replace(/\s+/g, " "), gone: window._ref.gone, url: window._ref.url, path: window._ref.path, title: window._ref.target?.get_one?.("title") }));
await page.evaluate(async ({ C, K }) => {
	const { default: Ref } = await import("/framework/core/Item/Ref.js"), { default: RefView } = await import("/framework/core/Item/RefView.js");
	window._ref = new Ref({ url: C, path: "tasks." + K });
	window._rv = new RefView({ ref: window._ref, where: true, capture: false }); document.body.append(window._rv.el);
	await window._ref.resolve();
}, { C, K });
await page.waitForTimeout(1000);
out.before = await row();
const mv = await run_item({ path: C, delta: { [K]: { move: { to: G } } } }, { caller: "probe-agent" });
out.move = { ok: mv.ok, moved: mv.moved, why: mv.why };
out.child_record_tail = fs.readFileSync(`${WT}/public${C}session.jsonl`, "utf8").trim().split("\n").slice(-2).map(l => JSON.parse(l));
await page.waitForTimeout(3000);
out.after_live = await row();   // the same Ref, re-settled by the child file's live "read"
out.fresh = await page.evaluate(async ({ C, K }) => { const { default: Ref } = await import("/framework/core/Item/Ref.js"); const r = new Ref({ url: C, path: "tasks." + K }); const t = await r.resolve(); return { gone: r.gone, url: r.url, path: r.path, title: t?.get_one?.("title") }; }, { C, K });
out.logs = logs;
console.log(JSON.stringify(out, null, 1));
await browser.close(); fs.rmSync(ROOT, { recursive: true, force: true });
