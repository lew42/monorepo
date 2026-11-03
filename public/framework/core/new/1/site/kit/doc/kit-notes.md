# kit.js notes

## chrome() overview

Exports a plain object with two methods so App can adopt the whole thing as `...args` and override individual pieces after the spread.

- `render()` builds the shell once (19 links, a bar, a drawer, main)
- `navigated(page)` updates only what depends on the leaf

## child_label rule

What a link should say before a child is imported: a label the parent declared, else the name made readable. Never the child's `title`, because title arrives with import, and which children are imported depends on entry point — a nav built from titles reads differently per URL.

**Duplication:** this is the SECOND copy in the repo (first is site/chrome/chrome.js). Both will delete themselves when `Page.child_label()` lands — see agents/chrome/child_label.md.

## shell() function

Captured wherever called, so the same function builds the document's chrome and a demo inside a box. Everything hangs on `app` — no hidden state, can poke at `app.$kit_nav` from console.

**Global ID trap:** an id is globally namespaced, and `<label for>` is the only way to reach a checkbox that isn't its ancestor. A document can hold more than one shell (preview, style guide, doc page), and two sharing one id means one burger drives the other's drawer and one skip link jumps to the other's main. Measured on /kit/ which renders two. Numbering them is the only fix.

## update() order (four steps)

The order is load-bearing. Wrong order throws nothing — just silently leaves focus on `<body>` or crumbs unmarked.

1. `nav()` — crumbs, prev/next, open section
2. `mark_links()` — everything step 1 built comes AFTER mark()'s pass, so never marked (same late-render gap tabs() hits)
3. Close drawer — you picked something, it is done
4. `focus()` — LAST. Steps 1 and 3 can destroy the currently focused node, and focus falls to `<body>` if set earlier

## Navigation updates

`nav()` builds 19 top-level links ONCE. Only the open section's sub-list is derived and rebuilt when crossing into a different section. Walking three pages inside one section touches no nav DOM.

## Crumbs

`chain()` is `[root … me]` and every page in it loads by construction, so crumbs are the only derived chrome with no lazy-title problem — real titles, always, free. The root has no parent to label it, so it is the one string the kit takes as config.

## Steps (prev/next)

Spends the one ordering guarantee `children` makes: `declare()` sets keys in declared order and `add()` setting an existing key never moves it. Index order is authoring order permanently, resolved or not.

A dead end is where a reader most needs a way out; the parent is always there.

## Focus and accessibility

Page's view gets attributes if not already set: `tabindex="-1"`, `role="region"`, `aria-label`. A focusable element with no role and no name is announced by its text; a page's text is the whole page.

Focus landing on a named region already reports navigation — don't announce it again with a live region (would report the word twice). Announce only what focus cannot say.

With no destination in our main region, `<main>` takes focus and the announcer says the name that "main" cannot.

## Framework future

Three attributes and the focus() are currently set by kit, but `Page.render()` should set them (covers tab defaults too, which kit cannot see). When that lands, delete the setAttribute lines and keep the focus().
