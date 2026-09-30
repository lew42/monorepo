import fs from "fs";
import os from "os";
import path from "path";
import { execFile, execFileSync } from "child_process";
import { fileURLToPath } from "url";
import Events from "../Server/Events.js";
import { refuse_links_into_main } from "../Server/junction-guard.mjs";
import { stamp, HOME } from "./home.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const slash = p => String(p).split(path.sep).join("/");

/* THE WORKTREE POOL — a quick fix goes into a worktree that is already warm.
 *
 * The owner, 2026-09-25: "Rather than spinning up a new mastermind and a new
 * work tree and a new Playwright, which takes time, if you have a quick fix you
 * send it off to an existing one." So Servex keeps ONE worktree ready — branched
 * from michael/dev, its own server answering, a page watcher on, git configured —
 * and any agent takes it with `take_worktree`, gets `{id, path, branch, url}` at
 * once, writes, smoke-tests (Server/smoke.mjs) and merges. Taking one makes
 * Servex prepare the next. `return_worktree` hands an unused or merged one back.
 * No agent manages this: it is a class, a JSON file and a 10-minute sweep.
 *
 *   K = 3        at most this many worktrees in the pool, taken or not
 *   N = 6 hours  a ready one idle longer than this is removed — except the one kept ready
 *
 * Slots are made and removed by the scripts every agent already uses,
 * Server/worktree-up.mjs and worktree-down.mjs, run from the MAIN checkout
 * (found through `git rev-parse --git-common-dir`) so a slot branches from
 * michael/dev even when this Servex runs from a worktree. State lives in
 * `.worktree-pool.json` at the main repo's root, so it survives a restart.
 * The whole story for a reader: Servex/doc/pool.md. */
export default class Pool extends Events {

    initialize(){
        this.K ??= 3;
        this.N_hours ??= 6;
        this.base ??= "michael/dev";
        this.prefix ??= process.env.SERVEX_POOL_PREFIX || "qf";
        this.main ??= Pool.main_repo();
        this.file ??= process.env.SERVEX_POOL_FILE || path.join(this.main, ".worktree-pool.json");
        ({ slots: this.slots = [], leaving: this.leaving = [] } = this.load());
        this.chain = Promise.resolve();     // one worktree-up (or -down) at a time
    }

