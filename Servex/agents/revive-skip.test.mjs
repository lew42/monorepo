/* node Servex/agents/revive-skip.test.mjs — the two predicates revive() uses to leave an agent alone (doc/restart.md). */
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";

process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "servex-skip-"));
const { Agents } = await import("./Agents.js");

const boot_at = Date.parse("2026-10-18T22:34:01Z"), skip = (row, o = {}) => Agents.revive_skip(row, { boot_at, ...o });
let n = 0;
const t = (ok, what) => { assert.ok(ok, what); n++; };

t(skip({ started_at: "2026-10-18T22:34:05Z", turns: 4 })?.dead === false, "started after boot: skipped, and never buried");
t(skip({ started_at: "2026-10-18T22:33:56Z", turns: 0 })?.dead === true, "the 10-18 case: 5 s old, zero turns, no session file: skipped and gone");
t(skip({ started_at: "2026-10-18T22:33:56Z", turns: 0 }, { has_session: true }) === null, "zero turns but a session file (a long first turn): revived and told");
t(skip({ started_at: "2026-10-18T20:00:00Z", turns: 3 }) === null, "an old agent with completed turns: revived and told");
t(skip({ started_at: undefined, turns: undefined }, { has_session: true }) === null, "a legacy row with a session file: revived");
t(skip({ started_at: "2026-10-18T22:34:01Z", turns: 2 }) === null, "started in the same millisecond as boot is not after it");

console.log(`revive-skip: ${n} checks passed`);
process.exit(0);
