---
name: css
description: Invoke before writing any substantial CSS in this repo — it has you read framework.css itself (the utility vocabulary, exact definitions) and decide where the declaration belongs before you write it. Re-invoke if it has been a while since the last time (context drifts); skip it for a one-line tweak. Naming a new class → the new-css-class skill; sizing a page → layout.
---

# CSS

Read the readme chain at [/framework/code/css/](/framework/code/css/) (root → framework → code →
css) — layers, where a declaration belongs, and class naming (`new-css-class` folded in there
too). Colour and contrast moved to [/framework/design/color/](/framework/design/color/); the
vocabulary itself is [/framework/styles/](/framework/styles/).

Overview: climb the ladder — nothing → a utility class → a layout word → a component class → the
module's own CSS — and stop at the first rung that works. Every rule sits in one of `base theme
site util`, declared once in `framework.css`. `@layer util` beats `@layer theme` regardless of
specificity. Constrain the container, never the items. A class that doesn't exist paints nothing
and throws nothing — verify it by reading the rule.

## Read when it applies

- [`caveats.md`](caveats.md) — pointer only now; the live list is [/framework/code/css/doc/caveats.md](/framework/code/css/doc/caveats.md).
- [`strategy.md`](strategy.md) — folded into [/framework/code/css/doc/rules.md](/framework/code/css/doc/rules.md).

Improve this skill: [`improvements.md`](improvements.md).

Review questions for this system: [/framework/code/css/questions.md](/framework/code/css/questions.md), [/framework/design/layout/questions.md](/framework/design/layout/questions.md) (spacing) and [/framework/design/color/questions.md](/framework/design/color/questions.md) (colour).
