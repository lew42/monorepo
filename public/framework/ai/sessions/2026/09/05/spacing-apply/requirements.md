# spacing-apply — fix brief (Sonnet)

Read first: the repo's `CLAUDE.md` (law 2), `../mastermind-night/requirements.md` (the night's rules), `../../2026-09-04/mastermind-platform/minion-rules.md`, then the study you are applying: `/imagine/design/spacing/` (`public/imagine/design/spacing/page.js`) and its raw tables `../spacing-study/{spacing-1280,spacing-3440,analysis}.json`. Skills: `new-task` (this dir, group `design`), `code`, `layout` (its spacing section), `css` (read framework.css's `:root` spacing tokens and Page.css's previews rule), `finish-task`.

## The owner's words

> these imagine pages are still quite cramped... try to study the vertical spacing in particular … if neighbors have vastly different spacing, it becomes more evident, or at least suggests there should be a legitimate reason for it.

## Deliverables (numbered)

1. **Apply the study's one bug fix.** `.page-previews` in `public/framework/core/Page/Page.css` carries a flat `--gap: 0.8em`; the study proposes the site's clamp instead (`var(--gap-default)` or the `--flow` the wall sits in — read both rules and pick the one that makes the wall's margin and the prose rhythm beside it agree; say why). One line, a two-line comment with the study's numbers and date. Re-measure the study's three confirmed pairs (platform, blogx, stream at 1280 and 3440) before and after; they must drop under 2.5×. Then re-shoot every page the study lists beside a previews wall (45 comparisons) at 1280 and 3440 and read the layout skill's three invariants — a wall that now pushes something below the fold is a finding, not a landing.
2. **The 1.20× cluster — a proposal with pictures, not a change.** Thirteen realms grow their vertical spacing 1.20× while the viewport grows 2.69×, because they share the root tokens (`--pad-default: clamp(1em, 1.3%, 2em)`, `--gap-default: clamp(1em, 0.4em + 0.5vw, 1.6em)`, and whatever `--flow` is at the root). The owner chose those numbers on 2026-09-01, so do NOT change them. Instead, on a scratch copy served from your private server (override the tokens with a `<style>` injected by Playwright, never an edit), shoot three realms (cms, paging, stream) at 3440 under three candidate ceilings — the current, 1.5× the current, 2× the current — and put the nine crops on one page, `/imagine/design/spacing/ceilings/` (a child of the study; the mastermind wires it), with the measured median sibling distance under each and one plain sentence per candidate about what it did to the fold. The owner picks.
3. **cms at 1.03×.** The one realm whose spacing barely grows at all: find why (a constant somewhere in `public/imagine/cms/` — the study's json names the boxes), fix it in the realm with the clamp, re-measure.

## Fences and budget

Write: the one rule in `core/Page/Page.css`, `public/imagine/cms/` (the constant only), `public/imagine/design/spacing/ceilings/` (new), this task dir. Never `framework.css` tokens. Private server only; scratch under `scratchpad/spacing-apply/`; never spawn agents; never `git stash`/commit. Budget ~180k tokens. Report in ≤ 10 lines: the previews rule as it now reads, the three pairs before/after, the 45-comparison re-shoot result, the ceilings page url with the three medians, the cms cause and fix, tokens.
