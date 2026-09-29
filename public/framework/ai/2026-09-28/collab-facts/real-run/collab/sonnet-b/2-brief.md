# Naming a new CSS class in this framework: rules vs guidelines

## The rules that actually break something if you skip them

1. **Never touch a reserved name.** `css-scopes.txt` lists every prefix already owned by a
   module. A bare line (`flex`) reserves that exact class and every `.flex-*` variant; a
   trailing-dash line (`ui-`) reserves the whole namespace. The framework block at the top of
   the file is closed to new classes entirely — this is the one line nobody gets to argue with,
   because a collision there means your new rule silently fights (or loses to) framework.css's
   own utility on every page that has it.
2. **Always census before naming.** Grep the live CSS/JS for the name you're about to write. A
   hit in another module is a real collision unless it's inside a vendored bundle (check the
   file, not just the count — minified `three.js` reporting `.grip` twice is not a conflict).
3. **A class name isn't only the string after `class=`.** Two places hide a class name where
   they don't look like one: a `View` subclass's constructor name (kebab-cased automatically
   into a class the element wears), and a modifier built by string concatenation
   (`"type-anchors-" + variant.key`). Both need the module prefix baked in and every possible
   value checked — not just what's typed literally in the file you're editing.
5. **`page-` and `page--`, two different things, both fixed.** `page-` is `core/Page`'s own
   namespace; a second core module (one that itself `extends Page`) can register a sub-namespace
   like `page-layout-` in `css-scopes.txt`, but nothing else may start a class with `page-`.
   `page--<slug>` (two dashes) is the automatic per-route stamp `Page.class.js` puts on every
   page — it's mechanical, not something you name yourself, and it can never collide with a
   one-dash `page-` component class by construction.
6. **Opening a namespace is a one-line debt you must pay.** The first class in a new module adds
   `prefix-   owner` to `css-scopes.txt`. If that file is outside your fence, the debt doesn't
   go away — it goes into the module's own `doc/decisions.md` under Open instead, so it isn't
   silently dropped.

## Where the same document is genuinely just a guideline

- **`.pad` / `.card` / an em-unit size** is presented as a rule of thumb (a page region, a framed
  box, a control-or-row, respectively), not an enforced one — it exists to stop you re-inventing
  `.card` under a new name, but plenty of real boxes sit at the boundary and need a judgment
  call. This is exactly the kind of thing general CSS-naming writing outside this repo treats
  the same way: BEM's own FAQ, for instance, says a block's own name already acts as a namespace
  for its children, so an extra prefix is a *collision-prevention convenience*, not a
  requirement — the same shape as this repo's "prefix unless the selector already starts with
  the module's own class" carve-out.
- **Re-prefixing under an already-scoped selector is optional, not required.** If your CSS is
  already nested inside the module's own class (`.panel { ... .grip {} }`), the nesting is doing
  the namespacing job that a prefix would otherwise do. The skill's instruction to "prefix unless
  the selector already starts with the module's own class" already carves this out; it reads as
  a convenience rule (cheaper to search a flat name later) rather than something that breaks if
  skipped, matching how BEM-style guidance treats block-scoped nesting.
- **No stated precedence for multiple valid prefixes**, **no scavenging policy for retired
  prefixes**, and **no separate rule for compound bare-class modifiers** (`.tabs.underline`) are
  simply not decided anywhere in `css-scopes.txt` or the skill file — not "guidelines" so much as
  gaps. General web practice doesn't resolve these either: it confirms prefixing is for
  collision-avoidance and lets ordinary CSS specificity/cascade order settle which rule wins once
  a name exists, but that's a runtime concern, not a naming-time one, so it doesn't fill the gap
  about which *name* to pick when two module prefixes both plausibly apply. Treat any of these
  three as an open question to ask the module owner (or note in `doc/decisions.md`), not as
  something with a "right" answer already written down.

## Bottom line

The hard rules are about **collision**: don't reuse a reserved name, always check the live
census, remember that a class name can be hiding in a constructor or a concatenated string, and
pay the one-line namespace debt when you open a new prefix. The soft parts are about **taste and
unresolved edge cases**: exactly which of `.pad`/`.card`/em-unit to reach for, whether to
re-prefix inside an already-scoped selector, and what to do when two prefixes could both apply —
none of those has a written tiebreaker, in this repo or in mainstream CSS naming practice.

## Sources

- [Naming convention / Methodology / BEM](https://bem.info/en/methodology/naming-convention/)
- [BEM — Block Element Modifier FAQ](https://getbem.com/faq/)
- [Battling BEM CSS: 10 Common Problems And How To Avoid Them — Smashing Magazine](https://www.smashingmagazine.com/2016/06/battling-bem-extended-edition-common-problems-and-how-to-avoid-them/)
- [CSS Naming Conventions - Best Practices for Good Code](https://www.hallme.com/blog/css-naming-conventions/)
- [Naming Things in CSS — CSS Architecture, Part 4 (Elad Shechter)](https://elad.medium.com/naming-things-in-css-a7de9ad31cd9)
