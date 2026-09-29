import fs from "fs";
import path from "path";
import watch from "../watch.js";

/* EVERY FOLDER KEEPS ITS OWN FILE LIST, one JSON line per change, so a page gets its
 * folder's listing from one small file instead of the whole site's directory.json.
 *
 *   {"file":"photo.png"}                 a file appeared
 *   {"file":"kid/page.jsonl"}            a subfolder that is a jsonl page
 *   {"file":"kid/page.js"}               a subfolder with a page.js
 *   {"file":"kid/"}                      a plain subfolder
 *   {"file":"photo.png","gone":true}     it disappeared
 *
 * WHICH FILE HOLDS THE LIST — `log_of(dir)`, the one place that decides:
 *   - A JSONL PAGE (no page.js, and its page.jsonl's line 1 is NOT a file line — every
 *     AI card, core/Page/jsonl/) keeps its list in its own page.jsonl: loading the page
 *     brings its listing for free (the owner, 2026-09-29).
 *   - EVERY OTHER FOLDER (it has a page.js, or it is a plain folder like doc/) keeps it in
 *     files.jsonl, and never gets a page.jsonl from us: a page.jsonl means "this folder is
 *     a jsonl page" to the loader (core/Page/jsonl/doc/writers.md).
 *   - An EMPTY folder gets no log at all. The first file inside it creates one.
 *
 * REPEAT-SAFE: Windows fires extra watch events (even a READ fires one), so before
 * every append the log's existing file lines are replayed — the latest line per
 * name wins — and a line is written only if the state truly changes. A `.jsonl`
 * change only tails to the browser (LiveReload -> Tail.changed); it never reloads. */

const PUBLIC = path.resolve("public");
const PAGE = "page.jsonl";
const LIST = "files.jsonl";

// Never listed, never a reason to write: the two logs themselves, and directory.json (the
// OTHER plugin's generated file, Server/plugins/Directory.js). Every other .json is content.
const skip = name => name === PAGE || name === LIST || name.startsWith(".") || name === "node_modules" || name === "directory.json";
const key_of = file => file.split("/")[0];   // "kid/page.js" and "kid/" are the same entry: "kid"

/* WHICH FOLDERS ARE COVERED: every folder under public/ except node_modules, a dot-folder,
 * or anything INSIDE a flat dated ai/ TASK folder — the day folder and the task folder
 * itself are covered; only what nests inside the task is not (a minion's scratch).
 *
 *   public/framework/ai/2026-09-29/page-files-log/          <- day + task: COVERED
 *   public/framework/ai/2026-09-29/page-files-log/writer/   <- inside the task: SKIPPED
 *
 * Only the flat `ai/YYYY-MM-DD/<task>/` shape has a "task interior". The card tree
 * `ai/YYYY/MM/DD/...` nests real cards inside cards, each a page, so it is all covered. */
const FLAT_DAY = /^\d{4}-\d{2}-\d{2}$/;

function inside_task_interior(segs) {
    const ai = segs.findIndex((s, i) => s === "ai" && segs[i - 1] === "framework");
    if (ai === -1) return false;
    const after = segs.slice(ai + 1);
    if (!after.length || !FLAT_DAY.test(after[0])) return false;   // not the flat day/task shape

    return after.length > 2;   // deeper than day/task (after[0]=day, after[1]=task)
}

function covers(full) {
    const rel = path.relative(PUBLIC, full);
    if (rel.startsWith("..")) return false;   // outside public/ entirely
    const segs = rel ? rel.split(path.sep) : [];
    if (segs.some(s => s === "node_modules" || s.startsWith("."))) return false;
    if (inside_task_interior(segs)) return false;
    return true;
}

