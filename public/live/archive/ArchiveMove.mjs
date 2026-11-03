// Moves the /live feed into /live/archive/ and starts /live over with three view cards. Doc: public/live/archive/readme.md
//   node public/live/archive/ArchiveMove.mjs --plan     (default) what would move; writes nothing
//   node public/live/archive/ArchiveMove.mjs --apply    copy page.jsonl to archive/page.jsonl byte for byte, then APPEND to page.jsonl
//   node public/live/archive/ArchiveMove.mjs --undo     APPEND the archived cards back to /live (the archive stays)
// Never deletes or rewrites a line: /live's log only grows, so git and the file itself are the history.
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export default class ArchiveMove {
	static EDITABLE = ["text", "title", "type", "preview", "live"];   // the fields Live.js lets a bare `{<id>:{…}}` line edit

	constructor(dir = join(dirname(fileURLToPath(import.meta.url)), "..")) {
		this.live = join(dir, "page.jsonl");
		this.archive = join(dir, "archive", "page.jsonl");
		this.manifest = join(dir, "archive", "manifest.json");
	}

	// The cards on screen after these lines: Live.js's own fold (add, edit by id, remove, clear), in the order added.
	static fold(lines) {
		let items = new Map();
		for (const line of lines) {
			const entry = JSON.parse(line), c = entry.content;
			if (c?.clear) items = new Map();
			if (c?.add) items.set(c.add.id ?? `i${items.size}`, { ...c.add, by: c.by ?? c.add.by, ts: c.ts ?? c.add.ts });
			if (typeof c?.remove === "string") items.delete(c.remove);
			for (const [k, v] of Object.entries(entry))
				if (k !== "content" && items.has(k) && v && typeof v === "object")
					items.set(k, { ...items.get(k), ...Object.fromEntries(this.EDITABLE.filter(f => v[f] !== undefined).map(f => [f, v[f]])) });
		}
		return [...items.values()];
	}

	read() {
		const text = readFileSync(this.live, "utf8"), end = text.lastIndexOf("\n") + 1;   // whole lines only
		const bytes = text.slice(0, end);
		return { bytes, lines: bytes.split("\n").filter(Boolean), sha: createHash("sha256").update(bytes).digest("hex") };
	}

	plan() {
		const { lines, bytes } = this.read(), cards = this.constructor.fold(lines);
		return { lines: lines.length, bytes: Buffer.byteLength(bytes), cards: cards.map(c => `${c.id} (${c.type})`) };
	}

	apply(at = new Date().toISOString()) {
		if (existsSync(this.archive)) throw new Error("archive/page.jsonl exists: already moved (--undo to bring cards back)");
		const { bytes, lines, sha } = this.read(), cards = this.constructor.fold(lines);
		const by = "mastermind-checkup-live", add = (id, o) => JSON.stringify({ content: { add: { type: "part-card", id, ...o, by, ts: at } } }) + "\n";
		writeFileSync(this.archive, bytes);   // byte for byte
		appendFileSync(this.archive, add("archive-about", { title: "About this archive", preview: "About this archive",
			text: `Everything that was on [/live/](/live/) until ${at.slice(0, 16).replace("T", " ")} UTC, copied byte for byte from \`page.jsonl\` (${lines.length} lines, sha256 \`${sha.slice(0, 12)}\`). ${cards.length} cards: open one to read it as it was. The record is [manifest.json](/framework/files/?path=live/archive/manifest.json); [readme](/framework/files/?path=live/archive/readme.md) says how to undo.` }));
		writeFileSync(this.manifest, JSON.stringify({ at, by, source: "public/live/page.jsonl", copied_to: "public/live/archive/page.jsonl", lines: lines.length, bytes: Buffer.byteLength(bytes), sha256: sha, cards: cards.map(c => ({ id: c.id, type: c.type, title: c.title })), undo: "node public/live/archive/ArchiveMove.mjs --undo" }, null, "\t") + "\n");
		appendFileSync(this.live, JSON.stringify({ content: { clear: true, by, ts: at } }) + "\n"
			+ add("archive", { title: "Archive", preview: "Archive", text: "The cards that were here are kept at [/live/archive/](/live/archive/)." })
			+ JSON.stringify({ content: { add: { type: "part-live", live: "tasks", id: "tasks", title: "Tasks", preview: "Tasks", by, ts: at } } }) + "\n"
			+ JSON.stringify({ content: { add: { type: "part-live", live: "now", id: "now", title: "Now", preview: "Now", text: "In flight, last landed and waiting, read from the session index and task logs.", by, ts: at } } }) + "\n");
		return this.manifest;
	}

	undo(at = new Date().toISOString()) {
		const old = JSON.parse(readFileSync(this.manifest, "utf8")), lines = readFileSync(this.archive, "utf8").split("\n").filter(Boolean).slice(0, old.lines);
		const back = this.constructor.fold(lines).map(c => JSON.stringify({ content: { add: c } }) + "\n").join("");
		appendFileSync(this.live, JSON.stringify({ content: { clear: true, by: "mastermind-checkup-live", ts: at } }) + "\n" + back);
		return old.cards.length;
	}
}

if (import.meta.url === `file:///${process.argv[1]?.replaceAll("\\", "/")}` || process.argv[1]?.endsWith("ArchiveMove.mjs")) {
	const move = new ArchiveMove(), flag = process.argv[2] ?? "--plan";
	if (flag === "--apply") console.log("moved; manifest", move.apply());
	else if (flag === "--undo") console.log("restored", move.undo(), "cards to /live");
	else console.log(JSON.stringify(move.plan(), null, 2));
}
