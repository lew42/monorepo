# Minion brief: prove push-to-talk works, headless + screenshots

Load the `minion` skill first. Worktree: `C:\Code\lew42\worktrees\push-to-talk`
(branch `worktree/push-to-talk`, server at `http://push-to-talk.localhost/`).
Work ONLY inside that worktree. **NEVER use `mcp__playwright` tools** (the parent
fence forbids them) — use plain headless Playwright you drive yourself via
`node`, or the `ui-test` skill's own method, from the Bash tool, writing a
throwaway script into your own scratch, not the repo.

Parent task: `public/framework/ai/sessions/2026/10/03/push-to-talk/push-to-talk/requirements.md`.
Two sibling minions already landed:
- `ux/Hotkeys/` (readme first) — the hotkey manager, two actions registered:
  `"dictate.push"` (hold, default mouse button 4) and `"dictate.toggle"`
  (press-once, default Ctrl+Shift+M).
- `ux/Dictate/push-to-talk.js` + `FloatingMic.css` — the floating mic, driven by
  both hotkeys through one shared `start()`/`stop()`, mounted site-wide from
  `public/app.js`.

Read both those files plus their class docs before writing a test — you need
the exact DOM hooks (`.ux-dictate-ptt-mic`, its `.showing` class, `--mic-level`)
and the exact Hotkeys event names, not guessed ones.

## What to prove, each with a screenshot or a concrete pass/fail

1. **Push-to-talk, hold-to-record:** load a page (not just `/`), synthesize a
   `mousedown` with `button: 4` on `document` → the `.ux-dictate-ptt-mic` gets
   `.showing` within ~1s (it needs mic permission; load the page via
   `chromium.launch` with `args: ["--use-fake-ui-for-media-stream",
   "--use-fake-device-for-media-stream"]` so a fake mic is granted with no
   prompt — this is the standard headless-mic trick, not a new idea). Then a
   `mouseup` button 4 → `.showing` clears again (after the ~250ms settle in
   the code). Screenshot the mic mid-"showing".
2. **Open-mic toggle:** dispatch a `keydown` with `code: "KeyM", ctrlKey: true,
   shiftKey: true` → mic shows and STAYS showing after you also send a
   push-to-talk mousedown+mouseup pair (the overlap rule: a push-to-talk tap
   must not cut off an active toggle session) → then the SAME Ctrl+Shift+M
   keydown again → mic hides. State each result in one line, pass or fail.
3. **The mic scales with level:** fake media stream has no real audio, so you
   can't prove real level-scaling end to end headless — instead, call
   `push_to_talk`'s own level path directly in-page (read the file: it's
   `mount.panel.dictate.on_meter`) via `page.evaluate` to simulate a level and
   confirm `--mic-level` on `.ux-dictate-ptt-mic` changes and its computed
   `transform` scale changes with it. Say clearly in your note that this is a
   simulated level, not real audio, and why (fake mic streams are silent).
4. **Click opens dev shell to chat:** with the mic showing, click it →
   `document.documentElement` gets `dev-shell-open`, and the shell's own tab
   row shows "ai" selected. Screenshot the open shell.
5. **Settings row:** open the ☰ drawer's Settings tab, confirm the "hotkeys"
   section renders both actions with their current binding text ("Mouse button
   4", "Ctrl+Shift+M" — check the actual text string the module → it must
   read sensibly), and that clicking "press a key or button…" then sending one
   keydown rebinds it (read the row back and confirm the text changed).
   Screenshot this panel.
6. **No console errors** on any page you touched this script with, and no
   failed requests — read your own script's own console/page-error listeners,
   don't just eyeball it.

## Write the result

Put your script in your own task dir (not the repo — this is scratch,
`public/framework/ai/sessions/2026/10/03/push-to-talk/push-to-talk/ptt-proof/` IS the task dir, so
screenshots and the script can live right there; they are not committed to
git — add `*.png` and your script to `.gitignore` only if the worktree doesn't
already ignore `ai/**` scratch, check first). Write
`public/framework/ai/sessions/2026/10/03/push-to-talk/push-to-talk/ptt-proof/proof.md`: one short
screen — each of the 6 checks above as a checklist line, pass/fail, screenshot
linked, one sentence each. This is the "short real test note for the owner"
the parent brief's item 4 asked for.

## When done

Log in `public/framework/ai/sessions/2026/10/03/push-to-talk/push-to-talk/ptt-proof/task.jsonl`
(load `new-task` first). Do NOT merge — that's the mastermind's own last step.
End your turn once `proof.md` is written and committed (commit the md + any
screenshots you want kept; the test script itself can stay uncommitted scratch
if it's throwaway).

Budget: $3.
