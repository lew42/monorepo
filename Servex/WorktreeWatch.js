import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import WebSocket from "ws";
import SessionRecord from "../Server/SessionRecord.mjs";
import LogLine from "../Server/LogLine.mjs";
import { stamp } from "./home.js";

const slash = p => String(p).split(path.sep).join("/");
const slug = u => u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "page";

/* A PAGE WATCHER FOR ONE POOL WORKTREE: when a page the holder is editing breaks, the holder hears within a minute.
 *
 * Pool starts one per taken slot (Pool.page_watch) and stops it when the slot is returned or removed. It listens to the
 * slot's own dev server (the `changed` frame the server sends its browser tabs, so no second fs.watch), waits for DEBOUNCE_MS
 * with no further save, runs the near tests and Server/layout-check.mjs (console errors, overflow) on the pages the changed files
 * render, and reports a break that still stands by appending one line to failures.jsonl in the module's own folder (report()).
 * It sends nothing: the builder hears it by `follow`ing that module. Design and the rejected timer: the plan.md and Servex/doc/pool.md "Page watcher". */
export default class WorktreeWatch {
    static WIDTHS = [400, 1200, 1920, 3440];
    static EMPTY_MAX = 0.6;                    // the same bound Server/on-landing.mjs flags
    static EMPTY_WIDTHS = [1920, 3440];        // phones are dense by nature; emptiness only means something wide
    static DEBOUNCE_MS = 45 * 1000;            // quiet time after the LAST save before anything runs or is told: a half-done two-file edit breaks a page for a moment, and the end of an agent's turn is not visible here, so the gap stands in for it
    static QUIET_MS = 10 * 60 * 1000;          // one message per page per this long
    static RUN_MS = 60 * 1000;                 // a layout-check that takes longer is killed
    static MAX_PAGES = 3;
    static TEMPLATE = /\.(m?js|css|html)$/i;   // data (.jsonl .json .md) never breaks a page
    static SHARED = [/^\/framework\/core\//, /^\/framework\/ui\//, /^\/framework\/ux\//, /^\/framework\/ext\//, /^\/framework\/framework\.css$/, /^\/app\.js$/];
    static CANARY = "/framework/";
    static BASE_404 = /^Failed to load resource: .*404/;   // every page load asks for /favicon.ico once per width, and a dev server has none
    static TESTABLE = /\.m?js$/i;              // only a script change runs tests: a dev server rewrites files.jsonl constantly
    static MAX_TESTS = 3;                      // test jobs at once, across every worktree
    static LIST_MS = 30 * 1000;                // how long a worktree's list of test files is reused
    static queue = new Map();                  // worktree id -> { watch, files }: at most one waiting run per worktree
    static active = 0;
    static runner_url = new URL("../public/framework/core/Test/TestRunner.mjs", import.meta.url).href;   // Servex's own copy, pointed at the worktree

    /* Start waiting runs while fewer than MAX_TESTS are going. A worktree never has two at once. */
    static pump(){
        while (WorktreeWatch.active < WorktreeWatch.MAX_TESTS){
            const next = [...WorktreeWatch.queue.values()].find(e => !e.watch.testing);
            if (!next) return;
            WorktreeWatch.queue.delete(next.watch.id);
            WorktreeWatch.active++;
            next.watch.test_job(next.files).catch(e => next.watch.note(`worktree-watch: ${next.watch.id} tests failed to run: ${e.message}`)).finally(() => { WorktreeWatch.active--; WorktreeWatch.pump(); });
        }
    }

    /* The line worth quoting from a failed test's tail: the first assertion or error, else the first line. */
    static first_failure(tail){
        const rows = String(tail ?? "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        return (rows.find(l => /^not ok\b|Error\b|\bfail/i.test(l)) ?? rows[0] ?? "no output").slice(0, 200);
    }

    /* A changed url-path ("/framework/x/page.js") -> the page urls it could break, own page first. Same rule as Server/health.mjs. */
    static pages_for(url_path, public_dir){
        if (!WorktreeWatch.TEMPLATE.test(url_path)) return [];
        if (/(^|\/)\.[^/]/.test(url_path) || /(^|\/)[^/]+-test-\d+(\/|$)/.test(url_path)) return [];   // a dot-folder or a "<name>-test-<pid>" folder is a test fixture, never a page
        let dir = path.dirname(path.join(public_dir, url_path));
        let own = null;
        while (dir === public_dir || dir.startsWith(public_dir + path.sep)){
            if (fs.existsSync(path.join(dir, "page.js"))){ const rel = slash(path.relative(public_dir, dir)); own = "/" + (rel ? rel + "/" : ""); break; }
            if (dir === public_dir) break;
            dir = path.dirname(dir);
        }
        const shared = WorktreeWatch.SHARED.some(re => re.test(url_path));
        return [...new Set([...(own ? [own] : []), ...(shared ? [WorktreeWatch.CANARY] : [])])];
    }

    /* One layout-check layout.json -> the breaks, worst first: {kind, widths, text}. Pure. */
    static judge(res){
        const breaks = [], widths = res.widths ?? {};
        const errs = new Map();   // error text -> the widths that showed it
        const favicon = new Set();   // widths whose one baseline 404 is spent; a second 404 at a width is a real missing file
        for (const e of res.errors ?? []){
            const m = /^(\d+): ([\s\S]*)$/.exec(e);
            const [w, text] = m ? [Number(m[1]), m[2]] : [null, e];
            if (WorktreeWatch.BASE_404.test(text) && !favicon.has(w)){ favicon.add(w); continue; }
            if (!errs.has(text)) errs.set(text, []);
            if (w) errs.get(text).push(w);
        }
        for (const [text, ws] of errs) breaks.push({ kind: "error", widths: ws.sort((a, b) => a - b), text: `console error: ${text.replace(/\s+/g, " ").slice(0, 160)}` });
        const over = Object.keys(widths).map(Number).filter(w => widths[w].overflow_x);
        if (over.length) breaks.push({ kind: "overflow", widths: over.sort((a, b) => a - b), text: "overflow_x true (something sticks out past the right edge)" });
        const empty = WorktreeWatch.EMPTY_WIDTHS.filter(w => widths[w]?.empty > WorktreeWatch.EMPTY_MAX);
        if (empty.length) breaks.push({ kind: "empty", widths: [...empty].sort((a, b) => a - b), text: `empty share ${empty.map(w => widths[w].empty).join("/")} (over ${WorktreeWatch.EMPTY_MAX})` });
        return breaks;
    }

    /* id, path, port: the pool slot. owner: the agent that took it. send(owner, text): how the line reaches it.
     * task_dir: the owner's task dir (log line and shots go there), or null. */
    constructor({ id, path: root, port, owner, send, task_dir = null, main = null }){
        Object.assign(this, { id, root: slash(root), port, owner, send, task_dir, main });
        this.public = path.join(root, "public");
        this.pending = new Set();
        this.pages = new Map();     // url -> { broken, messaged_at }
        this.running = false;
        this.stopped = true;
        this.test_pending = new Set();   // changed script paths (urls) waiting for the debounce
        this.test_state = new Map();     // test file -> ok, from this worktree's own runs: the last known result
        this.testing = false;
    }

    start(){
        this.stopped = false;
        this.connect();
        return this;
    }

    stop(){
        this.stopped = true;
        clearTimeout(this.timer); clearTimeout(this.retry); clearTimeout(this.test_timer);
        WorktreeWatch.queue.delete(this.id);
        try { this.ws?.terminate(); } catch {}
    }

    connect(){
        if (this.stopped) return;
        const ws = this.ws = new WebSocket(`ws://127.0.0.1:${this.port}/`);
        ws.on("message", data => { try { const m = JSON.parse(data.toString()); if (m.method === "changed") this.changed(m.args?.[0] ?? []); } catch {} });
        ws.on("error", () => {});
        ws.on("close", () => { if (!this.stopped) this.retry = setTimeout(() => this.connect(), 2000); });   // the dev server restarts itself on a Server/ edit
    }

    changed(paths){
        const scripts = paths.filter(p => WorktreeWatch.TESTABLE.test(p) && !/(^|\/)node_modules\//.test(p));
        if (scripts.length){
            for (const p of scripts) this.test_pending.add(p);
            clearTimeout(this.test_timer);
            this.test_timer = setTimeout(() => this.queue_tests(), WorktreeWatch.DEBOUNCE_MS);
        }
        let any = false;
        for (const p of paths) for (const url of WorktreeWatch.pages_for(p, this.public)){ this.pending.add(url); any = true; }
        if (!any) return;
        this.first_at ??= Date.now();
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.run(), WorktreeWatch.DEBOUNCE_MS);
    }

    async run(){
        if (this.running || this.stopped) return;   // a change during a run leaves `pending` set; run() re-arms itself below
        const urls = [...this.pending].slice(0, WorktreeWatch.MAX_PAGES);
        if (!urls.length) return;
        for (const u of urls) this.pending.delete(u);
        const since = this.first_at; this.first_at = null;
        this.running = true;
        try {
            const results = await this.measure(urls);
            for (const url of urls) if (results.has(url)) this.judged(url, results.get(url), since);
        } catch (e) { this.note(`worktree-watch: ${this.id} check failed: ${e.message}`); }
        this.running = false;
        if (this.pending.size && !this.stopped){ this.first_at = Date.now(); this.timer = setTimeout(() => this.run(), WorktreeWatch.DEBOUNCE_MS); }
    }

    /* The changed scripts join this worktree's one waiting run (a new change replaces the old queue entry, keeping its files). */
    queue_tests(){
        if (this.stopped) return;
        const files = new Set([...(WorktreeWatch.queue.get(this.id)?.files ?? []), ...this.test_pending]);
        this.test_pending.clear();
        WorktreeWatch.queue.set(this.id, { watch: this, files: [...files] });
        WorktreeWatch.pump();
    }

    /* A TestRunner pointed at this worktree. Overridden in the test. */
    async runner(){
        if (!this._runner){
            const R = (await import(WorktreeWatch.runner_url)).default;
            this._runner = new R(); this._runner.root = this.root;
            this._runner.results = path.join(path.dirname(this._runner.results), "save-results.jsonl");   // save runs never touch the tracked results.jsonl
        }
        return this._runner;
    }

    /* The tests near the changed scripts (repo-relative paths), one level of imports. Overridden in the test. */
    async near(urls){
        const r = await this.runner();
        if (!this.test_list || Date.now() - this.test_list_at > WorktreeWatch.LIST_MS){ this.test_list = r.find(); this.test_list_at = Date.now(); }
        return [...new Set(urls.flatMap(u => r.near("public" + u, this.test_list)))].sort();
    }

    /* Run one test file: { file, ok, tail, timeout } and a trigger "save" line (with this worktree's id) in core/Test/save-results.jsonl. Overridden in the test. */
    async execute(file){ return (await this.runner()).one(file, "save", { worktree: this.id }); }

    /* The last known result of a test before this run: this worktree's own last save line, else dev's latest line in results.jsonl, else undefined (unknown, so quiet). */
    async prior(file){
        if (this.test_state.has(file)) return this.test_state.get(file);
        const save = (await this.runner()).results;
        const last = (f, keep) => {
            let text = ""; try { text = fs.readFileSync(f, "utf8"); } catch {}
            let was;
            for (const l of text.split(/\r?\n/)) if (l.includes(file)) try { const e = JSON.parse(l); if (e.file === file && !e.timeout && keep(e)) was = e.ok; } catch {}
            return was;
        };
        return last(save, e => e.worktree === this.id) ?? last(path.join(path.dirname(save), "results.jsonl"), e => !e.sha);
    }

    /* Run the near tests one after another (one slot of the shared queue); tell the holder only about a change. */
    async test_job(urls){
        this.testing = true;
        try {
            const files = await this.near(urls);
            for (const file of files){
                if (this.stopped) break;
                const was = await this.prior(file);
                const res = await this.execute(file);
                if (res.timeout){ this.note(`worktree-watch: ${file} timed out (${this.id}); no result`); continue; }
                this.test_state.set(file, res.ok);
                if (!res.ok && was !== false){
                    const msg = `test ${file} ${was === true ? "was passing and now fails" : "fails (no earlier result)"}: ${WorktreeWatch.first_failure(res.tail)}`;
                    if (was === true) this.report(path.posix.dirname(file), { fail: { kind: "test", file, msg, worktree: this.id, quiet_ms: WorktreeWatch.DEBOUNCE_MS } });
                    else this.note("worktree-watch: " + msg + " (" + this.id + ")");   // no earlier pass to compare with: a failure that may already be on dev stays out of the log
                } else if (res.ok && was === false) this.report(path.posix.dirname(file), { clear: { kind: "test", file, msg: `test ${file} passes again`, worktree: this.id } });
            }
        } finally { this.testing = false; }
    }

    /* urls -> Map(url -> { res: layout.json, dir: where its pngs are }). Overridden in the test. */
    measure(urls){
        const out = path.join(os.tmpdir(), "lew42-worktree-watch", this.id, String(Date.now()));
        const full = urls.map(u => `http://127.0.0.1:${this.port}${u}`);
        return new Promise(resolve => {
            const child = spawn(process.execPath, [path.join(this.root, "Server", "layout-check.mjs"), ...full, "--widths", WorktreeWatch.WIDTHS.join(","), "--out", out],
                { cwd: this.root, windowsHide: true, stdio: "ignore" });
            const kill = setTimeout(() => child.kill(), WorktreeWatch.RUN_MS);
            child.on("error", () => { clearTimeout(kill); resolve(new Map()); });
            child.on("exit", () => {
                clearTimeout(kill);
                const map = new Map();
                urls.forEach((u, i) => {
                    const dir = path.join(out, slug(full[i]));
                    try { map.set(u, { res: JSON.parse(fs.readFileSync(path.join(dir, "layout.json"), "utf8")), dir }); } catch {}
                });
                resolve(map);
            });
        });
    }

    judged(url, { res, dir }, since){
        const state = this.pages.get(url) ?? this.pages.set(url, { broken: false, messaged_at: 0 }).get(url);
        const breaks = WorktreeWatch.judge(res);
        if (!breaks.length){
            if (state.broken) this.report(("public" + url).slice(0, -1), { clear: { kind: "page", page: url, msg: `${url} clear`, worktree: this.id } });
            state.broken = false;
            return;
        }
        state.broken = true;
        if (Date.now() - state.messaged_at < WorktreeWatch.QUIET_MS) return;
        state.messaged_at = Date.now();
        const first = breaks[0], width = first.widths[0] ?? WorktreeWatch.WIDTHS[0];
        const shot = this.keep_shot(dir, url, width);
        const more = breaks.length > 1 ? ` (+${breaks.length - 1} more: ${breaks.slice(1).map(b => b.kind).join(", ")})` : "";
        const secs = since ? ` ${Math.round((Date.now() - since) / 1000)} s after your save.` : "";
        const msg = `${url} breaks at ${first.widths.join("/") || "?"} px: ${first.text}${more}. Shot: ${shot ?? "none"}.${secs}`;
        this.report(("public" + url).slice(0, -1), { fail: { kind: "page", page: url, msg, worktree: this.id, quiet_ms: WorktreeWatch.DEBOUNCE_MS } });
    }

    /* The failing width's png goes into <task dir>/shots/ (git-ignored by **\/shots/), else beside the worktree logs. */
    keep_shot(dir, url, width){
        const to = path.join(this.task_dir ? path.resolve(this.main ?? ".", this.task_dir) : path.join(this.main ?? os.tmpdir(), ".worktree-logs", this.id), "shots");
        try {
            fs.mkdirSync(to, { recursive: true });
            const file = path.join(to, `${slug(url)}-${width}.png`);
            fs.copyFileSync(path.join(dir, `${width}.png`), file);
            return slash(file);
        } catch { return null; }
    }

    /* The ONE way a result leaves the watcher: a line appended to failures.jsonl in the failing module's own folder (in the MAIN checkout, where Servex's `follow` can see it;
     * git-ignored machine state). Whoever follows that module hears it, by the same `follow` that carries every other log: there is no direct send. `dir` is repo-relative. */
    report(dir, event){
        const line = JSON.stringify({ at: stamp(), ...event });
        console.log("worktree-watch: " + (event.fail ?? event.clear).msg + " (" + this.id + ")");
        try {
            const folder = path.resolve(this.main ?? ".", dir);
            fs.mkdirSync(folder, { recursive: true });
            const file = path.join(folder, "failures.jsonl");
            let lead = ""; try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
            fs.appendFileSync(file, lead + line + "\n");
        } catch (e) { console.log("worktree-watch: could not write " + dir + "/failures.jsonl: " + e.message); }
    }

    /* One line in the owner's task log (when `log` is true and it has one), and always on the console. */
    note(msg, log = false){
        console.log(msg);
        if (!log || !this.task_dir) return;
        try {
            const dir = path.resolve(this.main ?? ".", this.task_dir);
            const file = SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl");
            LogLine.raw(file, { log: { at: stamp(), msg } });   // newline-safe, and through the one writer in Servex
        } catch {}
    }
}
