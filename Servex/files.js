/* File and shell tools: read_file, write_file, edit_file, list_dir, glob, shell. No lockdown (the owner accepted it);
 * the remote door is already behind its bearer token. Paths resolve against `root` (default: the monorepo; a worktree
 * name like "remote-tools" or a full path). Detail: ext/remote/doc/remote-tools.md. */
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const MAIN = "C:/Code/lew42/monorepo";
const WORKTREES = "C:/Code/lew42/worktrees";
const json = v => JSON.stringify(v, null, 2);
const MAX = 200_000;   // chars returned per read/stdout, so one call cannot flood the model

export default class FileTools {
	static root_of(root){
		if (!root) return MAIN;
		return path.isAbsolute(root) ? path.resolve(root) : path.join(WORKTREES, root);
	}
	static abs(root, p){ return path.resolve(FileTools.root_of(root), String(p ?? ".")); }

	// .jsonl goes through the validating append hook, never a rewrite (live pages tail these files)
	static refuse_jsonl(file){
		return /\.jsonl$/i.test(file)
			? { ok: false, why: "a .jsonl file is append-only and validated: write lines to a temp .json array and run `node .claude/hooks/append.mjs <target.jsonl> <lines.json>` with the shell tool (or use page_add / append_log)." }
			: null;
	}

	static glob_to_re(g){
		let re = "";
		for (let i = 0; i < g.length; i++){
			const c = g[i];
			if (c === "*"){ if (g[i + 1] === "*"){ i++; if (g[i + 1] === "/") i++; re += ".*"; } else re += "[^/]*"; }
			else if (c === "?") re += "[^/]";
			else re += c.replace(/[.+^${}()|[\]\\]/g, m => "\\" + m);
		}
		return new RegExp("^" + re + "$");
	}

	static walk(dir, base, out, re, limit){
		for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			if (out.length >= limit) return;
			if (e.name === "node_modules" || e.name === ".git") continue;
			const full = path.join(dir, e.name), rel = path.relative(base, full).split(path.sep).join("/");
			if (re.test(rel)) out.push(rel + (e.isDirectory() ? "/" : ""));
			if (e.isDirectory()) FileTools.walk(full, base, out, re, limit);
		}
	}

	static run(shell, command, cwd, timeout_ms){
		return new Promise(resolve => {
			const exe = shell === "powershell" ? ["powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command]]
				: ["bash", ["-c", command]];
			const child = spawn(exe[0], exe[1], { cwd, windowsHide: true });
			let stdout = "", stderr = "", timed_out = false;
			const timer = setTimeout(() => { timed_out = true; spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]); }, timeout_ms);
			child.stdout.on("data", d => { if (stdout.length < MAX) stdout += d; });
			child.stderr.on("data", d => { if (stderr.length < MAX) stderr += d; });
			child.on("error", e => { clearTimeout(timer); resolve({ ok: false, why: e.message }); });
			child.on("close", code => { clearTimeout(timer); resolve({ ok: !timed_out && code === 0, exit_code: code, timed_out, stdout: stdout.slice(0, MAX), stderr: stderr.slice(0, MAX) }); });
		});
	}

	static tools(){
		const R = { type: "string", description: "Tree root: a worktree name (like remote-tools), a full path, or omit for the main monorepo." };
		const P = { type: "string", description: "File path, relative to the root (or absolute)." };
		const tool = (name, description, properties, required, run) => ({
			name, description, inputSchema: { type: "object", required, properties: { root: R, ...properties } },
			handler: async (args = {}) => { try { return json(await run(args)); } catch (e) { return json({ ok: false, why: e.message }); } },
		});
		return [
			tool("read_file", "Read a text file (up to 200k chars). Optional offset/limit are line numbers.", { path: P, offset: { type: "number" }, limit: { type: "number" } }, ["path"], a => {
				let text = fs.readFileSync(FileTools.abs(a.root, a.path), "utf8");
				if (a.offset || a.limit){ const lines = text.split("\n"); text = lines.slice(a.offset ?? 0, a.limit ? (a.offset ?? 0) + a.limit : undefined).join("\n"); }
				return { ok: true, truncated: text.length > MAX, text: text.slice(0, MAX) };
			}),
			tool("write_file", "Write (create or overwrite) a text file, making parent folders. A .jsonl target is refused with a pointer to the append hook.", { path: P, content: { type: "string" } }, ["path", "content"], a => {
				const file = FileTools.abs(a.root, a.path);
				const no = FileTools.refuse_jsonl(file); if (no) return no;
				fs.mkdirSync(path.dirname(file), { recursive: true });
				fs.writeFileSync(file, a.content);
				return { ok: true, path: file, bytes: Buffer.byteLength(a.content) };
			}),
			tool("edit_file", "Replace one exact string in a file. Fails if old_string is missing or not unique (unless replace_all).", { path: P, old_string: { type: "string" }, new_string: { type: "string" }, replace_all: { type: "boolean" } }, ["path", "old_string", "new_string"], a => {
				const file = FileTools.abs(a.root, a.path);
				const no = FileTools.refuse_jsonl(file); if (no) return no;
				const text = fs.readFileSync(file, "utf8");
				const count = text.split(a.old_string).length - 1;
				if (!a.old_string || !count) return { ok: false, why: "old_string not found" };
				if (count > 1 && !a.replace_all) return { ok: false, why: `old_string appears ${count} times; add context or set replace_all` };
				fs.writeFileSync(file, text.split(a.old_string).join(a.new_string));
				return { ok: true, replaced: a.replace_all ? count : 1 };
			}),
			tool("list_dir", "List a folder's entries (folders end in /).", { path: { ...P, description: "Folder, relative to the root; default the root itself." } }, [], a =>
				({ ok: true, entries: fs.readdirSync(FileTools.abs(a.root, a.path), { withFileTypes: true }).map(e => e.name + (e.isDirectory() ? "/" : "")) })),
			tool("glob", "Find paths matching a glob (** * ?) under the root, skipping node_modules and .git. Max 500.", { pattern: { type: "string", description: "like public/framework/**/readme.md" }, path: { ...P, description: "Folder to search in; default the root." } }, ["pattern"], a => {
				const base = FileTools.abs(a.root, a.path), out = [];
				FileTools.walk(base, base, out, FileTools.glob_to_re(a.pattern), 500);
				return { ok: true, matches: out };
			}),
			tool("shell", "Run a command and return stdout, stderr and the exit code. shell is bash (Git Bash, default) or powershell. cwd defaults to the root. Timeout default 60s, max 600s.", { command: { type: "string" }, shell: { type: "string", enum: ["bash", "powershell"] }, cwd: { type: "string", description: "Folder, relative to the root." }, timeout_s: { type: "number" } }, ["command"], a =>
				FileTools.run(a.shell, a.command, FileTools.abs(a.root, a.cwd), Math.min(a.timeout_s ?? 60, 600) * 1000)),
		];
	}
}