    static main_repo(){
        const common = execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: HERE, encoding: "utf8", windowsHide: true }).trim();
        return slash(path.resolve(HERE, common, ".."));
    }

    start(){
        this.started = this.adopt().then(() => this.sweep()).catch(e => this.say(`pool: start failed: ${e.message}`));
        this.timer = setInterval(() => this.sweep().catch(e => this.say(`pool: sweep failed: ${e.message}`)), 10 * 60 * 1000);
        this.timer.unref();
        return this;
    }

    /* ── state on disk ────────────────────────────────────────────────── */

    load(){
        try { return JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { return {}; }
    }

    save(){
        const plain = list => list.map(({ ready, ...s }) => s);   // `ready` is an in-memory promise
        fs.writeFileSync(this.file + ".tmp", JSON.stringify({ K: this.K, N_hours: this.N_hours,
            slots: plain(this.slots), leaving: plain(this.leaving) }, null, "\t"));
        fs.renameSync(this.file + ".tmp", this.file);
    }

    list(){
        return { K: this.K, N_hours: this.N_hours, slots: this.slots.map(s => ({ id: s.id, state: s.state, url: s.url, path: s.path,
            branch: s.branch, taken_by: s.taken_by, taken_at: s.taken_at, idle_since: s.idle_since })) };
    }

    say(msg, extra = {}){
        this.servex?.say(msg, { event: "pool", ...extra });
    }

    /* ── the two tools ────────────────────────────────────────────────── */

    tools(){
        return [{
            name: "take_worktree",
            description: "Take a ready quick-fix worktree: returns {id, path, branch, url} at once — a worktree already branched from"
                + " michael/dev and brought current, its own server answering at `url`. Write your fix into `path`, run"
                + " `node Server/smoke.mjs <path>`, merge into michael/dev, then call return_worktree. Servex prepares the next one"
                + " in the background. If none is ready yet, this waits while one is made (about 20 s). At most 3 exist; when all"
                + " 3 are taken it answers an error naming who holds each.",
            inputSchema: { type: "object", properties: {} },
            handler: async (args, ctx) => JSON.stringify(await this.take(ctx?.caller), null, 2)
        }, {
            name: "return_worktree",
            description: "Hand a worktree back to the pool. It must be clean and hold nothing unmerged (unused, merged, or applied by Server/merge.mjs into"
                + " michael/dev); it is then fast-forwarded to michael/dev and marked ready. Anything uncommitted or unmerged is"
                + " refused with the list — nothing is ever discarded.",
            inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string", description: "The id take_worktree gave, e.g. qf-1." } } },
            handler: async args => JSON.stringify(await this.give_back(args.id), null, 2)
        }];
    }

    async take(caller){
        await this.started;
        for (let tries = 0; tries < 4; tries++){
            const slot = this.slots.find(s => s.state === "ready");
            if (!slot){
                const pending = this.slots.find(s => s.state === "preparing" && s.ready);
                if (pending){ await pending.ready; continue; }
                if (this.slots.length >= this.K){
                    const { reclaimed, kept } = await this.reclaim();
                    if (reclaimed.length) continue;
                    throw new Error(`All ${this.K} worktrees are taken: `
                        + this.slots.map(s => `${s.id} by ${s.taken_by ?? "?"} since ${s.taken_at ?? "?"}`).join("; ")
                        + (kept.length ? `. Held by a stopped agent but NOT reclaimed, because they hold work (nothing is ever discarded): ${kept.map(k => `${k.id} (${k.why})`).join("; ")}` : "")
                        + ". Ask a holder to return_worktree, or wait. Or make your own: node Server/worktree-up.mjs <slug> (it runs npm ci); never link node_modules.");
                }
                await this.prepare()?.ready;
                continue;
            }
            // claimed synchronously, before any await, so two callers never get the same one
            Object.assign(slot, { state: "taken", taken_by: caller || "unknown", taken_at: stamp(), idle_since: null });
            this.save();
            const ff = await this.git(slot.path, ["merge", "--ff-only", this.base]);
            if (!ff.ok){
                slot.state = "bad";
                this.say(`pool: ${slot.id} would not fast-forward to ${this.base} — dropped: ${ff.out}`, { id: slot.id });
                this.remove(slot);
                continue;
            }
            this.say(`pool: ${slot.id} taken by ${slot.taken_by}`, { id: slot.id, taken_by: slot.taken_by });
            try { this.servex?.lifecycle?.took(slot, slot.taken_by); } catch {}   // lifecycle.jsonl + the taker's task log learns its worktree
            this.top_up();
            return { id: slot.id, path: slot.path, branch: slot.branch, url: slot.url };
        }
        throw new Error("No worktree could be made ready — see the servex log (event: pool).");
    }

    async give_back(id){
        const slot = this.slots.find(s => s.id === id);
        if (!slot) throw new Error(`No worktree "${id}" in the pool. It has: ${this.slots.map(s => s.id).join(", ") || "none"}.`);
        if (slot.state !== "taken") return { id, state: slot.state, note: "It was not taken; nothing to do." };

        const dirty = await this.own_dirt(slot);
        if (dirty.length) throw new Error(`Refused: ${id} has uncommitted changes — commit and merge them, or move them, first. Nothing was discarded.\n`
            + dirty.map(d => d.file).join("\n"));
        const unmerged = (await this.git(slot.path, ["log", "--oneline", `${this.base}..HEAD`])).out;
        if (unmerged && await this.landed(slot)){
            // merge.mjs APPLIED this branch over the owner's uncommitted edits: its commits are in the main
            // working tree but not in michael/dev, so a fast-forward would not bring it current. Remove it; make a fresh one.
            this.remove(slot);
            this.top_up();
            this.say(`pool: ${id} returned; its branch was applied, not merged, so it is removed and a fresh one made`, { id });
            return this.list();
        }
        if (unmerged) throw new Error(`Refused: ${id} holds commits not yet in ${this.base} — merge them first. Nothing was discarded.\n${unmerged}`);

        const ff = await this.git(slot.path, ["merge", "--ff-only", this.base]);
        if (!ff.ok) throw new Error(`Refused: ${id} would not fast-forward to ${this.base}: ${ff.out}`);
        Object.assign(slot, { state: "ready", taken_by: null, taken_at: null, idle_since: stamp() });
        this.save();
        this.say(`pool: ${id} returned and ready`, { id });
        try { this.servex?.lifecycle?.record({ kind: "worktree", id, path: slot.path, port: slot.port, event: "end", why: "returned to the pool" }); } catch {}

        for (const extra of this.slots.filter(s => s.state === "ready" && s !== slot)) this.remove(extra);   // one ready is enough
        return this.list();
    }

    /* A slot whose holder has died is handed back, as if it had called return_worktree.
     *
     * Why (2026-09-29, 13:25): take_worktree failed because all 3 slots were held since
     * 09-28 by agents that had since stopped, so the pool was full of dead holders, and the
     * agent that could not get one made its own worktree by hand, with node_modules junctions
     * into the main tree. That is what emptied the main node_modules at 13:46.
     *
     * "Taken" lives in .worktree-pool.json, so it survives a restart. A taken slot stays taken
     * until ALL of these hold (pool-taken, 2026-09-30):
     *   1. its holder is "stopped" or "gone" in the Servex registry (one the registry does not
     *      know — a CLI session, a person — is never reclaimed);
     *   2. no live agent works in it or is queued to (cwd inside the slot), and no live agent
     *      descends from the holder (a minion writes by absolute path from anywhere);
     *   3. it holds no changes of its own and no commits outside michael/dev — give_back()'s
     *      own check, so a slot with work is refused, KEPT and named.
     * Reclaim never salvages (it did until 2026-09-30, and twice that day moved a working
     * minion's files out from under it: qf-9 at 12:53 and 13:23). Salvage is by hand only:
     * `node Servex/Lifecycle.js --salvage qf-N`. */
    async reclaim(){
        const rows = this.holders(), queued = this.queued_cwds();
        const reclaimed = [], kept = [];
        for (const slot of this.slots.filter(s => s.state === "taken")){
            const holder = slot.taken_by, held = this.held(slot, rows, queued);
            if (held){
                if (held.dead) { kept.push({ id: slot.id, holder, why: held.why }); this.once(slot, `pool: ${slot.id} is held by stopped ${holder} but kept — ${held.why}`, holder); }
                continue;
            }
            try {
                await this.give_back(slot.id);
                if (!(await this.answers(slot.url))){ this.remove(slot); this.top_up(); }   // handed back, but its server is dead: make a fresh one
                reclaimed.push(slot.id);
                this.say(`pool: ${slot.id} reclaimed from ${holder}, which has stopped`, { id: slot.id, from: holder });
            } catch (e) {
                const why = String(e.message).split("\n")[0].replace(/^Refused: \S+ /, "").replace(/\.+$/, "");
                kept.push({ id: slot.id, holder, why });
                this.once(slot, `pool: ${slot.id} is held by stopped ${holder} but kept — ${why}. Nothing was moved; salvage by hand if it is truly abandoned: node Servex/Lifecycle.js --salvage ${slot.id}`, holder);
            }
        }
        return { reclaimed, kept };
    }

    /* The sweep asks every 5 minutes: a kept slot's reason is said once, and again only when it changes. */
    once(slot, msg, holder){
        if (slot.kept_msg === msg) return;
        slot.kept_msg = msg;
        this.say(msg, { id: slot.id, from: holder });
    }

    /* Why a taken slot is still held, or null when rules 1 and 2 above let it go.
     * `dead` is true when only rule 2 keeps it (the holder itself has stopped). */
    held(slot, rows, queued = []){
        const LIVE = ["idle", "working", "queued", "starting"];
        const row = rows.find(r => r.id === slot.taken_by || r.name === slot.taken_by);
        if (!row) return { why: `${slot.taken_by} is not a Servex agent` };
        if (row.state !== "stopped" && row.state !== "gone") return { why: `${slot.taken_by} is ${row.state}` };
        const inside = cwd => { const c = slash(path.resolve(String(cwd || "."))).toLowerCase(), p = slash(path.resolve(slot.path)).toLowerCase(); return !!cwd && (c === p || c.startsWith(p + "/")); };
        const worker = rows.find(r => LIVE.includes(r.state) && inside(r.cwd));
        if (worker) return { dead: true, why: `${worker.id} (${worker.state}) works in it` };
        if (queued.some(inside)) return { dead: true, why: "a queued spawn will work in it" };
        const kids = new Set([row.id]);
        for (let grew = true; grew;){ grew = false; for (const r of rows) if (r.parent && kids.has(r.parent) && !kids.has(r.id)){ kids.add(r.id); grew = true; } }
        const child = rows.find(r => r.id !== row.id && kids.has(r.id) && LIVE.includes(r.state));
        if (child) return { dead: true, why: `${child.id}, under ${row.id}, is ${child.state}` };
        return null;
    }

    /* The cwd of every spawn still waiting at the memory gate (not in the registry yet). A seam for tests. */
    queued_cwds(){
        try { return JSON.parse(fs.readFileSync(path.join(HOME, "spawn-queue.json"), "utf8")).map(e => e.spec?.cwd).filter(Boolean); } catch { return []; }
    }

    /* BY HAND ONLY (node Servex/Lifecycle.js --salvage qf-N; reclaim() never calls it since 2026-09-30).
     * A dead holder's slot, emptied without losing anything: its server is stopped FIRST (the
     * wrapper, whose /T takes run.js with it — a running server keeps appending page.jsonl lines,
     * so the tree went dirty again seconds after a hand reset on 09-29), then its uncommitted
     * files and unmerged commits go to `salvage/<slot>-<date>`, never merged, never deleted,
     * and the slot's own branch is moved back to the base. A diff of only appended page.jsonl
     * lines is the server's noise: salvaged anyway, and said so. Returns {branch, what}. */
    async salvage(slot, holder){
        this.kill(slot.watcher_pid, /health-supervisor/i);
        this.kill(slot.server_pid, this.server_cmd(slot));
        for (const d of await this.dirt(slot)) if (Pool.server_log(d.file)) this.restore(slot, d.file);   // the server's noise stays out of salvage
        const status = (await this.git(slot.path, ["status", "--porcelain", "--untracked-files=all"])).out;
        const commits = (await this.git(slot.path, ["log", "--oneline", `${this.base}..HEAD`])).out;
        if (!status && !commits) return { branch: null, what: "nothing to salvage" };
        const files = status ? status.split("\n").map(l => l.replace(/^\s*\S{1,2}\s+/, "").replace(/^"|"$/g, "")) : [];
        const numstat = (await this.git(slot.path, ["diff", "--numstat"])).out;
        const noise = files.length > 0 && files.every(f => f.endsWith("page.jsonl")) && !/^\d+\t[1-9]/m.test(numstat) && !commits;
        const day = stamp().slice(0, 10);
        let branch = `salvage/${slot.id}-${day}`;
        for (let i = 2; (await this.git(slot.path, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`])).ok; i++) branch = `salvage/${slot.id}-${day}-${i}`;
        const step = async args => { const r = await this.git(slot.path, args); if (!r.ok) throw new Error(`salvage of ${slot.id} stopped at git ${args[0]}: ${r.out}`); };
        await step(["checkout", "-b", branch]);
        if (status){
            await step(["add", "-A"]);
            await step(["commit", "-m", `salvage: ${slot.id}, held by ${holder} (stopped) — kept here, never merged`]);
        }
        await step(["checkout", "-B", slot.branch, this.base]);
        const what = `salvaged to ${branch}: ${files.length} file(s)${commits ? `, ${commits.split("\n").length} unmerged commit(s)` : ""}${noise ? " (only the server's own page.jsonl lines)" : ""}`;
        try { await this.servex?.lifecycle?.salvaged(slot, holder, branch, what); } catch {}
        return { branch, what, noise };
    }

    /* The Servex agent registry's rows ({ id, name, state }), or none without a Servex. A seam for tests. */
    holders(){
        try { return this.servex?.agents?.registry_list() ?? []; } catch { return []; }
    }

    /* ── making and removing slots ────────────────────────────────────── */

    /* Keep one ready (or on its way), within K. Runs in the background. */
    top_up(){
        if (this.slots.some(s => s.state === "ready" || s.state === "preparing")) return;
        if (this.slots.length < this.K) this.prepare();
    }

    prepare(){
        const id = this.free_id();
        if (!id) return null;
        const slot = { id, path: slash(path.resolve(this.main, "..", "worktrees", id)), branch: `worktree/${id}`, url: null, port: null,
            state: "preparing", taken_by: null, taken_at: null, idle_since: null, server_pid: null, watcher_pid: null };
        this.slots.push(slot);
        this.save();
        slot.ready = this.chain = this.chain.then(() => this.up(slot)).catch(e => {
            this.say(`pool: ${id} could not be made ready: ${e.message}`, { id });
            this.forget(slot);
            if (this.registry()[id]) return this.script("worktree-down.mjs", id).catch(() => {});
        });
        return slot;
    }

    free_id(){
        const taken = new Set([...this.slots.map(s => s.id), ...Object.keys(this.registry())]);
        for (let i = 1; i <= 9; i++){
            const id = `${this.prefix}-${i}`;
            const dir = path.resolve(this.main, "..", "worktrees", id);
            if (taken.has(id)) continue;
            if (fs.existsSync(dir)){
                try { if (fs.readdirSync(dir).length) continue; fs.rmdirSync(dir); } catch { continue; }   // an EMPTY leftover folder (qf-7, 09-30) frees its name
            }
            try { execFileSync("git", ["rev-parse", "--verify", "--quiet", `refs/heads/worktree/${id}`], { cwd: this.main, windowsHide: true, stdio: "ignore" }); }
            catch { return id; }   // no such branch: free
            /* A leftover branch with no worktree, already merged, is deleted and its name reused (`branch -d`
             * refuses an unmerged one, which keeps the name). Without this all nine names filled with
             * leftovers and take_worktree failed with "No worktree could be made ready" (2026-09-30). */
            try {
                execFileSync("git", ["merge-base", "--is-ancestor", `worktree/${id}`, this.base], { cwd: this.main, windowsHide: true, stdio: "ignore" });   // merged into the BASE, not just main's HEAD
                execFileSync("git", ["branch", "-d", `worktree/${id}`], { cwd: this.main, windowsHide: true, stdio: "ignore" }); return id;
            } catch {}
        }
        return null;
    }

    async up(slot){
        const t0 = Date.now();
        await this.script("worktree-up.mjs", slot.id);
        const entry = this.registry()[slot.id];
        if (!entry?.booted) throw new Error("worktree-up finished but its server never answered");
        Object.assign(slot, { path: slash(entry.path), port: entry.port, url: `http://127.0.0.1:${entry.port}/`, server_pid: entry.pid });
        const ff = await this.git(slot.path, ["merge", "--ff-only", this.base]);
        if (!ff.ok) throw new Error(`could not fast-forward to ${this.base}: ${ff.out}`);
        await this.identity(slot);
        await this.watch(slot);
        slot.baseline = Object.fromEntries((await this.dirt(slot)).map(d => [d.file, d.hash]));
        Object.assign(slot, { state: "ready", idle_since: stamp() });
        this.save();
        this.say(`pool: ${slot.id} ready at ${slot.url} in ${((Date.now() - t0) / 1000).toFixed(1)} s`, { id: slot.id, url: slot.url });
    }

    /* A slot leaves the pool at once; its worktree goes down on the chain.
     * Never discards: a slot with changes of its own or unmerged commits is only
     * forgotten, and left on disk for a person to look at. Its server is stopped
     * FIRST, so the baseline files (see `dirt()`) can be put back to HEAD
     * without the server writing them again, and worktree-down finds it clean. */
    remove(slot){
        this.forget(slot);
        this.leaving.push(slot);   // kept on disk until it is really gone, so a restart mid-way finishes it
        this.save();
        return this.chain = this.chain.then(async () => {
            this.kill(slot.watcher_pid, /health-supervisor/i);
            this.kill(slot.server_pid, this.server_cmd(slot));
            const own = await this.own_dirt(slot);
            const ancestor = (await this.git(slot.path, ["merge-base", "--is-ancestor", "HEAD", this.base])).ok || await this.landed(slot);
            if (own.length || !ancestor){
                this.say(`pool: ${slot.id} left on disk at ${slot.path} — it holds ${own.length ? "uncommitted changes" : "unmerged commits"}`, { id: slot.id });
                return;
            }
            for (const d of await this.dirt(slot)) this.restore(slot, d.file);
            if (this.registry()[slot.id]) await this.script("worktree-down.mjs", slot.id);
            else {   // not registered (qf-6, 09-30: worktree-down refused, the slot stayed on disk and its name stayed taken)
                const r = await this.git(this.main, ["worktree", "remove", slot.path]);
                if (!r.ok) throw new Error(`git worktree remove ${slot.path}: ${r.out}`);
                await this.git(this.main, ["branch", "-d", slot.branch]);   // -d: only a merged branch
            }
            fs.rmSync(path.join(this.main, ".worktree-logs", `${slot.id}.log.err`), { force: true });   // worktree-down deletes only the .log
            const tmp = path.join(os.tmpdir(), `lew42-pool-${slot.id}`);
            refuse_links_into_main(tmp, "removing the watcher's temp dir", this.main);   // guard: never a recursive delete through a link into main
            fs.rmSync(tmp, { recursive: true, force: true });   // the watcher's temp dir (watch())
            this.say(`pool: ${slot.id} removed`, { id: slot.id });
        }).catch(e => this.say(`pool: removing ${slot.id} failed: ${e.message}`, { id: slot.id }))
          .finally(() => { this.leaving = this.leaving.filter(s => s !== slot); this.save(); });
    }

    forget(slot){
        this.slots = this.slots.filter(s => s !== slot);
        this.save();
    }

    /* ── keeping it tidy ──────────────────────────────────────────────── */

    /* At start: adopt what survived a restart. A slot whose worktree is gone is
     * dropped; a ready one whose server stopped answering is replaced; a watcher
     * that died is started again; one half-made or half-removed when Servex died is removed. */
    async adopt(){
        for (const slot of this.leaving.splice(0)) if (fs.existsSync(slot.path)) this.remove(slot);
        for (const slot of [...this.slots]){
            if (!fs.existsSync(slot.path)){ this.forget(slot); continue; }
            if (slot.state === "taken") continue;
            if (slot.state !== "ready" || !(await this.answers(slot.url))){ this.remove(slot); continue; }
            if (!this.alive(slot.watcher_pid)){ await this.watch(slot); this.save(); }
        }
        if (this.slots.length) this.say(`pool: adopted ${this.slots.map(s => `${s.id} (${s.state})`).join(", ")}`);
    }

    /* Every 10 minutes and at start: at most K; a ready one idle over N hours
     * goes, except the newest; then make sure one is ready. Taken ones are never touched. */
    async sweep(){
        const ready = this.slots.filter(s => s.state === "ready").sort((a, b) => String(b.idle_since).localeCompare(String(a.idle_since)));
        const cutoff = Date.now() - this.N_hours * 3600 * 1000;
        for (const slot of ready.slice(1)){
            if (this.slots.length > this.K || Date.parse(slot.idle_since) < cutoff) this.remove(slot);
        }
        this.top_up();
    }

    /* ── helpers ──────────────────────────────────────────────────────── */

    registry(){
        try { return JSON.parse(fs.readFileSync(path.join(this.main, ".worktrees.json"), "utf8")); } catch { return {}; }
    }

    /* The MAIN checkout's copy of the script, run from the main checkout: its
     * own root decides where the worktree branches from. SERVEX_PORT tells it
     * which Servex to register the new name with. */
    script(name, id){
        return new Promise((resolve, reject) => execFile(process.execPath, [path.join(this.main, "Server", name), id], {
            cwd: this.main, windowsHide: true, timeout: 180000, maxBuffer: 8 << 20,
            env: { ...process.env, SERVEX_PORT: String(this.servex?.dashboard_port ?? 8090) }
        }, (e, out, err) => e ? reject(new Error(`${name} ${id} failed: ${String(err || out).trim().split("\n").slice(-3).join(" | ")}`)) : resolve(out)));
    }

    /* True when merge.mjs APPLIED this slot's current head over uncommitted edits
     * (recorded in .merge-landed.json at the main root): as good as merged. */
    async landed(slot){
        const head = (await this.git(slot.path, ["rev-parse", "HEAD"])).out;
        try { return JSON.parse(fs.readFileSync(path.join(this.main, ".merge-landed.json"), "utf8")).some(e => e.head === head); }
        catch { return false; }
    }

    git(cwd, args){
        return new Promise(resolve => execFile("git", ["-C", cwd, ...args], { windowsHide: true, encoding: "utf8" },
            (e, out, err) => resolve({ ok: !e, out: String(e ? err || out : out).trim() })));
    }

    /* THE BASELINE. A fresh slot is not clean: its own dev server's PageFiles
     * plugin appends, at boot, the page.jsonl lines michael/dev has not
     * committed yet (measured 2026-09-25: two lines, in every new worktree).
     * `dirt()` is every changed file with a content hash; `up()` keeps it as the
     * slot's `baseline`. `own_dirt()` is what changed BEYOND it — an agent's
     * work — and only that makes a return refuse. A baseline file whose hash
     * moved counts as the agent's, so nothing anyone wrote is ever put back. */
    async dirt(slot){
        const out = (await this.git(slot.path, ["status", "--porcelain", "--untracked-files=all"])).out;
        const files = out ? out.split("\n").map(l => l.replace(/^\s*\S{1,2}\s+/, "").replace(/^"|"$/g, "")) : [];
        /* ⚠ ONE git per 200 files, never one per file (2026-09-29): a slot with thousands of
           untracked files spawned thousands of `git hash-object` at once, and Servex's main
           thread sat at 100% inside spawn() — every agent message timed out. */
        const present = files.filter(file => fs.existsSync(path.join(slot.path, file)));
        const hashes = {};
        for (let i = 0; i < present.length; i += 200){
            const chunk = present.slice(i, i + 200);
            const h = await this.git(slot.path, ["hash-object", "--", ...chunk]);
            if (h.ok) h.out.split("\n").forEach((hash, j) => { hashes[chunk[j]] = hash.trim(); });
        }
        return files.map(file => ({ file, hash: hashes[file] ?? "gone" }));
    }

    /* A dev server's own logs (page.jsonl, files.jsonl, the clarity flags) are its noise, never an
     * agent's work: a return treats them as clean and salvage leaves them out (node-reliability,
     * 2026-09-30: qf-6's salvage swept 233 of them into a branch; a slot with only these stayed leased). */
    static server_log(file){ return /(^|\/)(page|files)\.jsonl$/.test(file) || file === ".claude/skills/clarity/flags.jsonl"; }

    async own_dirt(slot){
        return (await this.dirt(slot)).filter(d => !Pool.server_log(d.file) && slot.baseline?.[d.file] !== d.hash);
    }

    /* A baseline file back to exactly what HEAD holds (a new one is deleted). */
    restore(slot, file){
        const full = path.join(slot.path, file);
        try { fs.writeFileSync(full, execFileSync("git", ["-C", slot.path, "show", `HEAD:${file}`], { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] })); }
        catch { fs.rmSync(full, { force: true }); }
    }

    async identity(slot){
        if ((await this.git(slot.path, ["config", "user.name"])).out) return;
        for (const key of ["user.name", "user.email"]){
            const value = (await this.git(this.main, ["config", key])).out;
            if (value) await this.git(slot.path, ["config", key, value]);
        }
    }

    /* The page watcher, started from the slot's own root and pointed at the
     * slot's own server. Launched through PowerShell so it gets a HIDDEN console
     * its children inherit (worktree-up.mjs says why a bare detached node opens
     * windows). ⚠ health.mjs allows one copy per machine through a lock in the
     * temp dir, so each slot gets a temp dir of its own — or it would see the
     * owner's watcher and exit at once. */
    watch(slot){
        const tmp = path.join(os.tmpdir(), `lew42-pool-${slot.id}`);
        fs.mkdirSync(tmp, { recursive: true });
        const q = s => String(s).replaceAll("'", "''");
        const ps = `$env:HEALTH_BASE='http://127.0.0.1:${slot.port}'; $env:TEMP='${q(tmp)}'; $env:TMP='${q(tmp)}'; `
            + `$p = Start-Process -FilePath '${q(process.execPath)}' -ArgumentList 'Server/health-supervisor.mjs' -WorkingDirectory '${q(slot.path)}' -WindowStyle Hidden -PassThru; $p.Id`;
        return new Promise(resolve => execFile("powershell.exe", ["-NoProfile", "-Command", ps], { windowsHide: true, encoding: "utf8" }, (e, out) => {
            slot.watcher_pid = Number(String(out).trim()) || null;
            if (!slot.watcher_pid) this.say(`pool: ${slot.id} page watcher did not start: ${e?.message ?? out}`, { id: slot.id });
            resolve(slot.watcher_pid);
        }));
    }

    /* Kill a pid only while it is still the process we started. Windows reuses pids: on 2026-09-29
     * qf-4's recorded watcher pid (25792) had become whisper-server, and a blind taskkill /T would
     * have taken the owner's dictation down. `expect` is matched against its command line. */
    kill(pid, expect){
        if (!pid) return;
        if (expect){
            const cmd = this.cmdline(pid);
            if (!cmd || !expect.test(cmd)) return cmd && this.say(`pool: pid ${pid} is no longer ours (${cmd.slice(0, 80)}) — not killed`);
        }
        try { execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {}
    }

    cmdline(pid){
        try { return execFileSync("powershell.exe", ["-NoProfile", "-Command", `(Get-CimInstance Win32_Process -Filter "ProcessId=${Number(pid)}").CommandLine`], { encoding: "utf8", windowsHide: true }).trim(); }
        catch { return ""; }
    }

    /* A slot's server is the cmd wrapper worktree-up.mjs launched, writing to .worktree-logs/<id>.log. */
    server_cmd(slot){ return new RegExp(String.raw`worktree-logs[\\/]` + slot.id + String.raw`\.log`, "i"); }

    alive(pid){
        try { return !!pid && process.kill(pid, 0); } catch { return false; }
    }

    async answers(url){
        try { return !!url && (await fetch(url, { signal: AbortSignal.timeout(3000) })).status === 200; } catch { return false; }
    }
}
