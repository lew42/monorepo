import { Page, div, p, span, b, a, code, img, pre } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in the day's board — the ordinary `main` column.
   2 SIZE       one screen: two sentences, a live "is it up" line, the picture,
                the parts as five one-liners, the way in. The picture is the
                widest thing and rides the column; everything else is prose.
   3 OWN LAYOUT `.flow` for the prose; the parts are a stack of one-liners
                (`flex v gap-25`), not cards — each is one line, and five cards
                would be five boxes saying almost nothing.
   4 REGIONS    three: what it is (with the picture), the parts, the way in.
   5 PREVIEW    the day board's own card; one line is enough. */

const SHOT = new URL("shots/dashboard-live.png", import.meta.url).pathname;

/* Servex's log door is the one route that answers a cross-origin browser, so it
 * is also how this page asks "are you up?" — the last `servex` line says when it
 * last started. Nothing else here needs Servex to be running. */
const UP = "http://127.0.0.1:8090/log/servex?n=1";

const PARTS = [
	["Agents", "Every live Claude session, held in one Map inside the process. Spawn one, talk to it mid-answer, interrupt it, stop it — all five are MCP tools, so any Claude session can steer an agent it did not start. An agent can now hire agents of its own."],
	["The log", "One writer for every log file on this machine. Two things appending at once can never tear a line, because only Servex ever opens the file — everything else posts a line to it."],
	["MCP", "One door at /mcp that every Claude session connects to, with ten tools on it: six for the servers, four (well, five) for the agents."],
	["Servers", "One supervised child per dev server, restarted on a crash with a doubling backoff. Whisper is one of these. A Claude session never starts a dev server itself — it asks Servex to."],
	["The proxy", "<name>.localhost:8080 reaches any project, and starts it if it is not running. A name keeps its port forever, so a project's cookies survive a restart."],
];

const URLS = [
	["http://127.0.0.1:8090/", "the dashboard — every project, every agent, live"],
	["http://<name>.localhost:8080/", "any project, through the proxy; visiting a stopped one starts it"],
	["http://127.0.0.1:8090/mcp", "the MCP door every Claude session connects to"],
];

export default new Page({
	meta: import.meta,
	title: "servex-integrate",
	icon: "hub",
	description: "Servex is now one always-on process that holds the Claude agents, owns every log, and keeps itself alive.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "One process holds the agents, owns the logs, and restarts itself in three seconds."));
	},

	content(){
		p(b("Servex is the one process on this machine that stays up."), " It watches the dev servers so you never start one by hand, it owns every log file so two writers can never corrupt one, it holds every Claude agent in memory so any session can steer any agent, and it answers one MCP door that all of them connect to.");

		p("Before today those were two separate halves that had never been plugged together. Now they are one process, and it keeps itself alive: ", b("kill it and it is back in three seconds"), ".");

		let $up;
		div.c("card", () => { $up = p.c("muted", "checking whether Servex is up right now…"); }).style({ marginBlock: "1em" });

		/* No DOM is built after this await — the box was captured above and is
		 * only filled from inside the callback (code skill §1). */
		(async () => {
			try {
				const [line] = await fetch(UP).then(r => r.json());
				$up.empty(() => {
					span("● ").style({ color: "var(--ok)" });
					b("Servex is up right now");
					span(" — it last started at " + (line?.at ?? "an unknown time").slice(11, 19) + ". ");
					a("Open the dashboard").href("http://127.0.0.1:8090/").attr("target", "_blank");
				});
			} catch {
				$up.empty(() => {
					span("● ").style({ color: "var(--warn)" });
					b("Servex is not answering");
					span(" — start it with ");
					code("node Servex/sustain.mjs");
					span(" from the repo root.");
				});
			}
		})();

		/* ⚠ A 1280-wide picture is two columns of content, and two columns never
		 * live in `main` (layout skill Q2) — squeezed into the reading measure it
		 * was 600px wide and its own text unreadable. `wide` is the page grid's
		 * breakout track, and `.page > .wide` means the element wearing it has to
		 * be a direct child of the page, which is what a `content()` call is. */
		div.c("flex v gap-25", () => {
			p.c("muted", "The dashboard, with a Haiku agent counting out loud. Its tokens arrive as it thinks them — pushed, not polled.");
			img.c("card").attr("src", SHOT).attr("alt", "The Servex dashboard: three agent rows, the running one open with its live transcript streaming in.").style({ display: "block", width: "100%" });
		}).ac("wide").style({ marginBlock: "1em" });

		p.c("h3", "The five parts");
		/* ⚠ `.style(obj, callback)` silently DROPS the callback (code skill §7) —
		 * capture first, style the returned view after. */
		div.c("flex v gap-25", () => {
			PARTS.forEach(([name, what]) => {
				p(b(name + " — "), what);
			});
		}).style({ marginBottom: "1em" });

		p.c("h3", "Try it");
		p("One command, from the repo root, and it stays up on its own afterwards:");
		pre.c("card", "node Servex/sustain.mjs").style({ marginBottom: "0.6em" });
		p("Then open ", a("127.0.0.1:8090").href("http://127.0.0.1:8090/").attr("target", "_blank"), ". To stop it: ", code("node Servex/sustain.mjs --stop"), " — and ", code("--status"), " says whether it is up and on which pids.");

		div.c("flex v gap-25", () => {
			URLS.forEach(([url, what]) => {
				p(code(url), " — ", span.c("muted", what));
			});
		}).style({ marginBlock: "0.8em" });

		p.c("h3", "The detail, one click down");
		/* ⚠ These three are NOT links: `Servex/` sits beside `public/`, not inside
		 * it, so the site cannot serve them. Open them in the editor. */
		p(code("Servex/readme.md"), " is the coder's index — the parts, where state lives, the log rule, and how to put your own tool on the MCP door. ",
			code("Servex/agents/readme.md"), " is the agent host, and ", code("Servex/agents/doc/traps.md"), " is what the Agent SDK does not tell you.");
		p("Every decision and every measurement behind this: ",
			a("this task's log").href("/framework/ai/2026-09-22/servex-integrate/"), " (the integration), ",
			a("servex-port").href("/framework/ai/2026-09-22/servex-port/"), " (the port and the audit), ",
			a("agent-host").href("/framework/ai/2026-09-22/agent-host/"), " (the sessions). The proofs run themselves: ",
			code("node Servex/proof.mjs"), " is six checks in fifteen seconds, and ",
			code("node Servex/agents/demo.mjs"), " is a real agent being spawned, cut into and interrupted in your terminal.");
	},
});
