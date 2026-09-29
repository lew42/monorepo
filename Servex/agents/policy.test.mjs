import assert from "node:assert";
import { Policy } from "./policy.js";

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };
const live = new Map([["minion-a", { parent: "task-mastermind-x" }], ["task-mastermind-x", { parent: null }]]);
const registry = { "tab-editor": { kind: "external" } };
const p = new Policy({ agents: { live, reg: () => ({ read: () => registry }) } });
const m = (f, to) => p.message(f, to);

t(m(null, "minion-a").rule === "owner", "tab is owner");
t(m("owner", "assistant-a").ok, "owner ok");
t(m("dispatcher", "minion-a").rule === "system", "dispatcher");
t(m("mastermind-servex", "manager-b").rule === "system" && m("servex-mastermind", "manager-b").rule === "system", "servex");
t(m("minion-a", "task-mastermind-x").rule === "tree", "child to parent");
t(m("task-mastermind-x", "minion-a").rule === "tree", "parent to child");
t(!m("minion-a", "minion-b").ok, "worker to stranger refused");
t(m("assistant-a", "manager-a").rule === "table", "assistant to own manager");
t(m("assistant-a", "master-assistant").ok, "assistant to master");
t(m("assistant-a", "mastermind-servex").ok, "assistant to servex");
const bad = m("assistant-a", "manager-b");
t(!bad.ok && bad.why.includes("assistant-a may not message manager-b"), "cross-card refused");
t(m("manager-a", "assistant-a").ok && m("manager-a", "mastermind-servex").ok, "manager table");
t(!m("manager-a", "assistant-b").ok, "manager cross-card refused");
t(m("master-assistant", "assistant-z").ok && m("master-assistant", "mastermind-servex").ok, "master table");
t(!m("master-assistant", "manager-a").ok, "master to manager refused");
t(m("task-mastermind-x", "mastermind-servex").ok, "task-mastermind to servex");
t(!m("task-mastermind-x", "assistant-a").ok, "task-mastermind to assistant refused");
// D4: a numbered mastermind-servex-N counts as the mastermind, both ways
t(m("task-mastermind-x", "mastermind-servex-3").ok, "task-mastermind to a numbered mastermind-servex");
t(m("mastermind-servex-3", "task-mastermind-x").rule === "system", "a numbered mastermind-servex messages freely, like the plain one");
t(p.kind("mastermind-servex-3") === "servex" && p.kind("servex-mastermind-12") === "servex", "numbered ids are still kind servex");
// D4: parent/child both ways for two task masterminds — a child mastermind messaging its parent, and back
{
	const rec = new Map([["task-mastermind-child", { parent: "task-mastermind-x" }], ["task-mastermind-x", { parent: null }]]);
	const pp = new Policy({ agents: { live: rec } });
	t(pp.message("task-mastermind-child", "task-mastermind-x").rule === "tree", "child mastermind to its parent mastermind");
	t(pp.message("task-mastermind-x", "task-mastermind-child").rule === "tree", "parent mastermind to its child mastermind");
}
// D8: a registered external id (a VS Code tab, External.js's registry row) — any
// agent may message it, and it may message anyone, like the owner's own tab
t(p.kind("tab-editor") === "external", "a registered id reads as kind external");
t(m("minion-a", "tab-editor").rule === "external", "a worker may message an external id, unlike another worker");
t(m("task-mastermind-x", "tab-editor").rule === "external", "a task-mastermind may message an external id too");
t(m("tab-editor", "minion-a").rule === "external" || m("tab-editor", "minion-a").rule === "owner", "an external id messages freely, owner-like");
t(!m("minion-a", "some-other-worker").ok, "an UNregistered id is still an ordinary stranger — external is not a loophole for every id");
{
	const out = p.spawn("tab-editor", "minion");
	t(!out.ok && /external id \(a registered tab\) may message anyone, but not spawn/.test(out.why), "an external id may message, not spawn: " + out.why);
	t(!p.spawn("tab-editor", "manager").ok, "not even a manager");
	t(m("tab-editor", "manager-fix-the-sidebar").ok && m("tab-editor", "mastermind-servex").ok, "but it still messages anyone, like the owner");
}
// Page-pair parentage (fix item 3): the REAL Layers, its real ids, a real layers.json in a scratch dir.
{
	const fs = await import("node:fs"), os = await import("node:os"), path = await import("node:path");
	const { default: Layers } = await import("./Layers.js");
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "policy-pairs-"));
	fs.mkdirSync(path.join(dir, "public/framework/ux/Dictate"), { recursive: true });
	const CARD = "2026/09/24/fix-the-sidebar";
	const live = new Map();
	const agents = { live, spawn(){ throw new Error("no spawns here"); }, send(){}, stop(){} };
	const servex = { agents, cards: { canonical: id => id === CARD ? id : null, on(){} }, mcp: { tool(){} } };
	const L = new Layers({ servex, file: path.join(dir, "layers.json"), repo: dir, watch(){} }).install();
	for (const k of [CARD, "/framework/ux/Dictate/"]) L.record(k);
	// the runtime spawn parent of a manager is its own assistant, as Layers.spec() sets it
	for (const [k, rec] of Object.entries(L.state.cards)) live.set(rec.manager.id, { parent: rec.assistant.id, state: "idle" });
	const pp = new Policy({ agents });
	t(L.state.cards[CARD].manager.id === "manager-fix-the-sidebar" && L.state.cards["/"].manager.id === "manager-root", "real ids: manager-fix-the-sidebar, manager-root");
	t(pp.parent("manager-fix-the-sidebar") === "assistant-fix-the-sidebar", "the live parent stays the card's own assistant");
	t(pp.message("manager-fix-the-sidebar", "manager-root").rule === "tree", "a card's manager messages manager-root (tree, from layers.json)");
	t(pp.message("manager-root", "manager-fix-the-sidebar").rule === "tree", "manager-root messages a card's manager (tree)");
	t(pp.message("manager-dictate", "manager-ux").rule === "tree" && pp.message("manager-ux", "manager-dictate").rule === "tree", "a page's manager and its parent page's manager, both ways");
	t(pp.message("manager-framework", "manager-root").rule === "tree", "a top-level page's manager to manager-root");
	t(!pp.message("manager-dictate", "manager-root").ok, "a grandchild is not the root's child");
	t(!pp.message("manager-fix-the-sidebar", "manager-dictate").ok, "siblings across the tree are still refused");
	t(!pp.message("assistant-dictate", "manager-ux").ok, "an assistant gets no recorded parent: only managers do");
	t(pp.message("manager-fix-the-sidebar", "assistant-fix-the-sidebar").ok, "a manager still reaches its own assistant");
	fs.rmSync(dir, { recursive: true, force: true });
}
// reply rule
t(!m("minion-b", "helper-c").ok, "no reply yet");
const now = Date.now();
p.heard("helper-c", "minion-b", now);
t(p.message("minion-b", "helper-c", now + 1000).rule === "reply", "reply allowed");
t(!p.message("minion-b", "helper-c", now + 31 * 60 * 1000).ok, "reply expires");
// kinds and cards
t(p.kind("master-assistant") === "master" && p.kind("dispatcher") === "system" && p.kind("x") === "worker", "kinds");
t(p.card("manager-q") === "q" && p.card("minion-q") === null, "card");
// spawn
t(p.spawn(null, "manager").ok && p.spawn("mastermind-servex", "assistant").ok && p.spawn("dispatcher", "x").ok, "spawn privileged");
t(!p.spawn("assistant-a", "minion").ok && !p.spawn("master-assistant", "minion").ok, "assistant/master spawn nothing");
t(p.spawn("manager-a", "minion").ok && p.spawn("task-mastermind-x", "helper").ok, "manager spawns workers");
for(const r of ["task-mastermind", "manager", "mastermind", "master-assistant", "assistant", "page-mastermind", "page-assistant"])
	t(!p.spawn("manager-a", r).ok && !p.spawn("task-mastermind-x", r).ok, "no " + r);
t(p.spawn("minion-a", "minion").ok && p.spawn("minion-a", "helper").ok && !p.spawn("minion-a", "mastermind").ok, "worker spawn");
// bookkeeping
t(p.refused.length > 0 && p.refused.length <= 50, "refusals kept");
let hooked = 0; p.onrefuse = () => hooked++; m("minion-z", "minion-y");
t(hooked === 1, "onrefuse hook");
t(Array.isArray(p.rules()) && p.rules()[0].from, "rules");
// off
process.env.SERVEX_POLICY = "off";
t(m("assistant-a", "manager-b").rule === "off" && p.spawn("assistant-a", "manager").rule === "off", "policy off");
delete process.env.SERVEX_POLICY;
console.log(`policy: ${n} checks passed`);
