# UX — the behavior tier: `ui/` hands you markup, `ux/` hands you a class you can extend

A **ux** is a *workflow* — signup, login, a wizard, a course, a game lobby — assembled from
`ui/` templates and responsive from a phone to 3440. It is a class so that the next case is
a subclass, not a fork. Five shipped 2026-08-21 against the plan below: Auth, Wizard, Tree,
Course, Filter.

|  | [`ui/`](/framework/ui/) | `ux/` |
|---|---|---|
| is | html + css templates | classes |
| has | no listener, no state, no lifecycle | all three |
| you get | markup, with a copy button | an instance, and every method is a seam |
| a variant is | a child page — a different **thing**, not a different value | a named subclass — `class CardHero extends Card` |
| today | 20 components | 8 — [Auth](/framework/ux/Auth/) · [Wizard](/framework/ux/Wizard/) · [Tree](/framework/ux/Tree/) · [Course](/framework/ux/Course/) · [Filter](/framework/ux/Filter/) · [Menu](/framework/ux/Menu/) · [Pagination](/framework/ux/Pagination/) · [Tags](/framework/ux/Tags/) |

## Use

The graduation rule, in one line: **a template graduates when something has to be remembered
between renders.**

```js
// ui/  — a template. A handler at the CALL SITE does not make it behavioral.
div.c("surface pad flex v gap", () => { h3("View"); p("…"); });

// ux/ — state that outlives a render, so it is a class and it extends.
class Wizard extends View { … }
class SignupWizard extends Wizard { … }   // never Wizard2, never { variant: 2 }
```

The [2026-08-21 audit](/framework/ai/2026-08-21/ui-behaviors-audit/) scored **1 behavioral /
20** — `ui/tree` held row state and selection in a closure, which is a class written in a
shape nothing can subclass. It graduated, as [`ux/Tree`](/framework/ux/Tree/); the other
nineteen stay.

## Watch out

- **A ux never ships a "compact mode" or a "high contrast mode."** Both tiers read the same
  framework tokens, so [config words](/framework/ui/words/) re-skin a workflow and a template
  identically — [doc/system.md](/framework/ux/doc/system/)
- **Splitting is the usual answer, not moving.** `tree`'s CSS stays `ui-tree-*` in `ui/`; only
  the stateful half becomes a class — [doc/system.md](/framework/ux/doc/system/)
- **A ux imports `ui/` templates; `ui/` must never import `ux/`.** Imports flow down, and a
  cycle here breaks only on a deep reload — [doc/decisions.md](/framework/ux/doc/decisions/)
- **Behavior is not a reason to hide markup.** A ux exposes the templates it composed, or the
  first case half a step off it forks the whole class — [doc/system.md](/framework/ux/doc/system/)

## More

- [Overview](/framework/ux/) · [`doc/system.md`](/framework/ux/doc/system/) — the tier boundary argued,
  the config-word contract, the naming rules · [`doc/decisions.md`](/framework/ux/doc/decisions/) — every
  call made on 2026-08-21, what was rejected, and the modules' verdicts consolidated
- The eight: [Auth](/framework/ux/Auth/) · [Wizard](/framework/ux/Wizard/) · [Tree](/framework/ux/Tree/) ·
  [Course](/framework/ux/Course/) · [Filter](/framework/ux/Filter/) · [Menu](/framework/ux/Menu/) ·
  [Pagination](/framework/ux/Pagination/) · [Tags](/framework/ux/Tags/) — each has its own `readme.md` +
  `doc/decisions.md` with the evidence · [skill-suggestions.md](./skill-suggestions.md) — what a future
  `ux-design` skill should carry
- [`ui/words/`](/framework/ui/words/) — the two config words, live and toggleable
- [`ui/readme.md`](/framework/ui/) — the template tier · [`core/View`](/framework/core/View/) —
  the base class a ux extends
