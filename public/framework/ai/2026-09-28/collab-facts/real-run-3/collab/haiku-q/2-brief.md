# Brief: Shared CSS Changes, Screenshots, and the Review Gate

## Question
When does a merge into `michael/dev` need before-and-after screenshots (for shared CSS changes)? And may an agent ever skip `node Server/merge.mjs`'s review gate for a light-sized change if confident it's safe?

## Answer

### Screenshots Are Tied to Size, Not File Type

The repo's `Server/doc/review.md` ties screenshots (1280/1920/3440 + UX questions) **exclusively to the `full` size tier** — that is, new pages, modules, tools, or Servex changes. **Shared CSS changes are not automatically `full` size.** Therefore:

- **Shared CSS ≤ 20 lines, no new file** → size `none` → **no review, no screenshots**
- **Shared CSS > 20 lines or touches new file, but code-only** → size `light` → **review by Sonnet, no screenshots**
- **Shared CSS that is part of a new page, module, or tool** → size `full` → **Opus review + screenshots**

### When Visual Testing Matters (Industry Practice)

Industry best practices (visual regression testing) indicate that before-and-after screenshots add value for CSS changes when:

1. **The change cascades across multiple components** — a small shared CSS tweak can ripple across the whole site
2. **It affects layout or responsive behavior** — code review alone misses rendering issues across browsers/devices
3. **It's on customer-facing pages** — where visual bugs harm the user experience
4. **The scope is unclear** — the change's actual effect is not immediately obvious from the code

However, these are **judgment calls about whether to review more carefully**, not automatic triggers for screenshots. The repo's **size tier system already embeds this judgment**: if a CSS change is large, risky, or touches new pages, the mastermind can raise its size (or the size computation will, if it affects new files). Screenshots follow that decision.

### The Review Gate Is Non-Negotiable

**No agent—minion, mastermind, or confident developer—may skip the merge gate by asserting the change is safe.**

- Size `light` or `full` → merge gate **always refuses** without a passing review
- A `[fix]` finding with no answer → merge gate **always refuses**
- The mastermind may **lower** size only via `--why "self-evident: <reason>"` (recorded as a decision)
- The `--no-review` flag exists but prints loud `!!!` warnings; it is rare and exceptional

The gate is a **process, not a confidence check**. A minion or agent cannot bypass it.

### In This Repo: The Hard Rule vs. Judgment

**Hard rule (settled):**
- Review size is mechanical: CSS/docs ≤ 20 lines = none; code changes = light or full
- Screenshots only for size `full`
- The merge gate refuses light/full without passing review; no exceptions for confidence

**Judgment call (mastermind only):**
- Whether a shared CSS change warrants raising its size (to light or full) to get more scrutiny
- Whether to invoke `--no-review` in truly exceptional cases (loudly warned)
- Whether a particular CSS change is "self-evident" and safe to lower size for

---

## Sources

- [Visual Regression Testing - All You Need to Know](https://www.virtuosoqa.com/post/visual-regression-testing-101)
- [What is Visual Regression Testing? | BrowserStack](https://www.browserstack.com/percy/visual-regression-testing)
- [CSS Regression Testing: How to Automate CSS Tests | Diffy](https://diffy.website/css-regression-testing/)
- [Visual Regression Testing [2026] | Percy](https://percy.io/blog/visual-regression-testing/)
- [Guide to CSS Testing: Ensuring Visual Consistency Across the Web](https://www.devzery.com/post/guide-to-css-testing-ensuring-visual-consistency-across-the-web)
- [Automated Visual Regression Testing With Playwright | CSS-Tricks](https://css-tricks.com/automated-visual-regression-testing-with-playwright/)
- [Screenshot Testing: The Complete Guide to Visual Screenshot Testing in 2026 - DEV Community](https://dev.to/delta-qa/screenshot-testing-the-complete-guide-to-visual-screenshot-testing-in-2026-2nei)
- [Playwright Visual Regression Testing: Built-In Guide 2026 | Bug0](https://bug0.com/knowledge-base/playwright-visual-regression-testing)
- [Best Visual Testing Tools in 2026 | BrowserStack](https://www.browserstack.com/guide/visual-testing-tools)
