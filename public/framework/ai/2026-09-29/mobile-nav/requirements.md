# Mobile: nav back, an AI rail at the bottom, the mic, versions kept

The owner's words, verbatim, two parts: [`../../2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom/owner-words.md`](../../2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom/owner-words.md). Read them in full; they are the acceptance test.

Worktree: `C:\Code\lew42\worktrees\mobile-nav` (branch `worktree/mobile-nav`, server `http://mobile-nav.localhost/` = `http://localhost:52447/`). Every minion writes there only, never the main tree.

## What was found (task mastermind, 400px shots of / and /framework/)

`ext/drawer/drawer.css` places the ☰ `.drawer-menu` `position: fixed; z-index: 39` at the top right. Below 52em `core/Sidebar` turns into a sticky top bar (z-index 10) whose own ☰ `.sidebar-toggle` sits at the same corner, so the drawer's button covers it: every tap opens the AI drawer and the page's nav can't be reached.

## Deliverables

1. **Nav back on mobile.** Below 52em, on a page with a `.sidebar`, the ☰ at the top right is the sidebar's own toggle again (home → the home sidebar's primary links; /framework/… → the framework sidebar). Desktop unchanged: left nav plus the drawer ☰.
2. **Mobile bottom rail** with an ✦ AI button. Tap → a small bottom sheet that starts listening (ux/Dictate) and shows the live transcript; each finished utterance becomes a small "prompt item" card in the sheet. The drawer's tabs (AI, Sessions, Dictation, Settings, Admin) stay reachable on mobile from the rail.
3. **Mic feedback** (ux/Dictate): the listening sound only once the mic is really on; a clear error for insecure context (plain http on the LAN, e.g. http://10.0.0.135:8137 — `navigator.mediaDevices` is undefined there), permission denied, no device, Whisper server unreachable; each says how to fix it. A written proposal for https on the LAN; install nothing.
4. **Dictate variants**: the widget's user experience extendable as classes (a variant = a subclass overriding one method), each variant shown on its own routed page, all linked from the dictation playground.

## Rules for every minion

- Load the `minion` skill first, then `code`; `css` before CSS; `new-page` before any page.js.
- **Keep every earlier version reachable.** Before you change markup or CSS, keep version 1 as its own class or variant that can still be shown. Never overwrite a viable design.
- Test at 400 px and 1920 px, headless Playwright only (never the owner's tabs); screenshots into your task dir.
- Every process spawn sets `windowsHide: true`.
- Commit in the worktree by exact path. Don't merge; the task mastermind merges.
- Log milestones in the MAIN tree's task log, `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\mobile-nav\task.jsonl`, via `node C:\Code\lew42\monorepo\.claude\hooks\append.mjs <that file> <lines.json>` (appends only; never write the task dir inside the worktree). Screenshots go in `...\mobile-nav\shots\` in the main tree too.
