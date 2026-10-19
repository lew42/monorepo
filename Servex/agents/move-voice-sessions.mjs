// Move the flat voice-session files (public/**/ai/v-*.jsonl + .summary.json) into the dated central store.
//   node Servex/agents/move-voice-sessions.mjs                   dry run (default): prints the manifest old -> new
//   node Servex/agents/move-voice-sessions.mjs --apply          git mv every file, rewrite each session's `file` in sessions.json
//   node Servex/agents/move-voice-sessions.mjs --undo <manifest> reverse a manifest
// --apply and --undo refuse while Servex is up (it holds sessions.json in memory and re-saves it). v-timqv56 is always skipped.
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { place } from "../home.js";
import Sessions from "./Sessions.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKIP = new Set(["v-timqv56"]);

export default class MoveVoiceSessions {
	constructor({ repo = REPO, sessions_file = place("sessions.json") } = {}){ Object.assign(this, { repo, sessions_file }); }

	/* Servex owns port 80 (Servex/readme.md); anything listening there means it is up. */
	static up(port = 80){
		return new Promise(res => {
			const c = net.connect({ port, host: "127.0.0.1" }, () => { c.destroy(); res(true); });
			c.on("error", () => res(false));
		});
	}

	rel(abs){ return path.relative(this.repo, abs).split(path.sep).join("/"); }

	find(dir = path.join(this.repo, "public"), out = []){
		for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			if (e.name === "node_modules" || e.name === ".git") continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()) this.find(p, out);
			else if (/^v-[a-z0-9]+\.(summary\.)?(jsonl|json)$/.test(e.name) && path.basename(dir) === "ai" && !e.name.endsWith(".summary.jsonl")) out.push(p);
		}
		return out;
	}

	/* The manifest: [{id, from, to, home, at}] with repo-relative paths, skipping v-timqv56. */
	manifest(map = this.load()){
		const out = [];
		for (const abs of this.find()){
			const id = /^(v-[a-z0-9]+)\./.exec(path.basename(abs))[1];
			if (SKIP.has(id)) continue;
			const s = map[id], home = s?.home ?? "/" + path.relative(path.join(this.repo, "public"), path.dirname(path.dirname(abs))).split(path.sep).join("/") + "/";
			const date = new Date(s?.at ?? fs.statSync(abs).birthtime);
			const to = "public" + Sessions.session_path(home, id, date).replace(/session\.jsonl$/, abs.endsWith(".summary.json") ? "session.summary.json" : "session.jsonl");
			out.push({ id, from: this.rel(abs), to, tracked: !!s });
		}
		return out;
	}

	load(){ try { return JSON.parse(fs.readFileSync(this.sessions_file, "utf8")); } catch { return {}; } }
	git(...a){ return execFileSync("git", a, { cwd: this.repo, windowsHide: true, encoding: "utf8" }); }
	tracked(f){ try { this.git("ls-files", "--error-unmatch", f); return true; } catch { return false; } }

	move(from, to){
		fs.mkdirSync(path.dirname(path.join(this.repo, to)), { recursive: true });
		if (this.tracked(from)) this.git("mv", from, to); else fs.renameSync(path.join(this.repo, from), path.join(this.repo, to));
	}

	apply(manifest){
		const map = this.load(), file = this.manifest_path();
		for (const m of manifest) this.move(m.from, m.to);
		for (const m of manifest) if (map[m.id] && m.to.endsWith("session.jsonl")) map[m.id].file = m.to.replace(/^public/, "");
		fs.writeFileSync(this.sessions_file, JSON.stringify(map, null, 2));
		fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
		return file;
	}

	undo(manifest){
		const map = this.load();
		for (const m of [...manifest].reverse()) this.move(m.to, m.from);
		for (const m of manifest) if (map[m.id] && m.from.endsWith(".jsonl")) map[m.id].file = m.from.replace(/^public/, "");
		fs.writeFileSync(this.sessions_file, JSON.stringify(map, null, 2));
	}

	manifest_path(){ return path.join(this.repo, "Servex", "agents", `move-voice-sessions.${new Date().toISOString().replace(/[:.]/g, "-")}.manifest.json`); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = process.argv.slice(2), mover = new MoveVoiceSessions();
	const undo = arg.indexOf("--undo");
	if ((arg.includes("--apply") || undo >= 0) && await MoveVoiceSessions.up()){
		console.error("refused: Servex is up (port 80); it holds sessions.json in memory and would overwrite the rewrite. Stop it first."); process.exit(1);
	}
	if (undo >= 0){ mover.undo(JSON.parse(fs.readFileSync(arg[undo + 1], "utf8"))); console.log("undone"); }
	else {
		const m = mover.manifest();
		for (const x of m) console.log(`${x.from}  ->  ${x.to}${x.tracked ? "" : "  (not in sessions.json)"}`);
		console.log(`${m.length} file(s)${arg.includes("--apply") ? "" : "  [dry run; --apply to move]"}; skipped: ${[...SKIP].join(", ")}`);
		if (arg.includes("--apply")) console.log("manifest:", mover.apply(m));
	}
}
