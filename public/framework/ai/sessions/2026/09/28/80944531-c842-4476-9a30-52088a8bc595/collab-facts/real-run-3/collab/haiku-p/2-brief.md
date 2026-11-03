# When Shared CSS Changes Need Screenshots

## The Hard Rule

The merge gate at `Server/merge.mjs` is **always enforced** — no agent can skip it by claiming confidence. This is non-negotiable.

## The Mastermind's Judgment Call

Whether "shared CSS changed" triggers a before/after screenshot is **not** a hard rule. It depends on:

1. **Visual impact**, not CSS scope: Screenshots (1280/1920/3440) are required for "full" size reviews, which happen when there is a new page, module, tool, or Servex change. A shared CSS refactor alone does not automatically escalate to "full" size unless it introduces a new component or service. GitButler's approach codifies this: "screenshots only if visible" — a CSS change with no visible impact (renamed tokens, internal reorganization, moved rules) does not require before/after shots, even if it touches shared code.

2. **Size assignment is discretionary**: The task mastermind assigns the review size (none/light/full) based on the nature of the change. A 15-line CSS update affecting multiple pages could stay "none" size (no review) if it is clearly safe. A complex CSS refactor might be "light" (code review, no screenshots). Only changes introducing new UI surfaces need "full" (with screenshots).

3. **The override path is documented**: If a shared CSS change is large or risky, the mastermind can lower the size only by running `--why "self-evident: <reason>"` to document the decision. This makes the judgment auditable.

## In Practice

- A CSS change ≤20 lines with no new file and no visible breakage → **"none" size, no review**
- A CSS refactor affecting multiple files but no visible change → **"light" size, Sonnet reviews code, no screenshots**
- A CSS change introducing a new component or page → **"full" size, Opus reviews + screenshots at 1280/1920/3440**

The hard rule is the gate. The screenshot requirement depends on the size tier. The size tier is the mastermind's judgment call, recorded in the log.

---

## Sources

- [GitButler PR #16000: CSS label, screenshots only if visible](https://github.com/gitbutlerapp/gitbutler/pull/16000)
- [Zulip: Presenting visual changes](https://zulip.readthedocs.io/en/latest/contributing/presenting-visual-changes.html)
- [Smashing Magazine: CSS Refactoring, Strategy, Regression Testing](https://www.smashingmagazine.com/2021/08/refactoring-css-strategy-regression-testing-maintenance-part2/)
- [CSS-Tricks: Automated Visual Regression Testing with Playwright](https://css-tricks.com/automated-visual-regression-testing-with-playwright/)
- [OneUptime: How to Handle Visual Regression Testing](https://oneuptime.com/blog/post/2026-01-24-visual-regression-testing/view)
