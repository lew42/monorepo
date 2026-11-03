import Socket from "/framework/dev/Socket/Socket.js";
import LocalStorageSaver from "../Saver/LocalStorageSaver.js";

/**
 * `EditSwitch` — the ONE switch every editor control on the site reads, instead of each
 * one checking the dev socket for itself. `readme.md` names where it lives;
 * `doc/decisions.md` is the record.
 *
 *     import EditSwitch from "/framework/ext/Ask/EditSwitch.js";
 *     if (EditSwitch.edit()) button.c("verdict-approve", "Approve").click(...);
 *
 * `edit()` is true only when BOTH halves hold:
 *   - the dev socket is actually live (off localhost this is always false — there is
 *     no server for a write to reach, so nothing here can turn editing back on);
 *   - the rail's toggle is on. It defaults to true and is remembered, so the site
 *     keeps behaving as it always has UNTIL the owner flips it off in the dev rail
 *     (`Ctrl + \`) to see the site the way a signed-out visitor would.
 *
 * `set_edit(on)` is the rail's own setter — nothing else should call it. `on_edit(fn)`
 * is a hook for anything that wants to react without a reload.
 */
export default class EditSwitch {
	static saver = new LocalStorageSaver({ key: "lew42-edit" });
	static listeners = new Set();

	// ⚠ Read at CALL time, never cached: `Socket.singleton().disabled` can only get
	// MORE true after boot, so a stale cached boolean here would be a bug nobody sees.
	static on = true;

	// The saved preference arrives on a MICROTASK (`ext/Saver/LocalStorageSaver`),
	// which drains before first paint; every real caller runs from a page's content().
	static restored = EditSwitch.saver.load().then(saved => {
		if (saved && typeof saved.on === "boolean") EditSwitch.on = saved.on;
	});

	static edit(){
		return !Socket.singleton().disabled && EditSwitch.on;
	}

	static set_edit(on){
		EditSwitch.on = !!on;
		EditSwitch.saver.write({ on: EditSwitch.on });
		EditSwitch.listeners.forEach(fn => fn(EditSwitch.on));
		return EditSwitch.on;
	}

	static on_edit(fn){
		EditSwitch.listeners.add(fn);
		return () => EditSwitch.listeners.delete(fn);
	}
}
