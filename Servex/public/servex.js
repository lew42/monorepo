import { View, div, h1, h2, a, p, pre, span, button, style } from "/framework/core/View/View.js";
import { Docs } from "/docs.js";

/* THE SERVEX DASHBOARD — every project on this machine, every Claude agent
 * Servex is holding, and what all of them are saying right now.
 *
 * It is the framework's own View layer (`/framework/core/View/View.js`, served
 * from the monorepo's public/ as Servex's second static root) and nothing else:
 * no App, no Router, no framework.css. This page is not part of the site — it is
 * a standalone tool on its own origin and its own port — so it carries its own
 * CSS under the `servex-` prefix rather than pulling the site's whole theme
 * system across. Adding App later is an import away.
 *
 * TWO SPEEDS, on purpose. Projects and log files are POLLED (every 2s, 1.5s):
 * they change a few times an hour and a poll is the simpler thing. Agents are
 * PUSHED, over `/api/stream` — an agent emits a token at a time, and a poll
 * either misses most of them or hammers the server. `EventSource` is the whole
 * mechanism: one open connection, one `addEventListener("agent", …)`, and the
 * browser reconnects by itself when Servex restarts. */

style(`
.servex-nav { display: flex; gap: 1.1em; padding: 0.8em 1.4em 0; }
.servex-nav a { color: #9ecbff; text-decoration: none; font-size: 0.85em; }
.servex-nav a:hover { text-decoration: underline; }

.servex-head { padding: 1.2em 1.4em 0.6em; }
.servex-head h1 { margin: 0; font-size: 1.6em; letter-spacing: 0.02em; }
.servex-head p { margin: 0.3em 0 0; color: #8b93a1; font-size: 0.85em; }
.servex-head code { color: #9ecbff; }

/* Two regions that both SPEND the width they are given: the wall gets twice the
   flex of the log panel and grows a column at a time, so 3440 is more projects
   per row rather than more grey. auto-fit, never auto-fill -- the project count
   is small and variable, and auto-fill reserves a track for a column that has
   nothing to put in it. The floor is in rem so it does not scale with the
   viewport type and drop below a project's own name. */
.servex-main { display: flex; flex-wrap: wrap; gap: 1.2em; align-items: flex-start; padding: 1em 1.4em 3em; }

/* The agents band takes the whole row above the other two, and is not drawn at
   all when Servex is holding none — so a machine with nothing running looks
   exactly as it did before agents existed. An agent's line of transcript is
   TEXT, and text wants one wide column, not a tile in a grid: rows stack. */
.servex-agents { flex: 1 1 100%; min-width: 0; }
.servex-agent { background: #1b1f27; border: 1px solid #2b313c; border-left: 3px solid #2b313c; border-radius: 8px; margin-bottom: 0.5em; }
.servex-agent.working { border-left-color: #4ade80; }
.servex-agent.idle { border-left-color: #facc15; }
.servex-agent-head { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5em; padding: 0.55em 0.8em; cursor: pointer; }
.servex-agent-head:hover { background: #20252f; }
.servex-agent-id { font-weight: 600; }
.servex-agent-meta { color: #8b93a1; font-size: 0.78em; }
.servex-agent-meta b { color: #c9d1d9; font-weight: 500; }
.servex-agent-grow { flex: 1 1 2em; }

/* The open transcript. It scrolls because a log is the one thing that should:
   the page itself must not grow by a screen every few seconds. */
.servex-feed { margin: 0; border-top: 1px solid #2b313c; padding: 0.6em 0.8em; max-height: 20em; overflow: auto; font-size: 0.74em; line-height: 1.55; white-space: pre-wrap; word-break: break-word; color: #a9b2c0; }
.servex-feed i { color: #7c9cbf; font-style: normal; }
.servex-feed u { color: #6b7280; text-decoration: none; }

.servex-projects { flex: 2 1 30rem; min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 0.7em; align-content: start; }
.servex-logs { flex: 1 1 22rem; min-width: 0; }
.servex-h2 { margin: 0 0 0.4em; font-size: 1em; font-weight: 600; }

.servex-card { min-width: 0; background: #1b1f27; border: 1px solid #2b313c; border-radius: 8px; padding: 0.7em 0.8em 0.8em; }
.servex-card.running { border-color: #2f6b45; }
.servex-name { font-weight: 600; display: flex; justify-content: space-between; align-items: center; gap: 0.5em; }
.servex-name span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.servex-url { display: block; font-size: 0.78em; color: #7c9cbf; margin: 0.25em 0 0.4em; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.servex-url:hover { text-decoration: underline; }
.servex-said { font-size: 0.72em; color: #8b93a1; margin-bottom: 0.5em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.servex-pill { font-size: 0.68em; padding: 0.15em 0.6em; border-radius: 1em; background: #2b313c; color: #99a2b0; flex: none; }
.servex-pill.online { background: #12351f; color: #4ade80; }
.servex-pill.launching, .servex-pill.restarting { background: #33300f; color: #facc15; }
.servex-pill.errored, .servex-pill.port-taken { background: #3a1616; color: #f87171; }

.servex-acts { display: flex; gap: 0.35em; }
.servex-acts button { font: inherit; font-size: 0.75em; padding: 0.2em 0.7em; border-radius: 4px; border: 1px solid #39404d; background: #232833; color: #c9d1d9; cursor: pointer; }
.servex-acts button:hover { background: #2d3441; }

.servex-picker { display: flex; flex-wrap: wrap; gap: 0.3em; margin-bottom: 0.5em; }
.servex-picker button { font: inherit; font-size: 0.75em; padding: 0.15em 0.6em; border-radius: 4px; border: 1px solid #39404d; background: #232833; color: #99a2b0; cursor: pointer; }
.servex-picker button.on { background: #2f3846; color: #e6edf3; }
.servex-tail { margin: 0; background: #14171d; border: 1px solid #2b313c; border-radius: 8px; padding: 0.7em 0.8em; height: 26em; overflow: auto; font-size: 0.74em; line-height: 1.55; white-space: pre-wrap; word-break: break-word; color: #a9b2c0; }
.servex-tail b { color: #e6edf3; font-weight: 500; }

body { background: #0f1218; color: #c9d1d9; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; }
`);

