---
name: naming
description: Run whenever something needs a name — a class, a method, a CSS class, a page, a card, a tool, a concept in a readme. Brainstorm in parallel with cheap fast clones, then pick for clarity. Thirty seconds of wall time.
---

# Naming: many candidates, then one clear pick

A name is read far more often than it's written. The owner, 2026-09-29: brainstorm names in parallel, then pick the clearest.

1. **Say the thing in one plain sentence:** what it is, and what a newcomer would call it.
2. **Brainstorm in parallel.** Start 3–5 cheap fast agents (Sonnet, low effort; `spawn_agent`, or Agent with `model: sonnet`). Give each the sentence, the names of its neighbours, and one angle: *plain English*, *what the user sees*, *what it does*, *the name a rival library uses*, *the shortest*. Ask each for 5 names with a reason of four words.
3. **Pick for clarity, not wit.** Rule out a name that needs explaining, clashes with a neighbour or a reserved prefix (for a CSS class, run `new-css-class` too), or names how it's built instead of what it is. Among what's left, take the one a newcomer would guess.
4. **Log the pick** in task.jsonl as a `decision` with the runner-up as the alternative. For a name the owner will see, the `decide` skill writes it.
