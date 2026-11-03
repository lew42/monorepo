# CSS Class Naming: Open Questions and Research

## The Open Facts

The framework's rules leave three areas undefined:

1. **Selector nesting and optional re-prefixing** — when a CSS selector already starts with the module's class (e.g., `.panel { .grip { } }`), the skill says re-prefixing is "optional." This conflicts with the core rule: always prefix to avoid collisions.

2. **Precedence with multiple prefixes** — if a class could match both `.panel-grip` (explicit prefix) and `.grip` (bare, inside `.panel`), which takes precedence? CSS specificity says they're equal unless the nesting rule gives the nested one a contextual advantage.

3. **Compound modifiers on bare classes** — the framework uses `.tabs.underline` (bare compound modifiers on a bare class). These are explicitly allowed in css-scopes.txt, but the naming rules don't say whether they follow the same collision-check as prefixed classes.

## Research Findings

**On Nesting and Specificity:**
BEM methodology [maintains flat specificity by never nesting selectors](https://css-tricks.com/bem-101/) — every class selector has the same weight. The lew42 framework's CSS rules explicitly enforce this. Nesting in CSS provides visual organization but not namespace safety unless enforced by the naming rule itself, not by CSS specificity.

**On Multiple Prefixes and Precedence:**
In practice, when multiple prefixes could apply, [CSS specificity and source order determine precedence](https://levelup.gitconnected.com/how-to-write-css-without-naming-conflicts-f6ec10a82f72). If two classes have equal specificity, the last rule in the cascade wins. The framework's rule to "always prefix" implies that relying on nesting order as a tiebreaker is fragile — explicit prefixing removes ambiguity.

**On Bare Compound Modifiers:**
BEM treats modifiers as augmentations, not replacements — [a modifier should not be used alone; it augments the base class](https://www.freecodecamp.org/news/css-naming-conventions-that-will-save-you-hours-of-debugging-35cea737d849/). The `.tabs.underline` pattern (two bare classes applied together) works because `.underline` is a small, semantic modifier with low collision risk inside the `.tabs` context. But this is a special case, not a general rule.

## Conclusions

1. **Nesting does NOT provide namespace safety** — the "optional" re-prefixing claim should be "discouraged" or "only when you own both the parent and child classes." Collision avoidance depends on explicit naming, not DOM structure.

2. **Precedence has no rule** — when multiple prefixes could apply, the framework should specify: use the longest, most specific prefix (e.g., `.module-submodule-thing` beats `.module-thing`), or accept that this is a rare case and document it.

3. **Bare compound modifiers are a special case** — they work when the base class is stable and the modifier is semantic and small (like `.underline` on `.tabs`). The framework should document when this is safe: low risk of collision, high semantic value, rarely applied elsewhere.

---

## Sources

- [BEM 101](https://css-tricks.com/bem-101/) — CSS-Tricks on BEM specificity and nesting
- [How to Write CSS Without Naming Conflicts](https://levelup.gitconnected.com/how-to-write-css-without-naming-conflicts-f6ec10a82f72) — specificity and precedence
- [CSS Naming Conventions that Will Save You Hours of Debugging](https://www.freecodecamp.org/news/css-naming-conventions-that-will-save-you-hours-of-debugging-35cea737d849/) — BEM modifiers and best practices
- [Understanding BEM as a CSS Methodology](https://dev.to/michael-gokey/understanding-bem-as-a-css-methodology-for-modern-web-development-8l8) — DEV Community on BEM structure
