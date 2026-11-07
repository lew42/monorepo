// CommitLog — git hooks (.githooks/) call this so a commit is recorded in the session that made it.
//   node Server/CommitLog.mjs trailer <commit-msg file>   adds "Session: <uuid>" to the message (commit-msg hook)
//   node Server/CommitLog.mjs log                         appends {"commit","files","branch","worktree"} to the session's record (post-commit hook)
// Never throws, never blocks: exit 0 always, killed after LIMIT ms. An unknown session writes one line to
// public/framework/ai/sessions/failures.jsonl and nothing else. Doc: Server/doc/commit-log.md
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import SessionFolders from "../public/framework/core/Session/SessionFolders.mjs";
import SessionRecord from "./SessionRecord.mjs";
import RecordWriter from "../public/framework/core/Item/RecordWriter.js";

export default class CommitLog {
	static LIMIT = 8000;
	static FILES = 200;
	static UUID = SessionFolders.UUID;

	static git(args, cwd){ return execFileSync("git", args, { cwd, encoding: "utf8", windowsHide: true, timeout: 4000 }).trim(); }

	/** The main checkout (where Servex and the session store live): the parent of the shared .git dir. COMMITLOG_ROOT overrides it (tests). */
	static main_root(cwd){
		if (process.env.COMMITLOG_ROOT) return path.resolve(process.env.COMMITLOG_ROOT);
		return path.dirname(path.resolve(cwd, this.git(["rev-parse", "--git-common-dir"], cwd)));
	}

	/** The session id of the committing agent: CLAUDE_CODE_SESSION_ID, else the .worktrees.json row whose path is this worktree and names a session. */
	static session_id(top, root){
		const env = process.env.CLAUDE_CODE_SESSION_ID;
		if (this.UUID.test(env ?? "")) return env;
		try {
			const rows = Object.values(JSON.parse(fs.readFileSync(path.join(root, ".worktrees.json"), "utf8")));
			const row = rows.find(r => r.path && path.resolve(r.path).toLowerCase() === path.resolve(top).toLowerCase());
			if (this.UUID.test(row?.session ?? "")) return row.session;
		} catch {}
		return null;
	}

	static record_file(root, id){
		const dir = SessionFolders.at(path.join(root, SessionRecord.STORE)).record_of(id);
		return dir ? SessionRecord.log_file(dir) : null;
	}

	static fail(root, why, extra = {}){
		try {
			const f = path.join(root, "public/framework/ai/sessions/failures.jsonl");
			fs.mkdirSync(path.dirname(f), { recursive: true });
			fs.appendFileSync(f, JSON.stringify({ failure: { at: new Date().toISOString(), module: "CommitLog", why, ...extra } }) + "\n");
		} catch {}
	}

	static async trailer(msgfile){
		const cwd = process.cwd(), root = this.main_root(cwd), id = this.session_id(this.git(["rev-parse", "--show-toplevel"], cwd), root);
		if (!id) return this.fail(root, "no session for this commit (CLAUDE_CODE_SESSION_ID unset, worktree not in .worktrees.json): no Session trailer", { cwd });
		this.git(["interpret-trailers", "--in-place", "--if-exists", "doNothing", "--trailer", `Session: ${id}`, path.resolve(msgfile)], cwd);
	}

	static async log(){
		const cwd = process.cwd(), top = this.git(["rev-parse", "--show-toplevel"], cwd), root = this.main_root(cwd);
		const hash = this.git(["rev-parse", "HEAD"], cwd);
		const msg = this.git(["log", "-1", "--format=%B"], cwd), tr = /^Session: ([0-9a-f-]{36})$/m.exec(msg)?.[1];
		const id = this.UUID.test(tr ?? "") ? tr : this.session_id(top, root);
		if (!id) return this.fail(root, "commit not recorded: no session (CLAUDE_CODE_SESSION_ID unset, worktree not in .worktrees.json)", { commit: hash, worktree: top });
		const file = this.record_file(root, id);
		if (!file) return this.fail(root, "commit not recorded: the session has no record folder", { commit: hash, session: id });
		const all = this.git(["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", "-m", "--first-parent", "HEAD"], cwd).split("\n").filter(Boolean);
		const line = { commit: hash, files: all.slice(0, this.FILES), branch: this.git(["rev-parse", "--abbrev-ref", "HEAD"], cwd), worktree: top };
		if (all.length > this.FILES) line.files_total = all.length;
		await RecordWriter.write(file, [line], { by: "git-hook", timeout: 3000 });
	}

	static async main([cmd, arg]){
		const timer = setTimeout(() => process.exit(0), this.LIMIT); timer.unref?.();
		try { if (cmd === "trailer") await this.trailer(arg); else if (cmd === "log") await this.log(); }
		catch (e){ try { this.fail(this.main_root(process.cwd()), `CommitLog ${cmd}: ${e.message}`.slice(0, 300)); } catch {} }
		process.exit(0);
	}
}


if (process.argv[1]?.endsWith("CommitLog.mjs")) CommitLog.main(process.argv.slice(2));