import { Page, md, div, p, span, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board, same shape as
                this dir's sibling study reports today (worktree-study).
   2 SIZE       prose at --measure; the five-card wall and the small table need
                the room, so both claim wide.
   3 OWN LAYOUT prose, one five-card wall, one decision-lines list, one table.
   4 REGIONS    none.  5 PREVIEW  core's default card on the day board.

   ⚠ ONE SCREEN: the decision in a sentence, the five answers as cards, the
     PM2 verdict as a table. The evidence (file/line, commit hashes, the exact
     trace of what node index.js would hit) lives in this task's log, not here.
   ⚠ No template literals anywhere in this file - plain "…" strings with \n. */

const CARDS = [
	{
		n: "1",
		head: "What Servex is: a local dev-server manager, three months stale",
		what: "One long-lived Node process: a reverse proxy on port 80 routes *.localhost hostnames to a project's own port, a JSON file keeps that port stable across restarts, a one-level scan of C:/Code auto-detects any folder with a package.json, and PM2 starts/stops each one and pushes live status to a browser dashboard. Visiting a stopped project's URL auto-starts it.",
		why: "It never left MVP: no CLI, no global install, no config for the scan root - its own docs call these 'known blockers before this can be packaged.'",
	},
	{
		n: "2",
		head: "Structure: a real, live submodule - frozen the day it was forked",
		what: "Server/ is genuinely pinned by .gitmodules to mikelew42/Server at one commit (092b23d, 2026-06-22), not a copy. This repo's own Server.js is byte-identical to that exact commit: this repo's Server/ started as a fork of that same point, then was decoupled and kept growing - 6 more top-level files and 9 more plugins that Servex has never seen.",
		why: "Servex's last real commit is 932cd82, 2026-06-23 - three months and an entire supervisor generation behind.",
	},
	{
		n: "3",
		head: "Would it work today: boots, probably - collides with the server it would manage",
		what: "Dependencies are actually installed and PM2 is present on this machine, so node index.js would likely still construct. But its reverse proxy hard-binds port 80, exactly what this repo's own dev server already owns, so the two cannot run together. Its directory scan is also only one level deep, so it would not even discover this repo (nested at C:/Code/lew42/monorepo) without editing.",
		why: "Traced by reading the code only - nothing was started to check this.",
	},
	{
		n: "4",
		head: "Overlap: most of what Servex wanted, this repo already built better",
		what: "Crash-restart: the supervisor already respawns a dead child AND boot-tests a replacement on a spare port before ever touching the live one - PM2 only gives the blind half. Reload-pausing and page-health checks after a risky edit: nothing like either existed in Servex. A private instance per project: PORT=81xx node server.js already gives it, by hand instead of a directory scan.",
		why: "Genuinely missing: a place that lists every running private server, its port, PID and uptime - today that's only netstat or Get-Process, by hand.",
	},
	{
		n: "5",
		head: "The decision: rewrite small, no new dependency",
		what: "Each server.js writes one line about itself - name, port, pid, started_at - into a small gitignored file the moment it starts listening, the same trick this repo's reload-hold already uses, and drops its line on a clean exit. A second small script reads that file: node Server/servers.mjs prints a table; node Server/servers.mjs stop <port> sends the signal.",
		why: "No env var beyond the PORT already in use, no global install, no npx, no new package - matches 'start it and it runs on its own' exactly.",
	},
];

const PM2_FEATURES = [
	["Restart on crash", "already have it, and better - boot-tested before the swap, not a blind restart into a broken build"],
	["Start at login / survive a reboot", "genuinely missing - but that's an OS integration (Task Scheduler / Startup folder), not something a small script alone gives"],
	["Per-process log files", "missing today (console only) - worth adding, a dozen lines beside the new registry file, no new dependency"],
];

export default new Page({
	meta: import.meta,
	title: "Servex study",
	description: "What the separate Servex repo is, why it's three months stale, and the decision: rewrite a small self-registering server list inside this repo instead of moving Servex in.",
	icon: "dns",

	content(){

		p(b("Decision: rewrite small, inside this repo."), " A tiny self-registering server list - not Servex's code, not PM2 - because this repo's own supervisor already out-does PM2's crash-restart, and Servex's reverse proxy would collide with the port this repo's dev server already owns.");

		this.wall();

		md("### PM2 - what's actually worth having\n\n| feature | verdict |\n| --- | --- |\n" + PM2_FEATURES.map(r => "| " + r[0] + " | " + r[1] + " |").join("\n")).ac("wide");

		p.c("muted", "One thing to know: the read-only check `pm2 -v` (as instructed) silently spawned an idle PM2 background daemon as a side effect - it manages nothing, and two cleanup attempts were both blocked by this session's own permission system. `pm2 kill` clears it whenever convenient; it never touched ports 80 or 8123.");

		p.c("muted", "Full evidence - commit hashes, file-by-file diffs, the exact trace of what node index.js would hit - is in this task's log.");
	},

	wall(){
		return div.c("grid auto gap", () => {
			CARDS.forEach(c => { this.card(c); });
		}).style({ "--column": "18rem" }).ac("wide");
	},

	card(c){
		return div.c("surface pad flex v gap-25", () => {
			span.c("h4 muted", "Point " + c.n);
			p.c("h4", c.head);
			p(c.what);
			p.c("muted", c.why);
		});
	},
});
