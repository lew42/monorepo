# Smoke test follows links

Owner's words (from mastermind-servex, relaying the owner's system-design card feedback and the
fix plan), verbatim from `public/framework/ai/2026/09/24/system-design/page.jsonl`:

> Building the merge change now through one small task mastermind.

And the brief given to this task mastermind:

> Why: concept tiles on the System design card shipped with 7 links that 404, and nothing caught
> it. The smoke test at merge loads only /framework/, /framework/ai2/ and the paths an agent
> remembers to pass, and it never follows links.
>
> Build, in a worktree (the skill says how), then merge with Server/merge.mjs:
> 1. Server/merge.mjs works out the changed pages itself: from `git diff --name-only
>    <base>...<branch>`, every page.js or page.jsonl touched maps to its site URL (for card
>    folders under public/framework/ai/YYYY/MM/DD/…, the URL is /framework/ai2/YYYY/MM/DD/…).
>    They are passed to smoke.mjs together with any paths given by hand.
> 2. Server/smoke.mjs follows links: on each page it loads, collect every same-origin <a href>
>    (skip #anchors, mailto, and files like .png, .md or .json) and load each one, one level deep,
>    deduplicated, with a cap of about 60 per run. Any 404 answer or a page showing "Page load
>    error" (check how core/Page renders a load failure, and match that exactly) fails the run,
>    and the output names the page and the link it was found on.
> 3. Each NEW page (added, not modified, in the diff) gets a 1920 screenshot via
>    Server/layout-check.mjs --widths 1920 into the merge's own output folder, and the file paths
>    are printed.
>
> Every process you start sets windowsHide. Never kill or restart the dev server or Servex, and
> never commit outside your worktree branch.
>
> Prove it: (a) a scratch page with a link to a missing page fails smoke, naming both; (b) the
> System design card at /framework/ai2/2026/09/24/system-design/ passes once
> minion-concept-links-fix's fix is in (check git log first; if it isn't in yet, show it failing
> with the 7 links named); (c) a normal merge's run time goes up by less than 60 s. One Sonnet
> minion, or do it with the minion skill's rules yourself if it's under about 80 lines. Update
> Server/README.md and the sub-mastermind skill's merge section (one sentence: merge.mjs now
> finds changed pages and follows their links). Budget about $4.

## Note on scope

The card-tiles fix itself (minion-concept-links-fix) is a separate task; check `git log
michael/dev` before assuming it has landed. This task is only the smoke/merge tooling.

## Fence

`Server/merge.mjs`, `Server/smoke.mjs`, `Server/README.md`,
`.claude/skills/sub-mastermind/SKILL.md` (merge section, one sentence), plus a throwaway
scratch page under `public/framework/ai/2026-09-28/smoke-links/` for proof (a).
