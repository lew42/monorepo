import { Page, md, h2, small, div, details, summary } from "/app.js";
import { view } from "/framework/ux/Content/Object/DefaultView.js";
import { agents } from "../live.js";

/* THE LIVE DEBUG WIDGET. Two things, both real JS structures rendered as
   nested, dot-prefixed rows (`./doc/sessions/` explains what they are):
     1. the agents array Servex's `GET /api/agents` answers with right now
        (Servex/agents/Agents.js, `list()` → `agent.card()` per row);
     2. the shape of the one host object that holds them — hand-written here
        because that class is server-only Node code (fs, os, the SDK) and can
        never run in this browser page; the field and method names are
        copied from reading Servex/agents/Agents.js, not from importing it.
   `agents()` (../live.js) fails soft: no Servex running, or a network error,
   and this shows one plain line — never a console error, never a failed
   request. */
const HOST_SHAPE = {
	class: "Agents (Servex/agents/Agents.js)",
	live: "Map<id, Agent> — every session this process is holding right now",
	boot: "this process's own boot id, e.g. 138a02f3-91824",
	registry: "Registry — the on-disk copy at %LOCALAPPDATA%/lew42/servex/registry.json",
	methods: ["spawn", "send", "stop", "interrupt", "wait", "fork", "revive", "wake", "list", "get", "name", "register"],
};

export default new Page({
	meta: import.meta,
	title: "The agents list, live",
	description: "Every agent Servex is holding right now, and the shape of the object that holds them.",
	icon: "groups",

	content(){
		md("Fetched from Servex's own `GET /api/agents` — the same list `list_agents` and the dashboard read. Live agents only; a stopped one still shows if this Servex process remembers it.");

		h2("Right now");
		div.c("card pad", $box => {
			agents().then(rows => $box.append(() => {
				if (rows === null) return void small.c("muted", "Servex is not answering on this machine — nothing to show.");
				if (!rows.length) return void small.c("muted", "No agents running right now.");

				// ⚠ 2026-09-29 fix round, finding 3: `view(rows)` alone drew every row as a
				// bare array index (".0 {…}", ".1 {…}") — you had to open one to learn
				// anything about it. Each row gets the same id/role/state label the "Live
				// right now" widget on `ai/` already uses, with the full object one click
				// down inside it.
				rows.forEach(row => details.c("ai-row", () => {
					summary(`${row.id} · ${row.role} · ${row.state}`);
					div.c("ai-row-body", () => view(row));
				}));
			}));
		});

		h2("The host object's shape");
		md("`Servex/agents/Agents.js` — one instance per Servex process (`export const agents = new Agents()`). Not importable here: it is server-only Node code (file system, the Claude SDK). Read from the source, not fetched.");
		div.c("card pad", () => view(HOST_SHAPE));

		md("Detail: [Sessions and the SDK](/framework/core/Page/ai/doc/sessions/).");
	},
});
