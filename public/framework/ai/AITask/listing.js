/* The names in one folder under /framework/ai/, from the dev server's
   /framework/directory.json — answered SYNCHRONOUSLY, because Page.route() must
   return now (Page.child() never awaits it). Used by AITask.route() to open a
   subtask's folder inside its parent task's (nested tasks, doc/nested.md).

   One blocking fetch of a small same-origin file, cached for ten seconds, so a
   subtask folder made a moment ago is found on the next click. Off the dev server
   there is no directory.json, and the answer is null: nothing is claimed. */

let cache = null, at = 0;

function directory(){
	if (cache && Date.now() - at < 10000) return cache;
	const xhr = new XMLHttpRequest();
	xhr.open("GET", "/framework/directory.json", false);
	try { xhr.send(); } catch { return null; }
	const ok = xhr.status >= 200 && xhr.status < 300 && !(xhr.getResponseHeader("content-type") ?? "").includes("html");
	cache = ok ? JSON.parse(xhr.responseText) : null;
	at = Date.now();
	return cache;
}

/** names("2026-09-29/nested-tasks/minion-view") → ["task.jsonl", …], or null. */
export function names(path){
	let node = directory()?.files?.find(f => f.name === "ai");
	for (const part of path.split("/").filter(Boolean)) node = node?.children?.find(k => k.name === part && k.type === "dir");
	return node ? (node.children ?? []).map(k => k.name) : null;
}
