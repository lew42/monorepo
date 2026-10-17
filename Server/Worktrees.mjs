/* node Server/Worktrees.mjs --plan | --apply — one verdict per non-pool worktree; --apply removes the REMOVE ones.
 * REMOVE = its work is on michael/dev (or it has none) and nothing REAL is uncommitted. KEEP = anything else, with its branch.
 * Branches are never deleted; each removal is one line in ai/sessions/worktree-removals.jsonl. Doc: doc/worktrees.md "Clear out landed worktrees". */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import Pool from "../Servex/Pool.js";
import { refuse_links_into_main } from "./junction-guard.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const slash = s => String(s || "").replace(/\\/g, "/");
const lower = s => slash(s).toLowerCase().replace(/\/+$/, "");

export default class Worktrees {
    static BASE = "michael/dev";
    static MANIFEST = "public/framework/ai/sessions/worktree-removals.jsonl";
    // files a worktree's own dev server or a screenshot run rewrites: losing them loses nothing
    static REGENERATED = /(^|\/)(files\.jsonl|index\.json|cache\.jsonl)$|\.png$|(^|\/)(shots|layout-check)\//;

    static main_repo(from = HERE){
        return slash(path.resolve(from, execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: from, encoding: "utf8", windowsHide: true }).trim(), ".."));
    }

    /* options: main (repo root), base, agents (cwd list of live agents; null = ask Servex), pool_names (regexp) */
    constructor({ main = Worktrees.main_repo(), base = Worktrees.BASE, agents = null, here = process.cwd(), pool_names = /^qf-\d+$/ } = {}){
        Object.assign(this, { main: slash(main), base, agents, here: lower(this.top(here)), pool_names });
        // Pool.landed() is the one "is this on the base" test (by commits, by merge.mjs record, by file content)
        this.pool = new Pool({ servex: { agents: { registry_list: () => [] } }, main: this.main, base, file: path.join(os.tmpdir(), "worktrees-unused-pool.json") });
    }

    git(cwd, ...a){ return spawnSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 }); }
    out(cwd, ...a){ return this.git(cwd, ...a).stdout.trim(); }
    top(dir){ try { return slash(execFileSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], { encoding: "utf8", windowsHide: true }).trim()); } catch { return slash(dir); } }

    list(){
        return this.git(this.main, "worktree", "list", "--porcelain").stdout.split(/\r?\n\r?\n/).filter(Boolean).slice(1)
            .map(b => ({ path: slash(/^worktree (.*)$/m.exec(b)?.[1]), head: /^HEAD (\w+)$/m.exec(b)?.[1],
                branch: /^branch refs\/heads\/(.*)$/m.exec(b)?.[1] ?? null, locked: /^locked/m.test(b) }));
    }

    async live_cwds(){
        if (this.agents) return this.agents.map(lower);
        try {
            const j = await (await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/agents`, { signal: AbortSignal.timeout(3000) })).json();
            return (j.agents || j).filter(a => ["idle", "working", "queued", "starting"].includes(a.state)).map(a => lower(a.cwd)).filter(Boolean);
        } catch { return null; }   // unknown: --apply refuses to guess
    }

    changes(dir){
        const mod = { regenerated: 0, real: 0 }, unt = { regenerated: 0, real: 0 };
        for (const l of this.out(dir, "status", "--porcelain", "--untracked-files=all").split(/\r?\n/).filter(Boolean)){
            const file = slash(l.slice(3).replace(/^"|"$/g, "")), kind = l.startsWith("??") ? unt : mod;
            kind[Worktrees.REGENERATED.test(file) ? "regenerated" : "real"]++;
        }
        return { modified: mod, untracked: unt, regenerated: mod.regenerated + unt.regenerated, real: mod.real + unt.real };
    }

    async row(w, live){
        const base = { path: w.path, branch: w.branch ?? `(detached ${w.head?.slice(0, 9)})`, sha: w.head };
        if (!fs.existsSync(w.path)) return { ...base, verdict: "REMOVE", why: "folder is gone; only its git entry is left", gone: true };
        const ahead = Number(this.out(w.path, "rev-list", "--count", `${this.base}..HEAD`)) || 0;
        const diff_empty = this.git(w.path, "diff", "--quiet", `${this.base}...HEAD`).status === 0;
        const landed = ahead === 0 || diff_empty || await this.pool.landed({ path: w.path });
        const ch = this.changes(w.path), row = { ...base, ahead, diff_empty, landed, ...ch };
        if (w.locked) return { ...row, verdict: "KEEP", why: "locked" };
        if (lower(w.path) === this.here) return { ...row, verdict: "KEEP", why: "this script runs here" };
        if (live === null) return { ...row, verdict: "KEEP", why: "Servex is not answering, so no live agent can be ruled out" };
        if (live.some(c => c === lower(w.path) || c.startsWith(lower(w.path) + "/"))) return { ...row, verdict: "KEEP", why: "a live agent works there" };
        if (!w.branch && ahead) return { ...row, verdict: "KEEP", why: `detached with ${ahead} commit(s) ahead, no branch holds them` };
        if (!landed) return { ...row, verdict: "KEEP", why: `${ahead} unmerged commit(s) on ${row.branch}` };
        if (ch.real) return { ...row, verdict: "KEEP", why: `${ch.real} uncommitted file(s) that are not regenerated, on ${row.branch}` };
        return { ...row, verdict: "REMOVE", why: ahead ? `${ahead} commit(s) already on ${this.base}` : "nothing ahead of the base", force: ch.regenerated > 0 };
    }

    /* Every non-pool worktree, as rows. */
    async plan(){
        const live = await this.live_cwds(), pool = new Set(this.pool.slots.map(s => lower(s.path))), rows = [];
        for (const w of this.list()){
            if (this.pool_names.test(path.basename(w.path)) || pool.has(lower(w.path))) continue;
            rows.push(await this.row(w, live));
        }
        return rows;
    }

    format(r){
        const c = `uncommitted ${r.regenerated ?? 0} regenerated + ${r.real ?? 0} real`;
        const how = r.verdict === "REMOVE" ? (r.force ? " (--force: only regenerated files)" : "") : "";
        return `${r.verdict.padEnd(6)} ${r.path}  ${r.branch}  ahead ${r.ahead ?? "-"}  diff-empty ${r.diff_empty ?? "-"}  ${c}  ${r.why}${how}`;
    }

    summary(rows){
        const n = v => rows.filter(r => r.verdict === v).length;
        return `${rows.length} non-pool worktree(s): ${n("REMOVE")} REMOVE, ${n("KEEP")} KEEP.`;
    }

    /* Removes every REMOVE row; never a KEEP, never a branch. Returns the rows with `removed` or `failed`. */
    async apply(rows, { date = new Date().toISOString() } = {}){
        const manifest = path.join(this.main, Worktrees.MANIFEST);
        fs.mkdirSync(path.dirname(manifest), { recursive: true });
        for (const r of rows.filter(r => r.verdict === "REMOVE")){
            if (!r.gone){
                try { refuse_links_into_main(r.path, "git worktree remove"); }
                catch (e){ r.failed = e.message.split("\n")[0]; continue; }
                const res = this.git(this.main, "worktree", "remove", ...(r.force ? ["--force"] : []), r.path);
                if (res.status !== 0){ r.failed = (res.stderr || res.stdout).trim().split("\n").pop(); continue; }
            }
            r.removed = true;
            fs.appendFileSync(manifest, JSON.stringify({ path: r.path, branch: r.branch, sha: r.sha, at: date, why: r.why + (r.force ? "; forced over regenerated files only" : ""),
                restore: r.branch.startsWith("(") ? `git worktree add --detach "${r.path}" ${r.sha}` : `git worktree add "${r.path}" ${r.branch}` }) + "\n");
        }
        this.git(this.main, "worktree", "prune");
        return rows;
    }

    async run(argv){
        if (!argv.includes("--plan") && !argv.includes("--apply")) return console.log("usage: node Server/Worktrees.mjs --plan | --apply");
        let rows = await this.plan();
        if (argv.includes("--apply")) rows = await this.apply(rows);
        for (const r of rows) console.log((r.removed ? "removed " : r.failed ? "FAILED  " : "") + this.format(r) + (r.failed ? `  [${r.failed}]` : ""));
        console.log(this.summary(rows) + (argv.includes("--apply") ? ` ${rows.filter(r => r.removed).length} removed, ${rows.filter(r => r.failed).length} failed.` : ""));
        return rows;
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await new Worktrees().run(process.argv.slice(2));
