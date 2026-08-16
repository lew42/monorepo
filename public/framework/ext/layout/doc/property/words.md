`layout.words` is the control vocabulary itself — a plain object,
`word → $el => View`, that both the bar and the panel read through `draw($el, list)`
(`words.js`). It ships nine words (`mode`, `shape`, `fill`, `flow`, `gap`,
`column`, `pad`, `basis`, `measure`); a call site extends it by assignment —
`layout.words.radius = $el => knob($el, "--radius", 0.25, 2, 0.05)` — and every
bar or panel group that later names `"radius"` in its list can draw it. There is
no registration call, no return value to check, and no file in this module a
consumer ever has to open.

Full design reasoning — why a map beat a config object or a subclass, and why the
bar and panel used to disagree about which words existed at all — is
[The control vocabulary](/framework/ext/layout/doc/vocabulary/).

## Traps

- **⚠ An unregistered word is skipped, silently.** `draw()` filters with
  `words[word]?.(...)`, so a typo in a bar's list string (`"guy"` instead of
  `"gap"`) renders a shorter bar with no error anywhere. Half a bar beats no bar,
  by design — but it also means a missing control never announces itself.
- Assigning `layout.words.mode` (or any built-in name) from a call site silently
  replaces the framework's own control for every other consumer on the page —
  the map is one global object, not scoped per bar.