const ask = (url, options) => fetch(url, options).then(r => r.json()).catch(() => null);

let open_log = "servex";
let $agents, $projects, $picker, $tail;
let $dashboard, $docs, docs_view;

// Two views, one page: "/" (and anything not starting with /docs) is the
// dashboard below; "/docs" and "/docs/<path>" is the Docs tab. A real <a
// href> so ctrl-click/open-in-new-tab still work, with the plain click
// intercepted into pushState so it never reloads the page.
function nav_link(text, href){
	return a(text).href(href).click(event => {
		event.preventDefault();
		navigate(href);
	});
}

function navigate(path){
	if (path !== location.pathname) history.pushState({}, "", path);
	route();
}

function route(){
	const on_docs = location.pathname === "/docs" || location.pathname.startsWith("/docs/");

	if (on_docs){
		$dashboard.hide();
		$docs.show();
		// "/docs/Servex/ext/openrouter/" -> "Servex/ext/openrouter"; "/docs" or
		// "/docs/" alone -> "" (nothing picked yet).
		docs_view.select(location.pathname.replace(/^\/docs\/?/, "").replace(/\/+$/, ""));
	} else {
		$docs.hide();
		$dashboard.show();
	}
}

View.body().append(() => {

	div.c("servex-nav", () => {
		nav_link("Dashboard", "/");
		nav_link("Docs", "/docs/");
	});

	$dashboard = div.c("servex-dash", () => {
		div.c("servex-head", () => {
			h1("Servex");
			p(`The always-on process. It starts these servers, holds the Claude agents, owns every log, and answers MCP at ${location.origin}/mcp — so no Claude session ever has to start a dev server itself, and any of them can steer an agent running in here.`);
		});

		div.c("servex-main", () => {
			$agents = div.c("servex-agents");
			$projects = div.c("servex-projects");
			div.c("servex-logs", () => {
				h2.c("servex-h2", "Logs");
				$picker = div.c("servex-picker");
				$tail = pre.c("servex-tail");
			});
		});
	});

	docs_view = Docs(navigate);
	$docs = docs_view;
});

