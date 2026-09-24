import fs from "fs";
import path from "path";
import watch from "../watch.js";

/* Step "exists" of the page.jsonl format: when a file or folder appears in (or
 * vanishes from) a folder that has a page.jsonl, this appends one line to that
 * log, so nobody has to remember to.
 *
 *   {"file":"photo.png"}                 a file appeared
 *   {"file":"kid/page.jsonl"}            a subfolder with its own page.jsonl
 *   {"file":"kid/page.js"}               a subfolder with a page.js (wins over the jsonl)
 *   {"file":"kid/"}                      a plain subfolder
 *   {"file":"photo.png","gone":true}     it disappeared
 *
 * REPEAT-SAFE: Windows fires extra watch events (even a READ fires one), so before
 * every append the log's existing file lines are replayed — the latest line per
 * name wins — and a line is written only if the state truly changes. A `.jsonl`
 * change only tails to the browser (LiveReload -> Tail.changed); it never reloads. */

const PUBLIC = path.resolve("public");
const PAGE = "page.jsonl";

const skip = name => name === PAGE || name.startsWith(".") || name === "node_modules" || name.endsWith(".json");
const key_of = file => file.split("/")[0];   // "kid/page.js" and "kid/" are the same entry: "kid"

export default class PageFiles {

    static setup(server) {
        new PageFiles(server);
    }

    constructor(server) {
        this.server = server;
        this.pending = new Map();
        if (process.env.BOOT_TEST) return;   // a candidate boot test must never write files (see server.js)

        watch(file => this.event(file));
        const started = Date.now();
        const count = this.boot(PUBLIC);
        console.log(`PageFiles: boot catch-up over ${count} page.jsonl in ${Date.now() - started}ms`);
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
        this.sync(dir, name);
        // page.js in a subfolder changes how the PARENT lists that subfolder
        if (name === "page.js") this.sync(path.dirname(dir), path.basename(dir));
    }

    /* What the log should say about `name` in `dir`: a line, or null for "nothing to say". */
    desired(dir, name) {
        const full = path.join(dir, name);
        let stat; try { stat = fs.statSync(full); } catch {}
        if (!stat) return null;
        if (!stat.isDirectory()) return name;
        if (fs.existsSync(path.join(full, "page.js"))) return name + "/page.js";
        if (fs.existsSync(path.join(full, PAGE))) return name + "/" + PAGE;
        return name + "/";
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

    /* Bring the log in `dir` up to date for ONE name. */
    sync(dir, name, state) {
        const log = path.join(dir, PAGE);
        if (!fs.existsSync(log) || skip(name)) return;
        if (fs.existsSync(path.join(dir, "page.js"))) return;   // a folder with page.js uses it; its page.jsonl (if any) is not ours
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

    /* Walk public/ once; returns how many logs were caught up. */
    boot(dir) {
        let count = 0, entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
        if (entries.some(e => e.isFile() && e.name === PAGE)) { this.catchup(dir); count++; }
        for (const e of entries) {
            if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") count += this.boot(path.join(dir, e.name));
        }
        return count;
    }
}
