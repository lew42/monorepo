// Check 5: in node (as in Servex), a Ref resolved on a file the item tool keeps live: one object? And after the live-root cap drops it?
import fs from "node:fs"; import { spawnSync } from "node:child_process";
const WT = "C:/Code/lew42/worktrees/data-shapes-2", C = "/framework/core/Session/tasks/data-shapes/build/integration-2/oneref-probe/", DIR = `${WT}/public${C}`, FILE = C + "session.jsonl";
fs.rmSync(DIR, { recursive: true, force: true }); fs.mkdirSync(DIR, { recursive: true });
const LINES = "C:/Users/mike/AppData/Local/Temp/int2/oneref-lines.json";
fs.writeFileSync(LINES, JSON.stringify([{ assign: { session_id: "00000000-0000-4000-8000-000000000c02", agent: "oneref-probe", role: "minion", title: "One-ref probe" } }]));
spawnSync(process.execPath, [`${WT}/.claude/hooks/append.mjs`, DIR + "session.jsonl", LINES], { cwd: WT, env: { ...process.env, RECORD_ENTRY: "http://127.0.0.1:9/api/item" }, windowsHide: true });
const { run_item } = await import(`file:///${WT}/Servex/agents/page_tools.js`);
const { default: Store } = await import(`file:///${WT}/public/framework/core/Item/Store.js`);
const { default: Ref } = await import(`file:///${WT}/public/framework/core/Item/Ref.js`);
const K = (await run_item({ path: C, delta: { tasks: { add: { title: "Shared" } } } }, { caller: "probe" })).ids[0];
await run_item({ path: C }, { caller: "probe" });
const live = () => Store.instances.get(FILE)?.host, out = { file: FILE };
const ref = new Ref({ url: C, path: "tasks." + K }); await ref.resolve();
out.one_object = ref.target === live()?.tasks.find(K);
await run_item({ path: C, delta: { [K]: { start: {} } } }, { caller: "probe" });
out.tool_change_seen_by_ref = ref.target?.state;
// The cap (page_tools.js live_root): least recently used urls are deleted from this same map; the next call replays a new root.
Store.instances.delete(FILE);
await run_item({ path: C, delta: { [K]: { pause: {} } } }, { caller: "probe" });
out.after_cap = { same_root: ref._root_of_target === live(), old_ref_state: ref.target?.state, live_state: live()?.tasks.find(K)?.state };
const fresh = new Ref({ url: C, path: "tasks." + K }); await fresh.resolve();
out.after_cap.fresh_ref_is_live = fresh.target === live()?.tasks.find(K);
await ref.resolve(); out.after_cap.old_ref_after_resolve = { same: ref.target === live()?.tasks.find(K), state: ref.target?.state };
console.log(JSON.stringify(out, null, 1));
fs.rmSync(DIR, { recursive: true, force: true });
