# The 14 anonymous stylesheets — a proposal, not an edit

**Measured 2026-08-18** on one page: 72 stylesheets, and **14 have no `href`** — so ~1 rule in 5
cannot say which file it came from. CSSDoc renders `<style>` in the file column for those.

**Cause, one line.** `ui/parts.js:3`:

```js
export const css = rules => new View({ tag: "style", capture: false }).text(rules).append_to(document.head);
```

It appends a bare `<style>` — no href, no id, no attribute of any kind. Nothing is wrong with it;
it simply never had a reason to carry its origin.

**The fix that works** — one optional argument, backward compatible on its own:

```js
export const css = (rules, meta) => new View({ tag: "style", capture: false })
    .text(rules).attr("data-src", meta?.url ?? "").append_to(document.head);
```

...but it only *does* anything once callers pass `import.meta`, and there are **34 caller files**.
That is CLAUDE.md's "anything with a dozen callers" — so it is the owner's call, not the
mastermind's.

**Two cheaper shapes, if the full sweep is not worth it:**

1. **Do nothing.** `<style>` in the file column is honest, and the layer + selector already
   identify the rule. Cost: a reader must grep for it.
2. **Only where it pays.** Pass `import.meta` in the handful of `css()` calls that define rules a
   CSSDoc page will actually show. Partial, but zero risk and about six edits.

**Recommendation:** option 1 until a CSSDoc page is genuinely hard to use without it. The column
is a convenience; the rule text and the layer are the product. Revisit when someone is annoyed.
