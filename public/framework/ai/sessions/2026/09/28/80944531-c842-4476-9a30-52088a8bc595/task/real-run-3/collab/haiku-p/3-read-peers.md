# What Peers Found

## haiku-q

Identified four concrete judgement-call scenarios for raising CSS change severity (cascading effects, layout/responsive impact, customer-facing scope, unclear scope) and sourced industry visual regression testing practices; also surfaced the `--no-review` flag as an exceptional escape hatch that exists but is loudly warned and rare. I missed the flag entirely and the specificity of when visual scrutiny adds real value beyond code review alone.

## sonnet-r

Explicitly checked `Server/doc/review.md` for a "shared CSS change → screenshots" rule and found none; also directly examined `Server/merge.mjs` to document the `--no-review` flag and its warning text, then clarified the critical distinction: `--why "self-evident"` *lowers* size before review runs (legitimate mastermind call), while `--no-review` *skips* review after size is computed (not routine, and contradicts the sub-mastermind skill's "Never" list forbidding unilateral confidence-based decisions). I missed this entire escape hatch and the principle that using it violates the skill's own guidance on who makes safety calls.
