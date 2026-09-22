import { Page, div, p, span, b, a, md } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary
                page grid: main for prose, wide for the two flip cards.
   2 SIZE       two flip cards at 1 1 22em wrap to 2 / 1 columns; a compact list
                for the rest, no wrapping needed.
   3 OWN LAYOUT prose, one two-card wall, one plain list. Nothing else.
   4 REGIONS    none.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN, mostly above the fold: the headline, then the two disagreements
     (biggest news first), then the rest as one line each. The evidence, the file
     lines and the exact commands run all live in verify.jsonl and this task's
     own task.jsonl — never repeated here.
   ⚠ No template literals in this file — plain "…" strings, so a stray backtick
     can never end one early (the exact bug that blanked the site twice today). */

const VERDICT = {
	done: { word: "done", color: "var(--ok, #2e7d32)" },
	partly: { word: "partly", color: "var(--warn, #b26a00)" },
	differs: { word: "differs", color: "var(--warn, #b26a00)" },
	not: { word: "not done", color: "var(--bad, #b3261e)" },
};

function badge(v) {
	const info = VERDICT[v] || { word: v, color: "var(--muted)" };
	return span.c("h6", info.word).style({ color: info.color, fontWeight: 700, textTransform: "uppercase" });
}

/* The rest of the ten, already agreeing with the earlier audit's verdict —
   compact, one line each, task-owner's own outcome text is where the detail is. */
const AGREES = [
	["reload-on-load", "done", "Pages reload after loading — fixed. The mtime-check code is real and the live port-80 server is already running it.", "/framework/ai/2026-09-19/server-self/"],
	["reload-hold", "differs", "The hold command shipped, in CLAUDE.md, exactly as asked. Hot reload for JS was not looked into — only confirmed CSS already hot-swaps.", "/framework/ai/2026-09-19/reload-hold/"],
	["site-down-audit", "partly", "The fix (boot-test before swap) is real and proven, but it only guards backend code — a THIRD same-day outage, from a bad frontend import, happened after this fix landed.", "/framework/ai/2026-09-19/incident-site-down/"],
	["fps-meter", "partly", "The meter was never built (checked the dev bar's own code) — and the audit's own citation names a task dir, fps-meter, that does not exist; the real work is under padding-audit.", "/framework/ai/2026-09-19/padding-audit/"],
	["worktrees-and-cache", "done", "Loaded the live page myself: it renders fully now, matching its own numbers.", "/framework/ai/2026-09-19/worktree-study/"],
	["change-shots", "done", "A real proposal card sits on the v3 board, four parts, waiting on one word. Its first part leans on the page-health watcher, which is currently dead — see below.", "/framework/ai/v/3/"],
	["servex", "done", "A real decision, with the submodule commit hashes checked. One loose end from the study — an idle pm2 daemon — is still running.", "/framework/ai/2026-09-19/servex-study/"],
	["never-break-the-page", "partly", "The alarm and the auditor skill are both real. The site still blanked a third time after both landed, so the system catches breakage fast — it still does not prevent it.", "/framework/ai/2026-09-19/mistake-audit/"],
];

export default new Page({
	meta: import.meta,
	title: "Server, verified again",
	description: "A second, harder look at the 10 server-and-reliability requests — two graded done turned out to be only partly true right now.",
	icon: "fact_check",

	content() {

		p(b("Seven of the ten hold up. Two graded "), badge("done"), b(" turned out to be only "), badge("partly"), b(" true right now, and one row's own citation pointed at a task that does not exist."), " The two flips below are both the same shape: a real, working piece of engineering, described in the present tense as if it were still running — and when checked live, right now, it was not.");

		this.flips();

		p.c("h4", "The rest, checked and agreeing with the earlier audit's verdict — one line each:");
		this.list();

		p.c("muted", "Every verdict, its evidence and the exact commands run: ", a("verify.jsonl").href("/framework/ai/2026-09-19/verify-server/verify.jsonl"), ". Findings and the full trail: this task's own log.");
	},

	flips() {
		return div.c("grid auto gap", () => {
			this.flip("server-self", "done → partly",
				"\"The mastermind runs its own dev server on port 8123\" is written in the present tense. It is not true right now.",
				"Checked live: curl to 127.0.0.1:8123 refuses the connection, and netstat shows no listener on port 8123 at all. The self-restarting supervisor code is real and well proven — but five separate node server.js processes are currently sitting idle with no live child and no port, and the one that mattered is down.",
				"/framework/ai/2026-09-19/server-self/");
			this.flip("page-health", "done → partly",
				"The console-flood fix is real. The \"hidden browser watches every page\" half is not currently running.",
				"Server/health.mjs's own lock file names a process (PID 32096) that no longer exists — the watcher died and, unlike the server's own supervisor, nothing brings it back. Its default check target is the same port 8123 that is also down. Its findings page has no link from anywhere else in the site. A real ~80-second whole-site outage happened after this watcher's last log line, consistent with it already being dead when that hit.",
				"/framework/ai/2026-09-19/page-health/");
		}).style({ "--column": "22rem" }).ac("wide");
	},

	flip(id, headline, why, detail, url) {
		return div.c("surface pad flex v gap-25", () => {
			span.c("h4 muted", id);
			p.c("h4", headline);
			p(b(why));
			p.c("muted", detail);
			a("the task this came from →").href(url);
		});
	},

	list() {
		return div.c("grid gap-25", () => {
			AGREES.forEach(([id, verdict, line, url]) => {
				badge(verdict);
				p(b(id), " — ", line, " ", a("source →").href(url));
			});
		}).style({ gridTemplateColumns: "6.5rem 1fr" }).ac("wide");
	},
});
