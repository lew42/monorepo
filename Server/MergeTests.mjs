// The merge gate's test step: the tests that cover a diff run on the branch; a failing one is run on the branch's merge base
// too, and only a test that PASSES on the base and FAILS on the branch refuses the merge. A timeout is "no result", never a failure.
// Used by Server/merge.mjs (flag --skip-tests turns it off). Design: core/Page/tasks/page-mastermind/near-tests/requirements.md.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import TestRunner from "../public/framework/core/Test/TestRunner.mjs";

const git = (cwd, ...a) => spawnSync("git", a, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 });

export default class MergeTests {
	static SCRIPT = /\.m?js$/;

	/** dir: the branch's worktree. main: the repo whose results/ and .git it uses. base_ref/branch: git refs.
	 *  changed: repo-relative paths the branch changes (existing ones only). Returns { refused, notes, ran, shas }. */
	static async gate({ dir, main, base_ref, branch, changed, log = console.log }){
		const test_dir = path.join(main, "public/framework/core/Test"), results = TestRunner.day_file(test_dir);
		const mk = root => { const r = new TestRunner(); r.root = root; r.results = results; return r; };
		fs.mkdirSync(path.dirname(results), { recursive: true });
		const out = { refused: [], notes: [], ran: 0 };
		const scripts = changed.filter(f => MergeTests.SCRIPT.test(f) && fs.existsSync(path.join(dir, f)));
		if (!scripts.length) return out;
		const branch_run = mk(dir), all = branch_run.find();
		const tests = [...new Set(scripts.flatMap(f => branch_run.covers(f, all)))].sort();
		if (!tests.length) return out;
		log(`tests: ${tests.length} test(s) cover this diff; running them on the branch`);
		const res = await branch_run.run(tests, { trigger: "merge" });
		out.ran = res.length;
		const failed = res.filter(r => !r.ok && !r.timeout);
		for (const r of res.filter(r => r.timeout)) out.notes.push(`${r.file}: timed out on the branch; counted as no result`);
		if (!failed.length) return out;

		const sha = git(main, "merge-base", base_ref, branch).stdout.trim();
		if (!sha) { out.notes.push("tests: no merge base found; failing tests are not compared"); return out; }
		out.sha = sha;
		const cached = MergeTests.cached(TestRunner.recent_files(test_dir), sha);
		const need = failed.map(r => r.file).filter(f => !cached.has(f));
		if (need.length) {
			const base_dir = MergeTests.checkout(main, sha);
			if (base_dir) try {
				const present = need.filter(f => fs.existsSync(path.join(base_dir, f)));
				const base_run = mk(base_dir);
				for (const r of await base_run.run(present, { trigger: "merge-base", extra: { sha } })) if (!r.timeout) cached.set(r.file, r.ok);
			} finally { MergeTests.remove(main, base_dir); }
			else out.notes.push("tests: could not check out the merge base; failing tests are not compared");
		}
		/* The base runs only the failed tests, alone; the branch ran ~100 at once. A timing test (whisper-detach's 40 s model
		 * load, 2026-11-06) then fails on the branch from load alone. So a regression is re-run alone on the branch before it refuses. */
		const suspect = failed.filter(r => cached.get(r.file) === true).map(r => r.file);
		const again = new Map();
		if (suspect.length) for (const r of await mk(dir).run(suspect, { trigger: "merge-rerun" })) if (!r.timeout) again.set(r.file, r.ok);
		for (const r of failed) {
			const was = cached.get(r.file);
			if (was === true && again.get(r.file) === true) out.notes.push(`${r.file}: failed in the full branch run, passed re-run alone (load, not a regression); does not block`);
			else if (was === true) out.refused.push({ file: r.file, tail: r.tail });
			else out.notes.push(`${r.file}: fails on the branch; ${was === false ? "already failing on the base" : "no base result (new test, or the base run timed out)"}, so it does not block`);
		}
		return out;
	}

	/** file -> ok for the base results already recorded for this sha (timeouts are never recorded as results). */
	static cached(files, sha){
		const map = new Map();
		let text = ""; for (const f of [].concat(files)) try { text += fs.readFileSync(f, "utf8") + "\n"; } catch {}
		for (const l of text.split(/\r?\n/)) {
			if (!l.includes(sha)) continue;
			try { const e = JSON.parse(l); if (e.sha === sha && e.trigger === "merge-base" && !e.timeout) map.set(e.file, e.ok); } catch {}
		}
		return map;
	}

	// Inside main, so node finds main's node_modules; excluded locally so git status stays clean.
	static checkout(main, sha){
		const dir = path.join(main, ".merge-base", sha.slice(0, 12));
		try {
			const ex = path.resolve(main, git(main, "rev-parse", "--git-path", "info/exclude").stdout.trim());
			const cur = fs.existsSync(ex) ? fs.readFileSync(ex, "utf8") : "";
			if (!/^\.merge-base\/?$/m.test(cur)) { fs.mkdirSync(path.dirname(ex), { recursive: true }); fs.appendFileSync(ex, (cur && !cur.endsWith("\n") ? "\n" : "") + ".merge-base/\n"); }
		} catch {}
		MergeTests.remove(main, dir);
		const r = git(main, "worktree", "add", "--detach", dir, sha);
		return r.status === 0 ? dir : null;
	}

	static remove(main, dir){
		git(main, "worktree", "remove", "--force", dir);
		fs.rmSync(dir, { recursive: true, force: true });
		git(main, "worktree", "prune");
	}
}
