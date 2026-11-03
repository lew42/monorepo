# summary-styles — full-width variants of the Disclosure module

Servex agent `minion-summary-styles`, 2026-09-29. The ask, verbatim (from the owner's dictation,
`public/framework/ai/sessions/2026/09/29/dd9065c6-974a-48d3-92e4-4706532c807f/module-experts/owner-words.md`, "Continued (about 3:45 PM)"):

> By the way, I'd like a minion spawn a mastermind to explore different summary element styles.
> Those little expandable, collapsible summaries. Uh, most of them seem to be inline until
> they're expanded and then they go full width. I kind of think having full width ones would be
> better. I also feel like I already asked for this somewhere. So so maybe do have that minion do
> a search for things like accordion, expandable, summary, detail, like I was asking for full
> width ones and different gaps between them and different kind of background and border styles
> and color schemes and icons on top of them, like for the little chevrons or twirl downs or
> whatever. Those summary things are, you know, can be useful for FAQs and stuff.

## Steps

1. Search `.claude/prompts/*.jsonl` and `public/framework/ai/**/requirements.md` for prior asks
   about accordion/expandable/collapsible/summary/details/disclosure. Check
   `ux/Content/Disclosure` (built 2026-09-25) and `ui/accordion`. Write down what exists and what
   was asked but never built.
2. A variants page for `<details>`/`<summary>` styles, full-width by default, side by side:
   full width vs inline; gaps (none, small, a stack); background/border styles; colour schemes;
   the expand icon (chevron, twirl-down, +/−), left or right. Each variant is a short-named class
   word. Extend the EXISTING `Disclosure` module — don't replace it — v1 (`faq`/`flush`/`lines`)
   stays exactly as it is.
3. Put it at `/framework/ux/Content/Disclosure/variants/` (a child page), with screenshots at
   1920 and 400.
4. Use a pool worktree, `Server/merge.mjs`, and land.
5. Post a summary `.md` to a new card (`POST /card/create`, type `note`), file placed in that
   card's own folder.

## Fences

- MINE: `public/framework/ux/Content/Disclosure/**`, `public/framework/ux/Content/content.css`
  (additive rules only), this task dir.
- NOT MINE: `ux/Content/Question`, `Decision`, `Quotation`, `Spend`, `Object`, `ui/accordion`,
  `Disclosure/page.js`'s existing v1 demo block (keep as is).
- Never kill/restart the dev server. Never stash, commit, or `git add` in the main tree.

