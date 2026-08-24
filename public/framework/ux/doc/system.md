# The system: two tiers, one token set

*Written 2026-08-21, before `ux/` had a single class in it. Nothing below is a report on
existing code — it is the contract the first ones are held to.*

## 1. Why there are two tiers at all

The owner's ask: *"ui/\* should generally be html+css templates, not behavioral. Once
something needs behaviors, it should probably become a ux, a class, so it's extendable, and
we can have extensions as variants."*

`ui/` had already arrived there three separate times without naming it. `ui/doc/decisions.md`
reads, over and over, *"there is no `ui.pagination()` / `ui.dialog()` / `ui.menu()` /
`ui.tags()` / `ui.field()`"* — and each time the reason given was the same one: the component's
single line of real logic (menu's close-on-pick, pagination's current page, tags' `×`) was
always half a step off the next caller's case, so it was left out of the component and shown
**inline, in the copy-paste demo**, where a reader could edit it.

That is the boundary, discovered from below. The bar `ui/` already uses for exporting a
*function* — *"logic a user shouldn't have to carry"* — is the same bar, one rung up.

## 2. The graduation rule

**A template graduates when something has to be remembered between renders.**

Three things count, and nothing else does:

| counts | does not count |
|---|---|
| state the component holds (a selection, a cursor, an open row) | a click handler the **caller** writes at the call site |
| a listener the component installs on its own elements | `:hover`, `:focus-visible`, `<details>`, `<dialog>` — the platform's behavior |
| a lifecycle — `update()`, `select()`, anything that runs twice | a loop that builds markup once and returns it |

The right column is why the [2026-08-21 audit](/framework/ai/2026-08-21/ui-behaviors-audit/)
came back **1 behavioral / 20**. Nine components look interactive and are native HTML; three
(`table`, `timeline`, `keys`) are exported functions and every one is a *loop*, which is
markup a `for` can say and a `<template>` cannot. Only `ui/tree` keeps a `rows` Map and a
`selected_row` across an `update()`, in a closure — which is a class written in the one shape
nothing can subclass.

**Splitting is the usual answer, not moving.** A component that graduates leaves its CSS
behind: `.ui-tree-*` stays in `ui/tree/tree.js`, because a rule about a relationship or a
state is exactly what `ui/` is for. Only the stateful half becomes a class. A `ux` that also
took the stylesheet would fork the look the day the template's changed.

**Graduating is not a licence to hide the markup.** A class you cannot see inside is a class
you have to fight the first time your case is half a step off — the same argument that kept
sixteen components as templates. A `ux` exposes the `ui/` pieces it composed (a method per
piece: `header()`, `row()`, `footer()`), so a subclass overrides one of them instead of
reimplementing the workflow.

## 3. Variants are named subclasses

```js
class Wizard extends View { … }
class SignupWizard extends Wizard { … }      // ✓ the name says what it IS
class CardHero extends Card { … }            // ✓
class Wizard2 extends Wizard { … }           // ✗ a number is not a difference
new Wizard({ variant: "hero" })              // ✗ an option is API surface forever
```

Two consequences worth stating:

- **Parts hang off the constructor as statics**, so a subclass inherits a whole machine and
  overrides one branch of it (`Sortable.List.View`) — the `code` skill, §3. A `ux` with several
  moving pieces gives each piece a class rather than another file.
- **A variant that is only a different *value* is not a subclass** — it is a token. `ui/` has
  ruled this twice (`avatar/sizes` → `--avatar`, `stats/summary` → `--column`) and `ux/`
  inherits the rule. `--density`, below, is the same call made for the whole system.

## 4. The config-word contract

A **config word** is a class on a *section* that remaps framework tokens. `ui-contrast` and
`ui-compact` are the first two ([live](/framework/ui/words/)).

### A word MAY

- **Declare custom properties.** That is the entire permitted vocabulary.
- Sit anywhere — `<html>`, `.app`, a section, one card. The mechanism is **inheritance**, so
  the scope of a word is exactly the subtree it is written on, and a word on a *descendant* of
  the theme beats the theme by proximity, at any specificity. ⚠ One exception, and it is the
  only place order matters: on the **same element** as the theme class
  (`.theme-lew42.ui-contrast`) both are `(0,1,0)` in `@layer theme`, so whichever stylesheet
  loaded later wins. Put a word on a descendant and the question never comes up.
- Compose with any other word. Two words on one element set disjoint properties and never
  meet in the cascade.

### A word MAY NOT

- **Name an element or a component class.** `.ui-compact .ui-table td { … }` is per-component
  CSS wearing a section word's name — the one thing this mechanism exists to delete.
- **Use `!important`, or fight specificity at all.** It never has to: a utility *reads* the
  property (`.pad { padding: var(--pad, 1em) }`), so declaring `--pad` is not a competing
  declaration. This is also why the words live in `@layer theme` and a later site theme still
  beats them.
- **Invent a hue.** `ui-contrast` is an alpha bump on a pair framework.css already declared,
  the far end of the ink axis, or a mix of two existing tokens. That is what lets one word
  cover light and dark, and any theme.
- **Change `font-size`.** Shrinking the type is `zoom`, which already exists and is frozen at
  eight rungs. Density is *less space at the same reading size* — a different thing, so a
  different word.
- **Scale a token.** `calc(var(--radius) * var(--density))` is a self-reference; CSS drops the
  whole declaration. A word can only ever *replace* a value — which means it may only touch a
  token **nothing else declares**. `--pad`, `--gap` and `--flow` qualify (their fallback lives
  at the use site: `padding: var(--pad, 1em)`), so `ui-compact` may state them. `--radius` does
  not: the theme owns it — `lew42` says `0.25em`, `terminal` says `0` — and `0.5em × 0.5`
  measured 3.76px against the theme's own 3.76px. It was written, measured, and removed.
  Colour is the exception that proves it: replacing `--ink` and `--line` *is* what
  `ui-contrast` is for, and it does so on a deeper element, so every other choice the theme
  made survives.

### The consequence: a word is also an audit

Because a word can only reach tokens, **a value the framework never tokenized is a value no
word can touch** — and it becomes visible the moment you toggle one. Three are visible on
[`ui/words/`](/framework/ui/words/) right now:

| was stuck under `ui-compact` | literal in framework.css | the token (landed 2026-08-21) |
|---|---|---|
| `th` / `td` padding | `0.25em 0.75em` | `--pad-cell` |
| `button` / `input` padding | `0.25em 1em` / `0.25em 0.6em` | `--pad-control` |
| `.muted` | `currentColor 75%` | `var(--muted, 75%)` — shipped; nothing turns it (contrast is already 10.41:1 in `ui-contrast`) |

Those began as a proposal and landed as **sanctioned one-line fallback edits** on
2026-08-21 — the 4-line diff, the 4,436-element equality proof and the re-measured compact
numbers are at [`ai/2026-08-21/ux-tokenize/`](/framework/ai/2026-08-21/ux-tokenize/);
`ui-compact` now remaps `--pad-cell` and `--pad-control` too. The rule stands: a word that
patched a gap with its own selectors would be the first crack in the only rule that keeps
this mechanism cheap. One gap remains, filed not fixed: the lew42 theme restates `button`
padding in `@layer site`, which beats the token for themed buttons.

There is a fourth thing a word does not reach, and that one is **correct**: a component that
set `--gap` inline has already stated its own internal rhythm. Density governs the space the
*section* owns — between components and around them — not the space inside a component that
has made a decision. A card's `0.5em` is the card's.

## 5. How the two tiers meet

- **A `ux` imports `ui/` templates. `ui/` never imports `ux/`.** Imports flow down and a
  parent↔child cycle breaks only on a deep reload — the failure that costs an afternoon
  because it does not reproduce on a soft navigation.
- **A `ux` never ships a compact mode or a high-contrast mode.** Both tiers read the same
  tokens, so a config word on the section re-skins the workflow and the templates inside it
  in one pass. A `ux` that grew its own density option would be a second, drifting copy of a
  word that already works everywhere.
- **A `ux` is responsive because its `ui/` pieces are**, and because sizing is done with the
  layout vocabulary (`--column`, `--measure`, `flex auto`, `grid auto`) rather than breakpoints.
  Mobile ↔ 3440 is a container question, not a class question — the `layout` skill's five.
