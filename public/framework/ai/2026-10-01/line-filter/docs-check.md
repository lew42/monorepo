# Docs check — public/imagine/lines/doc/filter.md

Read: root readme.md, framework readme.md, imagine readme.md, imagine/lines readme.md, doc/filter.md. No code.

## Verdict: mostly clear, one real gap

The page does what Law 2 asks for in its first and last sections — plain sentences, a live demo up top, four sliders explained in terms anyone can picture (bigger window = smoother but softer corners, etc). The Limits section is also genuinely plain: it says what this is not (not a probability, not object recognition) before listing edge cases.

## Where it breaks the newcomer rule

**"Three ingredients" drops into unexplained jargon with no translation and no link.** "Centred differences," "structure tensor," "gradient outer products," "eigenvalue gap divided by its trace," "sample along the tangent" — a new coder gets none of these without already knowing linear algebra and image processing. CLAUDE.md calls this out directly: "jargon standing in for an explanation is a failure, not economy." Each term needs either one plain-English clause (e.g. "direction: the gradient — which way brightness is changing fastest — averaged over a small window, then checked for how much that direction agrees across the window") or a link to somewhere that supplies it. Right now there is neither.

**The three named outputs don't map to the three named ingredients.** The confidence formula reads "coherence × along-line support × relative signal strength," but the three ingredients are called "Change, Direction, Consistency." Coherence clearly comes from Direction. It's left to the reader to infer that Consistency produces both "along-line support" and "relative signal strength" — the doc never says so in those words. A reader checking the formula against the three bullets above it has to do the matching themselves.

**No one-line "why" before the math.** The doc opens with a demo and then goes straight to mechanism. A single plain sentence first — something like "it looks for pixels where the colour keeps changing the same way, in the same direction, along a line" — would let a reader hold the big picture before the three-step breakdown, per Law 2 ("explain it like I'm five... so the reader knows exactly what is being said before any detail arrives").

## Not a problem

- The sliders section and Limits section already meet the bar — concrete, plain, no unexplained terms.
- Cross-references (readme → filter.md, filter.md → the seagull photo) are correctly one-way: detail lives here once, the readme just points.
- Nothing seems missing structurally — ingredients, controls and limits is the right shape for this page.

## Suggested fix (not applied — docs only, no edit made)

Add one plain-English clause or short aside per jargon term in "Three ingredients," and one sentence up front stating the one-line idea before the mechanism. Label the formula's three terms against the three ingredient names explicitly (e.g. "Direction gives coherence; Consistency gives both along-line support and relative signal strength").
