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
import { spawnSync, spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { text_flags } from "./text-check.mjs";
import { card_flags } from "./CardCheck.mjs";
import { doc_check } from "./doc-check.mjs";
import { can_stop, entry_for_task_dir } from "./worktree-sweep.mjs";
import TaskDirs from "./TaskDirs.mjs";
import ModuleInbox from "../Servex/agents/ModuleInbox.js";
import Cards from "../Servex/cards/Cards.js";
import SessionRecord from "./SessionRecord.mjs";
import WorktreePreview from "./WorktreePreview.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
// What the AI system mastermind should see goes to its inbox, module_inbox "ai" (2026-10-23; it was servex-mastermind's daily task log,
// which no longer exists, so every line was silently dropped). No `fix`: an inbox line it reads on waking, never a wake by itself.
const to_architect = (dir, msg) => { try { new ModuleInbox("ai").add(`${path.basename(dir)} — ${msg}`, "/" + path.relative(path.join(root, "public"), dir).split(path.sep).join("/") + "/", { from: "on-landing" }); } catch {} };
const dir = path.resolve(process.argv[2] || ".");
const task = SessionRecord.log_or_old(dir);
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
	// the feedback council loop: checks rhythm (10 landings or 24h) and re-runs if due
	try { spawn(process.execPath, [path.join(root, "Server/Council.mjs"), "maybe"], { detached: true, stdio: "ignore", windowsHide: true }).unref(); } catch {}
	try {
		const tf = text_flags(dir);
		const tm = `text-check: ${tf.length ? tf.join("; ") : "no walls of text"}`;
		append(task, tm);
		if (tf.length) to_architect(dir, tm);
	} catch {}
	// The card check (cards-that-show-the-thing, 2026-09-25): checks the card against the card standard
	try {
		if (card) {
			const cardDir = Cards.dir(card, path.join(root, "public/framework/ai"));   // the sessions store, or the old tree (one tree, 2026-10-13)
			const cf = card_flags(cardDir);
			const cm = `card-check: ${cf.length ? cf.join("; ") : "standard passed"}`;
			append(task, cm);
				if (cf.length) to_architect(dir, cm);
		}
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
	// OWNER NOTE (owner-inbox, 2026-10-12): a task that decided things on the owner's behalf (its
	// `decision` lines) tells them ONCE, as one `owner_note` card pinned to the top of the AI Inbox,
	// never in chat. One digest per landing; the same `POST /owner_note` every agent's tool uses.
	try {
		const made = entries.filter(e => e.decision && (e.decision.chose || e.decision.question));
		if (made.length){
			const lines = made.slice(0, 6).map(e => "- " + String(e.decision.chose || e.decision.question).slice(0, 160)
				+ (e.decision.why ? " (" + String(e.decision.why).slice(0, 120) + ")" : "")
				+ (e.decision.options?.length ? "; alternatives: " + [].concat(e.decision.options).filter(o => o !== e.decision.chose).slice(0, 3).join(" / ") : ""));
			const name = path.basename(dir);
			const text = `${name} landed after deciding ${made.length} thing${made.length === 1 ? "" : "s"} for you:\n${lines.join("\n")}`;
			const r = await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/owner_note`, {
				method: "POST", headers: { "content-type": "application/json" },
				body: JSON.stringify({ title: `${name} decided ${made.length} thing${made.length === 1 ? "" : "s"} for you`, text, kind: "decision", by: "on-landing", links: ["/" + path.relative(path.join(root, "public"), dir).split(path.sep).join("/") + "/"] }),
				signal: AbortSignal.timeout(3000),
			});
			append(task, "owner-note: " + (r.ok ? `posted ${made.length} decision${made.length === 1 ? "" : "s"} to the Inbox` : "not posted (HTTP " + r.status + ")"));
		}
	} catch (e) { try { append(task, "owner-note: not posted - " + String(e && e.message || e).slice(0, 150)); } catch {} }
	// Owner-check (session-gate, 2026-10-01): does this LANDED task do what the owner actually
	// asked, item by item — not just match requirements.md's own summary of the ask? Detached,
	// same reason as the clarity agent above: it spawns its own fresh reviewer and can wait
	// several minutes for it, and on-landing's own checks below must not wait on that. It writes
	// its own log line (and a card nag for anything missing) once it finishes, on its own time.
	try { spawn(process.execPath, [path.join(root, "Server/owner-check.mjs"), dir], { detached: true, stdio: "ignore", windowsHide: true }).unref(); }
	catch (e) { try { append(task, "owner-check: not run — " + String(e && e.message || e).slice(0, 200)); } catch {} }
	// Worktree teardown (task-loop, worktree-down, 2026-09-29): a landed task's own private dev
	// server (its task.jsonl line 1 `worktree`) goes down the moment it's actually safe — landed,
	// its branch merged into michael/dev, and nobody still working there. can_stop() in
	// worktree-sweep.mjs is the one place that decides "safe"; sweep() on the loop's own tick
	// catches anything this misses (Servex down right now, a race with a still-running agent). A
	// task built straight in the main tree (no `worktree` on its line 1) has nothing to tear down
	// here — entry is null and this whole block is a no-op.
	try {
		const entry = entry_for_task_dir(dir);
		if (entry) {
			const { ok, reason, why } = await can_stop(entry);
			if (ok) {
				const r = spawnSync(process.execPath, [path.join(root, "Server/worktree-down.mjs"), entry.name], { encoding: "utf8", windowsHide: true });
				append(task, `worktree-down: ${entry.name} - ${(r.stdout || r.stderr || "").trim().split("\n").pop() || (r.status === 0 ? "stopped" : "failed")}`);
			} else {
				append(task, `worktree-down: kept ${entry.name} running - ${why}`);
				// "not-merged" fixes itself once merge.mjs lands the branch — this loop's own next
				// tick sweeps it then, no one needs to act — so only every OTHER reason (still
				// busy, no task found) is worth a line on the card.
				if (card && reason !== "not-merged" && reason !== "pool") {   // a pool slot is handed back by return_worktree; nothing to nag about
					let untracked = "";
					try {
						const st = execFileSync("git", ["-C", entry.path, "status", "--porcelain"], { encoding: "utf8", windowsHide: true });
						const files = st.split("\n").filter(l => l.startsWith("??")).map(l => l.slice(3).trim());
						if (files.length) untracked = ` Untracked in the worktree: ${files.join(", ")}.`;
					} catch {}
					const text = `Worktree ${entry.name} is still running - ${why}.${untracked}`;
					try {
						await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/mcp?as=on-landing`, {
							method: "POST", headers: { "content-type": "application/json" },
							body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "card_reply", arguments: { card, from: "on-landing", text } } }),
							signal: AbortSignal.timeout(3000),
						});
					} catch (e) { append(task, "worktree-down: card nag not sent - " + String(e && e.message || e).slice(0, 150)); }
				}
			}
			// Close the loop (worktree-closure, 2026-10-22): a landed task leaves no folder behind. Leftovers are committed to its
			// branch and the folder goes; unmerged commits become a ready-to-merge line. A live agent still in it keeps it
			// until Servex's Worktrees.js tick (task landed, agent stopped) closes it.
			// HOLD UNTIL MERGE (build F, 2026-10-28): an unmerged branch waits for review, so its folder stays; Servex's
			// Worktrees.js closes it once the branch merges, or after its 48-hour backstop.
			if (/^qf-\d+$/.test(entry.name)) {}   // a pool slot: Pool.js recycles it
			else if (fs.existsSync(entry.path) && !WorktreePreview.merged(entry.path)) append(task, `worktree-close: kept ${entry.name} - ${entry.branch || "its branch"} is not merged yet; it stays until the merge (48-hour backstop)`);
			else {
				const r = spawnSync(process.execPath, [path.join(root, "Server/Worktrees.mjs"), "--apply", "--archive", "--now", "--path", entry.path], { encoding: "utf8", windowsHide: true });
				const out = (r.stdout || r.stderr || "").trim().split("\n").filter(Boolean);
				append(task, `worktree-close: ${entry.name} - ${out.at(-2) || out.at(-1) || "no answer"}`);
			}
		}
	} catch (e) {
		try { append(task, "worktree-down: not run - " + String(e && e.message || e).slice(0, 200)); } catch {}
	}
	// THE PHONE LINK (build F, 2026-10-28): a task that asked for a preview (`{"assign":{"preview":true}}`) and is not merged
	// gets one computed `preview:` line, and Servex runs its clean-up pass now, which binds the worktree's server to the LAN.
	try {
		const pv = WorktreePreview.of_task(dir);
		if (pv && pv.merged !== true) {
			let pass = "";
			try {
				const r = await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/api/worktrees/tick`, { method: "POST", signal: AbortSignal.timeout(60000) });
				const j = await r.json();
				pass = j.lan?.includes(pv.name) ? "; its server is on the LAN" : `; not on the LAN yet (${j.why || "Servex's next pass"})`;
			} catch (e) { pass = "; Servex did not answer, its next pass (within 10 min) binds it"; }
			append(task, pv.url ? `preview: ${pv.url} - open it on your phone over the home Wi-Fi until its branch merges${pass}`
				: `preview: no link - ${pv.why || (pv.port ? "this PC has no private LAN address" : "Servex has not given " + pv.name + " a port yet")}`);
		}
	} catch (e) { try { append(task, "preview: not computed - " + String(e && e.message || e).slice(0, 150)); } catch {} }
	// THE REAPER (lifecycle, 2026-09-29): everything else this task still owns — a server started
	// by hand, its health watcher, headless browsers, idle reviewers and minions — is closed now,
	// in node, instead of trusting an agent to remember. Each close is an end line in Servex's
	// lifecycle.jsonl. Servex/Lifecycle.js; Servex/doc/lifecycle.md.
	try {
		const { default: Lifecycle } = await import("../Servex/Lifecycle.js");
		const rows = await new Lifecycle().reap(dir);
		append(task, `lifecycle: ${rows.length ? `closed ${rows.map(r => `${r.kind} ${r.id}`).join(", ")}` : "nothing of this task's was left running"}`);
	} catch (e) {
		try { append(task, "lifecycle: reap not run - " + String(e && e.message || e).slice(0, 200)); } catch {}
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
		to_architect(dir, msg);
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
		if (bad.length) to_architect(dir, pm);
	} catch (e) {
		try { append(task, "padding-check: not run — " + String(e && e.message || e).slice(0, 200)); } catch {}
	}
	if (r.error) append(task, "layout-check: runner problem — " + String(r.error.message).slice(0, 150));
} catch (e) {
	try { append(task, "layout-check: not run — " + String(e && e.message || e).slice(0, 200)); } catch {}
}
process.exit(0);
