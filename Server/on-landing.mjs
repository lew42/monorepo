/* `node Server/on-landing.mjs <task dir>` — runs text-check (walls of text), doc-check
 * (readme/doc/links on every module touched) and layout-check on what a landed task wrote.
 * The ledger hook spawns it (detached) the first time it sees a task with `landed_at`.
 * It reads the latest landing's `outcome`, takes up to 5 site links (paths starting with "/", no
 * images or .md), runs layout-check into <task dir>/layout-check, and appends ONE log line per
 * check to the task's task.jsonl. A dirty doc-check also gets ONE nag line on the task's own
 * card (Servex's `card_reply` tool, over its MCP door); flagged pages from the other checks go
 * to servex-mastermind's task.jsonl. It never throws: any failure becomes one log line, and the
 * exit code is always 0. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { text_flags } from "./text-check.mjs";
import { doc_check } from "./doc-check.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const dir = path.resolve(process.argv[2] || ".");
const task = path.join(dir, "task.jsonl");
const HOST = "http://monorepo.localhost";
const WIDTHS = "1280,1920,2560,3440";

const now = () => {
	const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`;
};
const append = (file, msg) => {
	let lead = "";
	try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.appendFileSync(file, lead + JSON.stringify({ log: { at: now(), msg } }) + "\n");
};
const slug = u => u.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "page";

try {
	const entries = fs.readFileSync(task, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } });
	const landing = entries.filter(e => e.assign?.landed_at).pop()?.assign;
	if (!landing) throw new Error("no landing line in " + task);
	const card = Object.assign({}, ...entries.filter(e => e.assign).map(e => e.assign)).card;
	// the clarity agent (.claude/skills/clarity/): a fresh Sonnet inside Servex, detached so layout-check does not wait
	try { spawn(process.execPath, [path.join(root, "Server/clarity.mjs"), "landing", dir], { detached: true, stdio: "ignore", windowsHide: true }).unref(); } catch {}
	try {
		const tf = text_flags(dir);
		const tm = `text-check: ${tf.length ? tf.join("; ") : "no walls of text"}`;
		append(task, tm);
		const arch = path.join(root, "public/framework/ai", now().slice(0, 10), "servex-mastermind", "task.jsonl");
		if (tf.length && fs.existsSync(arch)) append(arch, `${path.basename(dir)} — ${tm}`);
	} catch {}
	// The doc check (task-loop, 2026-09-28): every module this task touched needs a
	// readme.md, a doc/ and readme links that resolve — CLAUDE.md's own module shape.
	// ONE log line always; when something is missing, ONE nag line on the task's own
	// card too, through Servex's MCP door, so the owner sees it without opening the
	// log. Skipped when the task has no card (a headless run with nobody to nag).
	try {
		const dc = doc_check(dir);
		append(task, dc.line);
		if (dc.dirty.length && card) {
			const text = `Docs missing for ${dc.dirty.map(d => d.module).join(", ")} (no readme / no doc/ / dead links). Please fix before this counts as done.`;
			const port = process.env.SERVEX_PORT || 8090;
			try {
				await fetch(`http://127.0.0.1:${port}/mcp?as=on-landing`, {
					method: "POST", headers: { "content-type": "application/json" },
					body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "card_reply", arguments: { card, from: "on-landing", text } } }),
					signal: AbortSignal.timeout(3000),
				});
			} catch (e) { append(task, "doc-check: card nag not sent — " + String(e && e.message || e).slice(0, 150)); }
		}
	} catch (e) {
		try { append(task, "doc-check: not run — " + String(e && e.message || e).slice(0, 200)); } catch {}
	}
	const paths = [...String(landing.outcome || "").matchAll(/\]\((\/[^)\s]*)\)|(?:^|[\s"'(])(\/[\w./~%-]+)/g)].map(m => m[1] || m[2])
		.map(p => p.split(/[#?]/)[0]).filter(p => p && !/\.(png|jpe?g|gif|webp|svg|md|mp4|json|jsonl)$/i.test(p));
	const out = path.join(dir, "layout-check");
	fs.mkdirSync(out, { recursive: true });
	const urls = [...new Set(paths)].slice(0, 5).map(p => HOST + p);
	if (!urls.length) { append(task, "layout-check: skipped — the landing names no site pages"); process.exit(0); }

	const r = spawnSync(process.execPath, [path.join(root, "Server/layout-check.mjs"), ...urls, "--out", out], { encoding: "utf8", timeout: 300000, windowsHide: true });
	const flags = [];
	for (const u of urls) {
		let j; try { j = JSON.parse(fs.readFileSync(path.join(out, slug(u), "layout.json"), "utf8")); } catch { flags.push(`${u.replace(HOST, "")}: no result`); continue; }
		const bits = [];
		if (j.errors?.length) bits.push("errors");
		if (Object.values(j.widths).some(m => m.overflow_x)) bits.push("overflow_x");
		for (const w of [2560, 3440]) if (j.widths[w]?.empty > 0.6) bits.push(`empty ${j.widths[w].empty} at ${w}`);
		if (j.widths[3440]?.narrow_share > 0.5) bits.push(`narrow_share ${j.widths[3440].narrow_share} at 3440`);
		if (bits.length) flags.push(`${u.replace(HOST, "")}: ${bits.join(", ")}`);
	}
	const msg = `layout-check: ${urls.length} pages at ${WIDTHS.replaceAll(",", "/")} — ${flags.length ? flags.join("; ") : "no flags"}; sheets in layout-check/`;
	append(task, msg);
	if (flags.length) {
		const day = now().slice(0, 10).replaceAll("-", "-");
		const arch = path.join(root, "public/framework/ai", day, "servex-mastermind", "task.jsonl");
		if (fs.existsSync(arch)) append(arch, `${path.basename(dir)} — ${msg}`);
	}
	// The padding law (padding-system, 2026-09-25): nothing a reader looks at sits
	// at 0 from an edge. ONE line; flagged pages also go to servex-mastermind.
	try {
		const { edges } = await import("./padding-check.mjs");
		const pages = urls.map(u => u.replace(HOST, ""));
		const rows = await edges(pages, { base: HOST, widths: [400, 1280, 1920, 3440] });
		const bad = rows.filter(x => x.violations || x.error).map(x => x.error
			? `${x.url} ${x.width ?? ""}: not measured (${String(x.error).slice(0, 80)})`
			: `${x.url} ${x.width}: ${x.violations} at an edge ("${x.worst[0]?.text || ""}")`);
		const pm = `padding-check: ${bad.length ? bad.join("; ") : `${pages.length} pages — clean`}`;
		append(task, pm);
		const arch = path.join(root, "public/framework/ai", now().slice(0, 10), "servex-mastermind", "task.jsonl");
		if (bad.length && fs.existsSync(arch)) append(arch, `${path.basename(dir)} — ${pm}`);
	} catch (e) {
		try { append(task, "padding-check: not run — " + String(e && e.message || e).slice(0, 200)); } catch {}
	}
	if (r.error) append(task, "layout-check: runner problem — " + String(r.error.message).slice(0, 150));
} catch (e) {
	try { append(task, "layout-check: not run — " + String(e && e.message || e).slice(0, 200)); } catch {}
}
process.exit(0);
