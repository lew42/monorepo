// Check 3: a task drawn in the default view redraws when an agent changes it through the item tool (this worktree's page_tools, in node).
// Page "with": the fix. Page "without": DefaultView.listen_read stubbed out first (the code before the fix), as the control.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs"; import { spawnSync } from "node:child_process";
const WT = "C:/Code/lew42/worktrees/data-shapes-2", REL = "/framework/core/Session/tasks/data-shapes/build/integration-2/view-probe/", DIR = `${WT}/public${REL}`;
fs.rmSync(DIR, { recursive: true, force: true }); fs.mkdirSync(DIR, { recursive: true });
const LINES = "C:/Users/mike/AppData/Local/Temp/int2/view-lines.json";
fs.writeFileSync(LINES, JSON.stringify([{ assign: { title: "View probe", now: "a probe for integration 2's check 3" } }]));
spawnSync(process.execPath, [`${WT}/.claude/hooks/append.mjs`, DIR + "task.jsonl", LINES], { cwd: WT, env: { ...process.env, RECORD_ENTRY: "http://127.0.0.1:9/api/item" }, windowsHide: true });
const NAME = fs.readdirSync(DIR).find(f => f.endsWith(".jsonl"));   // append.mjs may start it as session.jsonl (SessionRecord.start_file)
const { run_item } = await import(`file:///${WT}/Servex/agents/page_tools.js`);
const made = await run_item({ path: REL, delta: { tasks: { add: { title: "Sub task" } } } }, { caller: "probe-agent" }), SUB = made.ids?.[0];
const browser = await chromium.launch(), out = { sub: SUB };
const pages = {};
for (const mode of ["with", "without"]){
	const p = pages[mode] = await browser.newPage();
	await p.goto("http://localhost:53219/framework/core/Item/", { waitUntil: "load" }); await p.waitForTimeout(1500);
	await p.evaluate(async ({ url, mode, sub }) => {
		const Task = (await import("/framework/core/Task/Task.js")).default, { view, DefaultView } = await import("/framework/ux/Content/Object/DefaultView.js");
		if (mode === "without") DefaultView.listen_read = () => {};
		const t = new Task({ id: "probe" }), s = Task.Store.for(url); await s.open(); s.attach(t);
		const host = document.createElement("div"); host.id = "probe-host"; document.body.append(host);
		window._sub = new DefaultView({ subject: t.tasks.find(sub), open: 1, capture: false }); host.append(window._sub.el);
		window._root = new DefaultView({ subject: t, open: 1, capture: false }); host.append(window._root.el);
	}, { url: REL + NAME, mode, sub: SUB });
}
const read = p => p.evaluate(() => ({ sub_state: window._sub.rows.get("state")?.textContent, sub_keys: [...window._sub.rows.keys()].join(), root_title: window._root.rows.get("title")?.textContent }));
for (const m of ["with", "without"]) out[m + "_before"] = await read(pages[m]);
const r1 = await run_item({ path: REL, delta: { [SUB]: { start: {} } } }, { caller: "probe-agent" });
const r2 = await run_item({ path: REL, delta: { title: "View probe, renamed by an agent" } }, { caller: "probe-agent" });
out.item_tool = [r1.ok, r2.ok];
await pages.with.waitForTimeout(2500);
for (const m of ["with", "without"]) out[m + "_after"] = await read(pages[m]);
out.name = NAME; out.file = fs.readFileSync(DIR + NAME, "utf8").trim().split("\n").length;
console.log(JSON.stringify(out, null, 1));
await browser.close(); fs.rmSync(DIR, { recursive: true, force: true });
