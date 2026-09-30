# UX — the behavior tier: `ui/` hands you markup, `ux/` hands you a class you can extend

## Index

Every module here, and what you would use it for.

- [Auth](./Auth/) — login, signup, password reset and a social-login row, as one class you can extend.
- [Content](./Content/) — cards that read and append to a `.jsonl` log: Question, Decision, Quotation, Spend.
- [Course](./Course/) — chapters of lessons with a side rail, a reading column and a next-up card.
- [Dictate](./Dictate/) — a microphone button that always shows what is happening and what it heard.
- [Filter](./Filter/) — a segment row plus a search box that filters several regions at once.
- [Menu](./Menu/) — a dropdown menu that closes after a pick and on an outside click.
- [Pagination](./Pagination/) — a row of page buttons that remembers the current page and drives real content.
- [Popover](./Popover/) — one popup anchored to a trigger, in the browser's top layer so no z-index fights it.
- [Rename](./Rename/) — tap a title, ask to rename it, pick from a dropdown of 5 suggestions.
- [Tags](./Tags/) — a chip row where you add and remove tags.
- [Tree](./Tree/) — nested rows you can open, drag and drill into, from an array or a `Page`'s children.
- [Understand](./Understand/) — a ✓ or ? after every sentence, a clarifying question right in the flow.
- [Wizard](./Wizard/) — the generic multi-step engine that lessons, courses and signup extend.
- [doc](./doc/) — the tier's written rules: [system.md](./doc/system/) and [decisions.md](./doc/decisions/) (a docs folder, no readme).

A **ux** is a *workflow* — signup, login, a wizard, a course, a game lobby — assembled from
`ui/` templates and responsive from a phone to 3440. It is a class so that the next case is
a subclass, not a fork. Fourteen live today, each its own real page under `/framework/ux/` — the
index is a wall of cards, never a tab strip (2026-09-22).

|  | [`ui/`](/framework/ui/) | `ux/` |
|---|---|---|
| is | html + css templates | classes |
| has | no listener, no state, no lifecycle | all three |
| you get | markup, with a copy button | an instance, and every method is a seam |
| a variant is | a child page — a different **thing**, not a different value | a named subclass — `class CardHero extends Card` |
| today | 20 components | 14 — [Auth](/framework/ux/Auth/) · [Wizard](/framework/ux/Wizard/) · [Tree](/framework/ux/Tree/) · [Course](/framework/ux/Course/) · [Filter](/framework/ux/Filter/) · [Menu](/framework/ux/Menu/) · [Pagination](/framework/ux/Pagination/) · [Tags](/framework/ux/Tags/) · [Dictate](/framework/ux/Dictate/) · [Popover](/framework/ux/Popover/) · [Content](/framework/ux/Content/) |

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
- **The index (`ux/page.js`) is a plain `Page`, not a `Doc`** — on purpose, so its own children
  are exactly the ten modules (a card wall, and the sidebar rail expands to exactly those ten)
  with no Overview/API/Docs/Files chrome mixed in. `doc/system.md` and `doc/decisions.md` still
  resolve at their old urls through one `route("doc")` — visiting either logs one harmless
  browser-level 404 first (`Page.load()` probing for a `page.js` that isn't there before its own
  `.md` fallback succeeds; `documentation` skill names this as the fallback's documented cost,
  not a bug) — [`ai/2026-09-22/ux-subpages/`](/framework/ai/2026-09-22/ux-subpages/).
- **Hover a card, press the flag, name what's wrong.** The approve-or-reject process the owner
  asked for, with no approve button: one line goes through the same `card_say` rpc the AI
  board's cards use, lands on `ai/verdicts.jsonl` as an `improve`, and a quiet marker stays on
  the card. `ux/page.js`'s `wall()` + `flaggable()`, styled in `ux/ux.css`.

## More

- [Overview](/framework/ux/) · [`doc/system.md`](/framework/ux/doc/system/) — the tier boundary argued,
  the config-word contract, the naming rules · [`doc/decisions.md`](/framework/ux/doc/decisions/) — every
  call made on 2026-08-21, what was rejected, and the modules' verdicts consolidated
- The ten: [Auth](/framework/ux/Auth/) · [Wizard](/framework/ux/Wizard/) · [Tree](/framework/ux/Tree/) ·
  [Course](/framework/ux/Course/) · [Filter](/framework/ux/Filter/) · [Menu](/framework/ux/Menu/) ·
  [Pagination](/framework/ux/Pagination/) · [Tags](/framework/ux/Tags/) · [Dictate](/framework/ux/Dictate/) ·
  [Popover](/framework/ux/Popover/) — each has its own `readme.md` + `doc/decisions.md` with the evidence ·
  [skill-suggestions.md](./skill-suggestions.md) — what a future `ux-design` skill should carry
- [`ui/words/`](/framework/ui/words/) — the two config words, live and toggleable
- [`ui/readme.md`](/framework/ui/) — the template tier · [`core/View`](/framework/core/View/) —
  the base class a ux extends
