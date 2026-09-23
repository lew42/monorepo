import fs from "fs";
import path from "path";
import Events from "../Server/Events.js";
import { place, stamp } from "./home.js";

/* A log name becomes a filename, so it may not contain a slash, a colon or a
 * `..` — `/log/../../etc/passwd` is a real request somebody can type.
 *
 * ⚠ ONE NAMESPACE IS THE EXCEPTION: `cards/<slug>` — a card's own append-only
 * event stream (decision `card-storage`, ai2-nested). It is still checked
 * against the same "no `..`, no traversal" rule as every other name, just with
 * one literal `/` allowed after the fixed `cards` segment, so `path.join`
 * inside `place()` nests it under `logs/cards/<slug>.jsonl` instead of every
 * card's log flattening into one shared directory. */
const NAME = /^[a-z0-9][a-z0-9._-]{0,63}$/i;
const CARD_NAME = /^cards\/[a-z0-9][a-z0-9-]{0,63}$/i;
const OWNER = "owner";

/* One id's naming state — the same three facts fold.js computes for it:
 * `name` (what's visible), `seen` (any card ever referenced it), `locked`
 * (any approve ever referenced it). `named` is bookkeeping only: it is what
 * tells the FIRST name from every alternative that follows it. */
function get(idx, id){
    return idx.get(id) ?? idx.set(id, { name: undefined, named: false, seen: false, locked: false }).get(id);
}

/* One entry's effect on the index. Called on replay (reindex, below) and
 * again, live, the instant an entry is actually written — so the index a
 * check reads is never more than one queued write behind the file itself.
 *
 * `rename`, `approve` and `dispute` are NOT bin types in fold.js — they only
 * ever move a thing through its `re`, exactly like a `card` only marks `seen`
 * on the ids in ITS `re`, never on its own id. Read `re`, never `id`, for all
 * three, or this index would disagree with the real fold the moment anyone
 * ran it over the same file. */
function absorb(idx, e){
    if (e.type === "name"){ const t = get(idx, e.id); if (!t.locked && !t.named) t.name = e.name; t.named = true; }

    for (const id of [].concat(e.re ?? [])){
        const t = get(idx, id);
        if (e.type === "card") t.seen = true;
        else if (e.type === "approve") t.locked = true;
        else if (e.type === "rename" && e.by === OWNER && !t.locked) t.name = e.name;
    }
}

/* THE NAMING RULES — see events.md's "checks the appender runs". Everything
 * that is not one of these two `if`s is accepted unchanged, first name for an
 * id included: there is nothing to check about it.
 *
 * `re` is stamped onto a rename/approve/dispute that arrived without one,
 * defaulting to the entry's own `id` — the schema's own convention (every
 * hand-written sample carries both) and the only way `absorb()` above (and
 * the real fold.js, later, reading the same line back) can find what it's
 * about. Without this a caller that forgot `re` would look accepted here and
 * do nothing once folded — the exact silent drift this appender exists to
 * prevent.
 *
 * Returns `{ok: false, why}` to refuse outright (nothing is written), or
 * `{ok: true, entry}` for what actually gets written — `entry` rewritten and
 * `became` set when the rule turned one type into another. */
function check(idx, entry){
    const re_types = entry.type === "rename" || entry.type === "approve" || entry.type === "dispute";
    const e = re_types && entry.re == null ? { ...entry, re: entry.id } : entry;

    if (e.type === "approve" && e.by !== OWNER)
        return { ok: false, why: "only the owner may approve" };

    /* An approved name is locked: a `name`, `rename` or `dispute` aimed at it
     * afterward is refused outright, the owner included, naming the lock in
     * `why` — the same treatment `rename` already had here, extended to the
     * other two types the naming-rules table also lists (log-model/events.md;
     * `name` and `dispute` were left open by the naming-checks task that added
     * this file's index, closed here, servex-hardening 2026-09-22). */
    if (e.type === "name" || e.type === "rename" || e.type === "dispute"){
        const target = e.re ?? e.id;
        const t = get(idx, target);
        if (t.locked)
            return { ok: false, why: `"${target}" is locked as "${t.name}" — ${e.type} refused` };
    }

    if (e.type === "rename" && get(idx, e.re).seen && e.by !== OWNER)
        return { ok: true, became: "dispute", entry: { ...e, type: "dispute", refused: "rename",
            text: e.why || "Tried to rename a name the owner has already seen." } };

    return { ok: true, entry: e };
}

