/* pref.js — the one bit of shared state between `dev/DevShell` and `dev/DevBar`:
 * which one Ctrl + \ opens. No other dependency on purpose — `DevBar.js` imports
 * this (never `DevShell.js` itself), so the two modules never form an import
 * cycle even though `DevShell.js` already imports FROM `DevBar.js` (it reuses
 * its tabs and its `pathbar`/`width`/`hold`/`blocked` sections).
 *
 * `use_v1()` false (the default, nothing saved yet) means "Ctrl + \ opens the
 * new dark shell" — the owner's ask, 2026-09-30. Clicking the shell's "v1"
 * button, or the old rail's "shell" button, flips it and remembers the choice. */
const KEY = "lew42-dev-v1";

export function use_v1(){
	try { return localStorage.getItem(KEY) === "1"; }
	catch { return false; }
}

export function set_v1(on){
	try { localStorage.setItem(KEY, on ? "1" : "0"); }
	catch { /* private mode / full quota — the in-memory default just stops persisting */ }
}