window.addEventListener("popstate", route);
route();

/* ── agents — the pushed half ──────────────────────────────────────────── */

/* `cards` is what the rows are drawn from; `rows` remembers the three little
 * views inside each row that change on every event, so a token arriving does not
 * redraw the whole band 300 times a turn. `open` is the one agent whose
 * transcript is showing — one at a time, because two live streams side by side
 * is two things to read at once. */
const cards = new Map(), rows = new Map();
let open_agent = null, $count, $rows, cap = 5;

function agent_row(card){
	const views = {};

	div.c("servex-agent " + card.state, () => {
		div.c("servex-agent-head", () => {
			span.c("servex-agent-id", card.id);
			views.$state = span.c("servex-pill " + card.state, card.state);
			span.c("servex-agent-meta", `${card.role} · ${card.model}`);
			span.c("servex-agent-grow");
			views.$meta = span.c("servex-agent-meta");
		}).click(() => open_row(card.id));

		/* ⚠ `View.toggle()` takes no argument — it FLIPS, reading the computed
		 * style of an element that is not in the document yet. Say which. */
		views.$feed = pre.c("servex-feed");
		if (card.id !== open_agent) views.$feed.hide();
	});

	rows.set(card.id, views);
	meta(card.id, card);
	return views;
}

function meta(id, card){
	const views = rows.get(id);
	if (!views) return;

	views.$state.text(card.state).el.className = "servex-pill " + card.state;
	views.$meta.html(`<b>${card.turns}</b> turns · <b>$${(card.cost ?? 0).toFixed(4)}</b>`);
	views.$feed.el.closest(".servex-agent").className = "servex-agent " + card.state;
}

/* Clicking a row opens its transcript and closes whichever was open. The feed is
 * only filled from here on — the lines an agent said BEFORE you opened it are in
 * its log file, one click away through the Logs panel. */
function open_row(id){
	open_agent = open_agent === id ? null : id;
	for (const [key, views] of rows) key === open_agent ? views.$feed.show() : views.$feed.hide();
}

/* One event, one line — except a `delta`, which is a fragment of a sentence still
 * arriving and simply joins the text already there. */
function feed(event){
	const views = rows.get(event.agent);
	if (!views || event.agent !== open_agent) return;

	const at = views.$feed.el, stuck = at.scrollTop + at.clientHeight >= at.scrollHeight - 30;

	if (event.type === "delta") at.append(event.text);
	else if (event.type === "transcript") at.append(line(event.text + "\n"));
	else if (event.type === "tool") at.append(line(`\n· ${event.name} — ${event.input}\n`, "i"));
	else if (event.type === "agent_msg") at.append(line(`\n[${event.from ?? "host"}] ${event.text}\n`, "i"));
	else if (event.type === "result") at.append(line(`\n— turn ${event.turns} · ${event.duration_ms ?? 0}ms · $${(event.cost ?? 0).toFixed(4)}\n`, "u"));
	else if (event.type === "error") at.append(line(`\n! ${event.where}: ${event.text}\n`, "i"));

	while (at.childNodes.length > 600) at.firstChild.remove();
	if (stuck) at.scrollTop = at.scrollHeight;
}

function line(text, tag){
	if (!tag) return text;
	const el = document.createElement(tag);
	el.textContent = text;
	return el;
}

/* The band is built once and then only ADDED to. Redrawing it whenever an agent
 * appears would wipe whatever transcript was open mid-sentence, which is exactly
 * the moment you are reading it. */
