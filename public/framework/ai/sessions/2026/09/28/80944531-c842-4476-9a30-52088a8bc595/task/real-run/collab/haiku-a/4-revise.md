# CSS Class Naming: Hard Rules vs Guidelines

## The Foundation: CSS Has No Native Scoping

The lew42 framework is a static site with no build step, so it manages CSS namespaces entirely by convention, not by tooling. This is why the rules exist: every class name must encode its module's namespace in the name itself. A collision in the global CSS namespace is a real bug — styles silently fight or one rule loses to another, breaking the site unpredictably.

## Hard Rules (Never Break — Actual Breaking Changes)

These rules exist because violating them causes style conflicts:

1. **Never use a reserved name.** `css-scopes.txt` lists every prefix already owned by a module. A bare line (`.flex`, `.card`) reserves that exact class and every `.flex-*` variant; a trailing dash (`ui-`) reserves the namespace. The framework block (lines 5–67) is closed to new classes entirely — a collision there means your rule silently fights framework.css's own utility on every page.

2. **Always census the live CSS before naming.** Use `grep -rhoE '\.<name>[a-z0-9-]*' public --include=*.css --include=*.js | sort -u`. A hit elsewhere is a collision unless it's inside vendored code (check WHERE the hit is; minified three.js can false-positive). This is not optional — the census is what catches hidden class names.

3. **A class name can hide in three places:**
   - After `class=` in HTML or JSX (the obvious one)
   - In a View subclass's constructor name (View.classify() kebab-cases it automatically: `class Stage` wears `.stage`)
   - In a string concatenation (e.g., `'type-anchors-' + variant.key`)
   
   All three must be prefixed with the module namespace, and all three must pass the census.

4. **Always prefix with the owning module** (e.g., `.panel-grip`, not `.grip`), unless the CSS selector already starts with the module's own class (e.g., `.panel { .grip {} }`). The prefix encodes the namespace when CSS provides none natively.

5. **`page-` and `page--` are two different, fixed things:**
   - `page-` (single dash) is core/Page's reserved namespace. Nothing else may start a class with it, except a second core module extending Page may register a sub-namespace like `page-layout-` in css-scopes.txt.
   - `page--<slug>` (two dashes) is the automatic per-route stamp that core/Page applies to every page instance. Never repurpose the two-dash form.

6. **When you open a new namespace, record it immediately.** Add one line to `css-scopes.txt` (`prefix-   owner`). If that file is outside your write fence, the debt doesn't vanish — document it in the module's `doc/decisions.md` under Open so the next agent finds it instead of it being silently dropped.

## Guidelines (Best Practices, Not Enforced)

These exist to avoid common mistakes, but they describe taste and unresolved edge cases:

1. **The `.pad` / `.card` / em-unit choice is a rule of thumb.** 
   - `.pad` is a page region (spacing between sections)
   - `.card` is a framed box (a distinct, bounded piece of content)
   - An em unit is a control or row (specific-sized, reusable widget)
   
   Many real layouts sit at the boundary between these and require judgment. This guidance exists to stop you re-inventing `.card` under a different name, not to enforce a single right answer.

2. **Re-prefixing inside an already-scoped selector is optional, not required.** When your CSS is already nested inside the module's class (`.panel { .grip {} }`), the nesting provides the namespace that a prefix would otherwise encode. This matches BEM's own language: a prefix is a "collision-prevention convenience," not a requirement. Shorter names inside the scoped selector are cheaper to search for later, but optional.

3. **The rules do not specify three things — treat these as open questions, not gaps with a hidden right answer:**
   - **Precedence when multiple prefixes could apply** — if a class could match both `.panel-grip` and `.grip` (nested inside `.panel`), CSS specificity says they're equal; the rule doesn't pick one. Ask the module owner or document your choice in `doc/decisions.md`.
   - **Which retired classes (if any) should be scavenged** — the framework doesn't define when old naming goes obsolete or how to migrate off it.
   - **Whether bare compound modifiers follow different rules** — patterns like `.tabs.underline` (two bare classes applied together) are allowed and work because `.underline` is small and semantic, but the naming rules don't formalize when this is safe.

## Bottom Line

**Hard rules = collision prevention.** Don't reuse a reserved name, always check the census (including hidden class names), and pay the namespace debt when you open a new prefix.

**Soft parts = taste and edge cases.** Exactly which of `.pad`/`.card`/em-unit fits a given box, whether to re-prefix inside a scoped selector, and what to do when two prefixes could apply — none of these have a written tiebreaker, in this repo or in mainstream CSS practice. When in doubt, ask the module owner or document the decision in `doc/decisions.md`.

---

## Sources

- [CSS has no native scoping. `@scope` changes that](https://dev.to/parsajiravand/css-has-no-native-scoping-scope-changes-that-4ho2)
- [BEM — Block Element Modifier FAQ](https://getbem.com/faq/) (especially on block scoping as a namespace convenience)
- [Battling BEM CSS: 10 Common Problems And How To Avoid Them — Smashing Magazine](https://www.smashingmagazine.com/2016/06/battling-bem-extended-edition-common-problems-and-how-to-avoid-them/)
