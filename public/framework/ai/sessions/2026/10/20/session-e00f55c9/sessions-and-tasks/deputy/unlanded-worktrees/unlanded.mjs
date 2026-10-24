// Read-only: which closed-worktree branches hold commits michael/dev lacks, and what is real in them.
// Run from anywhere in the repo: node unlanded.mjs   (writes verdicts.jsonl beside itself)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../../../../../../../../../.."); // up to the repo root
const git = (...a) => { try { return execFileSync("git", a, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return null; } };
const BASE = "michael/dev";
const NOISE = /(^|\/)(files\.jsonl|page\.jsonl|log\.jsonl|board\.jsonl|usage\.jsonl|index\.json|flags\.jsonl)$|\.log$/;

const recs = readFileSync(join(root, "public/framework/ai/sessions/worktree-removals.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const byBranch = new Map();
for (const r of recs) byBranch.set(r.branch, r); // last record wins

const rows = [];
for (const [branch, r] of byBranch) {
  let tip = git("rev-parse", "--verify", "--quiet", `refs/heads/${branch}`);
  let how = "branch";
  if (!tip) {
    how = "deleted";
    const known = git("cat-file", "-t", r.sha) === "commit" ? r.sha : null;
    tip = known;
    if (!tip) {
      const g = git("log", "--all", "-1", "--format=%H", `--grep=saved to ${branch}`);
      tip = g || null;
    }
    if (!tip) { rows.push({ branch, sha: r.sha, removed_at: r.at, how: "missing", ahead: 0 }); continue; }
  }
  const ahead = Number(git("rev-list", "--count", `${BASE}..${tip}`) || 0);
  rows.push({ branch, sha: tip, removed_at: r.at, how, ahead });
}
const candidates = rows.filter(r => r.ahead > 0);

const out = [];
for (const c of candidates) {
  const files = (git("diff", "--name-only", `${BASE}...${c.sha}`) || "").split("\n").filter(Boolean);
  const real = files.filter(f => !NOISE.test(f));
  let same = 0, older = 0; const unique = [];
  for (const f of real) {
    const mine = git("rev-parse", "--verify", "--quiet", `${c.sha}:${f}`);
    const theirs = git("rev-parse", "--verify", "--quiet", `${BASE}:${f}`);
    if (mine && theirs && mine === theirs) { same++; continue; }
    if (!mine) { same++; continue; } // branch deleted it; nothing to land
    const hist = (git("log", BASE, "--format=%H", "--", f) || "").split("\n").filter(Boolean);
    if (hist.some(h => git("rev-parse", "--verify", "--quiet", `${h}:${f}`) === mine)) { older++; continue; } // this exact content was on michael/dev at some point
    if (theirs) {
      const later = git("log", BASE, `--since=${c.removed_at}`, "--format=%h", "--", f);
      if (later) { older++; continue; }
    }
    unique.push(f);
  }
  out.push({ branch: c.branch, sha: c.sha, removed_at: c.removed_at, how: c.how, ahead: c.ahead, changed: files.length, real_files: real.length, same, older, unique, verdict: !real.length ? "noise only" : unique.length ? "has unique work" : "nothing new", what: "", recommend: "" });
}
writeFileSync(join(here, "candidates.json"), JSON.stringify({ removals: byBranch.size, rows, out }, null, 1));
console.log(`records(unique branches)=${byBranch.size} candidates=${candidates.length}`);
for (const o of out) console.log(o.verdict.padEnd(16), o.branch.padEnd(34), o.how, "real", o.real_files, "same", o.same, "older", o.older, "unique", o.unique.length, "date", o.removed_at.slice(0, 10));
for (const r of rows.filter(r => r.how === "missing")) console.log("MISSING", r.branch);
