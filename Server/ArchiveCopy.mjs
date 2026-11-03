#!/usr/bin/env node
// Second copy of the archived session pictures on Cloudflare R2. Doc: public/framework/ai/sessions/doc/picture-archive.md
//   node Server/ArchiveCopy.mjs --plan  [--months 08,09]   what would upload / is already there / bytes / ops / cost
//   node Server/ArchiveCopy.mjs --apply [--cap 10000]      upload (refuses past the cap), log every 100 files, append to archive-r2.jsonl
// Flags: --bucket lew42-archive  --src E:/Projects/lew42/archive  --log <task.jsonl>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Cloudflare from "./Cloudflare.mjs";

export default class ArchiveCopy {
	// R2 prices (ai/doc/cloudflare.md): 10 GB stored free, then $0.015/GB-month; writes $4.50 per million, 1M free
	static GB_MONTH = 0.015; static FREE_GB = 10; static WRITE_PER_M = 4.5; static FREE_WRITES = 1e6;
	static TYPES = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

	constructor({ r2, bucket = "lew42-archive", src = "E:/Projects/lew42/archive", year = "2026", months = ["08", "09"], log } = {}) {
		Object.assign(this, { r2, bucket, src: path.resolve(src), year, months, log });
	}

	key(m, p) { return `sessions/${this.year}/${m}/${p}`; }
	monthFile(m, name) { return path.join(this.src, "sessions", this.year, m, name); }

	manifest(m) {
		return fs.readFileSync(this.monthFile(m, "archive.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((e) => e.path && e.sha1);
	}

	// existing = Map key -> size from one list per month; present files are head-checked for their sha1
	async plan() {
		const todo = [], have = [];
		let reachable = true, why = "";
		for (const m of this.months) {
			let there = new Map();
			try { there = new Map((await this.r2.list(this.bucket, `sessions/${this.year}/${m}/`)).map((o) => [o.key, o.size])); }
			catch (e) { reachable = false; why = e.message; }
			for (const e of this.manifest(m)) {
				const key = this.key(m, e.path), item = { ...e, month: m, key };
				if (there.get(key) === e.bytes && (await this.r2.head(this.bucket, key))?.meta.sha1 === e.sha1) have.push(item); else todo.push(item);
			}
		}
		const bytes = todo.reduce((s, e) => s + e.bytes, 0), all = todo.concat(have).reduce((s, e) => s + e.bytes, 0);
		const C = ArchiveCopy;
		const storage = Math.max(0, all / 1e9 - C.FREE_GB) * C.GB_MONTH, writes = Math.max(0, todo.length - C.FREE_WRITES) / 1e6 * C.WRITE_PER_M;
		return { todo, have, bytes, ops: todo.length, reachable, why, monthly: storage, once: writes };
	}

	async apply(plan, cap) {
		if (!plan.reachable) throw new Error(`bucket unreachable, nothing uploaded: ${plan.why}`);
		if (plan.todo.length > cap) throw new Error(`plan wants ${plan.todo.length} writes, over the cap of ${cap}: nothing uploaded; raise with --cap`);
		let n = 0;
		for (const e of plan.todo) {
			const file = path.join(this.src, "sessions", this.year, e.month, e.path);
			const buf = fs.readFileSync(file);
			await this.r2.put(this.bucket, e.key, buf, ArchiveCopy.TYPES[path.extname(file).slice(1).toLowerCase()], { sha1: e.sha1 });
			fs.appendFileSync(this.monthFile(e.month, "archive-r2.jsonl"), JSON.stringify({ path: e.path, r2: e.key, at: new Date().toISOString() }) + "\n");
			if (++n % 100 === 0) this.note(`r2: uploaded ${n}/${plan.todo.length}`);
		}
		this.note(`r2: uploaded ${n} files`);
		return n;
	}

	note(text) { console.log(text); if (this.log) fs.appendFileSync(this.log, JSON.stringify({ log: text, at: new Date().toISOString() }) + "\n"); }

	static async main(argv) {
		const arg = (f, d) => { const i = argv.indexOf(f); return i > -1 ? argv[i + 1] : d; };
		const cap = +arg("--cap", 10000);
		const c = new ArchiveCopy({ r2: Cloudflare.r2({ cap }), bucket: arg("--bucket", "lew42-archive"), src: arg("--src", "E:/Projects/lew42/archive"), months: arg("--months", "08,09").split(","), log: arg("--log") });
		const p = await c.plan();
		const mb = (b) => (b / 1e6).toFixed(1) + " MB";
		console.log(`to upload ${p.todo.length} (${mb(p.bytes)}), already there ${p.have.length}, writes ${p.ops} (cap ${cap}), bucket ${p.reachable ? "reachable" : "UNREACHABLE: " + p.why}`);
		console.log(`cost: $${p.once.toFixed(2)} once for writes, $${p.monthly.toFixed(2)} a month storage (inside the free tier below ${ArchiveCopy.FREE_GB} GB / ${ArchiveCopy.FREE_WRITES} writes)`);
		if (argv.includes("--apply")) await c.apply(p, cap);
		else if (!argv.includes("--plan")) console.log("add --plan (default view) or --apply");
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) ArchiveCopy.main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
