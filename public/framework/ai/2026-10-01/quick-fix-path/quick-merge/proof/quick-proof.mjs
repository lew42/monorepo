/* Proof for merge.mjs --quick (public/framework/ai/2026-10-01/quick-fix-path/quick-merge/requirements.md,
 * deliverable 2). `node quick-proof.mjs <merge.mjs> <scratch dir>` — builds a fresh throwaway repo for
 * each case (branch michael/dev, one file under a fake module), runs merge.mjs --quick against it
 * with --main and --skip-smoke (same safe pattern as 2026-09-25/quickfix-worktrees/landing/proof.mjs),
 * and checks the exit code and the final JSON line. Never touches the real repo.
 *
 * --skip-smoke also skips --quick's OWN screenshot step (it's gated behind the smoke test passing,
 * same as the existing new-page screenshot step above it in merge.mjs) — a scratch repo has no real
 * dev server to screenshot anyway. So this proof is about the GATE (size/lines/one-module), the
 * merge actually landing, and the JSON line's shape — not the screenshot pixel itself. A SEPARATE,
 * read-only proof (shot-proof.mjs, beside this file) takes a real screenshot against this worktree's
 * own live dev server to show widthsFor's chosen width really becomes one real .png. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [MERGE, SCRATCH] = process.argv.slice(2).map(p => path.resolve(p));
const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", windowsHide: true });
const git = (cwd, ...a) => { const r = run("git", ["-c", "user.name=proof", "-c", "user.email=proof@example.invalid", ...a], cwd); return r.stdout.trim(); };
const out = [];
const say = s => { out.push(s); console.log(s); };

function setup(name, { lines = 3 } = {}){
	const root = path.join(SCRATCH, name);
	fs.rmSync(root, { recursive: true, force: true });
	const main = path.join(root, "main"), wt = path.join(root, "wt");
	fs.mkdirSync(main, { recursive: true });
	git(main, "init", "-q", "-b", "michael/dev");
	const cssPath = "public/framework/ux/Thing/Thing.css";
	fs.mkdirSync(path.join(main, path.dirname(cssPath)), { recursive: true });
	fs.writeFileSync(path.join(main, cssPath), ".box { color: red; }\n");
	git(main, "add", "."); git(main, "commit", "-q", "-m", "one component's css");
	git(main, "worktree", "add", "-q", "-b", "worktree/quick-x", wt);
	// `lines` fresh lines appended — a real git diff numstat of exactly that many added lines
	const added = Array.from({ length: lines }, (_, i) => `.extra-${i} { color: blue; }`).join("\n") + "\n";
	fs.appendFileSync(path.join(wt, cssPath), added);
	git(wt, "commit", "-q", "-am", `+${lines} line(s) to one component's css`);
	return { main, wt };
}

const quick = ({ main, wt }, extra = []) => run("node", [MERGE, wt, "--main", main, "--skip-smoke", "--quick", "--asked", "2026-10-01T00:00:00-05:00", ...extra], main);
const lastJsonLine = text => { const l = text.trim().split("\n").filter(Boolean); for (let i = l.length - 1; i >= 0; i--) { try { return JSON.parse(l[i]); } catch {} } return null; };

const results = [];
function check(label, ok, detail){ say(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`); results.push([label, ok]); }

say("case 1: --quick, 3 lines in one module -> lands, prints the JSON line");
{
	const repo = setup("c1-small", { lines: 3 });
	const branchHead = git(repo.wt, "rev-parse", "HEAD");
	const r = quick(repo);
	say(`  exit ${r.status}\n` + (r.stdout + r.stderr).trim().split("\n").map(l => "    | " + l).join("\n"));
	check("exit 0", r.status === 0, `got ${r.status}`);
	const json = lastJsonLine(r.stdout);
	check("last stdout line is JSON with merged/shot/width/ms/asked_at", !!json && "merged" in json && "shot" in json && "width" in json && "ms" in json && "asked_at" in json, JSON.stringify(json));
	check("merged names the branch's own head commit", json?.merged === branchHead, `${json?.merged} vs ${branchHead}`);
	check("asked_at echoes --asked, ms measured from it", json?.asked_at === "2026-10-01T00:00:00-05:00" && typeof json?.ms === "number" && json.ms >= 0);
	check("shot/width are null — --skip-smoke also skips --quick's own screenshot step, by design (see header)", json?.shot === null && json?.width === null);
	check("the css file actually landed in main", fs.readFileSync(path.join(repo.main, "public/framework/ux/Thing/Thing.css"), "utf8").includes("extra-0"));
	let review = null; try { review = fs.readFileSync(path.join(repo.main, "public/framework/ai/quick-fix/review.md"), "utf8"); } catch {}
	check("a 'size quick' review.md record was written (no task dir existed, so the quick-fix/ fallback)", !!review && review.includes("size quick"), review);
}

say("\ncase 2: --quick, 40 lines -> refused, exit 2, nothing merged");
{
	const repo = setup("c2-big", { lines: 40 });
	const before = fs.readFileSync(path.join(repo.main, "public/framework/ux/Thing/Thing.css"), "utf8");
	const r = quick(repo);
	say(`  exit ${r.status}\n` + (r.stdout + r.stderr).trim().split("\n").map(l => "    | " + l).join("\n"));
	check("exit 2 (too big for --quick, not the generic 1)", r.status === 2, `got ${r.status}`);
	const refused = r.stderr + r.stdout;
	check("the refusal names the line count, dir count and size, and says to run the normal path",
		refused.includes("refused: --quick needs") && refused.includes("40 lines in 1 dir(s), size light") && refused.includes("run the normal path"), refused);
	check("nothing was touched: main's css file is byte-identical", fs.readFileSync(path.join(repo.main, "public/framework/ux/Thing/Thing.css"), "utf8") === before);
	check("no JSON line printed on a refusal", lastJsonLine(r.stdout) === null, JSON.stringify(lastJsonLine(r.stdout)));
}

say("\nSUMMARY");
for (const [label, ok] of results) say(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:")), "quick-proof.txt"),
	`Proof: Server/merge.mjs --quick on scratch repos (${new Date().toISOString()})\nmerge.mjs: ${MERGE}\n` + out.join("\n") + "\n");
process.exit(results.every(r => r[1]) ? 0 : 1);
