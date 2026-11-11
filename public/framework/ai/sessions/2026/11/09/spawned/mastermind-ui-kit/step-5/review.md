verdict: fix

1. [fix] Half the ask isn't in the diff being reviewed. requirements.md says "if the existing count is large, report it first: list the offenders on /live/plan/ui-kit/" and "where the kit lacks a part that the Figma card system has, list it and don't build it." Both were written, but only as an uncommitted edit to `public/live/plan/ui-kit/page.jsonl` sitting in the main working tree (`git status` shows it modified, not committed) — it is not in `review/diff.patch`, and the branch under review (`worktree/qf-3`, one commit `58b568322`) never touches that file. Per the project's own rule ("Main site is production" — edits go worktree → check_page → merge, never straight into the main tree), this change needs to move into the branch and land through merge.mjs like the rest of step 5, or it will be lost/overwritten and the owner's ask goes unmet. A fresh agent reading only `diff.patch` would conclude this half of the requirement was never built.
2. [note] The plan-page text links the doc as `/Server/doc/own-css.md`, but `Server/` is dev-only tooling, not served under `public/`, so that link 404s on the live site; once moved into the branch (finding 1), fix it to the on-disk path `Server/doc/own-css.md` without a leading slash, matching how the rest of the plan page links things, or drop the link.
3. [note] `OwnCSS.declarations()` is a regex, not a CSS parser, and a literal `;` inside a value (e.g. a `data:` URI or a quoted string with a semicolon) can split one declaration into a mismatched pair of matches; `Server/doc/own-css.md` already states this caveat plainly ("The count is a regex, not a CSS parser"), and spot-checks (`a:hover`, an `@supports` condition, an attribute selector containing `:`) all counted correctly, so this is pre-existing, documented risk rather than a new bug — flagging only so the next person doesn't rediscover it.

## Requirements
- "a merge check that fails when a page or card adds its own CSS instead of using the kit" — yes — `Server/OwnCSS.mjs` + the `merge.mjs` hook at Server/merge.mjs:179-182; a probe commit adding one declaration to LivePage.css was refused (484→486) per requirements.md's evidence, and `OwnCSS.test.mjs` covers the counting and refusal logic directly.
- "if the existing count is large, report it first: list the offenders on /live/plan/ui-kit/" — no — see finding 1: the report exists only as an uncommitted edit outside the reviewed diff, not landed.
- "fail only on NEW CSS in a diff" — yes — `OwnCSS.added()` (Server/OwnCSS.mjs:67-74) compares before/after counts against the merge-base and only flags files where `after > before`; the existing 15,130 declarations are left alone (confirmed by running `node Server/OwnCSS.mjs --census --top 5` in the worktree: 15130 total, matching the evidence in requirements.md exactly).
- "where the kit lacks a part that the Figma card system has, list it and don't build it" — no (same as finding 1) — the Figma-gap list exists only in the uncommitted plan-page edit, not in this diff, and no new component was built, which is the right behavior once that text actually lands.
- Can a reader open a page showing this class's live instances/properties? n/a — `OwnCSS` is a one-shot CLI/merge-gate tool with no persistent state; nothing to watch live.

## Indexing
- `Server/doc/own-css.md` is linked from `Server/readme.md` (Server/readme.md:62) — indexed correctly.
- `Server/OwnCSS.test.mjs` needs no separate index: `TestRunner.covers()` finds `*.test.mjs` beside its class by convention, confirmed in Server/MergeTests.mjs.
- The `--own-css "why"` merge flag is documented in both `Server/doc/own-css.md` and inline at Server/merge.mjs:171 — consistent with the `--no-nav`/`--skip-tests` pattern already in that file.
- Nothing else touched by this diff (merge.mjs, readme.md) is left stale by this change; both edits are additive one-liners that match the surrounding style.

## Words
- requirements.md and Server/doc/own-css.md are short, concrete and name their own evidence (exact counts, a probe commit) rather than asserting — reads clearly to a fresh agent.
- The "Decision: where the kit's line is" section in requirements.md states the alternative considered (styles/+ui/ only) and why it was rejected, matching the "say what you chose, and why" rule.
