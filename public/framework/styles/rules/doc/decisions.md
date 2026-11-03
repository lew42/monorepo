# Rules — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Five pages of dos and don'ts, each with live examples measured by
`ext/DesignTool` as the page renders. The `css-strategy` skill is the compressed
version an agent loads; **this is the long form a human argues with.**

## Why these live in the site, not only in a skill

A skill is read by whoever is about to write code. A page is read by whoever is
about to *review* it, and it can **show** the thing. The padding rule is a
sentence in the skill and a row of rendered cards here, each printing its own
measured ratio — so when the rule stops being true, the page stops claiming it.

The split: **skill = what to do, page = why, and proof.**

## The enforcement seam

Every rule that can be measured has a rule of the same name in
`ext/DesignTool`, with the same threshold:

| page | analyzer rule |
|---|---|
| Proportion | `pad-scale`, `cramped`, `double-pad` |
| Nesting | `escape`, `clipped`, `measure`, `zero-size` |
| Cascade | `gutter` |
| Robust | the whole corpus at four widths |

**When the two disagree, one is out of date.** That is the point of naming them
the same thing — a mismatch is discoverable instead of quiet.

## Decisions

**Written to be argued with, not obeyed.** `never` and `always` appear only
where something actually breaks — a zero-width flex item, a clipped rail with no
scrollbar. Everywhere else the rule states its reasoning and its weight. Over-firm
documentation trains the reader to obey rules that never needed to exist, and
this file is the one most likely to be read by someone with less context than
its author had.

**Live demos over asserted examples.** A code block in prose is a claim; a
rendered card printing its own measured padding ratio is evidence. It costs a
`requestAnimationFrame` and it means the page cannot drift from the tool.

**One page per question, not one page of rules.** Each has a URL, so a review
comment can point at `/framework/styles/rules/nesting/#…` instead of quoting a
paragraph. The prime objective: everything browsable, in the fewest clicks.

## For the owner — one decision waiting

**`.measure` centres, and this site's other rule is one left edge.**
`framework.css` gives `.measure` `margin-inline: auto`; `Page.css` says the
opposite in as many words — *"No auto margins: every shape shares ONE left edge,
so a page narrower than its region stays flush left rather than finding its own
centre."*

The collision is not theoretical. Three layouts built from the Figma spec
(`hero`, `pricing`, `carousel`) each rendered a capped intro block **centred
above left-aligned content**, and each worked around it with an inline
`max-width: 34em` — which is precisely the hardcode a utility exists to replace.
The analyzer scored them A/B the whole time, because centring is not a
geometric failure.

Shipped as **additive**: `.measure.start { margin-inline: 0 }`, because
`.measure` has eight call sites in the section vocabulary that genuinely do want
centring. **The open question is which way round the default belongs.** Making
`.measure` flush-left and `.measure.center` the exception would match the house
rule and touch those eight; leaving it is one more word to remember forever.

## Open

- **`robust.md` has seven arrangements; there should be more.** It is a
  shortlist of what has been proven at four widths, not a survey.
- **No page yet for type or colour** — this is layout only.
- **The nesting table's "safe?" column is hand-written**, while the demos below
  it are measured. Those should be the same source.
- **Nothing enforces that a rules page and its analyzer rule agree.** A test
  that renders each demo and asserts the named rule fires would close that.
