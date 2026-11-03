import { View, div, icon } from "../../core/View/View.js";
import Hotkeys from "../Hotkeys/Hotkeys.js";
import MicIndicator from "./MicIndicator.js";
import mount_chat from "./chat.js";
import devshell from "../../dev/DevShell/DevShell.js";
import LocalStorageSaver from "../../ext/Saver/LocalStorageSaver.js";

View.stylesheet(import.meta, "FloatingMic.css");

/**
 * **Push-to-talk, anywhere on the site.** The owner's own words: "I don't think we
 * need the dev shell open to dictate... I hit push-to-talk and talk to the agents."
 *
 * `public/app.js` calls `push_to_talk(app)` exactly once, in `App.render()`, right
 * beside `devbar(this); devshell(this);` — the same "mount once, on <body>, beside
 * `.app`" shape those two already use (`DevShell.js`'s own class doc). That ONE call
 * is what makes this live on every page, framework or site, dev shell open or closed.
 *
 * It does three things, and builds nothing new to do them (CLAUDE.md law 6 — one of
 * everything):
 *
 * 1. **Registers two hotkeys** — `ux/Hotkeys` (a sibling task; its own readme has the
 *    full API) owns detecting a key or mouse button is down; this file only names the
 *    two actions and what pressing each one does:
 *    - `"dictate.push"` — HOLD to talk, release to stop (mouse button 4, the default).
 *    - `"dictate.toggle"` — PRESS ONCE to start an open mic, press again to stop
 *      (Ctrl+Shift+M, the default — the owner's own follow-up ask, 2026-10-03: "press
 *      once -> start recording... press again -> stop").
 * 2. **Drives the ONE global dictation session** — `ux/Dictate/chat.js`'s own `chat()`
 *    mount, the exact same global conversation the ✦ sheet and the ☰ drawer's AI tab
 *    already share (`keep: true`, the default). This file mounts it into an off-screen
 *    box, once, and just calls `panel.start_mic()` / `stop_mic()` on it — never a
 *    second recording path, and both hotkeys share the exact same `start()`/`stop()`
 *    pair below rather than each owning its own copy.
 * 3. **Shows a small floating mic** (`FloatingMic.css`) whenever the mic is actually
 *    live, by EITHER hotkey, and opens the dev shell on its chat tab when clicked.
 *
 * **The overlap rule** (push-to-talk held while the toggle is already on): releasing
 * push-to-talk is a NO-OP — the toggle still owns the mic, same as if push-to-talk had
 * never been touched. Picked over "releasing push-to-talk also ends the toggle session"
 * because a push-to-talk tap is the more likely ACCIDENT of the two (a stray thumb-button
 * bump while reaching for the mouse), and the owner's own open-mic session is the one
 * thing an accidental tap must never cut off mid-sentence. `toggled_on` (below) is the
 * one flag this decides on.
 *
 * **Off by default** (reversed 2026-10-03, `task-mastermind-one-dictation`'s own standing
 * instruction, once `@ptt-proof` live-confirmed two real mounts hearing one utterance send
 * TWO `POST /api/session/say` — this mount and whatever OTHER dictation mic is open on the
 * same page would otherwise both hear the owner and both send). `mic_pref` (below) is one
 * persisted boolean, `LocalStorageSaver` again (CLAUDE.md law 6 — the same saver `ux/Hotkeys`
 * already uses, not a second one), read by `start()` before anything else: off, and a press
 * of either hotkey does nothing at all — no mount, no mic, no DOM — the hotkeys still fire,
 * they just no-op silently. The drawer's Settings tab has the one checkbox that turns it on.
 */

Hotkeys.register("dictate.push", { label: "Push to talk", default: { type: "button", button: 4 } });
// `ctrlKey`/`shiftKey` need `ux/Hotkeys`'s own binding shape extended to match on them,
// not just `code` — a sibling task (`hotkeys-module`) was asked to add that, and its own
// `Hotkeys.js` class doc now documents exactly this shape (`{type:"key", code, ctrlKey,
// shiftKey, altKey, metaKey}`), so this registers against it directly rather than waiting.
Hotkeys.register("dictate.toggle", { label: "Toggle dictation (open mic)",
	default: { type: "key", code: "KeyM", ctrlKey: true, shiftKey: true } });

let mount = null;        // the one hidden chat() mount — built lazily, on the first press
let toggled_on = false;  // true while "dictate.toggle" has an open mic running

// One persisted boolean, default OFF — see this file's own class doc, "Off by default".
// `enabled` is read synchronously (never awaited) the same way `Hotkeys.binding()` reads
// its own `overrides`: `saver.load()` resolves on a microtask, which drains before the
// first real key/button press or settings-tab render can ever reach it.
const mic_pref = {
	saver: new LocalStorageSaver({ key: "lew42-ptt-mic-enabled" }),
	enabled: false,
	set(on){
		mic_pref.enabled = !!on;
		mic_pref.saver.save(mic_pref.enabled);
	},
};
mic_pref.loaded = mic_pref.saver.load().then(value => { mic_pref.enabled = value === true; return mic_pref.enabled; });