// The first non-blank line of a file, parsed; reads only the head of a long log.
function first_line(file) {
    let fd; try { fd = fs.openSync(file, "r"); } catch { return undefined; }
    try {
        let text = "", pos = 0;
        const buf = Buffer.alloc(4096);
        for (;;) {
            const n = fs.readSync(fd, buf, 0, buf.length, pos);
            if (!n) break;
            text += buf.toString("utf8", 0, n); pos += n;
            const line = text.split("\n").find((l, i, all) => l.trim() && i < all.length - 1);
            if (line) { try { return JSON.parse(line); } catch { return null; } }
        }
        const line = text.split("\n").find(l => l.trim());
        if (!line) return undefined;
        try { return JSON.parse(line); } catch { return null; }
    } finally { fs.closeSync(fd); }
}

export default class PageFiles {

    static PAGE = PAGE;
    static LIST = LIST;
    static covers = covers;
    static skip = skip;

    static setup(server) {
        new PageFiles(server);
    }

    constructor(server) {
        this.server = server;
        this.pending = new Map();
        if (process.env.BOOT_TEST) return;   // a candidate boot test must never write files (see server.js)

        watch(file => this.event(file));

        /* LAZY, not blocking: `boot()` is a synchronous walk (~2s over the ~2,900 logs),
         * and the constructor runs before `Server.listen()`. `setImmediate` lets the port
         * open first; the walk itself is unchanged. */
        setImmediate(() => {
            const started = Date.now();
            const count = this.boot(PUBLIC);
            console.log(`PageFiles: boot catch-up over ${count} logs in ${Date.now() - started}ms`);
        });
    }

    /* A short per-path debounce: a tool writing a file is a few events in a row. */
    event(file) {
        clearTimeout(this.pending.get(file));
        this.pending.set(file, setTimeout(() => {
            this.pending.delete(file);
            try { this.handle(file); } catch (e) { console.error("PageFiles:", e?.message || e); }
        }, 60));
    }

    handle(file) {
        const dir = path.dirname(file), name = path.basename(file);
        if (!file.startsWith(PUBLIC)) return;
        if (name === LIST) return;   // our own list: nothing depends on it, no loop

        if (name === PAGE) {
            // a page.jsonl appeared, changed or went: `dir` may have become (or stopped
            // being) a jsonl page — move its list, and tell the parent how to load `dir`
            this.settle(dir);
            this.sync(path.dirname(dir), path.basename(dir));
            return;
        }
        if (skip(name)) return;

        /* A folder that arrives all at once (a git merge landing a whole subtree) can lose
         * its own "folder appeared" event — Windows' recursive watch drops events when its
         * buffer overflows (watch.js). One surviving event for anything inside it is enough:
         * `dir` gets its log with its FULL listing here. Its parent hears through the next
         * surviving event there, or the next boot catch-up. */
        this.settle(dir);
        this.settle(file);   // a brand-new folder that already has files in it
        this.sync(dir, name);
        // page.js in a subfolder changes how the PARENT lists that subfolder, and where
        // the subfolder keeps its own list
        if (name === "page.js") {
            this.sync(path.dirname(dir), path.basename(dir));
        }
    }

    /* THE RULE: the file that holds `dir`'s list. */
    log_of(dir) {
        return path.join(dir, this.is_jsonl_page(dir) ? PAGE : LIST);
    }

    // No page.js, and a page.jsonl whose line 1 sets a page up (title, class, …) — not a file line.
    is_jsonl_page(dir) {
        if (fs.existsSync(path.join(dir, "page.js"))) return false;
        const first = first_line(path.join(dir, PAGE));
        return !!first && typeof first === "object" && typeof first.file !== "string";
    }

