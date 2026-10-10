# card_reply length, second task masterminds, and the merge gate

A web search doesn't actually settle any of this — these are private conventions inside this
one repo, not general software-engineering practice, so the useful answer came from reading the
repo's own code and docs, not the web. Here is what each edge case actually is.

## (a) card_reply's "two or three sentences" — a stated convention, not an enforced rule

It's real, but it lives in an unexpected place: the `card_reply` MCP tool's own description, in
`Servex/agents/Assistant.js` ("Two or three plain sentences; the reader is glancing, not reading
code"). So every agent that can call the tool sees this instruction baked into the tool itself,
not just in a skill file — that's stronger than a loose convention.

But it is **not mechanically enforced**: the handler (`card_reply` method, same file) only checks
that `card` and `text` are both present — nothing counts sentences or truncates a longer reply.
And the exact count is inconsistent across the agents that use it: `mastermind-servex.md` and
`card-assistant.md` both say "one or two plain sentences," while `Dispatcher.js` and a helper
agent's prompt say "two plain sentences" or "two to four." So the real state is: a strongly
stated house style, present at the tool-contract level, that different roles interpret with
slightly different numbers, with nothing in code that stops a violation.

## (b) never a second task mastermind — a hard, explicit rule

`.claude/skills/sub-mastermind/SKILL.md`'s Never list states this outright: "spawn another task
mastermind (depth stops at two until one measured run proves a three-deep tree can report failure
upward)." This is written as an absolute, with the one condition that would lift it spelled out
in the same sentence — not a soft preference. The stated reason is mechanical: a nested
background agent's completion notifies the *main* session, not its parent, so a three-deep tree
has no proven way to get a failure report back to the top. Nothing found in this repo shows that
rule bending in practice yet — it's a known limit waiting on a specific proof, not a rule with a
worked edge case.

## (c) every merge through Server/merge.mjs — hard-gated for the sizes that matter, moot for the rest

`Server/doc/review.md` describes `merge.mjs` as mechanically refusing a `light` or `full` branch
if it has no review newer than its last commit, or an unanswered `[fix]` finding. That's an
enforced script-level gate, not a convention. Nothing in the docs describes a way to bypass it in
favor of a plain `git merge` for those sizes.

The one real edge case is size `none` — CSS/docs-only, 20 lines or fewer, no new file — which is
reviewed by nobody. The merge-gate requirement ("no review newer than the last commit") is simply
moot there, since there's no review pipeline expected in the first place; the doc doesn't say
`merge.mjs` special-cases this explicitly, but it follows from the size table. That's the
legitimate bend, and it's about scope (nothing to review) rather than about skipping the mechanism
itself.

## Bottom line

(b) and the `light`/`full` half of (c) are genuine hard rules — one stated outright with its own
lift condition, the other enforced by a refusing script. (a) is the softest of the three: a
strongly worded convention embedded in the tool's contract, but unenforced and inconsistently
quoted, so it's the one most likely to visibly bend in practice.

## Sources

Repo files (not the web — these are internal to this codebase):
- `Servex/agents/Assistant.js` (card_reply tool definition and handler)
- `Servex/agents/mastermind-servex.md`, `Servex/agents/card-assistant.md`, `Servex/agents/Dispatcher.js` (differing wordings of the sentence-count convention)
- `.claude/skills/sub-mastermind/SKILL.md` (the depth-two rule)
- `Server/doc/review.md` (the merge gate and the size table)

Web (background only, not specific to this repo, and did not change the answer):
- [Pre-merge Code Reviews](https://verraes.net/2013/10/pre-merge-code-reviews/)
- [Pre-Merge Checks: Built-in & custom PR rules enforced](https://www.coderabbit.ai/blog/pre-merge-checks-built-in-and-custom-pr-enforced)
