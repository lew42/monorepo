import assert from "node:assert";
import { kind_of, coverage, report } from "./pid-coverage.mjs";

/* kind_of: the spawned exe, not any word inside the command line. */
assert.equal(kind_of({ cmd: `"C:\\Program Files\\nodejs\\node.exe" C:\\x\\script.mjs` }), "node");
assert.equal(kind_of({ cmd: `"C:\\Program Files\\Git\\bin\\bash.exe" -c "git log --oneline"` }), "powershell/bash");
assert.equal(kind_of({ cmd: `git.exe -c core.fsmonitor= status --short` }), "git");
assert.equal(kind_of({ cmd: `C:\\...\\claude.exe --resume=abc` }), "claude.exe");
assert.equal(kind_of({ cmd: `chrome.exe --headless` }), "chrome (playwright)");
assert.equal(kind_of({ cmd: `python C:\\x\\script.py` }), "other");

/* coverage: counts per kind, with-end and with-agent-session, only for rows inside the window. */
const now = Date.now();
const starts = [
	{ t: now - 1000, cmd: "git status", agent: "minion-x", session: "s1" },     // in window, has end, attributed
	{ t: now - 2000, cmd: "git status", agent: null, session: null },          // in window, open (no end), unattributed
	{ t: now - 1000 * 60 * 60 * 25, cmd: "git status", agent: "a", session: "s" },   // outside the 24h window
];
const open_set = new Set([starts[1]]);
const cov = coverage(starts, open_set, now - 24 * 3600000);
assert.equal(cov.windowed, 2);
const git_row = cov.rows.find(r => r.kind === "git");
assert.deepEqual([git_row.starts, git_row.with_end, git_row.with_both], [2, 1, 1]);

const md = report(cov, 24);
assert.ok(md.includes("agree"));
assert.ok(md.includes("| git | 2 |"));

console.log("pid-coverage.test.mjs ok");