function band(){
	$agents.empty(() => {
		$count = h2.c("servex-h2");
		$rows = div.c("servex-agent-rows");
	});
	$agents.hide();
}

function add_row(card){
	$rows.append(() => { agent_row(card); });
	$agents.show();
	count();
}

function count(){
	const all = [...cards.values()], live = all.filter(c => c.state !== "stopped" && c.state !== "gone").length;
	/* the working cap (Servex/doc/dormant.md): the front desk does not count */
	const working = all.filter(c => (c.state === "working" || c.state === "starting") && !/^(assistant-|manager-|master-assistant|session-|dispatcher$)/.test(c.id)).length;
	const dormant = all.filter(c => c.state === "dormant").length;
	$count.text(`Agents — working ${working}/${cap} · ${dormant} dormant · ${live} live of ${cards.size}`);
}

/* The live wire. The first paint comes from `/api/agents` because a page opened
 * halfway through a run has to start from somewhere; everything after it arrives
 * on the stream. An agent the page has never seen draws its row on its first
 * event, so nothing has to be reloaded to see a new one. */
async function agents(){
	band();
	cap = Number((await ask("/api/system"))?.sample?.agents?.cap?.match?.(/\/(\d+)/)?.[1]) || cap;
	(await ask("/api/agents") || []).forEach(card => { cards.set(card.id, card); add_row(card); });

	const source = new EventSource("/api/stream");
	source.addEventListener("agent", message => {
		const event = JSON.parse(message.data);
		const known = cards.has(event.agent);

		cards.set(event.agent, event.card);
		if (!known) add_row(event.card);
		else { meta(event.agent, event.card); count(); }

		feed(event);
	});
}

/* ── projects ──────────────────────────────────────────────────────────── */

function card(project){
	const running = ["online", "launching", "restarting"].includes(project.status);

	div.c("servex-card" + (running ? " running" : ""), () => {
		div.c("servex-name", () => {
			span(project.name);
			span.c("servex-pill " + project.status, project.status);
		});
		a.c("servex-url", project.url.replace("http://", "").replace(/\/$/, ""))
			.href(project.url).attr("target", "_blank");
		div.c("servex-said", project.said || project.dir);
		div.c("servex-acts", () => {
			if (!project.self) for (const verb of running ? ["restart", "stop"] : ["start"]){
				button(verb).click(() => send(project.name, verb));
			}
			button("logs").click(() => pick(project.name));
		});
	});
}

async function send(name, verb){
	await ask(`/api/projects/${name}/${verb}`, { method: "POST" });
	pick(name);
	projects();
}

async function projects(){
	const list = await ask("/api/projects");
	if (!list) return;

	const shown = list.filter(p => p.can_start || p.self);
	$projects.empty(() => { shown.forEach(p => { card(p); }); });
}

/* ── logs ──────────────────────────────────────────────────────────────── */

function pick(name){
	open_log = name;
	logs();
}

async function names(){
	const list = await ask("/api/logs") || [];
	$picker.empty(() => {
		list.forEach(name => { button.c(name === open_log ? "on" : "", name).click(() => pick(name)); });
	});
}

async function logs(){
	const lines = await ask(`/log/${open_log}?n=80`);
	if (!Array.isArray(lines)) return;

	const stuck = $tail.el.scrollTop + $tail.el.clientHeight >= $tail.el.scrollHeight - 30;
	$tail.empty(() => {
		lines.forEach(line => {
			div.c("", () => {
				span.c("", (line.at || "").slice(11, 19) + "  ");
				span(line.msg ?? line.bad ?? JSON.stringify(line));
			});
		});
	});
	if (stuck) $tail.el.scrollTop = $tail.el.scrollHeight;
}

agents();
projects();
names();
logs();
setInterval(projects, 2000);
setInterval(names, 5000);
setInterval(logs, 1500);
