/* node Server/ChatToMessages.mjs <session.jsonl …> [--apply]
 *
 * THE LATER MIGRATION (not run yet; the owner, 2026-11-01: no migration until the new list has proven itself). For a session written
 * before the real chat list existed (public/framework/core/Session/Chat/readme.md), it computes the `messages`/`sentences` lines the
 * live writer would have written, from the session's V1 `{chat}` lines, through the SAME code (Servex/agents/ChatWriter.js).
 *
 * - Dry run by default: prints, per file, how many V1 lines it read and how many lines it would append, plus the first few.
 * - `--apply` APPENDS those lines at the end of the file (append-only: no line is rewritten or removed) and records each file in
 *   public/framework/ai/sessions/chat-messages-moves.jsonl ({file, lines, at}), so it can be audited and undone (cut the tail).
 * - A file that already has a `messages` or `sentences` line is skipped: the live writer already keeps it.
 * - What it cannot know: whether the owner was mid-thought when a reply landed, so a reply goes where V1 had it (no holding).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ChatWriter from "../Servex/agents/ChatWriter.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "public/framework/ai/sessions/chat-messages-moves.jsonl");

export default class ChatToMessages {
	/** The lines to append for one file's parsed lines, or null when it already has the list. */
	static plan(lines){
		if (lines.some(l => l && (l.messages || l.sentences))) return null;
		const writer = new ChatWriter({ find_sentence: () => null }), out = [];
		for (const l of lines) if (l?.chat) out.push(...writer.mirror("s", l.chat));
		return out;
	}
	static read(file){
		return fs.readFileSync(file, "utf8").split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } });
	}
	static run(files, { apply = false } = {}){
		for (const file of files){
			const lines = this.read(file), add = this.plan(lines);
			if (!add){ console.log(`${file}: already has the chat list, skipped`); continue; }
			console.log(`${file}: ${lines.filter(l => l?.chat).length} V1 chat lines -> ${add.length} lines to append`);
			for (const l of add.slice(0, 3)) console.log("   ", JSON.stringify(l).slice(0, 160));
			if (!apply || !add.length) continue;
			fs.appendFileSync(file, add.map(l => JSON.stringify(l)).join("\n") + "\n");
			fs.appendFileSync(MANIFEST, JSON.stringify({ file: path.relative(ROOT, file).replaceAll("\\", "/"), lines: add.length, at: new Date().toISOString() }) + "\n");
		}
		if (!apply) console.log("dry run: nothing written (add --apply to append)");
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2), apply = args.includes("--apply"), files = args.filter(a => a !== "--apply");
	if (!files.length){ console.error("usage: node Server/ChatToMessages.mjs <session.jsonl …> [--apply]"); process.exit(1); }
	ChatToMessages.run(files.map(f => path.resolve(f)), { apply });
}