    /* Make sure a covered folder's list is in the right file:
     *   - a jsonl page: its page.jsonl is caught up, and a files.jsonl left from before it
     *     became a page is deleted (it is only ever our own file lines);
     *   - any other folder: its files.jsonl is caught up, or created if the folder has
     *     anything in it. An empty folder gets nothing.
     * `create` false (the server's boot) only catches up logs that exist. Returns true
     * when it created a log. */
    settle(full, create = true) {
        if (!covers(full)) return false;
        let stat; try { stat = fs.statSync(full); } catch { return false; }
        if (!stat.isDirectory()) return false;

        const log = this.log_of(full);
        if (path.basename(log) === PAGE) {
            this.catchup(full, log);
            const stale = path.join(full, LIST);
            if (fs.existsSync(stale)) fs.unlinkSync(stale);
            return false;
        }
        if (fs.existsSync(log)) { this.catchup(full, log); return false; }
        if (!create) return false;
        if (!fs.readdirSync(full).some(n => !skip(n))) return false;   // empty: no log
        this.catchup(full, log);
        return true;
    }

    // What the server's boot and page-files-backfill.mjs call per folder (the old name).
    ensure(full) { return this.settle(full, true); }

    /* What the log should say about `name` in `dir`: a line, or null for "nothing to say". */
    desired(dir, name) {
        const full = path.join(dir, name);
        let stat; try { stat = fs.statSync(full); } catch {}
        if (!stat) return null;
        if (!stat.isDirectory()) return name;
        if (fs.existsSync(path.join(full, "page.js"))) return name + "/page.js";
        if (this.is_jsonl_page(full)) return name + "/" + PAGE;
        return name + "/";
    }

    /* Replay the log: key -> {file, gone} of the latest line for each. */
    state(log) {
        const map = new Map();
        let text; try { text = fs.readFileSync(log, "utf8"); } catch { return map; }
        for (const line of text.split("\n")) {
            if (!line.trim()) continue;
            let obj; try { obj = JSON.parse(line); } catch { continue; }
            if (typeof obj?.file !== "string") continue;
            map.set(key_of(obj.file), { file: obj.file, gone: !!obj.gone });
        }
        return map;
    }

    /* Bring `dir`'s log up to date for ONE name. Only a log that exists is written:
     * settle() is what creates one. */
    sync(dir, name, state, log = this.log_of(dir)) {
        if (!fs.existsSync(log) || skip(name)) return;
        this.write(dir, name, state ?? this.state(log), log);
    }

    // The one append decision: a line only when the replayed state differs from the disk.
    write(dir, name, state, log) {
        const have = state.get(name);
        const want = this.desired(dir, name);
        const line = want ? (have && !have.gone && have.file === want ? null : { file: want })
                          : (have && !have.gone ? { file: have.file, gone: true } : null);
        if (!line) return;
        this.append(log, line);
        state.set(name, { file: line.file, gone: !!line.gone });
    }

    /* Everything in `dir` the log does not know yet (and everything it lists that is gone).
     * Writes the log even when it does not exist yet — settle() decides when that is allowed. */
    catchup(dir, log = this.log_of(dir)) {
        const state = this.state(log);
        const names = new Set(fs.readdirSync(dir).filter(n => !skip(n)));
        for (const key of state.keys()) names.add(key);
        for (const name of names) this.write(dir, name, state, log);
    }

    append(log, obj) {
        fs.appendFileSync(log, JSON.stringify(obj) + "\n");
    }

    /* Walk public/ once; returns how many logs were caught up (or, with `create`, created).
     * Prunes at any folder the rule doesn't cover. `create` is false at boot (existing logs
     * only, so a fresh server starts quickly) and true from page-files-backfill.mjs. */
    boot(dir, create = false) {
        let count = 0, entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
        const has_log = entries.some(e => e.isFile() && (e.name === PAGE || e.name === LIST));
        if (this.ensure_at(dir, create) || has_log) count++;
        for (const e of entries) {
            if (!e.isDirectory()) continue;
            const full = path.join(dir, e.name);
            if (!covers(full)) continue;
            count += this.boot(full, create);
        }
        return count;
    }

    // boot()'s per-folder step: through ensure() when creating, so the backfill counts it.
    ensure_at(dir, create) {
        return create ? this.ensure(dir) : this.settle(dir, false);
    }
}
