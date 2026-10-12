/* A same-origin, blocking GET — used only for a cold deep link that lands straight on
   a dynamic route() before the normal async cache has had a tick to warm (the exact
   trade ext/AITask/dashboard.js's fetch_sync makes for the AI day pages: route() must
   answer now, never with a Promise — Page.child() checks its result with a plain `if`). */
export function fetch_text_sync(url){
	const xhr = new XMLHttpRequest();
	xhr.open("GET", url, false);
	try { xhr.send(); } catch { return null; }
	if (xhr.status < 200 || xhr.status >= 300) return null;
	if ((xhr.getResponseHeader("content-type") ?? "").includes("html")) return null;   // SPA fallback
	return xhr.responseText;
}
export default fetch_text_sync;
