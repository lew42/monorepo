import Socket from "/framework/dev/Socket/Socket.js";
import LocalStorageSaver from "../Saver/LocalStorageSaver.js";

/**
 * `edit()` — the ONE switch every editor control on the site reads, instead of each
 * one checking the dev socket for itself. `readme.md` names where it lives;
 * `doc/decisions.md` is the record.
 *
 *     import { edit } from "/framework/ext/Ask/edit.js";
 *     if (edit()) button.c("verdict-approve", "Approve").click(...);
 *
 * `edit()` is true only when BOTH halves hold:
 *   - the dev socket is actually live (off localhost this is always false — there is
 *     no server for a write to reach, so nothing here can turn editing back on);
 *   - the rail's toggle is on. It defaults to true and is remembered, so today's
 *     site keeps behaving exactly as it always has UNTIL the owner flips it off in
 *     the dev rail (`Ctrl + \`) to see the site the way a signed-out visitor would —
 *     every editor control just stops rendering, with nothing else to change.
 *
 * `set_edit(on)` is the rail's own setter — nothing else should call it, the same
 * way nothing but the rail calls `DevBar`'s other knobs. `on_edit(fn)` is a hook for
 * anything that wants to react without a reload; the rail itself does not use it —
 * see `doc/decisions.md` for why a reload was simpler and is what ships today.
 */

const saver = new LocalStorageSaver({ key: "lew42-edit" });
const listeners = new Set();

// ⚠ Read at CALL time, never cached: `Socket.singleton().disabled` can only get
// MORE true after boot (a socket that connects never un-connects to "off
// localhost"), so there is nothing to invalidate — but a stale cached boolean
// here would be the kind of bug that never shows up until someone else copies it.
let toggle = true;

// The saved preference arrives on a MICROTASK (`ext/Saver/LocalStorageSaver`),
// which drains before first paint — same guarantee `DevBar/settings.js` documents
// for its own restore(). Every real caller of `edit()` runs from a page's
// content(), well after that.
saver.load().then(saved => { if (saved && typeof saved.on === "boolean") toggle = saved.on; });

export function edit(){
	return !Socket.singleton().disabled && toggle;
}

export function set_edit(on){
	toggle = !!on;
	saver.write({ on: toggle });
	listeners.forEach(fn => fn(toggle));
	return toggle;
}

export function on_edit(fn){
	listeners.add(fn);
	return () => listeners.delete(fn);
}

export default edit;
