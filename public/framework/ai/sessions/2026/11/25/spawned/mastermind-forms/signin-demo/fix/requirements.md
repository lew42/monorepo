# Sign-in demo, fix pass: the review's findings on /join/

Budget: $5. Load the `minion` skill first, then `code`. You work alone; spawn no one.

Card: /framework/ai/2026/11/25/sign-in-demo-video-landing-google-weekly/

## Read first

- The review: [../review.md](../review.md). These are its findings, plus three from the cloud chat's review.
- The page: `public/join/readme.md`, then `Join.js`, `Backend.js`, `MockBackend.js` and `copy.js`.

## Where

- **The worktree:** `C:/Code/lew42/worktrees/qf-1` (branch `worktree/qf-1`); its site is at `http://127.0.0.1:57506/`.
- **Your fence:** `public/join/**` and this folder.
- `public/framework/ux/Auth/GoogleButton.js` has an uncommitted change by mastermind-forms: the Google button is now centred and sized to its column, and drawn again on resize. Leave it alone; mastermind-forms commits it.
- Commit by exact path. Never `git add -A`: the worktree has about 160 unrelated `files.jsonl` changes that are not yours.

## Fix

1. **Keep the test key out of shared links.** `Join.js:209` uses `location.href` for the in-app card's Copy link, Share and the Android `intent://` link, so with `?test=<key>` the key is shared too. Build the shared URL without the `test` and `debug` parameters.
2. **The iPhone steps end wrong.** An app opened from the Home Screen does not share Safari's cookies, so the person arrives signed out. Change the last `ios_steps` line in `copy.js` to say: open lew42 from the Home Screen, sign in again, then tap Allow. Also check that `/join/` works as the Home Screen app's start URL.
3. **A stage with an API but no Google client id** (production today) must still sign in somewhere visible. `Backend` has no `login()`, so the mock button's sign-in throws. When `client_id` is empty, use the MockBackend path or show a clear line ("Sign-in isn't set up here yet"). Pick one and say which.
4. **Reset everything** (`Join.js:288`) clears all of localStorage and sessionStorage on the origin. Clear only this page's keys: `join-*`, and the mock's `join-mock`.
5. **Delete the dead code** the review names in `Join.js`.
6. **Show Share next to Copy link whenever `navigator.share` exists.** It probably does already (`Join.js:219`); confirm it, and change nothing if so.
7. **When Google refuses the origin,** the button must not look dead. The "Not working?" link sits under it. Make sure that link is visible in that state, and that in test mode the Test sign-in button is too.
8. **Add a lean `Join.test.mjs`** only if it can run in node without a DOM shim in under 1 s. Otherwise, add a test of the state logic: pull `state` into a static function and test that. One test, either way.

## Check

- `node public/join/shoot.mjs` (see the readme) still passes every check, with no console errors on the mock path.
- Shoot `/join/` at 400 and 1920 after the fix, and read both shots yourself.
- Update `public/join/readme.md` wherever a fix makes it stale. The shots folder is gitignored, so say that instead of linking it as a committed folder.

## Done when

- [ ] Your commits are on `worktree/qf-1`.
- [ ] Each fix is a `log` line in this folder's task log.
- [ ] You send mastermind-forms 5 lines: what you changed per fix, the shoot result and anything you could not do.

## Never

- Touch `worker/**` or `GoogleButton.js`, push, use git's stash, or kill or restart the dev server or Servex.
- Write the test key anywhere.
