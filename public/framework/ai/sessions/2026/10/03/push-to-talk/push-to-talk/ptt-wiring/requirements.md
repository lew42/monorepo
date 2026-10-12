# Minion brief: wire push-to-talk + the floating mic into `ux/Dictate`

Load the `minion` skill first. Worktree: `C:\Code\lew42\worktrees\push-to-talk`
(branch `worktree/push-to-talk`, server at `http://push-to-talk.localhost/`).
Work ONLY inside that worktree.

Parent task (read it first, the owner's verbatim words are there — don't
re-ask, decide and build):
`public/framework/ai/2026-10-03/push-to-talk/requirements.md`.

A sibling minion just built `public/framework/ux/Hotkeys/` — read its
`readme.md` before you start. It gives you:
- `Hotkeys.register(name, { label, default })`
- `Hotkeys.on(name, "down" | "up", fn)`
- `Hotkeys.binding(name)` / `Hotkeys.all()`
- the settings-row UI, `hotkeys_section()` from `ux/Hotkeys/row.js`

Do not change anything in `ux/Hotkeys/`.

## The owner's words this serves (verbatim)

> I don't think we need the dev shell open to dictate, especially if I close it
> with Ctrl+\ to see the whole site. A little microphone icon, 24px or so,
> bottom-right, floating over the page. When you push to talk it appears and
> its size fluctuates with the level, ~1.5em to 2em, so you know the sound is
> getting through. (Another idea: a gray mic with a primary-coloured mic on top
> whose clip height is the level.) Start with an MVP: get push-to-talk working
> so I can go somewhere and set the key, then go anywhere on the site, inside
> or outside the framework, and the session follows me, context-aware: I hit
> push-to-talk and talk to the agents. Clicking the icon opens the dev shell to
> the chat/dictation tab, where the prompt refinement shows.

## What to build

### 1. Register the hotkey

In a new file `ux/Dictate/push-to-talk.js`, at module load:
```js
import Hotkeys from "../Hotkeys/Hotkeys.js";
Hotkeys.register("dictate.push", { label: "Push to talk", default: { type: "button", button: 4 } });
```
Mouse button 4 (forward thumb button) is the sane MVP default — the owner said
"a thumb button on my mouse" — but it's rebindable through the Hotkeys settings
row, not hard-coded for real use.

### 2. The floating mic + push-to-talk behaviour

