import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

/* ONE-TIME MOVE: a folder's file list leaves page.jsonl for files.jsonl, unless the folder
 * IS a jsonl page (Server/plugins/PageFiles.js, "WHICH FILE HOLDS THE LIST").
 *
 * For every covered folder that is not a jsonl page and has a page.jsonl:
 *   - only {"file"} lines, and nothing else in the folder -> the log was the folder's only
 *     content (an empty folder the lister gave a log): delete the log AND the folder;
 *   - only {"file"} lines -> rename it to files.jsonl (merged, oldest lines first, when a
 *     files.jsonl is already there);
 *   - any other line (real data, e.g. imagine/cms/json/) -> left alone; the backfill then
 *     writes that folder's list to files.jsonl.
 * The changes are staged in git (a rename stages as a rename). Run it from the repo or
 * worktree root:
 *
 *   node Server/page-files-migrate.mjs            then   node Server/page-files-backfill.mjs
 *
 *   --dry          change nothing, print what would happen
 *   --root <dir>   work on another checkout's public/ (e.g. --dry --root ../monorepo)
 *
 * IDEMPOTENT: a second run finds no list-only page.jsonl outside a jsonl page, and prints 0. */

const arg = name => process.argv.indexOf(name);
const dry = arg("--dry") > -1;
if (arg("--root") > -1) process.chdir(path.resolve(process.argv[arg("--root") + 1]));
// imported after the chdir: PageFiles resolves public/ against the working directory
const { default: PageFiles } = await import("./plugins/PageFiles.js");

const PUBLIC = path.resolve("public");
const pf = Object.create(PageFiles.prototype);
const rel = full => path.relative(process.cwd(), full).split(path.sep).join("/");

const git = (args, input) => spawnSync("git", args, { input, encoding: "utf8", windowsHide: true });
const tracked = new Set(git(["ls-files", "--", "public"]).stdout.split("\n").filter(Boolean));

const count = { pages: 0, renamed: 0, merged: 0, kept: 0, deleted: 0 };
const deleted = [], kept = [], stage = [];
const gone = new Set();   // folders removed (with --dry: that would be)

function list_only(text) {
    return text.split("\n").filter(l => l.trim()).every(l => {
        try { return typeof JSON.parse(l)?.file === "string"; } catch { return false; }
    });
}

// Children first, so a folder emptied by its children's deletion is seen empty.
function walk(dir) {
    let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory() && PageFiles.covers(full)) walk(full);
    }
    migrate(dir);
}

function migrate(dir) {
    const log = path.join(dir, PageFiles.PAGE), list = path.join(dir, PageFiles.LIST);
    if (!fs.existsSync(log)) return;
    if (pf.is_jsonl_page(dir)) return void count.pages++;

    const text = fs.readFileSync(log, "utf8");
    if (!list_only(text)) { count.kept++; kept.push(rel(log)); return; }

    stage.push(rel(log));
    const rest = fs.readdirSync(dir).filter(n => n !== PageFiles.PAGE && n !== PageFiles.LIST && !gone.has(path.join(dir, n)));
    if (!rest.length) {
        gone.add(dir);
        count.deleted++;
        deleted.push(rel(log), rel(dir) + "/");
        if (dry) return;
        fs.rmSync(log);
        if (fs.existsSync(list)) { fs.rmSync(list); stage.push(rel(list)); }
        fs.rmdirSync(dir);
        return;
    }

    const merge = fs.existsSync(list);
    count[merge ? "merged" : "renamed"]++;
    stage.push(rel(list));
    if (dry) return;
    if (merge) {
        // written by the new lister in the meantime: the old lines go FIRST, so the
        // replay's latest-line-wins still ends on the newest state
        const newer = fs.readFileSync(list, "utf8");
        fs.writeFileSync(list, text + (text && !text.endsWith("\n") ? "\n" : "") + newer);
        fs.rmSync(log);
    } else {
        fs.renameSync(log, list);
    }
}

walk(PUBLIC);

// Stage exactly what moved: not a delete of an untracked log, not a .gitignored path.
if (!dry && stage.length) {
    const ignored = new Set(git(["check-ignore", "--stdin"], stage.join("\n") + "\n").stdout.split("\n").filter(Boolean));
    const paths = stage.filter(p => (fs.existsSync(p) || tracked.has(p)) && !ignored.has(p));
    const res = paths.length && git(["add", "-A", "--pathspec-from-file=-"], paths.join("\n") + "\n");
    if (res?.status) console.error("git add failed:", res.stderr);
}

console.log(`page-files-migrate${dry ? " (dry run, nothing changed)" : ""}: ${count.renamed} renamed to files.jsonl, ` +
    `${count.merged} merged into an existing files.jsonl, ${count.kept} kept (hold other lines), ` +
    `${count.deleted} empty folders deleted; ${count.pages} jsonl pages untouched`);
for (const p of kept) console.log("  kept     " + p);
for (const p of deleted) console.log("  deleted  " + p);
