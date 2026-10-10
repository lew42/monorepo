# Naming a new CSS class in this framework: rules vs guidelines (revised)

## The one-sentence "why"

CSS has no native scoping, and this is a no-build static site (no CSS Modules, no `@scope`
build step) — so `css-scopes.txt` plus the `new-css-class` skill are doing by hand-checked
convention what a build step would otherwise do automatically. That's the reason the "hard
rules" below are actually hard: skip them and a name collision is a live, global bug, not a
lint warning.

## The rules that actually break something if you skip them

1. **Never touch a reserved name.** A bare line in `css-scopes.txt` (`flex`, `card`) reserves
   that class and every `.name-*` variant; a trailing-dash line (`ui-`) reserves the whole
   namespace. The framework block is closed to new classes entirely.
2. **Always census before naming.** Grep the live CSS/JS for the name. A hit in another module
   is a real collision — unless it's inside a vendored bundle, so check the file the hit is in,
   not just the count.
3. **A class name can hide where it doesn't look like one.** A `View` subclass's constructor
   name gets auto-minted into a class (`classify()`), and a modifier built by string
   concatenation (`"type-anchors-" + variant.key`) is a class name at every value the variable
   can take — both need the module prefix baked in, and both need checking beyond what's typed
   literally in the file.
4. **`page-` and `page--` are two different fixed things.** `page-` is `core/Page`'s namespace;
   only a core module that itself `extends Page` may register a sub-namespace like
   `page-layout-`. `page--<slug>` (two dashes) is the automatic per-route stamp `Page.class.js`
   puts on every page — mechanical, not something you name, and it can't collide with a one-dash
   `page-` class by construction.
5. **Opening a namespace is a debt you must pay in the same edit.** The first class in a new
   module adds one line to `css-scopes.txt`. If that file is outside your fence, the debt moves
   to the module's own `doc/decisions.md` under Open — it doesn't disappear.

## Where the same document is genuinely just a guideline — and why "optional" is riskier than it sounds

- **`.pad` / `.card` / an em-unit size** is a rule of thumb (page region / framed box /
  control-or-row), not enforced — real boxes sit at the boundary and need judgment. This mirrors
  how BEM treats prefixing generally: useful for collision avoidance, not structurally required.
- **Re-prefixing under an already-nested selector is marked "optional," but that word is doing
  more work than it should.** The skill's own carve-out is: if your CSS is already written as
  `.panel { .grip { } }`, the nesting supplies the namespace, so you don't have to also rename
  the class to `.panel-grip`. Read narrowly, that's fine — CSS nesting can visually communicate
  scope. But it doesn't provide *collision safety*: `.grip` is still a bare global class the
  moment any other stylesheet targets it directly (a JS `classList.add('grip')`, another
  module's flat selector, a future refactor that un-nests the rule). One peer in this
  collaboration argued this should read "discouraged — only when you own both the parent and
  child classes" rather than a clean either/or; I now agree that's the more accurate framing than
  calling it a neutral style choice. Treat "optional" as "optional for the CSS selector you're
  looking at right now, not optional for the class name's global safety."
- **No stated precedence for multiple valid prefixes.** If a name could plausibly sit under two
  different module prefixes, nothing in `css-scopes.txt` or the skill says which wins. One
  reasonable convention worth adopting (raised by a peer, not currently written down anywhere in
  this repo) is: prefer the longer, more specific prefix — `.module-submodule-thing` over
  `.module-thing` — because a more specific prefix reduces future collision surface more than a
  shorter one does. That's a sensible default, not an established rule; when it's ambiguous which
  module truly owns the class, that's a real open question for the module owner, not something to
  silently decide alone.
- **No scavenging policy for retired prefixes**, and **no separate rule for compound bare-class
  modifiers** (`.tabs.underline`) — these are gaps, not decided guidelines. The one concrete
  working example the repo has (`.tabs.underline`) suggests such compounds are tolerated when the
  base class is stable, the modifier is small and semantic, and it's unlikely to be reused
  elsewhere — but that's read off a single example, not a stated rule, so don't generalize it to
  a compound modifier that's ambiguous or high-collision-risk without checking with the module
  owner first.

## Bottom line

Hard rules are about **collision that actually breaks a page**: never reuse a reserved name,
always run the live census, remember a class name can be hiding in a constructor or a
concatenated string, respect the fixed `page-`/`page--` split, and pay the namespace-registration
debt in the same edit you open it. Soft parts are about **taste and genuinely unresolved
cases**: which of `.pad`/`.card`/em to reach for, whether "optional" re-prefixing under nesting
is safe enough to actually skip (probably only when you own both classes), which prefix wins when
two are plausible (no rule — pick the more specific one as a default, but ask if truly
ambiguous), and how far to stretch the one working example of a compound bare-class modifier.

## Sources

- [Naming convention / Methodology / BEM](https://bem.info/en/methodology/naming-convention/)
- [BEM — Block Element Modifier FAQ](https://getbem.com/faq/)
- [Battling BEM CSS: 10 Common Problems And How To Avoid Them — Smashing Magazine](https://www.smashingmagazine.com/2016/06/battling-bem-extended-edition-common-problems-and-how-to-avoid-them/)
- [CSS Naming Conventions - Best Practices for Good Code](https://www.hallme.com/blog/css-naming-conventions/)
- [Naming Things in CSS — CSS Architecture, Part 4 (Elad Shechter)](https://elad.medium.com/naming-things-in-css-a7de9ad31cd9)
- Peer briefs from this collaboration: haiku-a/2-brief.md, haiku-c/2-brief.md
