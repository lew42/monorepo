import LocalStorageSaver from "../../ext/Saver/LocalStorageSaver.js";

/**
 * class Hotkeys — a static, site-wide hotkey manager. There is no instance: every
 * module that owns an action calls `Hotkeys.register()` once, at import time, and
 * whatever wants to react to it calls `Hotkeys.on()`. One flat list, no nested
 * per-panel scopes — the owner's own words, in `doc/decisions.md`.
 *
 *   Hotkeys.register("dictate.push", { label: "Push to talk", default: { type: "button", button: 4 } });
 *   Hotkeys.on("dictate.push", "down", () => start());
 *   Hotkeys.on("dictate.push", "up",   () => stop());
 *
 * A binding is EITHER a keyboard key or a mouse button, never both:
 *   { type: "key", code: "AltRight" }                                  — a KeyboardEvent.code
 *   { type: "key", code: "KeyM", ctrlKey: true, shiftKey: true }       — Ctrl+Shift+M
 *   { type: "button", button: 4 }                                      — a MouseEvent.button (3 = back, 4 = forward)
 *
 * A key binding's `ctrlKey`/`shiftKey`/`altKey`/`metaKey` are each optional and
 * EXACT — omitted (or `false`) means that modifier must be UP, not "don't care".
 * `{ type: "key", code: "KeyM" }` and the Ctrl+Shift+M binding above are two
 * different, non-overlapping bindings — doc/decisions.md.
 *
 * `Hotkeys.bind()` saves the owner's own choice, per browser, through
 * `ext/Saver/LocalStorageSaver` (law 6 — reuse the one localStorage reader rather
 * than hand-roll a second one). `Hotkeys.all()` is what the settings UI
 * (`row.js`'s `hotkeys_section()`) reads to draw itself.
 */
export default class Hotkeys {

	// name -> { label, default }: what register() was called with.
	static register(name, { label, default: fallback }){
		Hotkeys.actions.set(name, { label, default: fallback });
		Hotkeys.listen();
	}

	// Saves the owner's own binding for `name`, overriding the default.
	static bind(name, binding){
		Hotkeys.overrides = { ...Hotkeys.overrides, [name]: binding };
		Hotkeys.saver.save(Hotkeys.overrides);
		return binding;
	}

	// The binding actually in effect: the owner's own choice, else the default.
	static binding(name){
		return Hotkeys.overrides[name] ?? Hotkeys.actions.get(name)?.default ?? null;
	}

	static on(name, phase, fn){
		Hotkeys.listen();
		if (!Hotkeys.subscribers.has(name)) Hotkeys.subscribers.set(name, { down: [], up: [] });
		Hotkeys.subscribers.get(name)[phase].push(fn);
	}

	// Every registered action, for the settings UI: label, default, current
	// binding, and a human string for it ("Mouse button 4", "Alt (right)").
	static all(){
		return [...Hotkeys.actions.entries()].map(([name, action]) => {
			const binding = Hotkeys.binding(name);
			return { name, label: action.label, default: action.default, binding, text: Hotkeys.text(binding) };
		});
	}

	static text(binding){
		if (!binding) return "(unbound)";
		if (binding.type === "button") return `Mouse button ${binding.button}`;
		if (binding.type === "key") return [...modifier_text(binding), key_text(binding.code)].join("+");
		return "(unbound)";
	}

	// Arms a ONE-SHOT listener: the very next key or mouse-button press anywhere
	// on the page becomes `cb(binding)`, then capture mode turns itself off. Used
	// by the "press a key or button…" button in row.js. That press is swallowed
	// here — it never also fires a bound action's own "down"/"up" (see key()/button()).
	static capture(cb){
		Hotkeys.listen();
		Hotkeys.capturing = cb;
	}

	// Added ONCE, lazily, on the first register() or on() — adding it twice would
	// fire every handler twice per real key press.
	static listen(){
		if (Hotkeys.listening) return;
		Hotkeys.listening = true;

		document.addEventListener("keydown", e => Hotkeys.key(e, "down"));
		document.addEventListener("keyup", e => Hotkeys.key(e, "up"));
		document.addEventListener("mousedown", e => Hotkeys.button(e, "down"));
		document.addEventListener("mouseup", e => Hotkeys.button(e, "up"));
		// In some browsers THIS is the event that actually fires the browser's own
		// back/forward navigation on these buttons, not mousedown/mouseup — caught
		// here too so the page never leaves under the owner's own thumb button.
		document.addEventListener("auxclick", e => Hotkeys.button(e, null));
	}