Export one function, call it `push_to_talk(app)`, that `public/app.js` calls once
(same pattern as `devbar(this)` / `devshell(this)` in `App.render()` — read
`public/app.js` first). It must work on EVERY page, dev shell open or closed,
and never shift page layout (it's `position: fixed`).

Build it on the EXISTING mount, not a new recording path (CLAUDE.md law 6 — one
of everything): mount `ux/Dictate/chat.js`'s `chat()` into a hidden/offscreen
container, once, globally (`keep: true`, so it's the SAME global session every
other surface already shares), and drive it with the `panel` the mount returns —
`panel.start_mic()` / `panel.stop_mic()` / `panel.mic_active()` (read
`Widget.js`'s class doc on those three, and its `on_meter` option, before
writing anything — don't guess the API).

- `Hotkeys.on("dictate.push", "down", …)` → if not already recording, call
  `panel.start_mic()` and show the floating mic.
- `Hotkeys.on("dictate.push", "up", …)` → `panel.stop_mic()`, hide the floating
  mic after its own stop sound/settle (don't just vanish instantly — a couple
  hundred ms is fine, check how `Dictate.js` signals "done" if there's a clean
  hook; otherwise a short fixed delay is an acceptable MVP).
- The CURRENT PAGE's url must travel with the dictation as context — `chat()`'s
  `nav(path)` already reports the path to the session on every navigation if you
  call it; wire `push_to_talk`'s mount to call `mount.nav(location.pathname)` on
  every route change (`app.navigated` already calls `devbar.refresh()` /
  `devshell.refresh()` in the same spot — read `public/app.js`'s `navigated()`
  and add one more call there, OR listen for the same event `app.js` fires;
  pick whichever is less code).

### 3. The floating mic itself — new file `ux/Dictate/FloatingMic.css` (or fold
into `Dictate.css`, your call) + the markup built by `push_to_talk.js`:

- `position: fixed`, bottom-right, a reasonable gap from the edge (use the
  site's spacing tokens — load the `css` skill before writing any rule; don't
  invent a new pixel constant when a token already exists).
- 24px at rest... but it's only ever SHOWN while recording, so really: hidden
  (`display: none` or opacity 0 + no pointer-events) until `start_mic()`,
  then visible, sized ~1.5em to 2em and SCALING LIVE with the level — use
  `on_meter` the same way `Widget.Pulse` already does (you read that class
  already; reuse the exact smoothed-level math, don't reinvent it) to set a
  CSS custom property (`--mic-level` or similar) the CSS `transform: scale()`
  reads, so there's no layout thrash, just a transform.
- A simple two-colour mic, if you have time: a gray mic icon behind, a
  primary-coloured (`--prime`) mic icon in front whose visible height follows
  the level via `clip-path` or a height-clipped overlay (the owner's "another
  idea" above) — but a single mic that just scales with the level is a
  perfectly good MVP if the two-colour version costs much more code. Say which
  one you built and why in your log.
- **Click → opens the dev shell on its chat/dictation tab.** Read
  `dev/DevShell/DevShell.js`: `devshell.toggle(true)` opens it; the chat tab
  inside DevShell's own tab row is named `"ai"` (see `dev/DevBar/tools.js`'s
  `tabs` array — `["ai", [ask]]` — and `dev/DevBar/ask.js`, which already
  mounts the SAME global chat()). You'll need to select that tab too — read
  `DevShell.js`'s own `tab(name)` function; it's module-private (not exported),
  so either export it, or export a small `devshell.open_tab(name)` helper
  that calls `toggle(true)` then sets its internal `tab_name` and refreshes —
  whichever is the smaller diff. Don't duplicate the tab list.

### 4. Settings row

In `ext/drawer/tabs/settings.js` (read it first — it already has a `section(...)`
per setting), add one more: `section("hotkeys", () => hotkeys_section());` —
import `hotkeys_section` from `ux/Hotkeys/row.js`. This single row set covers
BOTH the "where settings live" options the parent brief named (drawer Settings
tab) — don't also duplicate it into `dev/DevBar/settings.js`, that file is just
persisted state, not a settings UI (read it to confirm before deciding).

### 5. Mount `push_to_talk(app)` in `public/app.js`

Read `public/app.js`'s `render()` — add the import and one call right next to
`devbar(this); devshell(this);`. This is the ONE line that makes it live on
every page.

## Watch out (from the parent brief + what you'll read)

- Mouse buttons 3/4 are "back"/"forward" in the browser — you must
  `preventDefault()` on `mousedown`/`mouseup`/`auxclick` for them
  (`Hotkeys.js` already does this; just make sure nothing in your own code
  re-triggers navigation).
- No DOM after an `await` — capture synchronously, fill in a callback
  (CLAUDE.md "Traps that never throw").
- Every CSS rule sits in a layer (`base theme site util`) — read
  `framework.css`'s own `@layer` order before writing a rule.
- The mic is released on `visibilitychange`/`pagehide` already, inside
  `Dictate.js` — don't fight that; if push-to-talk is held while the tab is
  hidden, let it just stop (don't add a second lifecycle hook here).

## Prove it (your own quick check before handing to the proof minion)

Load `http://push-to-talk.localhost/` in a browser or curl it for a 200 with no
server error; that's enough for your own commit — a THIRD minion does the full
headless proof + screenshots next, in this same worktree.

## When done

Log your result in `public/framework/ai/2026-10-03/push-to-talk/ptt-wiring/task.jsonl`
(load `new-task` if not open yet): what you built, the exact mic/mouse-button
design you picked and why, any gap left open with its reason. Commit. End your
turn.

Budget: $4.
