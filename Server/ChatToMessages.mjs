/* node Server/ChatToMessages.mjs <session.jsonl …> [--apply]
 *
 * THE LATER MIGRATION (not run yet; the owner, 2026-11-01: no migration until the new list has proven itself). For a session written
 * before the real chat list existed (public/framework/core/Session/Chat/readme.md), it computes the `messages`/`sentences` lines the
 * live writer would have written, from the session's V1 `{chat}` lines, through the SAME code (Servex/agents/ChatWriter.js).
 *
 * - Dry run by default: prints, per file, how many V1 lines it read and how many lines it would append, plus the first few.
 * - `--apply` APPENDS those lines at the end of the file (append-only: no line is rewritten or removed) and records each file in
 *   public/framework/ai/sessions/chat-messages-moves.jsonl ({file, lines, at}), so it can be audited and undone (cut the tail).
 * - A partly mirrored file is FILLED: only the missing messages are added, each `after` the message of the chat line before it, with no twins; a mirrored sentence missing `said_at` gets it set in place.
 * - What it cannot know: whether the owner was mid-thought when a reply landed, so a reply goes where V1 had it (no holding).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ChatWriter from "../Servex/agents/ChatWriter.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "public/framework/ai/sessions/chat-messages-moves.jsonl");

export default class ChatToMessages {
	/** The lines to append for one file's parsed lines (V1 `{chat}` lines, plus whatever of the list is already there). Every
	 * unmirrored chat line gets its mirror, placed `after` the message of the chat line before it, so a hole in the middle or at the
	 * front fills in its own place and never twins a line that is there. A sentence already mirrored that lacks the V1 line's
	 * `said_at` gets it set in place. Nothing mirrored yet gives the plain append the live writer would have made. Returns [] when
	 * the list is complete. */
	static plan(lines){
		const have_msg = new Map(), have_said = new Set();   // at -> message id (a sentence's Prompt) / reply id
		const sentence_id_at = new Map(), said_ids = new Set();
		for (const l of lines){
			if (!l) continue;
			const ss = l.sentences?.add; if (ss?.at) sentence_id_at.set(ss.id, ss);
			if (ss?.said_at) have_said.add(ss.at);
			for (const [id, ch] of Object.entries(l.sentences ?? {})) if (id !== "add" && ch?.said_at) said_ids.add(id);
			const add = l.messages?.add;
			if (add?.type === "Prompt") for (const sid of add.sentences ?? []) { const x = sentence_id_at.get(sid); if (x) have_msg.set(x.at, add.id); }
			else if (add && add.at && add.type !== "Ref") have_msg.set(add.at, add.id);
			for (const [id, ch] of Object.entries(l.messages ?? {})) {
				if (id === "add" || !ch?.sentences?.push) continue;
				for (const sid of [].concat(ch.sentences.push)) { const x = sentence_id_at.get(sid); if (x) have_msg.set(x.at, id); }
			}
		}
		const chats = lines.filter(l => l?.chat).map(l => l.chat);
		const last_have = chats.reduce((n, c, i) => have_msg.has(c.at) ? i : n, -1);
		const writer = new ChatWriter({ find_sentence: () => null }), out = [];
		for (const l of lines) for (const id of [l?.sentences?.add?.id, l?.messages?.add?.id]) { const m = /^([sm])-(\d+)$/.exec(id ?? ""); if (m) writer.last_ms.set(m[1], Math.max(writer.last_ms.get(m[1]) ?? 0, +m[2])); }   // new ids never collide with old ones
		let prev = null;   // id of the message the previous chat line lives in
		chats.forEach((c, i) => {
			const known = have_msg.get(c.at);
			if (known){
				const st = writer.state("s"); st.open = null; st.last = known; prev = known;
				if (c.said_at && c.from?.kind === "owner" && !have_said.has(c.at)){
					const sid = [...sentence_id_at.values()].find(x => x.at === c.at)?.id;
					if (sid && !said_ids.has(sid)) out.push({ sentences: { [sid]: { said_at: c.said_at } }, by: "servex", ts: new Date().toISOString() });
				}
				return;
			}
			for (const l of writer.mirror("s", c)){
				const add = l.messages?.add, grow = Object.keys(l.messages ?? {}).find(k => k !== "add");
				if (add && i < last_have) add.after = prev;
				if (add) prev = add.id; else if (grow) prev = grow;
				out.push(l);
			}
		});
		// The fast seat's {place} improves: the cleaned text lands as that sentence's `clean`, in place, if the file does not say so yet.
		const sid_of = new Map([...sentence_id_at.values()].map(x => [x.at, x.id])), mid_of = new Map(have_msg);
		for (const l of out){ const ss = l.sentences?.add; if (ss?.at) sid_of.set(ss.at, ss.id); const add = l.messages?.add;
			if (add?.type === "Prompt") for (const sid of add.sentences) mid_of.set([...sid_of].find(([, v]) => v === sid)?.[0], add.id);
			for (const [id, ch] of Object.entries(l.messages ?? {})) if (id !== "add" && ch?.sentences?.push) mid_of.set([...sid_of].find(([, v]) => v === ch.sentences.push)?.[0], id); }
		const clean_now = new Map();
		for (const l of lines) for (const ch of Object.values(l?.messages ?? {})) for (const [sid, t] of Object.entries(ch?.clean ?? {})) clean_now.set(sid, t);
		for (const l of lines){
			const p = l?.place; if (!p || !["improve", "both"].includes(p.edit) || !String(p.text ?? "").trim() || !p.re) continue;
			const sid = sid_of.get(p.re), mid = mid_of.get(p.re);
			if (!sid || !mid || clean_now.get(sid) === String(p.text)) continue;
			clean_now.set(sid, String(p.text));
			out.push({ ...ChatWriter.clean_line(mid, sid, p.text), by: "servex", ts: new Date().toISOString() });
		}
		return out;
	}
	static read(file){
		return fs.readFileSync(file, "utf8").split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } });
	}
	static run(files, { apply = false } = {}){
		for (const file of files){
			const lines = this.read(file), add = this.plan(lines);
			if (!add.length){ console.log(`${file}: the chat list is complete, nothing to add`); continue; }
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
