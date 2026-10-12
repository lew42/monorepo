# Dictate: push-to-talk anywhere on the site, with a hotkey you set

## The ask (owner, 2026-10-03, dictated; MVP first)
> Integrate a push-to-talk UX for our site-wide Dictate. I'm used to using a thumb button on my mouse. We need a key detection system for setting hotkeys, so it isn't hard-coded: just make a quick rudimentary UI for it. Really a hotkey manager: one place to manage every hotkey in the app, filterable, rebindable. (Nested per-panel scopes, like Blender, can confuse; keep a few go-to hotkeys.)
> I don't think we need the dev shell open to dictate, especially if I close it with Ctrl+\ to see the whole site. A little microphone icon, 24px or so, bottom-right, floating over the page. When you push to talk it appears and its size fluctuates with the level, ~1.5em to 2em, so you know the sound is getting through. (Another idea: a gray mic with a primary-coloured mic on top whose clip height is the level.) Start with an MVP: get push-to-talk working so I can go somewhere and set the key, then go anywhere on the site, inside or outside the framework, and the session follows me, context-aware: I hit push-to-talk and talk to the agents. Clicking the icon opens the dev shell to the chat/dictation tab, where the prompt refinement shows.

## What exists (read first, extend; law 6)
- `ux/Dictate/` (the Dictate widget, Whisper via whisper-server), its readme and the one global session (the drawer's chat). @task-mastermind-one-dictation owns this area: read its task log.
- `dev/DevShell/` (Ctrl+\ shell) and `dev/DevBar/` tabs; `core/Shell`.

## Do (MVP, in order)
1. **Hotkeys:** a tiny `ux/Hotkeys/` (class `Hotkeys`): register named actions (`dictate.push`), bind each to a key OR a mouse button (mouse back/forward = `button` 3/4: catch `mousedown`/`mouseup`/`auxclick` and `preventDefault` so the browser doesn't navigate back), stored per browser. A minimal settings row: action name, current binding, "press a key or button…" capture. Put it where settings already live (the drawer's Settings tab, or the DevShell's).
2. **Push-to-talk:** hold the bound button → Dictate records; release → it stops and sends to the ONE global session, with the current page's URL attached as context. Works on every page (site and framework), dev shell open or closed.
3. **The floating mic:** bottom-right, fixed, over the page (never shifts layout), shown only while recording; scales ~1.5–2em with the live level. Click → opens the DevShell on its chat/dictation tab.
4. Prove it headless where possible (synthetic mouse button 4 down/up starts/stops recording; the mic appears and scales), screenshots, and a short real test note for the owner.

## Fence
ux/Hotkeys/ (new), ux/Dictate/ (the push-to-talk entry + floating mic), the settings row, this task dir. Coordinate with @task-mastermind-one-dictation via a page inbox note. NEVER the mcp__playwright tools.
Model: Sonnet. Budget $10.
