/* node Server/Worktrees.mjs --plan | --apply [--archive [--now] [--path <worktree>]] — one verdict per non-pool worktree; --apply removes the REMOVE ones.
 * --archive also closes a quiet one (no live agent, nothing touched for 2 hours; an UNMERGED branch for 48 hours, since it waits for review): its leftovers are committed to its own branch, then the folder goes; unmerged commits get a line in ready-to-merge.jsonl.
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
    static READY = "public/framework/ai/sessions/ready-to-merge.jsonl";   // one line per branch whose worktree went but whose commits are not on the base
    // files a worktree's own dev server or a screenshot run rewrites: losing them loses nothing
    static REGENERATED = /(^|\/)(files\.jsonl|index\.json|cache\.jsonl)$|\.png$|(^|\/)(shots|layout-check)\//;

    static main_repo(from = HERE){
        return slash(path.resolve(from, execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: from, encoding: "utf8", windowsHide: true }).trim(), ".."));
    }

    /* options: main (repo root), base, agents (cwd list of live agents; null = ask Servex), pool_names (regexp),
     * close_hours (an unmerged branch is archived only after this long quiet; the same backstop as Servex/Worktrees.js) */
    constructor({ main = Worktrees.main_repo(), base = Worktrees.BASE, agents = null, here = process.cwd(), pool_names = /^qf-\d+$/, archive = false, quiet_hours = 2,
        close_hours = Number(process.env.SERVEX_WORKTREE_CLOSE_HOURS) || 48, only = null } = {}){
        Object.assign(this, { main: slash(main), base, agents, archive, quiet_hours, close_hours, only: only ? lower(only) : null, here: lower(this.top(here)), pool_names });
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

    /* Minutes since anything touched this worktree: git's index/HEAD/reflog, or any file git reports changed. */
    quiet_min(w){
        const gitdir = path.resolve(w.path, this.out(w.path, "rev-parse", "--git-dir"));
        let last = 0;
        for (const f of ["index", "HEAD", "logs/HEAD"]) try { last = Math.max(last, fs.statSync(path.join(gitdir, f)).mtimeMs); } catch {}
        for (const l of this.out(w.path, "status", "--porcelain", "--untracked-files=all").split(/\r?\n/).filter(Boolean))
            try { last = Math.max(last, fs.statSync(path.join(w.path, l.slice(3).replace(/^"|"$/g, "").replace(/.* -> /, ""))).mtimeMs); } catch {}
        return last ? Math.round((Date.now() - last) / 60000) : null;
    }

    /* A KEEP that only waits on leftovers or a merge becomes ARCHIVE when --archive is on and the worktree is quiet.
     * HOLD UNTIL MERGE (build F, 2026-10-28): an unmerged branch waits for review, so it needs close_hours quiet
     * (the 48-hour backstop), never just quiet_hours; `--now` shortens only quiet_hours. */
    archivable(w, row){
        if (!this.archive || row.verdict !== "KEEP" || !w.branch || !/uncommitted|unmerged/.test(row.why)) return row;
        const quiet = this.quiet_min(w), hours = row.landed ? this.quiet_hours : this.close_hours;
        if (quiet === null || quiet < hours * 60) return { ...row, why: row.why + (row.landed ? ` (touched ${quiet ?? "?"} min ago, so it stays)`
            : ` (held until it merges, or ${this.close_hours} quiet hours; touched ${quiet ?? "?"} min ago)`) };
        return { ...row, verdict: "ARCHIVE", why: `quiet ${quiet} min; ${row.why}` };
    }

    /* Commit every leftover to the worktree's own branch; returns how many files, or throws with git's words. */
    commit_leftovers(r){
        const n = this.out(r.path, "status", "--porcelain", "--untracked-files=all").split(/\r?\n/).filter(Boolean).length;
        if (!n) return 0;
        this.git(r.path, "add", "-A");
        const c = this.git(r.path, "commit", "-m", `worktree closed: ${n} leftover file(s) saved to ${r.branch} before the folder was removed\n\nCo-Authored-By: Claude Code <noreply@anthropic.com>`);
        if (c.status !== 0) throw new Error((c.stderr || c.stdout).trim().split("\n").pop());
        return n;
    }

    async row(w, live){
        return this.archivable(w, await this.row_base(w, live));
    }

    async row_base(w, live){
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
            if (this.only && lower(w.path) !== this.only) continue;
            if (this.pool_names.test(path.basename(w.path)) || pool.has(lower(w.path))) continue;
            rows.push(await this.row(w, live));
        }
        return rows;
    }

    format(r){
        const c = `uncommitted ${r.regenerated ?? 0} regenerated + ${r.real ?? 0} real`;
        const how = r.verdict !== "KEEP" ? (r.force ? " (--force: only regenerated files)" : "") : "";
        return `${r.verdict.padEnd(6)} ${r.path}  ${r.branch}  ahead ${r.ahead ?? "-"}  diff-empty ${r.diff_empty ?? "-"}  ${c}  ${r.why}${how}`;
    }

    summary(rows){
        const n = v => rows.filter(r => r.verdict === v).length;
        return `${rows.length} non-pool worktree(s): ${n("REMOVE")} REMOVE, ${n("ARCHIVE")} ARCHIVE, ${n("KEEP")} KEEP.`;
    }

    /* Removes every REMOVE row; never a KEEP, never a branch. Returns the rows with `removed` or `failed`. */
    async apply(rows, { date = new Date().toISOString() } = {}){
        const manifest = path.join(this.main, Worktrees.MANIFEST);
        fs.mkdirSync(path.dirname(manifest), { recursive: true });
        const ready = path.join(this.main, Worktrees.READY);
        for (const r of rows.filter(r => r.verdict === "REMOVE" || r.verdict === "ARCHIVE")){
            if (r.verdict === "ARCHIVE"){
                try { r.committed = this.commit_leftovers(r); } catch (e){ r.failed = "commit refused: " + e.message; continue; }
                r.sha = this.out(r.path, "rev-parse", "HEAD");
                r.unmerged = Number(this.out(r.path, "rev-list", "--count", `${this.base}..HEAD`)) || 0;
                if (r.unmerged && (this.git(r.path, "diff", "--quiet", `${this.base}...HEAD`).status === 0 || await this.pool.landed({ path: r.path }))) r.unmerged = 0;
            }
            if (!r.gone){
                try { refuse_links_into_main(r.path, "git worktree remove"); }
                catch (e){ r.failed = e.message.split("\n")[0]; continue; }
                const res = this.git(this.main, "worktree", "remove", ...(r.force ? ["--force"] : []), r.path);
                if (res.status !== 0){ r.failed = (res.stderr || res.stdout).trim().split("\n").pop(); continue; }
            }
            r.removed = true;
            if (r.unmerged) fs.appendFileSync(ready, JSON.stringify({ branch: r.branch, sha: r.sha, unmerged: r.unmerged, leftover_files: r.committed, at: date, how: "node Server/merge.mjs on a worktree of this branch", why: "worktree closed; these commits are not on " + this.base }) + "\n");
            fs.appendFileSync(manifest, JSON.stringify({ path: r.path, branch: r.branch, sha: r.sha, at: date, why: r.why + (r.force ? "; forced over regenerated files only" : ""), committed: r.committed, unmerged: r.unmerged,
                restore: r.branch.startsWith("(") ? `git worktree add --detach "${r.path}" ${r.sha}` : `git worktree add "${r.path}" ${r.branch}` }) + "\n");
        }
        this.git(this.main, "worktree", "prune");
        return rows;
    }

    async run(argv){
        if (!argv.includes("--plan") && !argv.includes("--apply")) return console.log("usage: node Server/Worktrees.mjs --plan | --apply");
        let rows = await this.plan();
        if (argv.includes("--apply")) rows = await this.apply(rows);
        for (const r of rows) console.log((r.removed ? (r.committed ? `removed (+${r.committed} files committed${r.unmerged ? `, ${r.unmerged} unmerged -> ready-to-merge` : ""}) ` : "removed ") : r.failed ? "FAILED  " : "") + this.format(r) + (r.failed ? `  [${r.failed}]` : ""));
        console.log(this.summary(rows) + (argv.includes("--apply") ? ` ${rows.filter(r => r.removed).length} removed, ${rows.filter(r => r.failed).length} failed.` : ""));
        return rows;
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await new Worktrees({ archive: process.argv.includes("--archive"), quiet_hours: process.argv.includes("--now") ? 0 : 2, only: process.argv.includes("--path") ? process.argv[process.argv.indexOf("--path") + 1] : null }).run(process.argv.slice(2));
