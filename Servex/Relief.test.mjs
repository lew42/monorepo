/* node Servex/Relief.test.mjs — early relief at 70% commit (resources, 2026-11-06). Doc: Servex/doc/processes.md
 * Pure rule first, then one run with fake agents, lifecycle, worktrees and monitor: the order of the steps, who may sleep,
 * the ONE owner note per episode, and that nothing in `other` is ever ended. */
import assert from "node:assert/strict";
import Relief, { decide } from "./Relief.js";

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; };
const MIN = 60000, NOW = 10 * 3600000;

await check("decide: below the line never runs, at or above runs", () => {
    assert.equal(decide({ commit_pct: 69.9, now: NOW }).run, false);
    assert.equal(decide({ commit_pct: 70, now: NOW }).run, true);
    assert.equal(decide({ commit_pct: 91, now: NOW }).run, true);
    assert.equal(decide({ commit_pct: 70, now: NOW, threshold: 80 }).run, false, "SERVEX_RELIEF_PCT moves the line");
});
await check("decide: at most once per 15 minutes", () => {
    assert.equal(decide({ commit_pct: 80, last_run: NOW - 14 * MIN, now: NOW }).run, false);
    assert.equal(decide({ commit_pct: 80, last_run: NOW - 15 * MIN, now: NOW }).run, true);
});
await check("decide: an unreadable commit never runs; armed re-arms only below 65", () => {
    assert.equal(decide({ commit_pct: null, now: NOW }).run, false);
    assert.equal(decide({ commit_pct: undefined, armed: false, now: NOW }).armed, false);
    assert.equal(decide({ commit_pct: 68, armed: false, now: NOW }).armed, false, "between 65 and 70 stays disarmed");
    assert.equal(decide({ commit_pct: 64.9, armed: false, now: NOW }).armed, true);
    assert.equal(decide({ commit_pct: 75, armed: true, now: NOW }).armed, true);
});

function world(pct = 80){
    const calls = [], logged = [], notes = [];
    const agent = (id, extra = {}) => ({ id, state: "idle", rss_mb: 200, sleep(why){ calls.push(`sleep:${this.id}`); this.state = "dormant"; return true; }, ...extra });
    const agents = [
        agent("minion-old"), agent("minion-fresh"), agent("minion-working", { state: "working" }),
        agent("assistant-front"), agent("session-smart-1"), agent("fixer-1"), agent("master-held", { dormant_after: "session" }), agent("minion-child-busy")
    ];
    const idle_since = { "minion-fresh": 2 * MIN };      // everyone else has been idle for 30 minutes
    const other_proc = { kill_called: false };
    const sv = {
        procmon: {
            commit_mb: pct * 100, commit_limit_mb: 10000,
            reaped: [{ at: new Date(Date.now() - MIN).toISOString(), mb: 40 }],
            now: { idle_s: 30 * 60, other_top: ["Chrome", "Figma", "Slack", "Teams", "Docker", "Spotify"].map((name, i) => ({ name, n: 3, mb: 3000 - i * 100, cpu: 1 })) },   // the owner has been away 30 minutes
            kill(){ other_proc.kill_called = true; }
        },
        log: { append: async (name, line) => { logged.push({ name, ...line }); } },
        lifecycle: { sweep: async () => { calls.push("sweep"); return { close: [{ kind: "agent", id: "x", mb: 100 }, { kind: "server", id: "y", mb: 50 }], gone: [], kept: [{}, {}] }; } },
        worktrees: {
            last: { items: [{ name: "wt-a", state: "finished" }, { name: "wt-b", state: "open" }] },
            tasks: () => new Map(),
            stop_idle: async items => { calls.push(`servers:${items.map(i => i.name)}`); return items.length; }
        },
        global: {
            wait_ms: a => (a.dormant_after === "session" || /^session-/.test(a.id) ? Infinity : 600000),
            has_working_child: id => id === "minion-child-busy",
            last_active: a => Date.now() - (idle_since[a.id] ?? 30 * MIN),
            mark_slept: a => calls.push(`marked:${a.id}`)
        },
        agents: { live: new Map(agents.map(a => [a.id, a])) },
        cards: { owner_note: n => { notes.push(n); return Promise.resolve(); } }
    };
    return { sv, calls, logged, notes, other_proc, agents };
}

