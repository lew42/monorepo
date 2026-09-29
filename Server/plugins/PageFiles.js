import fs from "fs";
import path from "path";
import watch from "../watch.js";

/* Step "exists" of the page.jsonl format: every folder the rule below COVERS gets its
 * own page.jsonl, created the moment it appears, and kept current as files and folders
 * inside it come and go — so loading a page's own page.jsonl gets that page's listing
 * for free, with no separate directory.json fetch.
 *
 *   {"file":"photo.png"}                 a file appeared
 *   {"file":"kid/page.jsonl"}            a subfolder with its own page.jsonl
 *   {"file":"kid/page.js"}               a subfolder with a page.js (still WINS as the page;
 *                                        its page.jsonl, if it also has one, is only a listing)
 *   {"file":"kid/"}                      a plain subfolder
 *   {"file":"photo.png","gone":true}     it disappeared
 *
 * REPEAT-SAFE: Windows fires extra watch events (even a READ fires one), so before
 * every append the log's existing file lines are replayed — the latest line per
 * name wins — and a line is written only if the state truly changes. A `.jsonl`
 * change only tails to the browser (LiveReload -> Tail.changed); it never reloads. */

const PUBLIC = path.resolve("public");
const PAGE = "page.jsonl";

// directory.json is the OTHER plugin's own generated file (Server/plugins/Directory.js,
// always this exact name, at public/ and public/framework/); every other .json file is
// real content and belongs in the listing, same as anything else.
const skip = name => name === PAGE || name.startsWith(".") || name === "node_modules" || name === "directory.json";
const key_of = file => file.split("/")[0];   // "kid/page.js" and "kid/" are the same entry: "kid"

/* THE RULE (deliverable 1): a folder under public/ gets its own page.jsonl unless it is
 * node_modules, a dot-folder, or sits INSIDE a dated ai/ TASK folder — the task folder
 * itself and the day folder above it still get one; only what nests inside the task does
 * not. Every ancestor of a covered folder is checked too, so a folder under a skipped one
 * is skipped the same way, with nothing extra to write.
 *
 *   public/framework/ai/2026-09-29/page-files-log/          <- day + task: COVERED
 *   public/framework/ai/2026-09-29/page-files-log/writer/   <- inside the task: SKIPPED
 *
 * This ONLY applies to the flat `ai/YYYY-MM-DD/<task>/` shape — a minion's own working
 * folder (task.jsonl, requirements.md, scratch files a mastermind or reviewer doesn't
 * need listed). `ai/2026/09/29/...` (year/month/day as three folders) is a DIFFERENT
 * tree — the card/AI2 dashboard system, not minion scratch work: 816 flat task folders
 * carry a task.jsonl versus 1 in the whole nested tree (checked 2026-09-29), and a card
 * there can nest cards inside cards indefinitely, each one real, own-authored content
 * (`{"class":"/framework/ai2/card.js", "title": ..., ...}` as line 1 — a real page, not
 * an auto-filled listing). Cutting that tree off at a fixed depth would have silently
 * stopped covering every grandchild card in the dashboard, which is real content this
 * plugin should list same as anything else — so only the flat style gets a "task
 * interior" at all. */
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

export default class PageFiles {

    static setup(server) {
        new PageFiles(server);
    }

