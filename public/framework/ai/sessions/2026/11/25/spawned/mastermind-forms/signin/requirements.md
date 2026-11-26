Budget: $8

# Build the Google sign-in block and the talking-head video with one button

Load the `minion` skill first, then `code`, `page` and `css`. The owner's words: `.scratch/forms/brief-2026-11-25.md` (read it whole; part 3 is yours). The owner now finds whole forms over video distracting: over a talking-head video the overlay is **one simple "Sign in with Google" button**. The plan, names and homes: `../plan.md`. Inputs in `.scratch/forms/`: `spec.md` (section 04 sign-in, sizes), `research.md` (Google GIS / FedCM), `stills-results.json` (talking-head stills, 768×1360, on fal.media; download what you use into the page's folder and commit it, the site must not hot-link). The cloud chat is drawing the same overlay as a new section on the Figma Forms page (file `woCZQDoXKJW3GcJPZukW7f`, page `103:11`); if it is there when you build, read it with one `get_screenshot` and follow it.

## Work in a worktree

Yours is made: `C:\Code\lew42\worktrees\forms-signin` (branch `worktree/forms-signin`, served at `http://forms-signin.localhost/`). Commit by exact path after each working step. Do not merge; the mastermind reviews and merges. Another builder is making `ux/Form/` at the same time: do not write there.

## Build

1. **`ux/Auth/GoogleButton.js`**: `class GoogleButton extends View`, the "Continue with Google" button in Google's own branding (white, the G mark, the label; a dark variant for video). Real sign-in already exists at `/app/` (`public/app/app.js`, verified by `worker/google.js`) and has never run because `GOOGLE_CLIENT_ID` is empty: read how `/app/` calls Google Identity Services and mirror it. With a client id the button uses GIS; without one it is a mock that fires a `signin` event with a fake user and says so on screen. No second auth system.
2. **The sign-in view**: extend `ux/Auth/Auth.js` by its seams the way `MagicAuth.js` does (read `ux/Auth/readme.md`): Google first, then Apple and an email link, "use a password instead" one tap down.
3. **The page `/framework/ux/Auth/google/`** (`page.js`): level 1 is the talking-head video (a portrait frame, the still as the poster; a real `<video>` element so a clip can drop in later) with a soft bottom scrim and ONE "Sign in with Google" button over it, thumb-reachable, with the host's one line above it if it reads well. Below: the button's variants, and the sign-in view. Phone first; on desktop the portrait video sits centred at a sensible height, not stretched.
4. Docs: update `ux/Auth/readme.md` (the new files, Use, the mock-vs-real rule) in the same commit.
5. A lean core test for `GoogleButton` (`GoogleButton.test.mjs`, see `public/framework/core/Test/readme.md`).
6. Check it: screenshots at 400, 1200, 1920 and 3440 (`mcp__site__shot` or `Server/Shots`), read them yourself; `node Server/smoke.mjs` shows no FAIL. Log `{"log":{"msg":"landed", ...}}` with the worktree url and the screenshot paths, and end your turn with that line.

## Rules

Use the framework's tokens and control grammar (`ui/controls/readme.md`), every rule inside a layer; no colour schemes, no glass forms. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Vanilla JS, no new npm dependency. `node --check` every file. Findings as `log` lines in this folder's task log.
