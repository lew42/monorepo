import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

/* THE LOG SWEEPER — commits the machine-written logs so the working tree stays quiet.
 *
 * Agents, the dev server and Servex append to logs all day (task.jsonl, page.jsonl,
 * spend.json, the files.jsonl folder listings, public/ai/*.jsonl). Nobody commits them,
 * so `git status` drowns in them and the real changes hide. The rule is in
 * public/framework/ai/sessions/doc/commit-rule.md: records are committed, caches are
 * gitignored, and this class commits the records in batches.
 *
 * Safe by construction:
 *   - ONLY paths matching ALLOW are ever added (never code, never briefs or readmes);
 *   - `git commit --only --pathspec-from-file` commits just those paths, so anything
 *     another agent has staged stays staged and uncommitted;
 *   - it skips the sweep while a git operation is running (index.lock, merge, rebase)
 *     or the branch is not the expected one;
 *   - a batch is at most `max` paths; the rest wait for the next sweep;
 *   - idempotent: nothing changed means no commit;
 *   - `dry` only reports what it would do. Everything it does goes to the `sweeper` log.
 * Never deletes anything: a path git sees as deleted is left for a person. */
export default class LogSweeper {

    /* A repo-relative path is swept only if it matches one of these. */
    static ALLOW = [
        /^public\/framework\/ai\/(\d{4}-\d{2}-\d{2}|\d{4}\/\d{2}(\/\d{2})?)\/.*\b(task\.jsonl|page\.jsonl|spend\.json|log\.jsonl|words\.jsonl|files\.jsonl)$/,
        /^public\/framework\/ai\/sessions\/\d{4}\/\d{2}\/\d{2}\/.+\/(task\.jsonl|page\.jsonl|spend\.json|session\.jsonl|files\.jsonl)$/,
        /^public\/framework\/ai\/sessions\/\d{4}\/\d{2}\/\d{2}\/.+\/task\/(task\.jsonl|page\.jsonl|spend\.json|files\.jsonl)$/,
        /^public\/(ai\/[^/]+\.jsonl|files\.jsonl|framework\/ai\/(.+\/)?files\.jsonl)$/,
        /^\.claude\/skills\/[^/]+\/(flags|improvements)\.jsonl$/,
        /^public\/framework\/ai\/(usage|cards)\.jsonl$/, // usage history (owner keeps it) and the board's card index: appended by Servex
        /^public\/framework\/(?!ai\/).+\/doc\/files\.jsonl$/, // the dev server's folder listing under any module's doc/
        /^public\/framework\/ai\/sessions\/(\d{4}(\/\d{2}){0,2}\/)?index\.json$/, // day/month/year composites: tracked, rewritten by the sessions indexer
    ];
    /* Never swept, even if an ALLOW pattern would match. */
    static DENY = [/\.(js|mjs|css|html|md)$/, /(^|\/)index\.tmp\.json$/, /node_modules/];

    constructor(...args){ Object.assign(this, ...args); this.initialize(); }

    initialize(){
        this.root ??= process.cwd();
        this.every ??= (Number(process.env.SERVEX_SWEEP_MIN) || 30) * 60000;
        this.max ??= 400;
        this.branch ??= process.env.SERVEX_SWEEP_BRANCH || "michael/dev";
        this.dry ??= process.env.SERVEX_SWEEP_DRY === "1";
        this.message ??= "servex: log sweep";
        this.last = null;
    }

    start(){
        if (this.timer) return this;
        this.timer = setInterval(() => { try { this.sweep(); } catch (e) { this.log({ error: String(e?.message || e) }); } }, this.every);
        this.timer.unref?.();
        return this;
    }

    stop(){ clearInterval(this.timer); this.timer = null; return this; }

    git(args, input){
        const r = spawnSync("git", args, { cwd: this.root, input, encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
        return { ok: r.status === 0, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
    }

    log(entry){ return this.servex?.log?.append("sweeper", { at: new Date().toISOString(), ...entry })?.catch?.(() => {}); }

    allowed(p){
        const C = this.constructor;
        return C.ALLOW.some(re => re.test(p)) && !C.DENY.some(re => re.test(p));
    }

    /* The paths a sweep would take: modified tracked files and new untracked ones, allowlisted. */
    candidates(){
        const mod = this.git(["diff", "--name-only", "--diff-filter=M"]).out.split("\n");
        const neu = this.git(["ls-files", "--others", "--exclude-standard"]).out.split("\n");
        return [...new Set([...mod, ...neu].map(s => s.trim()).filter(Boolean))].filter(p => this.allowed(p));
    }

    /* Why a sweep must not run right now, or null. */
    busy(){
        const dir = path.resolve(this.root, this.git(["rev-parse", "--git-dir"]).out);
        const at = f => fs.existsSync(path.join(dir, f));
        for (const f of ["index.lock", "MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD"]) if (at(f)) return f;
        const b = this.git(["rev-parse", "--abbrev-ref", "HEAD"]).out;
        if (this.branch && b !== this.branch) return `on branch ${b}, not ${this.branch}`;
        return null;
    }

    /* One pass. Returns { dry, skipped?, found, committed, commit? }. */
    sweep({ dry = this.dry } = {}){
        const why = this.busy();
        if (why){ const r = { skipped: why }; this.log(r); return this.last = r; }
        const all = this.candidates(), batch = all.slice(0, this.max);
        const r = { dry, found: all.length, committed: 0 };
        if (!batch.length || dry){ if (batch.length) r.would = batch.slice(0, 20); if (batch.length || this.last?.found) this.log(r); return this.last = r; }
        const list = batch.join("\n") + "\n";
        const add = this.git(["add", "--pathspec-from-file=-"], list);
        if (!add.ok){ r.error = add.err; this.log(r); return this.last = r; }
        const c = this.git(["commit", "--only", "-m", `${this.message} (${batch.length} files)`, "--pathspec-from-file=-"], list);
        if (!c.ok){ r.error = c.err || c.out; this.log(r); return this.last = r; }
        r.committed = batch.length;
        r.commit = this.git(["rev-parse", "--short", "HEAD"]).out;
        this.log(r);
        return this.last = r;
    }
}