await check("a run goes sweep, then servers, then sleeping, then the reaped count; sleeps only who may", async () => {
    const w = world(80);
    const relief = new Relief({ servex: w.sv });
    const entry = await relief.tick(Date.now());
    assert.ok(entry, "it ran");
    const order = w.calls.filter(c => !c.startsWith("marked"));
    assert.deepEqual(order[0], "sweep");
    assert.deepEqual(order[1], "servers:wt-a", "only the finished worktree is offered");
    assert.deepEqual(order.slice(2), ["sleep:minion-old"], "fresh, working, front desk, voice, fixer, session-holder and busy-parent all stay");
    assert.deepEqual(w.logged.filter(l => l.type === "relief-step").map(l => l.step), ["sweep", "servers", "dormant", "reaped"]);
    const line = w.logged.find(l => l.type === "relief");
    assert.equal(line.name, "processes");
    assert.equal(line.commit_pct, 80);
    assert.deepEqual(line.dormant, ["minion-old"]);
    assert.deepEqual(line.closed, ["agent:x", "server:y", "servers:1 worktree"]);
    assert.equal(line.reaped, 1);
    assert.equal(line.freed_mb_estimate, 100 + 50 + 200 + 40);
});

await check("still over the line: ONE note naming the five biggest not-ours apps; a second run in the episode adds none", async () => {
    const w = world(80);
    const relief = new Relief({ servex: w.sv });
    await relief.tick(Date.now());
    assert.equal(w.notes.length, 1);
    const n = w.notes[0];
    assert.equal(n.kind, "risk");
    for (const name of ["Chrome", "Figma", "Slack", "Teams", "Docker"]) assert.ok(n.text.includes(name), name);
    assert.ok(!n.text.includes("Spotify"), "only five");
    assert.match(n.text, /3000 MB/);
    await relief.tick(Date.now() + 16 * MIN);
    assert.equal(w.notes.length, 1, "same episode: no second note");
    w.sv.procmon.commit_mb = 6000;                       // 60%: the episode ends
    await relief.tick(Date.now() + 17 * MIN);
    assert.equal(relief.armed, true, "re-armed below 65%");
    w.sv.procmon.commit_mb = 8000;
    await relief.tick(Date.now() + 40 * MIN);
    assert.equal(w.notes.length, 2, "the next episode may post again");
});

await check("the owner at the keyboard: the note is held (one held line), stays armed, and posts at a later run once they are away", async () => {
    const w = world(80);
    w.sv.procmon.now.idle_s = 60;
    const relief = new Relief({ servex: w.sv });
    await relief.tick(Date.now());
    assert.equal(w.notes.length, 0, "never while they are using the PC");
    assert.equal(w.logged.filter(l => l.type === "relief-note-held").length, 1);
    assert.equal(relief.armed, true, "still armed");
    delete w.sv.procmon.now.idle_s;
    await relief.tick(Date.now() + 16 * MIN);
    assert.equal(w.notes.length, 0, "no idle reading counts as not idle");
    w.sv.procmon.now.idle_s = 15 * 60;
    await relief.tick(Date.now() + 32 * MIN);
    assert.equal(w.notes.length, 1, "away 15 minutes: the suggestion is posted");
    assert.equal(relief.armed, false);
});

await check("relief that gets the commit under the line posts no note", async () => {
    const w = world(80);
    w.sv.lifecycle.sweep = async () => { w.sv.procmon.commit_mb = 5000; return { close: [], gone: [], kept: [] }; };
    await new Relief({ servex: w.sv }).tick(Date.now());
    assert.equal(w.notes.length, 0);
});

await check("the 'still over' check waits for the monitor's next reading, not the stale snapshot", async () => {
    const w = world(80);
    const fns = [];
    w.sv.procmon.once = (ev, fn) => { if (ev === "tick") fns.push(fn); };
    w.sv.procmon.off = () => {};
    w.sv.lifecycle.sweep = async () => { setTimeout(() => { w.sv.procmon.commit_mb = 5000; fns.splice(0).forEach(fn => fn()); }, 20); return { close: [], gone: [], kept: [] }; };
    await new Relief({ servex: w.sv }).tick(Date.now());
    assert.equal(w.notes.length, 0, "the fresh reading is under the line: no note");
});

await check("nothing in `other` is ever ended, and a missing worktrees/lifecycle does not stop the run", async () => {
    const w = world(80);
    delete w.sv.worktrees; delete w.sv.lifecycle;
    const entry = await new Relief({ servex: w.sv }).tick(Date.now());
    assert.ok(entry, "still ran");
    assert.equal(w.other_proc.kill_called, false);
    assert.ok(w.logged.some(l => l.step === "sweep" && l.error), "the failed step is logged, not thrown");
    assert.deepEqual(entry.dormant, ["minion-old"]);
});

console.log(`Relief.test: ${checks} checks pass`);
