/* The names in one folder, from the dev server's /api/folder-names (Server/plugins/FolderNames.js),
   answered SYNCHRONOUSLY because Page.route() must return now (Page.child() never awaits it).
   The one folder listing for task folders (dated and sessions store): AITask.has() and route()
   ask it instead of probing files that may not exist, which is a 404 each.

   One blocking same-origin request per folder, cached for three seconds, so a folder made a
   moment ago is found on the next click. Off the dev server (the deployed static site) it never
   asks: the answer is null and the caller falls back to its own probe. Same for a dev server
   that has not restarted onto the plugin yet: one miss, then null for good. */

import Store from "../../core/Item/Store.js";

const cache = new Map();   // folder url -> {names, at}
let missing = false;

/** names("/framework/ai/sessions/2026/10/20/session-e00f55c9/") → ["session.jsonl", …], or null. */
export function names(dir){
	if (missing || !Store.local()) return null;

	const hit = cache.get(dir);
	if (hit && Date.now() - hit.at < 3000) return hit.names;

	const x = new XMLHttpRequest();
	x.open("GET", "/api/folder-names?dir=" + encodeURIComponent(dir), false);
	try { x.send(); } catch { return null; }
	if (x.status !== 200 || !(x.getResponseHeader("content-type") ?? "").includes("json")) return (missing = true, null);

	const listed = JSON.parse(x.responseText).names;
	cache.set(dir, { names: listed, at: Date.now() });
	return listed;
}