    constructor(server) {
        this.server = server;
        this.pending = new Map();
        if (process.env.BOOT_TEST) return;   // a candidate boot test must never write files (see server.js)

        watch(file => this.event(file));

        /* LAZY, not blocking: `boot()` is a synchronous walk (deliverable 5's measurement —
         * ~2.2s over the ~2,800 logs this repo has after the backfill), and the constructor
         * runs before `Server.listen()` (Events fires the "new" plugin-setup hookpoint before
         * `initialize()`). Without this, the whole dev server would sit there NOT LISTENING
         * for that entire walk on every boot. `setImmediate` defers it to the next tick, after
         * the current synchronous chain (which reaches `listen()`) has already run, so the port
         * opens first. The walk itself is unchanged — it just starts a moment later. */
        setImmediate(() => {
            const started = Date.now();
            const count = this.boot(PUBLIC);
            console.log(`PageFiles: boot catch-up over ${count} page.jsonl in ${Date.now() - started}ms`);
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

        if (name === PAGE) {
            // a page.jsonl was created (or deleted) in `dir`: fill its own log, and tell the parent how to load `dir`
            if (fs.existsSync(file)) this.catchup(dir);
            this.sync(path.dirname(dir), path.basename(dir));
            return;
        }
        if (skip(name)) return;

        /* A folder that arrives all at once — a git merge or checkout landing a whole new
         * subtree in one burst — can skip the individual "this folder appeared" event
         * entirely (Windows' recursive watch has a fixed buffer; a big enough burst
         * overflows it and drops events, watch.js's own doc comment). If even ONE event
         * for ANYTHING inside that folder survives, this catches it up here: `dir` (the
         * folder the surviving event landed in) gets its own page.jsonl, with its FULL
         * current listing, the moment we see anything happen inside it — not just when
         * its own arrival was the thing observed. No parent-chain walking needed: once
         * `dir`'s page.jsonl is created, that write is itself a new-file event, which the
         * `name === PAGE` branch above already reacts to by telling `dir`'s OWN parent —
         * so a whole new nested tree heals one level at a time as its own events land. */
        this.ensure(dir);
        this.ensure(file);   // a brand-new covered folder gets its own log right away (deliverable 3)
        this.sync(dir, name);
        // page.js in a subfolder changes how the PARENT lists that subfolder
        if (name === "page.js") this.sync(path.dirname(dir), path.basename(dir));
    }

    /* If `full` is a directory the rule covers and has no page.jsonl yet, create an empty
     * one and fill it with what's already inside. This is how a brand-new folder gets its
     * log (deliverable 3), and `boot(dir, true)` (page-files-backfill.mjs) calls it for
     * every existing folder the rule covers, to fill in what's missing. */
    ensure(full) {
        if (!covers(full)) return false;
        let stat; try { stat = fs.statSync(full); } catch { return false; }
        if (!stat.isDirectory()) return false;
        const log = path.join(full, PAGE);
        if (fs.existsSync(log)) return false;
        fs.writeFileSync(log, "");
        this.catchup(full);
        return true;
    }

    /* What the log should say about `name` in `dir`: a line, or null for "nothing to say". */
    desired(dir, name) {
        const full = path.join(dir, name);
        let stat; try { stat = fs.statSync(full); } catch {}
        if (!stat) return null;
        if (!stat.isDirectory()) return name;
        if (fs.existsSync(path.join(full, "page.js"))) return name + "/page.js";
        if (this.names_a_page(path.join(full, PAGE))) return name + "/" + PAGE;
        return name + "/";
    }

    /* A subfolder is only a LINKED CHILD PAGE (`kid/page.jsonl`) if its own page.jsonl
     * was written BY HAND, as a real page — line 1 sets the page up (title, class, ...),
     * exactly like `core/Page/doc/jsonl.md` describes. This plugin's own auto-created
     * logs (deliverable 3) never write a line like that; their line 1 is a {"file":...}
     * entry same as every other line. So a folder that has nothing but an auto-filled
     * listing stays a plain subfolder (`kid/`) — it doesn't turn every doc/ into a page. */
    names_a_page(log) {
        if (!fs.existsSync(log)) return false;
        const first = fs.readFileSync(log, "utf8").split("\n").find(l => l.trim());
        if (!first) return false;
        let obj; try { obj = JSON.parse(first); } catch { return false; }
        return typeof obj?.file !== "string";
    }

    /* Replay the log: key -> {file, gone} of the latest line for each. */
    state(log) {
        const map = new Map();
        for (const line of fs.readFileSync(log, "utf8").split("\n")) {
            if (!line.trim()) continue;
            let obj; try { obj = JSON.parse(line); } catch { continue; }
            if (typeof obj?.file !== "string") continue;
            map.set(key_of(obj.file), { file: obj.file, gone: !!obj.gone });
        }
        return map;
    }

    /* Bring the log in `dir` up to date for ONE name. A `dir` that itself has a page.js
     * still USES that page.js as the page (deliverable 2 does not touch the loader) — but
     * its page.jsonl, if it has one, is kept current as a listing all the same. */
    sync(dir, name, state) {
        const log = path.join(dir, PAGE);
        if (!fs.existsSync(log) || skip(name)) return;
        state ??= this.state(log);
        const have = state.get(name);
        const want = this.desired(dir, name);

        if (want) {
            if (have && !have.gone && have.file === want) return;
            this.append(log, { file: want });
        } else if (have && !have.gone) {
            this.append(log, { file: have.file, gone: true });
        }
    }

    /* Everything in `dir` the log does not know yet (and everything it lists that is gone). */
    catchup(dir) {
        const log = path.join(dir, PAGE);
        const state = this.state(log);
        const names = new Set(fs.readdirSync(dir).filter(n => !skip(n)));
        for (const key of state.keys()) names.add(key);
        for (const name of names) this.sync(dir, name, state);
    }

    append(log, obj) {
        fs.appendFileSync(log, JSON.stringify(obj) + "\n");
    }

    /* Walk public/ once; returns how many logs were caught up (or, with `create`, created).
     * Prunes at any folder the rule doesn't cover, so it never descends into node_modules,
     * a dot-folder, or a task folder's interior — that's most of what makes this fast.
     * `create` is false at boot (existing logs only, so a fresh server starts quickly) and
     * true from `page-files-backfill.mjs`, which is this exact walk run once to fill in
     * every missing log. */
    boot(dir, create = false) {
        let count = 0, entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
        if (entries.some(e => e.isFile() && e.name === PAGE)) { this.catchup(dir); count++; }
        else if (create && this.ensure(dir)) count++;
        for (const e of entries) {
            if (!e.isDirectory()) continue;
            const full = path.join(dir, e.name);
            if (!covers(full)) continue;
            count += this.boot(full, create);
        }
        return count;
    }
}
