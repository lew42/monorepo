/* The names in one folder, from the dev server's /api/folder-names (Server/plugins/FolderNames.js),
   answered SYNCHRONOUSLY because Page.route() must return now (Page.child() never awaits it).
   The one folder listing for routing (core/Router): a page's route() asks it which files a folder holds (has()) instead of
   probing files that may not exist, which is a 404 each. AITask and TaskPage both route their step folders with it.

   One blocking same-origin request per folder, cached for three seconds, so a folder made a
   moment ago is found on the next click. Off the dev server (the deployed static site) it never
   asks: the answer is null and the caller falls back to its own probe. Same for a dev server
   that has not restarted onto the plugin yet: one miss, then null for good. */

import Store from "../Item/Store.js";

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
	if (x.status === 403) return null;   // a denied folder (a dot segment, node_modules): this one folder only, never `missing`
	if (x.status !== 200 || !(x.getResponseHeader("content-type") ?? "").includes("json")) return (missing = true, null);

	const listed = JSON.parse(x.responseText).names;
	cache.set(dir, { names: listed, at: Date.now() });
	return listed;
}

/** The same listing and cache as names(), asked with fetch: for callers that can await. */
export async function fetch_names(dir){
	if (missing || !Store.local()) return null;

	const hit = cache.get(dir);
	if (hit && Date.now() - hit.at < 3000) return hit.names;

	let res;
	try { res = await fetch("/api/folder-names?dir=" + encodeURIComponent(dir)); } catch { return null; }
	if (res.status === 403) return null;
	if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) return (missing = true, null);

	const listed = (await res.json()).names;
	cache.set(dir, { names: listed, at: Date.now() });
	return listed;
}

/** Does this file exist? The folder's listing when there is one, else a synchronous HEAD probe (off the dev server). */
export function has(url){
	const cut = url.lastIndexOf("/") + 1;
	const listed = names(url.slice(0, cut));
	return listed ? listed.includes(url.slice(cut)) : probe(url);
}

export function probe(url){
	const x = new XMLHttpRequest();
	x.open("HEAD", url, false);
	try { x.send(); } catch { return false; }
	return x.status >= 200 && x.status < 300 && !(x.getResponseHeader("content-type") ?? "").includes("html");
}

/** A task folder with no page.js of its own: it holds session.jsonl or task.jsonl, and no page.js. */
export function is_record_folder(url){
	return (has(url + "session.jsonl") || has(url + "task.jsonl")) && !has(url + "page.js");
}