export default function push_to_talk(app){
	let hide_timer = null;

	const $hidden = div.c("ux-dictate-ptt-hidden");

	const $mic = div.c("ux-dictate-ptt-mic").attr("role", "button").attr("tabindex", "0")
		.attr("title", "Dictating — release to send; click to open the chat")
		.attr("aria-label", "Open the dictation chat")
		.append(() => { icon("mic"); new MicIndicator({ compact: true }); })
		.click(() => devshell.open_tab("ai"))
		.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); devshell.open_tab("ai"); } });

	// `push_to_talk(app)` runs inside `App.render()` BEFORE `View.set_captor(this.$pages)`
	// (public/app.js) — at this exact moment `View.captor` is null, so a plain `.append()`
	// (what `div.c()` does on construction) silently lands nowhere (`View.js`'s own append
	// guard). `devshell.js`'s own mount, right above this call in app.js, hits the same
	// trap and defers past it the same way: wait for styles, then `append_to(View.body())`
	// explicitly, never relying on the implicit captor. Found live by @ptt-proof.
	app.styles_loaded().then(() => {
		$mic.append_to(View.body());
		$hidden.append_to(View.body());
	});

	// The ONE global session, mounted once, off screen — never a second recording
	// path (CLAUDE.md law 6). Built on first use rather than at `push_to_talk(app)`
	// call time: `chat()` immediately opens a `Dictate` (microphone permission UI
	// included) the instant it mounts, which has no business happening before the
	// owner ever presses the key even once.
	function ensure_mount(){
		if (mount) return mount;
		mount = mount_chat($hidden.el, { keep: true, placeholder: "Push to talk…" });
		// THE LEVEL (the brief's own "size fluctuates with the level"): `Dictate`'s own
		// `on_meter(level)` is the SAME already-smoothed 0..1 number `Widget.Pulse`'s own
		// dot reads (`Widget.js`'s class doc on `on_meter`) — reused here by WRAPPING the
		// real mic's `on_meter`, never a second meter loop. Nothing else sets `on_meter`
		// on this particular `Dictate` instance (this mount never passes `level`/`pulse`
		// to `chat()`), so there is nothing to chain — this is simply the one callback.
		if (mount.panel.dictate) mount.panel.dictate.on_meter = level => set_level(level);
		return mount;
	}

	function set_level(level){ $mic.style("--mic-level", Math.min(1, level).toFixed(3)); }

	function show(){
		clearTimeout(hide_timer);
		$mic.ac("showing");
	}
	// Release doesn't just vanish the icon — a short settle so the owner can see the
	// last bit of level fall back to rest, same idea as a VU meter's own release time.
	// `Dictate.js` already handles its own mic lifecycle (stop sound, releasing the
	// track); this is only about how long the ICON stays up after that.
	function hide_soon(){
		clearTimeout(hide_timer);
		hide_timer = setTimeout(() => { $mic.rc("showing"); set_level(0); }, 250);
	}

	// THE ONE "mic is live" PATH — both hotkeys call just these two, never their own
	// copy of `start_mic()`/`stop_mic()`/`show()`/`hide_soon()` (the follow-up ask's own
	// words: "the same show()/hide_soon(), not a separate code path").
	function start(){
		if (!mic_pref.enabled) return;   // OFF by default — no mount, no mic, no DOM
		const m = ensure_mount();
		if (!m.panel.mic_active()) m.panel.start_mic();
		show();
	}
	function stop(){
		if (mount?.panel.mic_active()) mount.panel.stop_mic();
		hide_soon();
	}

	Hotkeys.on("dictate.push", "down", start);
	Hotkeys.on("dictate.push", "up", () => {
		if (toggled_on) return;   // THE OVERLAP RULE — see this file's own class doc
		stop();
	});

	// PRESS ONCE to start, press again to stop — unlike push-to-talk, this one hotkey
	// fires only on "down" (a key's "up" would otherwise double-fire the toggle: one
	// press is ONE flip, not down-starts/up-stops).
	Hotkeys.on("dictate.toggle", "down", () => {
		toggled_on = !toggled_on;
		toggled_on ? start() : stop();
	});

	return { mic: $mic, nav: path => mount?.nav(path) };
}

// `public/app.js`'s own `navigated(page)` calls this right alongside `devbar.refresh()`
// / `devshell.refresh()` — the one line that reports the CURRENT page to the dictation
// session as context (`chat.js`'s own `nav(path)`, read by `ext/Session`). A no-op until
// the first press ever builds `mount` — nothing to tell a session that doesn't exist yet,
// and `ensure_mount()`'s own `chat()` call reports the page it was built on anyway.
push_to_talk.nav = function(path = location.pathname){ mount?.nav(path); };

// The one persisted on/off switch (see "Off by default" above) — `ext/drawer/tabs/
// settings.js`'s own checkbox reads/writes this, rather than a second copy of the pref.
push_to_talk.mic_pref = mic_pref;