	static key(e, phase){
		if (phase === "down" && e.repeat) return;   // a held key: one "down", never a flood

		// The actual modifier state at THIS keydown/keyup, not just the code —
		// captured here (not re-read later) because by the time a subscriber
		// runs, the real event is gone.
		const signature = { type: "key", code: e.code, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey };

		if (Hotkeys.capturing && phase === "down"){
			const cb = Hotkeys.capturing;
			Hotkeys.capturing = null;
			cb(signature);
			return;
		}

		Hotkeys.fire(signature, phase);
	}

	static button(e, phase){
		// The left button (0) is every ordinary click on the page — "confirm",
		// "cancel", "close this popover" — never a hotkey. Without this, the
		// very next click ANYWHERE after pressing "press a key or button…"
		// (row.js) became the new binding, including a click meant to back out
		// — found live by a fresh-eyes review, 2026-10-03. doc/decisions.md.
		if (e.button === 0) return;

		// Buttons 3 and 4 (back/forward) are reserved for app hotkeys — the
		// owner's own mouse thumb button is one — so the browser's own
		// navigation on them is stopped whether or not anything is bound to
		// them yet. doc/decisions.md.
		if (e.button === 3 || e.button === 4) e.preventDefault();

		if (phase === null) return;   // auxclick only ever reaches here to preventDefault

		if (Hotkeys.capturing && phase === "down"){
			const cb = Hotkeys.capturing;
			Hotkeys.capturing = null;
			cb({ type: "button", button: e.button });
			return;
		}

		Hotkeys.fire({ type: "button", button: e.button }, phase);
	}

	static fire(event, phase){
		for (const name of Hotkeys.actions.keys()){
			if (!Hotkeys.matches(Hotkeys.binding(name), event)) continue;
			for (const fn of Hotkeys.subscribers.get(name)?.[phase] ?? []) fn();
		}
	}

	static matches(binding, event){
		if (!binding || binding.type !== event.type) return false;

		if (binding.type === "button") return binding.button === event.button;

		// type === "key": the code AND every modifier must match exactly, a
		// missing binding flag read as `false` — so a bare "M" binding and a
		// "Ctrl+Shift+M" one never both fire off the same keypress.
		return binding.code === event.code
			&& !!binding.ctrlKey === !!event.ctrlKey
			&& !!binding.shiftKey === !!event.shiftKey
			&& !!binding.altKey === !!event.altKey
			&& !!binding.metaKey === !!event.metaKey;
	}
}

// A readable name for a KeyboardEvent.code: "AltRight" -> "Alt (right)",
// "KeyA" -> "A", "Digit1" -> "1", "ArrowUp" -> "Arrow Up". Rudimentary on
// purpose — the owner asked for "a quick rudimentary UI", not a full keyboard
// map (doc/decisions.md).
function key_text(code){
	const letter = code.match(/^Key([A-Z])$/);
	if (letter) return letter[1];

	const digit = code.match(/^Digit([0-9])$/);
	if (digit) return digit[1];

	const sided = code.match(/^(.*)(Left|Right)$/);
	if (sided) return `${sided[1].replace(/([a-z])([A-Z])/g, "$1 $2")} (${sided[2].toLowerCase()})`;

	return code.replace(/([a-z])([A-Z])/g, "$1 $2");
}

// The held modifiers, as the prefix of a human string — "Ctrl+Shift+M": fixed
// order (Ctrl, Alt, Shift, Meta) so the same combination always reads the same
// way, whichever order the keys actually went down.
function modifier_text(binding){
	const mods = [];
	if (binding.ctrlKey) mods.push("Ctrl");
	if (binding.altKey) mods.push("Alt");
	if (binding.shiftKey) mods.push("Shift");
	if (binding.metaKey) mods.push("Meta");
	return mods;
}

// Static state, set on the class rather than as class fields — this mirrors the
// rest of the codebase's own habit of prototype/static assignment after the
// class body (ux/Tags/Tags.js, ux/Menu/Menu.js) rather than risk any field-order
// surprise; there are no instances here to make it matter either way.
Hotkeys.actions = new Map();          // name -> { label, default }
Hotkeys.subscribers = new Map();      // name -> { down: [fn, …], up: [fn, …] }
Hotkeys.overrides = {};               // name -> binding, the owner's own choices
Hotkeys.listening = false;
Hotkeys.capturing = null;

// Same shape as dev/DevBar/settings.js's own `saver` — one LocalStorageSaver,
// one key, loaded once. `load()` resolves on a microtask (it is really just
// `Page.Prefs.read_raw` underneath, which never actually waits on anything), and
// microtasks drain before the first paint, so `overrides` is the saved state by
// the time any real key or button press can reach `fire()`.
Hotkeys.saver = new LocalStorageSaver({ key: "lew42-hotkeys" });
Hotkeys.loaded = Hotkeys.saver.load().then(value => { Hotkeys.overrides = value || {}; return Hotkeys.overrides; });

export { Hotkeys };
