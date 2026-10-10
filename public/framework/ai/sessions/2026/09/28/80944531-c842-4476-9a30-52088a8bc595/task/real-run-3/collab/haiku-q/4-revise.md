# Revised Answer: Shared CSS Changes, Screenshots, and the Review Gate

## Question
When does a merge into `michael/dev` need before-and-after screenshots (for shared CSS changes)? And may an agent ever skip `node Server/merge.mjs`'s review gate for a light-sized change if confident it's safe?

## Answer

### What review.md Actually Says (and Doesn't Say)

**There is no rule in `review.md` saying "shared CSS change → always take a before/after screenshot."** Screenshots (1280/1920/3440 + UX questions) are tied exclusively to the `full` size tier, which is triggered by *what kind of thing changed*, not by whether CSS is "shared":

- **Size `none`** — CSS or docs only, ≤20 lines, no new file → no review, no screenshot
- **Size `light`** — code changed, but no new page/module/Servex part → fresh Sonnet reviews code, no screenshot
- **Size `full`** — new page, module, tool, or Servex change → fresh Opus + screenshots

A shared CSS edit under 20 lines with no new file is `none` size by the letter of the rule — no review, no screenshot.

### The Principle: Visual Impact, Not CSS Scope

Industry practice (GitButler's approach: "screenshots only if visible") supports this: screenshots validate whether visible output changed, not whether the CSS file itself is shared or touches many lines. A CSS refactor across multiple files might stay `light` or even `none` size if the rendered page looks identical. The mastermind's judgment is about **whether the change's visual impact warrants escalating the review tier**, not whether the file itself is risky.

### Where the Mastermind's Discretion Lives

The mastermind has **one explicit discretionary lever** — raising or lowering a computed size:

- **Raising** (e.g., from `none` to `light`): needs no justification. If a CSS change looks risky or affects many pages, bump the size to get more eyes.
- **Lowering** (e.g., from `full` to `light`): requires `--why "self-evident: <reason>"` at review time, logged as a decision line.

This is how judgment enters: the mastermind can decide that a shared CSS change is scary enough to treat as bigger than its line count implies, triggering a screenshot requirement. But **that decision is about escalating review scope, not about skipping the review that a size tier already requires**.

### Can an Agent Skip the Review Gate by Being Confident?

**No.** This is a hard rule, mechanically enforced in code:

- `Server/merge.mjs` **always refuses** a `light` or `full` branch without a review newer than its last commit
- `Server/merge.mjs` **always refuses** any branch with unanswered `[fix]` findings
- No agent can bypass this on authority of its own confidence

There is a `--no-review` flag that can skip the gate, but:
1. It prints loud `!!!` warnings
2. It requires a reason to be logged
3. **Nothing in `review.md` or the sub-mastermind skill grants an agent discretion to use it** — it is a loud, documented exception for rare cases, not a routine judgment call any minion or developer should reach for on a hunch

The distinction is critical: **lowering size** (with `--why`) is a documented adjustment to what review scope to apply; **skipping review** (with `--no-review`) is bypassing the gate altogether, a much bigger decision that belongs to whoever owns the merge, not to an agent acting on confidence alone.

### In This Repo: Hard Rule vs. Judgment

**Hard rules (mechanical, no exceptions):**
- Review size is computed from what changed: CSS/docs ≤20 lines = `none`; code changes = `light` or `full`
- Screenshots only for size `full`
- The merge gate refuses `light` or `full` without a passing review
- Unanswered `[fix]` findings block the merge

**Judgment call (mastermind only):**
- Whether a shared CSS change warrants raising its size to get screenshots or stricter review
- Whether a computed size should be lowered with `--why "self-evident: ..."`
- Whether to invoke `--no-review` in truly exceptional cases (loudly warned and logged)

**Not a normal judgment call for any agent:**
- Skipping the merge gate on confidence alone, whether via `--no-review` or any other route

---

## Sources

- `Server/doc/review.md` (this repo) — size table, review gates, mastermind's size-lowering authority
- `Server/merge.mjs` (this repo) — review gate enforcement, `--no-review` flag, warnings
- [GitButler PR #16000: CSS label, screenshots only if visible](https://github.com/gitbutlerapp/gitbutler/pull/16000) — real-world precedent: visual impact drives screenshot need
- [Visual Regression Testing: Best Practices & When to Use It](https://www.visual-regression-testing.dev/visual-regression-testing) — industry context on when screenshots add value
- [Guide to CSS Testing: Ensuring Visual Consistency Across the Web](https://www.devzery.com/post/guide-to-css-testing-ensuring-visual-consistency-across-the-web)
