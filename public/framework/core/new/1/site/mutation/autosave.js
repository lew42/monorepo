/* The reference autosave — a save STATE, not just a write.
 *
 * /forms/autosave/ argued that a framework with no navigation guard is quietly
 * recommending this. Those fifteen lines are the mechanism; these are the parts
 * you find out you need the first time you ship it.
 *
 * Three states, because "saved / not saved" cannot render honestly:
 *
 *   clean   nothing typed since the last write
 *   dirty   typed, not yet written — the debounce window
 *   saved   written, and the value written is the value on screen
 *   failed  the write threw. This is not hypothetical: localStorage raises
 *           QuotaExceededError, and in some private modes setItem always throws.
 *           It is the one storage failure that actually happens and the one
 *           nobody handles.
 *
 * The handle it returns carries `dirty()` — which is exactly the question a
 * navigation guard would have asked, answerable without one.
 */
export function autosave($control, key, { store = sessionStorage, delay = 300, state } = {}){
	const slot = "mutation:" + key;
	let timer, written = "";

	function read(){
		try { return JSON.parse(store.getItem(slot)) ?? null; }
		catch { return null; }        // someone else wrote this key, or it is corrupt
	}

	function write(text){
		try {
			store.setItem(slot, JSON.stringify({ text, at: Date.now() }));
			written = text;
			state?.("saved");
		} catch (error){
			state?.("failed", error.name);
		}
	}

	const found = read();
	$control.el.value = written = found?.text ?? "";
	state?.("clean");

	$control.on("input", () => {
		state?.("dirty");
		clearTimeout(timer);
		timer = setTimeout(() => write($control.el.value), delay);
	});

	return {
		read, write,
		clear(){ store.removeItem(slot); written = ""; state?.("clean"); },
		dirty(){ return $control.el.value !== written; },
	};
}

// How old is a stored draft? `null` when there isn't one, so a caller can tell
// "no draft" from "a draft written this instant".
export function age(key, store = localStorage){
	try { return Date.now() - JSON.parse(store.getItem("mutation:" + key)).at; }
	catch { return null; }
}

export function ago(ms){
	const s = Math.round(ms / 1000);
	return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)}m ago` : `${Math.round(s / 3600)}h ago`;
}
