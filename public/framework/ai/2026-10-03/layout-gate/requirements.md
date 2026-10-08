# Links look right everywhere, and the merge gate catches broken layout

## The ask (owner, 2026-10-03, dictated)
> There's a little link "$1,128 of AI work · 49 tasks" … it's blue. I'm not sure why we have blue links. Our default link styles need to apply everywhere; right now they might be scoped to the page class, so a random link somewhere should still use the proper styles.
> It sat above the AI title (an h1, `.doc-title`, the page with the top tabs) which is meant to be flush with the top of the page. There is zero padding from that dollar sign to the edge of its container. It creates a massive void and pushes the entire page down. Whatever UI check we're doing, measuring the layout or looking at images to make sure text isn't against the border, didn't catch it. We need a system in place to fix these problems.

Already done by vscode-mastermind (commit db0e77af): the cost line moved to the page end, padded, hidden on Doc/app pages. Don't redo that.

## Do
1. **Global link style:** find where link colour/decoration is defined (likely scoped under `.page` in `framework.css` / the theme layer). Make the default apply to every `a` (inside the right `@layer`, lowest specificity, e.g. `:where(a)`), so a link anywhere uses it. Check a few pages at the four widths for regressions.
2. **A layout check in `Server/smoke.mjs`** (or the module it already uses for the four widths), run per page, failing the merge on:
   - **text touching its box:** a visible text node whose rendered box is within 2px of its nearest padded/bordered/backgrounded ancestor's edge;
   - **something above the title:** any visible element painted above a page's `h1` (`.page-title` or `.doc-title`) inside the same page view, except the nav/tab bar.
   Keep it in one function, give each failure the selector and the pixel distance, and prove it by temporarily re-adding the cost line above the title on a scratch branch: the check must fail on it.
3. Put one line in `Server/doc/review.md` naming the two checks.

## Fence
Write: the link CSS, smoke.mjs (coordinate: @task-mastermind-console-clean is also editing smoke.mjs today; pull before you edit, keep your change in its own function), review.md, this task dir. Hold reloads for CSS writes.
Model: Sonnet. Budget $8. Over pace: no reviewer spawn.
