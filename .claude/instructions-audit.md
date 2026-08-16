# Instructions audit — what the AI is told, and what it costs

Written 2026-08 from inside a long autonomous session — first-hand evidence,
not inference. The pass it recommended has since been executed: `CLAUDE.md`
went from ~47KB (~12,500 tokens, loaded every session) to the current file of
constraints, traps, agreements, and pointers. What remains here is the
evidence, kept as receipts for the rules it produced.

**The headline:**

> Every documentation failure in this session was a **confident false statement**,
> not a missing one. Not one problem was caused by absent guidance.

The cost of a long instruction file is not mainly the tokens — it is that
**prose cannot be tested**, so every sentence is a liability that ages while
the code underneath moves. Length is bad *because* it correlates with
staleness, not on its own.

## The four failures, with receipts

1. **The section a new session trusts most was wrong.** The old "How the site
   works" described `App.load_page()`, `Page.module_url()`, and a `.page.js`
   sibling convention — none existed (0 grep hits). A page linked from the
   home page sat unreachable, and a browser crawl — not the docs — is what
   found 5 of 6 site sections 404ing.

2. **One sentence of guidance hid the best design record in the repo.** The
   skill called `core/new/` sketches not to be read; `new/1/Router.js` was
   line-for-line the shipping router, and its readme the only design record
   with measurements — while four core classes had no readme at all.

3. **Writing a rule down is not enforcement.** `framework/readme.md` already
   said "rename freely inside `framework/`, alias on the way out" — and the
   App rewrite still dropped four APIs and took every sandbox down with it.
   Only a test or a structural impossibility enforces anything. This bounds
   what *any* amount of instruction text can buy.

4. **Two instruction sources gave opposite orders** on committing agent
   scratch dirs (`CLAUDE.md`: never; a since-deleted skill: they're a
   deliverable), arbitrated mid-task. **Contradictions are worse than either
   rule alone** — they convert an automatic decision into a judgement call,
   every time. This is why `CLAUDE.md` now opens with a Precedence section.

## What earned its tokens

The lines that prevented real bugs shared one property: **traps that do not
throw** — undiscoverable by reading the code and by testing, because the
failure is silent. That is the highest-value-per-word content, and it now *is*
the `CLAUDE.md` Traps section. The prescriptive taste moved to skills; the
facts moved next to their code, replaced by pointers.

The organising principle of the rewrite: **split by decay rate, not topic.**
Constraints and silent traps age almost never — always loaded. Facts age
constantly — they live next to the code. Taste ages slowly — a skill, loaded
on demand. Date any volatile claim you must write down.

## The counter-argument, stated fairly

Minimal instructions have a real cost: **a model with less context makes more
locally-reasonable, globally-wrong choices.** "Propose before major surgery"
is valuable precisely because it is *not* re-derivable from the code. So the
rule is not "cut by volume" — keep every sentence that encodes a preference or
a silent trap, and delete every sentence that restates something a file
already says. The first category is small and durable. The second was most of
the old file, and it was the part that was wrong.
