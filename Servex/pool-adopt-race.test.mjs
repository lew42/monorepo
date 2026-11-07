/* node Servex/pool-adopt-race.test.mjs — a slot someone holds is never gutted (relief, 2026-11-06).
 * At boot Pool.adopt() awaited answers(slot.url) on a ready slot; Fixer.take_slot() took that slot with take_sync() in the
 * await; adopt() then removed the now-taken slot and worktree-down emptied the folder the fixer lived in (qf-1 15:43, qf-2 20:17).
 * No real git: remove() is spied, answers() is a promise the test releases by hand. Doc: Servex/doc/pool.md */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pool-adopt-race-"));
process.env.SERVEX_HOME = dir;
const { default: Pool } = await import("./Pool.js");
const { default: Fixer } = await import("./agents/Fixer.js");

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; };

function fake_pool(agents = []){
    const said = [];
    const pool = new Pool({ main: dir, file: path.join(dir, `.pool-${Math.random().toString(36).slice(2)}.json`),
        servex: { say: m => said.push(m), agents: { registry_list: () => agents } } });
    pool.said = said;
    pool.holders = () => agents;
    pool.removed = [];
    pool.chain = Promise.resolve();
    const real = pool.remove.bind(pool);
    pool.remove = (slot, opts) => { pool.removed.push(slot.id); return real(slot, opts); };   // spy, then the real guard
    return pool;
}
function slot_on_disk(id, extra = {}){
    const p = path.join(dir, id); fs.mkdirSync(p, { recursive: true }); fs.writeFileSync(path.join(p, ".git"), "gitdir: fake");
    return { id, path: p, branch: `worktree/${id}`, url: "http://127.0.0.1:9/", state: "ready", ...extra };
}

await check("a slot taken during adopt()'s await is not removed", async () => {
    const pool = fake_pool();
    const slot = slot_on_disk("qf-1"); pool.slots = [slot];
    let release; pool.answers = () => new Promise(r => { release = r; });
    pool.page_watch = () => {};
    const adopting = pool.adopt();
    await new Promise(r => setImmediate(r));
    Object.assign(slot, { state: "taken", taken_by: "fixer-1" });   // what take_sync did in the await
    release(false);                                                   // the server did not answer: the old code removed it here
    await adopting;
    assert.deepEqual(pool.removed, [], "remove() was never called on the taken slot");
    assert.ok(pool.slots.includes(slot) && fs.existsSync(path.join(slot.path, ".git")), "slot and folder are intact");
});

await check("a ready slot whose server is dead is still replaced (the repair still works)", async () => {
    const pool = fake_pool();
    const slot = slot_on_disk("qf-2"); pool.slots = [slot];
    pool.answers = async () => false;
    await pool.adopt();
    assert.deepEqual(pool.removed, ["qf-2"]);
});

await check("take_sync refuses while adopt() is still running", async () => {
    const pool = fake_pool();
    pool.slots = [slot_on_disk("qf-3")];
    pool.adopting = true;
    assert.equal(pool.take_sync("fixer-1"), null, "no slot while adopting");
    assert.equal(pool.slots[0].state, "ready", "the slot was not touched");
    pool.adopting = false;
});

await check("remove() refuses a taken slot, a held slot and one an agent works in", async () => {
    const pool = fake_pool();
    const taken = slot_on_disk("qf-4", { state: "taken", taken_by: "x" });
    const held = slot_on_disk("qf-5", { state: "ready", held_by: "fixer-1" });
    const worked = slot_on_disk("qf-6");
    pool.slots = [taken, held, worked];
    pool.holders = () => [{ id: "minion-a", state: "idle", cwd: path.join(worked.path, "sub") }];
    for (const s of [taken, held, worked]) await pool.remove(s);
    assert.equal(pool.slots.length, 3, "nothing was forgotten");
    assert.equal(pool.leaving.length, 0, "nothing queued for removal");
    assert.equal(pool.said.filter(m => /NOT removed/.test(m)).length, 3, "one log line each");
    for (const s of [taken, held, worked]) assert.ok(fs.existsSync(path.join(s.path, ".git")), `${s.id} still on disk`);
});

await check("a caller that holds the slot itself can force the removal", async () => {
    const pool = fake_pool();
    const bad = slot_on_disk("qf-7", { state: "bad", taken_by: "x" });
    pool.slots = [bad];
    pool.remove(bad, { force: true });
    assert.equal(pool.slots.length, 0, "forgotten");
    assert.equal(pool.leaving.length, 1, "queued for removal");
    await pool.chain;   // the queued removal runs (it finds a fake repo and gives up) before the scratch dir goes
});

await check("Fixer drops a gutted slot, stops the fixer in it, and takes a fresh one", async () => {
    const pool = fake_pool();
    const old = slot_on_disk("qf-8", { state: "taken", taken_by: "fixer-1", held_by: "fixer-1" });
    const fresh = slot_on_disk("qf-9");
    pool.slots = [old, fresh];
    pool.page_watch = () => {};
    pool.release_extra_holds = async () => {};
    pool.hold = (id, by) => { pool.slots.find(s => s.id === id).held_by = by; };
    pool.reuse_hold = () => null;
    pool.take_sync = caller => Object.assign(pool.slots.find(s => s.state === "ready"), { state: "taken", taken_by: caller });   // no real git here
    const stopped = [];
    const agent = { state: "idle", cwd: old.path };
    const servex = { say(){}, pool, agents: { live: new Map([["fixer-1", agent]]), stop: (id, o) => { stopped.push(id); agent.state = "stopped"; } } };
    const fixer = new Fixer({ servex });
    fixer.slot = old;
    assert.equal(fixer.take_slot(), old, "an intact slot is kept");
    fs.rmSync(path.join(old.path, ".git"));   // gutted
    const got = fixer.take_slot();
    assert.deepEqual(stopped, ["fixer-1"], "the fixer standing in the gutted folder was stopped");
    assert.equal(got.id, "qf-9", "a fresh slot was taken");
    fixer.slot = fresh;
    pool.slots = [old];                       // no longer in the pool
    fs.writeFileSync(path.join(old.path, ".git"), "gitdir: fake");
    assert.equal(fixer.gutted(fresh), true, "a slot the pool no longer lists is dead");
});

console.log(`pool-adopt-race.test: ${checks} checks pass`);
fs.rmSync(dir, { recursive: true, force: true });
