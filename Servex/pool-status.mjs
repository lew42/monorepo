/* node Servex/pool-status.mjs — one line per quick-fix slot: holder and its state, branch, commits ahead of the base,
 * uncommitted files, and the verdict reclaim gives it. Read-only: it frees nothing. Doc: doc/pool.md "When a slot is freed". */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Pool from "./Pool.js";
import Registry from "./agents/Registry.js";

export default class PoolStatus {
    constructor(pool = new Pool({ servex: { agents: { registry_list: () => new Registry().list() } } })){ this.pool = pool; }

    async rows(){
        const rows = this.pool.holders(), queued = this.pool.queued_cwds();
        return Promise.all(this.pool.slots.map(async slot => {
            const holder = rows.find(r => r.id === slot.taken_by || r.name === slot.taken_by);
            const base = { id: slot.id, state: slot.state, branch: slot.branch, holder: slot.taken_by ?? "-", holder_state: holder?.state ?? (slot.taken_by ? "unknown" : "-") };
            try {
                const s = await this.pool.standing(slot), v = slot.state === "taken" ? await this.pool.verdict(slot, rows, queued) : { free: false, why: slot.state };
                return { ...base, ahead: s.ahead.length, on_base: s.on_base, dirty: s.own.length, verdict: v.free ? "FREE" : "KEPT", why: v.why };
            } catch (e) { return { ...base, ahead: "?", dirty: "?", verdict: "?", why: e.message.split("\n")[0] }; }
        }));
    }

    async print(){
        const rows = await this.rows();
        for (const r of rows) console.log(`${r.id}  ${r.holder} (${r.holder_state})  ${r.branch}  ahead ${r.ahead}${r.on_base && r.ahead ? " (on base)" : ""}  uncommitted ${r.dirty}  ${r.verdict}: ${r.why}`);
        const free = rows.filter(r => r.verdict === "FREE").length, ready = rows.filter(r => r.state === "ready").length;
        console.log(`${rows.length} slot(s): ${ready} ready, ${free} would be freed by reclaim, ${rows.filter(r => r.verdict === "KEPT" && r.state === "taken").length} kept.`);
        return rows;
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await new PoolStatus().print();