/* THE SINGLE WRITER.
 *
 * Every log file Servex owns is opened exactly once, here, and written only
 * through this object. Nothing else appends to those files — a dev server, an
 * agent session or a Claude session that wants to add a line POSTs it to
 * Servex (`POST /log/<name>`) and Servex writes it.
 *
 * Why bother: two processes appending to the same file on Windows can interleave
 * mid-line, and a half-written JSON line poisons the file for every reader after
 * it. One process, one open stream, one queue per file, and that cannot happen.
 *
 * The queue is a promise chain per file (`file.queue`). Each append tacks itself
 * onto the end of that chain, so line N+1 is not handed to the stream until line
 * N has actually been flushed — and the promise `append()` returns resolves when
 * the caller's own line is on disk, which is what lets an HTTP POST answer
 * honestly instead of optimistically. Checking a naming rule happens INSIDE that
 * same chain, not before it, so two rapid appends for the same id are checked in
 * the order they are actually written, never against a stale index. */
export default class Log extends Events {

    initialize(){
        this.files = new Map();
        this.dir = path.dirname(place("logs", "any.jsonl"));   // and creates it
    }

    file(name){
        if (!NAME.test(name) && !CARD_NAME.test(name))
            throw new Error(`Bad log name "${name}" — letters, digits, dot, dash and underscore only (or "cards/<slug>").`);
        if (this.files.has(name)) return this.files.get(name);

        const at = place("logs", `${name}.jsonl`);
        const file = { name, path: at, stream: fs.createWriteStream(at, { flags: "a" }), queue: Promise.resolve(), names: this.reindex(at) };
        this.files.set(name, file);
        return file;
    }

    /* The names index built fresh from whatever is already on disk — Servex
     * restarts, the file does not, so the index has to catch up on first open
     * exactly the way `fold.js` would if it ran over the same lines. A line
     * that won't parse is skipped, same as `tail()` treats it. */
    reindex(at){
        const idx = new Map();
        let text = "";
        try { text = fs.readFileSync(at, "utf8"); } catch { /* nothing written yet */ }
        for (const line of text.split("\n")) if (line.trim()){
            try { absorb(idx, JSON.parse(line)); } catch { /* torn line */ }
        }
        return idx;
    }

    /* `at` is stamped here so every line has a real clock reading and no caller
     * can type one from memory. A caller that genuinely knows better (replaying
     * an older event) may pass its own `at` and it wins. Resolves to `{ok, entry}`
     * on success (`became` set when the rule rewrote the entry) or `{ok:false, why}`
     * on a refusal — nothing is written for a refusal. */
    append(name, entry){
        const file = this.file(name);

        return file.queue = file.queue.then(() => new Promise((done, fail) => {
            const outcome = check(file.names, entry);
            if (!outcome.ok) return done(outcome);

            const written = { at: stamp(), ...outcome.entry };
            file.stream.write(JSON.stringify(written) + "\n", err => {
                if (err) return fail(err);
                absorb(file.names, written);
                done({ ok: true, entry: written, ...(outcome.became ? { became: outcome.became } : {}) });
            });
        }));
    }

    /* The last `n` entries. Waits for the queue first, so a `tail` right after an
     * `append` sees that append — otherwise the line is still in the stream's
     * buffer and the read comes back one short. A line that will not parse comes
     * back as `{bad: "<the raw text>"}` rather than throwing the whole tail away. */
    async tail(name, n = 50){
        const file = this.file(name);
        await file.queue;

        let text = "";
        try { text = await fs.promises.readFile(file.path, "utf8"); } catch { return []; }

        return text.split("\n").filter(Boolean).slice(-n).map(line => {
            try { return JSON.parse(line); } catch { return { at: null, bad: line }; }
        });
    }

    /* Every log file on disk, whether or not this run has opened it. */
    names(){
        try {
            return fs.readdirSync(this.dir).filter(f => f.endsWith(".jsonl")).map(f => f.replace(/\.jsonl$/, ""));
        } catch {
            return [];
        }
    }

    close(){
        for (const file of this.files.values()) file.stream.end();
    }
}
