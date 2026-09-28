# CSS Class Naming: Rules That Break vs. Guidelines for Judgment

## The Hard Rules (Collision Prevention)

These rules catch real bugs — style conflicts, silent cascading failures. Skip them and styling breaks:

1. **Never touch a reserved name.** `css-scopes.txt` lists every prefix already owned by a module. A bare line (`.flex`) reserves that exact class and all `.flex-*` variants; a trailing dash (`ui-`) reserves the whole namespace. The framework block is closed to new classes entirely — a collision there means your rule fights framework.css on every page that has it.

2. **Always census the live CSS before naming.** Grep for the name in both `.css` and `.js` files. A hit in another module is a real collision unless it's inside a vendored bundle (check the file path, not just the count — minified three.js reporting `.grip` twice is not a conflict).

3. **Class names hide in three places.** Explicitly declared classes are only the obvious one. A `View` subclass's constructor name gets kebab-cased automatically into a class the element wears (so `Stage` becomes `.stage`). A modifier built by string concatenation (`"type-anchors-" + variant.key`) also becomes a class name. Both need the module prefix baked in and every possible value checked against the census — not just what's typed literally.

4. **Prefix with the owning module.** Write `.panel-grip`, not `.grip`. The one carve-out: if your CSS selector already starts with the module's own class (`.panel { .grip { } }`), nesting provides context, but this is a special case, not a license to skip prefixing everywhere. Safer to prefix even in nested selectors because nesting doesn't provide namespace safety at the global level — collision avoidance depends on explicit naming in the class name itself, not on DOM structure.

5. **Distinguish `page-` from `page--`.** The `page-` prefix is `core/Page`'s own namespace; nothing else starts there. `core/Layout` uses `page-layout-` as a sub-namespace (registered in `css-scopes.txt`). `page--<slug>` (two dashes) is automatic per-route stamping — it can't collide with one-dash prefixes by construction. Don't start any new class with `page-`.

6. **Register a namespace when you open one.** The first class in a new module adds `prefix-   /owner` to `css-scopes.txt`. If that file is outside your write fence, the debt doesn't vanish — document it in the module's own `doc/decisions.md` under Open so it isn't silently dropped.

## Guidelines for Judgment (Taste and Edge Cases)

These have no written tiebreaker in this repo or in mainstream CSS practice:

- **`.pad` / `.card` / an em-unit size** is a rule of thumb, not enforced. A page region reaches for `.pad`, a framed box for `.card`, a control or row for its own em-unit sizing. Real boxes sit at boundaries and need a judgment call. BEM's own FAQ validates this: a block's name already acts as a namespace for its children, so extra prefixing is a *collision-prevention convenience*, not a requirement.

- **Which prefix when two could both apply?** No rule exists. General CSS practice says specificity and source order determine precedence, but that's runtime, not naming-time. If `panel-grip` and `grid-grip` both seem right, ask the module owner, document the choice in `doc/decisions.md`, or use the longest/most specific prefix (e.g., `panel-submodule-grip` beats `panel-grip`).

- **Bare compound modifiers on base classes** (`.tabs.underline`) are a special case. They work when the base class is stable, the modifier is semantic and small, and collision risk is low (the modifier is rarely applied elsewhere). The framework allows them but doesn't specify when it's safe — treat each as a judgment call and document why if it's nonobvious.

## Why This Matters

The hard rules exist because **CSS has no native scoping**. Every class name lives in a global namespace, so collisions are actual bugs. The framework chose an explicit reservation system (like BEM) instead of build-time CSS Modules or native `@scope` rules because it's a static site with no build step — the entire namespace is managed by convention, making collision prevention non-negotiable.

The guidelines acknowledge that CSS naming is not a solved problem even in other frameworks. They're the places where code review, domain knowledge, and team judgment belong, not where a linter can decide.

---

## Sources

- [BEM Methodology - Naming Convention](https://bem.info/en/methodology/naming-convention/)
- [BEM FAQ](https://getbem.com/faq/) — block names as namespaces
- [Battling BEM CSS: Common Problems And How To Avoid Them — Smashing Magazine](https://www.smashingmagazine.com/2016/06/battling-bem-extended-edition-common-problems-and-how-to-avoid-them/)
- [CSS Naming Conventions - Best Practices for Good Code](https://www.hallme.com/blog/css-naming-conventions/)
- [How to Write CSS Without Naming Conflicts](https://levelup.gitconnected.com/how-to-write-css-without-naming-conflicts-f6ec10a82f72) — specificity and precedence
