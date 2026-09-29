# Ask-each — one question at a time

The owner's idea, in one line: **a prompt that dumps 12 questions on a model gets answered
shallowly, in one pass — ask the same questions one at a time, in the same session, and each
answer gets the model's full attention.**
(Verbatim, `public/framework/ai/2026-09-28/harness-research/owner-words.md`, "Added 2026-09-28
about 11:15 PM".)

## What it is

`Server/ask-each.mjs` — plain Node, one Claude Agent SDK session (the same SDK Servex uses),
context sent once, then every question sent as its own turn in that same session so the model
still remembers the context and its own earlier answers.

```
node Server/ask-each.mjs <questions.md> [--context <file>] [--model claude-sonnet-5] [--out answers.md]
```

- `<questions.md>` — one question per non-empty line (a leading `- `, `* ` or `1. ` is stripped,
  so a normal Markdown list just works).
- `--context <file>` — sent as the very first turn, once, before any question (e.g. "you are
  choosing a page layout; here is the page's content and constraints").
- Writes `--out` (default `answers.md`) as one `## N. <question>` heading per question, with its
  answer underneath, plus a total-cost comment at the top.
- No browser, no tool use (`allowedTools: []` — this is a Q&A tool, it never edits the repo), and
  every child process the SDK spawns is already hidden (`windowsHide: true`, built into the SDK
  itself — verified by grepping `Servex/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs`, no
  extra work needed here).
- The model call lives in one function, `askOnce()` — a future OpenRouter harness swaps that one
  function out; the loop, the file parsing and the output format don't change.

## The proof: same 3 questions, two ways

Context: a fake doc page to lay out (`ext/Panel`, 5 sections, viewed at 3440px). Three layout
questions about it (columns? which piece gets centered? where does a table go?).

- **One at a time (`ask-each.mjs`):** $1.98, one session, 3 turns.
- **One combined prompt (all 3 questions in a single turn):** $0.27, one turn.

Full transcripts: `public/framework/ai/2026-09-28/ask-each/answers-one-at-a-time.md` and
`answers-one-prompt.md`.

**Depth — both answered well; the difference is what each answer stayed accountable to.**
The single-prompt version wrote three solid, self-consistent short essays. But it invented and
re-used its own reference points across all three answers (a nav-rail + wide content column, a
"framework explicitly forbids the layout jumping" rule) that don't exist anywhere in the context
it was given — plausible-sounding, unverifiable additions, made once and then built on for the
next two answers because they were all composed together.

The one-at-a-time version was measurably more grounded: each answer named this repo's real
vocabulary (`main`/`wide` tracks, `.grid.auto`, `core/Page`'s actual Miller-columns feature) and,
for question 2, explicitly caught itself framing the problem wrong ("the real risk is left-edge
drift, not height") — a self-correction that shows up between turns, not inside one. It also
closed every answer with a concrete, checkable next step ("screenshot the full scroll at 3440 and
confirm the demo's left edge and the gotchas list's left edge land on the same vertical line")
where the combined-prompt version stayed at the level of general advice.

**Cost — one at a time costs about 7x more** for this 3-question run ($1.98 vs $0.27). That's the
real trade the owner's idea makes: each turn re-sends the accumulated session (context + every
prior Q&A) as new input tokens, so turn *N* pays for turns 1..N-1 again on top of its own answer.
For 3 questions that's still cheap in absolute terms; it will not stay cheap linearly as the
question count grows — a 12-question run should be expected to cost roughly `O(n²)` in resent
context, not `O(n)`. Worth watching once this is used for a real 12-question layout brief, not
just this 3-question proof.

**Verdict:** use `ask-each` for exactly the case the owner named — a small number of
genuinely-hard, order-independent judgment calls (like the layout-decision questions
`minion-layout-system` asked for) — not as the default way to ask a model anything. A short list
of simple or dependent questions is cheaper and nearly as good in one prompt.

## For the next agent

Both scratch inputs (context + questions) and both outputs live at
`public/framework/ai/2026-09-28/ask-each/` for anyone who wants to re-run the comparison or reuse
the 3-question layout test. The comparison script that produced the single-prompt run was a
one-off scratch file, not committed — `askOnce()` in `ask-each.mjs` is the reusable half.
