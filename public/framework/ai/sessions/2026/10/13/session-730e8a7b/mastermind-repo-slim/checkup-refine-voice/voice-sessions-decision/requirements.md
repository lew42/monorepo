# One rolling voice session, or many: test the "New session" button, write the decision

Budget: $4. Sonnet. Work in a worktree if you change code (`take_worktree`); the parent reviews and merges. Read `CLAUDE.md`, `public/framework/ux/Dictate/readme.md`, `ux/Dictate/chat.js`, `ext/Session/readme.md` + `ext/Session/doc/sessions.md`.

## The owner's question (2026-10-17, verbatim in `../../requirements-16.md`, ask 3)

Today the browser voice chat is one global session (`ux/Dictate/chat.js`, kept in `sessionStorage` key `lew42-voice-session`, shared across pages). There is a "New session" button (`new_session_button()` in `chat.js`, used on `ux/Dictate/page.js`'s demo) the owner never tested. Two alternatives: (a) several sessions, with a working "new session" button; (b) one continuous session whose chat is chunked into archives and whose refined prompts become a hierarchy of ideas (a library of ideas), so no one needs to create a session. The owner leans to (b) and is not sure how easy it is.

## Do

1. **Test (a) headless, with the fake mic** (pattern: `ext/Refine/test/dictate-flow.mjs`; Playwright root is in the scratchpad notes, otherwise `npx playwright`; never drive the owner's tabs). On `/framework/ux/Dictate/`: say a sentence, press "New session", confirm what happens (the chat clears, the `lew42-voice-session` key changes, a new `ext/Session` file starts, the old one stays on disk and resumable via `chat.resume`). Also state what `ext/Session`'s `start()` does within the hour ("pressing ✦ again within an hour continues the same session"): that is the rolling session already, with an hour-long edge. Report pass or fail and what you saw. A bug that is a few lines: fix it in the worktree.
2. **Write `ux/Dictate/doc/sessions.md`** and link it from `ux/Dictate/readme.md` (one line under "More"). Plain sentences, one screen: the two alternatives, the test result, what already rolls today, and a `Decision` section: both options with when each wins. The parent's recommendation to adopt unless you find a reason not to: **(b) wins as the direction**, because a Refine outline already turns prompts into a hierarchy (`ext/Refine/Outline.js`, `structure.js`) and chunking by gaps is a script, not a UI; **(a) stays as the manual escape hatch** (the button) for a clean slate, because it costs nothing and already exists.
3. **The smallest first step toward (b), only if it fits the budget**: a dry-run script `ux/Dictate/chunk-session.mjs` that reads one session file (`ai/<session>.jsonl` as `ext/Session` writes it), splits it into archive chunks at silence gaps of an hour or more (or a line cap), and prints a manifest `{chunk, from, to, lines, first words}` without writing or moving anything (never destructive; a later step moves by manifest). Run it on one real session file and put the printed manifest in `ux/Dictate/doc/sessions.md`. If it does not fit, write the same as a half-page brief `ux/Dictate/doc/sessions-next.md` instead.

## Fence

`ux/Dictate/chat.js` (bug fix only), `ux/Dictate/doc/sessions.md`, `ux/Dictate/chunk-session.mjs`, `ux/Dictate/readme.md` (one line), this dir. Not `Servex/`, not `ext/Session/` code. Commit by path; do not merge. Log in your `task.jsonl`; the landing line last.
