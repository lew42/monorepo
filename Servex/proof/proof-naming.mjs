/* THE NAMING PROOF — `node Servex/proof/proof-naming.mjs`.
 *
 * The owner's naming rules ("Naming rules are hard requirements" — the Servex
 * brief, section D) live as `if`s inside `Log.append()`, not in any skill an
 * agent could forget to read. This walks eight scenes — the six
 * `log-model/events.md` describes, plus two more (servex-hardening,
 * 2026-09-22) proving a locked id refuses a plain `name` and a `dispute`, not
 * only a `rename` — checks the appender's own answer at each one, and — the
 * part that actually proves the rules are RIGHT, not just present — folds the
 * resulting log with the real, unmodified `log-model/fold.js` and checks its
 * answer agrees with the appender's live index at every single step. Runs
 * against a throwaway SERVEX_HOME and a throwaway log name, so it never
 * touches the real log folder and can run any time, Servex up or down. */

import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRATCH = path.join(os.tmpdir(), `servex-proof-naming-${process.pid}`);
process.env.SERVEX_HOME = SCRATCH;

const { default: Log } = await import("../Log.js");
const { fold, parse } = await import(pathToFileURL(path.join(HERE, "..", "..", "public", "framework", "ai", "2026-09-22", "log-model", "fold.js")));

const log = new Log();
const NAME = `naming-proof-${Date.now().toString(36)}`;
let failures = 0, n = 0;

function check(claim, ok, detail){
    n++;
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${n}. ${claim}\n      ${detail}`);
}

/* The two numbers that must agree: what the appender's own live index says
 * is visible for `id`, and what the real fold.js says when it reads the same
 * lines back. Thrown, not returned — a disagreement here means the appender
 * and the browser's own fold would show the owner two different names, which
 * is exactly the bug this whole system exists to rule out. */
async function agree(id){
    const file = log.file(NAME);
    const folded = fold(parse(await fs.promises.readFile(file.path, "utf8"))).names[id];
    const live = file.names.get(id);
    if ((live?.name ?? null) !== (folded?.name ?? null))
        throw new Error(`disagreement on "${id}": appender says "${live?.name}", fold says "${folded?.name}"`);
    return live?.name;
}

// 1. the fast assistant names a thing → written
let r = await log.append(NAME, { id: "thing", type: "name", by: "assistant-fast", kind: "feature", name: "Live Board" });
check("the fast assistant names a thing and it is written", r.ok && await agree("thing") === "Live Board", `visible name "${await agree("thing")}"`);

// 2. a mastermind renames it before it is seen → written as a rename (fold.js
//    only ever moves the visible name for an OWNER's rename — see its own
//    comment — so a mastermind's suggestion is written verbatim and simply
//    sits beside "Live Board", which is exactly the "propose, never swap" rule)
r = await log.append(NAME, { id: "thing", type: "rename", by: "mastermind-servex", name: "Agent Timeline", why: "ordered by time" });
check("a mastermind renames it before anyone has seen it, and the rename is written as-is",
    r.ok && !r.became && r.entry.type === "rename" && await agree("thing") === "Live Board", `type "${r.entry.type}", visible name still "${await agree("thing")}"`);

// 3. the card shows it (seen) → a mastermind renames again → becomes a dispute, visible name unchanged
await log.append(NAME, { id: "c-thing", type: "card", by: "assistant-fast", re: "thing", title: "Live Board" });
r = await log.append(NAME, { id: "thing", type: "rename", by: "mastermind-servex", name: "Agent Stream", why: "shorter" });
check("once a card has shown it, a non-owner rename becomes a dispute and the visible name does not move",
    r.ok && r.became === "dispute" && r.entry.type === "dispute" && await agree("thing") === "Live Board", `became "${r.became}", visible name still "${await agree("thing")}"`);

// 4. the owner renames → written
r = await log.append(NAME, { id: "thing", type: "rename", by: "owner", name: "Agent Timeline", why: "the owner's pick" });
check("the owner's own rename is written even though the thing has been seen",
    r.ok && !r.became && await agree("thing") === "Agent Timeline", `type "${r.entry.type}", visible name "${await agree("thing")}"`);

// 5. the owner approves → locked
r = await log.append(NAME, { id: "thing", type: "approve", by: "owner" });
check("the owner's approve locks it", r.ok && log.file(NAME).names.get("thing").locked === true, `locked ${log.file(NAME).names.get("thing").locked}`);

// 6. the owner renames the locked one → refused with the lock named
r = await log.append(NAME, { id: "thing", type: "rename", by: "owner", name: "Something Else" });
check("renaming the locked name is refused, even for the owner, and the lock is named in why",
    r.ok === false && r.why.includes("Agent Timeline"), r.why);

// 7. a plain `name` on the locked id → refused too, not only a rename
r = await log.append(NAME, { id: "thing", type: "name", by: "mastermind-servex", kind: "feature", name: "Yet Another Name" });
check("a plain name on a locked id is refused, and the lock is named in why",
    r.ok === false && r.why.includes("Agent Timeline"), r.why);

// 8. a `dispute` on the locked id → refused too
r = await log.append(NAME, { id: "thing", type: "dispute", by: "mastermind-servex", text: "still think Agent Stream reads better" });
check("a dispute aimed at a locked id is refused, and the lock is named in why",
    r.ok === false && r.why.includes("Agent Timeline"), r.why);

console.log("\n" + (await log.tail(NAME, 20)).map(e => JSON.stringify(e)).join("\n"));

log.close();
try { fs.rmSync(SCRATCH, { recursive: true, force: true }); } catch { /* it is a temp dir */ }

console.log(failures ? `\n${failures} FAILED` : "\nall naming proofs passed, the fold agrees at every step");
process.exit(failures ? 1 : 0);
