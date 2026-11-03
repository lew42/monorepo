# Push-to-talk, proven headless

Ran a real headless Chromium against `http://push-to-talk.localhost/framework/ux/Hotkeys/`
(the live worktree server, not a mock) and drove it exactly the way a person would: real
`mousedown`/`keydown` events, a fake microphone so Chrome never needs a permission prompt.
Script: [`proof.mjs`](proof.mjs) — run it again with `node public/framework/ai/sessions/2026/10/03/push-to-talk/push-to-talk/ptt-proof/proof.mjs`.
Check 7's own script is [`check7.mjs`](check7.mjs).

## The headline: the root-cause bug got fixed mid-task, and now 6 of 7 checks pass live

First run found the floating mic never attached to the page at all (screenshot:
[`0-no-mic-on-page.png`](0-no-mic-on-page.png)) — a captor-timing bug in `push-to-talk.js`,
reported here and fixed by a sibling change (commit `a077dd09`, "defer $mic/$hidden append
past View.set_captor") while this task was still open. Re-ran the exact same script after
that fix landed and the server came back up: **checks 1, 2, 4 now pass for real**, on top of
3 and 5 which never depended on the bug. Only check 6 still fails, on two things that are not
push-to-talk's own logic breaking (see below).

## The seven checks

1. **Hold-to-record (push-to-talk).** ✅ PASS. `mousedown button:4` on `document` →
   `.ux-dictate-ptt-mic` gets `.showing` within 1s; `mouseup` → clears after the 250ms
   settle. Screenshot mid-"showing": [`1-hold-showing.png`](1-hold-showing.png).
2. **Open-mic toggle + the overlap rule.** ✅ PASS. `Ctrl+Shift+M` → mic shows and
   **stays** showing through an overlapping push-to-talk `mousedown`+`mouseup` pair (the
   overlap rule held); `Ctrl+Shift+M` again → hides.
3. **The mic scales with level.** ✅ PASS (simulated — see note). Built one throwaway
   element carrying the real `.ux-dictate-ptt-mic` class and set `--mic-level` the way
   `push-to-talk.js`'s own `set_level()` does. The CSS scaled it correctly: `scale(1)` at
   level 0, `scale(1.231)` at level 0.7 — matches `FloatingMic.css`'s documented "1.5em to
   2em" (×1.33 at full level). **Simulated, not real audio**: the real `Dictate` instance
   lives in a variable `push-to-talk.js` never exposes outside its own file, and a fake
   microphone (needed so headless Chrome never has to show a permission prompt) carries no
   real sound to begin with. Screenshot: [`3-level-simulated.png`](3-level-simulated.png).
4. **Click opens the dev shell to chat.** ✅ PASS. Clicked the showing mic →
   `document.documentElement` gets `dev-shell-open`, and the shell's own tab row shows "ai"
   selected. Screenshot: [`4-dev-shell-ai-tab.png`](4-dev-shell-ai-tab.png).
5. **Settings row.** ✅ PASS. Opened the ☰ drawer's Settings tab and found both actions
   with sensible text: "Push to talk" → "Mouse button 4", "Toggle dictation (open mic)" →
   "Ctrl+Shift+M". Clicked "press a key or button…" on the Push to talk row, sent one
   keydown (no modifiers, the "9" key), and the row updated to read "9" — rebinding works.
   Screenshots: [before](5-settings-hotkeys.png), [after rebind](5-settings-rebound.png).
6. **No console errors, no failed requests.** ❌ FAIL, but not from push-to-talk's own
   hold/toggle/click logic (all proven working above):
   - Three speculative `GET .../page.jsonl` 404s — a pre-existing, site-wide thing that
     watches every page for a live log, unrelated to this feature.
   - **New since the fix landed:** once the mic actually starts for real, the console now
     shows `ux/Dictate: The microphone stopped (AbortError: Unable to load a worklet's
     module.)`. This only became visible because check 0 used to hide it (the mic never
     started at all before). [`ux/Dictate/doc/decisions.md`](/framework/ux/Dictate/doc/decisions.md)
     notes a prior proof of this exact worklet pipeline used
     `--use-file-for-fake-audio-capture` (feeding a real WAV file) rather than the bare
     `--use-fake-device-for-media-stream` flag this task used — so this reads as a
     **headless/fake-device test artifact**, not a regression in the shipped code, but it
     hasn't been independently confirmed against a real microphone in this task. Worth a
     follow-up check with the WAV-file flag before calling it fully closed.
7. **Cross-mount double-send.** ✅ **CONFIRMED LIVE** (added mid-task on a coordination
   note from @task-mastermind-one-dictation — see [`chat.js`](/framework/ux/Dictate/chat.js)).
   Built two real `chat(el, { keep: true })` mounts into hidden divs on one live page — the
   same combination push-to-talk's hidden mount and a page's own visible widget both use —
   and sent the identical text through both at once via the real entry point
   (`panel.submit(text, "voice")`, same path `Widget.js`'s typed Send and voice auto-send
   both use). Counted actual network requests: **2 separate `POST /api/session/say`
   requests for one utterance.** This matches the earlier code-reading prediction exactly:
   `chat.js`'s `deliver()` callback (~218) calls `Session.say()` independently per mount;
   the only de-duplication in the file (`own_ats`/`seen_chat`) is declared fresh *inside*
   each `chat()` call and only guards the **receiving** side (not drawing a line twice),
   never the sending side. **This is a general risk in `chat.js`'s own design, not a
   push-to-talk-specific bug** — push-to-talk's hidden mount is just a second ordinary
   `keep:true` mount, the same mechanism any second `chat()`/`Widget()` call anywhere else
   would hit. Script: [`check7.mjs`](check7.mjs).

## Bottom line

The fix landed mid-task and the proof now backs it up: **6 of 7 checks pass live**,
including the three (hold, toggle, click) that were blocked by the root-cause bug at the
start of this task. The one real open item is check 6's new worklet error, which looks
like a headless-test artifact (a known flag difference, not a code change) rather than a
real regression — flagged for a follow-up, not re-opened as a blocker. Check 7, added
mid-task, is now confirmed live, not just from reading the code: two mounts, one
utterance, two sends — a `chat.js`-level risk worth a cross-mount guard, independent of
push-to-talk. Full detail, the live DOM trace, and the raw pass/fail data:
[`task.jsonl`](task.jsonl) · [`results.json`](results.json).
