# Minion brief: merge 11, one widget, autosend by default

Load the `minion` skill first. Your parent is **task-mastermind-one-dictation**. Read `public/framework/ai/2026-09-30/one-dictation/checklist-2026-10-01.md`: you own items **2** and **3**.

## Why
The owner used the Dictate page and the ✦ sheet this afternoon. They "look alike but behave differently": the page showed replies twice, and autosend didn't happen. The owner, in their own words: "maybe that was a mistake to separate those into two different [modes]", and "auto send after a pause of a reasonable amount". Law 6: every surface that shows the same chat uses the same component in the same way, so a fix on the Dictate page reaches the sheet too.

## What differs today
- **The demo** (`ux/Dictate/page.js`, `demo_mount()`): `chat($slot.el, { placeholder: "say something", keep: false, level: true, source: true, debug: true, mode })`, plus a Dictate | Chat switch (`mode_switch()`, `mode_from_url()`, `?mode=chat`).
- **The ✦ sheet** (`ext/drawer/rail.js`, `DrawerRailSheetChat.ensure_mount()`): `chat(el, { path, card, placeholder })`.
- **The modes** (`ux/Dictate/Widget.js`, `MODES`): `dictate`, `chat` (`send_mode: "manual"`, `join: false`) and `live`. `live` belongs to merge 13 (clean transcribe), so leave it alone.
- **The mic** (`ext/Chat/Mic.js`, `SETTINGS`): `send_mode: "pause"` is the default. The gear also offers `"manual"`, and a saved `"manual"` under `chat.mic.settings.3` would silently turn autosend off for good.

## Do
1. **The demo mounts exactly what the sheet mounts.** The only extra option is `keep: false`, which gives the demo its own session. The placeholder is the same one, `"say something"`. Drop `level`, `source` and `debug` from the demo's call. The level bars are being replaced by the pulsing dot in merge 12. If the debug views are still useful, move them to the Dictate page's `playground` child, not the main demo. (The alternative was turning them on for every surface. That's noise in the sheet, so don't.)
2. **Autosend after a pause is the default and the only behaviour.**
   - Delete the `chat` row from `MODES`. Delete the Dictate | Chat switch from page.js (`mode_switch`, `mode_from_url`, the popstate listener). An old `?mode=chat` link must still load fine, as plain dictate (the unknown-name fallback already does this; check it).
   - In the gear, drop `"manual"` from the send-mode choices. When the settings load, change a saved `send_mode: "manual"` back to `"pause"`, the same way `pause_send_ms` is already migrated.
   - Typing still works: Enter or Send sends a typed line, just as it does now.
3. **Find every other caller** of `mode: "chat"` or `send_mode: "manual"` (grep the whole `public/` tree) and move it to the default.
4. **Docs:**
   - Rewrite the "Modes, and where the Dictate box sits" section of `ux/Dictate/doc/chat.md` to say it in plain sentences: one chat, everywhere, autosend after a pause; `live` is the one other mode (merge 13).
   - Add a one-line entry to `ux/Dictate/doc/decisions.md`: why the chat mode went (the owner's words above).

## Prove (headless Playwright, never the owner's tabs, never `say()`: stub every Servex call like `minion-chatjoin/proof.mjs` does)
- **Same widget:** on the demo and in the ✦ sheet, read the live Widget's `mode`, `join`, its mic's `mode_now()`, `SETTINGS.pause_send_ms`, `level`, `source` and `debug`. The two lists are equal; only `keep` differs. Print both lists.
- **Autosend:** feed the mic a final transcript ("hello there.") through the same path a real recognition result takes. Then wait out `pause_send_ms`. One bubble appears with no Send press, on both surfaces.
- **The migration:** put `{"send_mode":"manual"}` into `chat.mic.settings.3`, reload, and `mode_now()` is `"pause"`.
- **`?mode=chat` still loads** the demo with no console error.
- **Shots** of the demo and the sheet at 400 and 1920, in `minion-onewidget/shots/`.

## Rules
- Work in your worktree only. Commit by exact path, and never commit `.jsonl` files.
- Run `node Server/review.mjs` on your task dir and answer every finding.
- End your turn with the commit hash, the two equal lists, and the shot paths.
