# CSS Class Naming: Rules vs Guidelines

## The Question
When a Claude agent picks a name for a new CSS class in the lew42 framework, what are simple, foundational rules it should never break — and where are those rules genuinely just guidelines instead of hard rules?

## Answer

### Hard Rules (Never Break)
The framework's hard rules reflect a real constraint: **CSS has no native scoping**. Every class name exists in a global namespace, so collisions are actual bugs that break styling. The framework addresses this with a reservation system:

1. **Reserved names are absolute**: A bare name in css-scopes.txt (`.card`, `.flex`) or a namespace (`panel-`, `ui-`) cannot be reused anywhere else. These are not guidelines — violating them causes style conflicts.

2. **Module prefixing is mandatory** unless the selector already starts with the module's own class. This exists because CSS naming conventions (like BEM) must encode the namespace in the class name itself when native scoping is unavailable.

3. **View class names are auto-minted and must be prefixed**: The framework's `View.classify()` automatically creates CSS class names from constructor names, so these must also follow the namespace rule.

### Guidelines (Likely, Not Settled)

1. **Nested scoping may relax re-prefixing**: The open fact mentions that re-prefixing is optional when the CSS selector already starts with the module's class (e.g., `.panel { .grip { } }`). This aligns with modern best practices: nesting itself provides context. However, the framework's current guidance doesn't make this exception explicit, treating all prefixing as mandatory.

2. **Precedence for competing prefixes is not specified**: CSS itself has no rule for precedence when multiple prefixes could apply. The framework documents reserved names but doesn't define what happens if an agent accidentally creates `.panel-grid` when both `panel-` and `grid` are reserved. In practice, the census check (grep search) catches these manually.

3. **Retired classes and compound modifiers are undefined**: The framework doesn't specify which classes (if any) become deprecated, or whether compound modifiers on bare framework utilities (`.tabs.underline`) follow different rules than branded component classes (`.panel-grip`).

## Why the Distinction Matters

The rules that are settled reflect actual breaking changes (style leaks, collisions). The guidelines reflect missing specification: they're best practices in other frameworks but the lew42 framework hasn't yet formalized whether (a) nested rules relax prefixing, (b) prefix conflicts have a resolution order, or (c) bare modifiers on framework utilities differ from component namespaces.

The framework chose an explicit reservation system over build-time CSS Modules or native `@scope` rules because it is a static site with no build step. This means the entire namespace must be managed by convention, which is why the census and prefixing rules are non-negotiable.

---

## Sources

- [CSS has no native scoping. `@scope` changes that](https://dev.to/parsajiravand/css-has-no-native-scoping-scope-changes-that-4ho2)
- [CSS Guidelines (2.2.5) – High-level advice and guidelines for writing sane, manageable, scalable CSS](https://cssguidelin.es/)
- [BEM Methodology](https://bem.info/en/methodology/naming-convention/)
- [BEMIT: Taking the BEM Naming Convention a Step Further](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/)
- [CSS Scope Proposal & Explainer - OddBird CSS Sandbox](https://css.oddbird.net/scope/explainer/)
- [& nesting selector - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Nesting_selector)
- [CSS Modules and Scoped Styles: Avoiding Style Collisions](https://developers-heaven.net/blog/css-modules-and-scoped-styles-avoiding-style-collisions/)
