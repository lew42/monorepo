# editor — MVP spec

Not built yet. This is the design for the smallest editable, syntax-highlighted
code box that is worth having, written down while the reasoning is fresh.

The whole thing is the **overlay trick**: a real `<textarea>` sitting on top of a
`<pre>` that shows the highlighted copy of the same text. The textarea is made
see-through, so you appear to be typing on colored code. There is no virtual
cursor, no re-implemented selection, no key handling beyond Tab — the browser's
own text editing does the work, which is the entire reason to prefer this over
`contenteditable` or a real editor library.

---

## The trick

```
div.editor              ← display: grid, both children in the same cell
├── pre.editor-view     ← the colored copy. aria-hidden, pointer-events: none
└── textarea            ← the real input. ON TOP. color: transparent
```

**The textarea goes on top.** This is not a preference — it has to receive the
click, the drag-select, the double-click-a-word, the IME composition, the mobile
keyboard, the spellcheck suppression and the native undo stack. Put the `<pre>`
on top and every one of those breaks. The `<pre>` is decoration; it gets
`pointer-events: none` and `aria-hidden="true"` so it is invisible to both the
mouse and a screen reader, which correctly sees only the textarea.

The textarea is hidden with `color: transparent; background: transparent`, and
the two things that transparency also destroys are put back by hand:

- `caret-color` — otherwise the cursor is invisible too.
- `::selection { background: … }` — a selection of transparent text is a
  selection you cannot see.

---

## Alignment is the whole difficulty

The two layers must agree on the position of every character, or the illusion
falls apart progressively down the file. Four ways it goes wrong:

**1. Metrics.** `font-family`, `font-size`, `line-height`, `letter-spacing`,
`tab-size`, `white-space`, padding, border and width must be *identical*. Note
that on this site they start out different — `framework.css` gives `pre, code`
`padding: 0.25em 0.5em` and a background, and gives `textarea` `padding: 0.25em
0.6em` plus a `1px` border and `resize: vertical`. All of that has to be reset
to one shared value in `editor.css`. A 1px border on one layer and not the other
is a permanent one-pixel skew.

**2. The trailing newline.** `<pre>` drops a final `\n`; a textarea keeps it. So
the last line disagrees the moment someone presses Enter at the end. Fix: append
a space to the *highlighted copy only* when the source ends in a newline.

**3. Tab.** A textarea doesn't indent — Tab moves focus. It has to be intercepted
and a literal `\t` inserted. Use `document.execCommand("insertText", false,
"\t")` despite the deprecation: it is the only way to insert text that keeps the
browser's **native undo stack** intact. `setRangeText()` is the clean modern API
and it silently breaks Ctrl+Z, which users notice immediately.

**4. Scrolling.** If the box has a fixed height, the `<pre>`'s `scrollTop` and
`scrollLeft` must be copied from the textarea on both `input` and `scroll`.

**The MVP dodges #4 entirely** by auto-growing: the grid cell is sized by the
`<pre>` (which is as tall as the content), the textarea stretches to match, and
`white-space: pre-wrap` on both means no horizontal scroll either. No scroll
sync, no scroll listener, no drift. A fixed-height variant can be added later
and pays for it with the sync handler.

---

## Why this pairs with highlight.js specifically

Highlighting runs on **every keystroke**. `hljs.highlight()` is synchronous, so
the new markup lands in the same turn as the input event and there is no way for
frames to render stale or out-of-order text.

An async highlighter (speed-highlight, Shiki) would need a sequence guard —
fast typing fires overlapping promises and the last one to resolve is not
necessarily the newest text. That's a real bug, not a theoretical one, and
avoiding it is worth more here than prettier tokens. It's the same property that
makes the fence hook FOUC-free in `readme.md`.

The other requirement a highlighter must meet is **character fidelity**: the
output must contain exactly the input's characters, or the layers desync.
highlight.js qualifies (`textContent` round-trips — there's a test for it).
Anything that injects a line-number gutter does not, which is why line numbers
and the editor have to be designed together if both are ever wanted.

---

## Shape

`Editor extends View`, so `classify()` gives it `.editor` for free and the
constructor is the repo's standard assign-based one — no constructor at all,
in fact; defaults are class fields and any of them can be overridden by the
caller.

```js
import View, { pre, code, textarea } from "../../core/View/View.js";
import "./syntax.js";                    // for View.prototype.syntax

View.stylesheet(import.meta, "editor.css");

export default class Editor extends View {

    lang = "js";
    value = "";

    render(){
        this.$view = pre.c("editor-view", () => this.$code = code())
            .attr("aria-hidden", "true");

        this.$input = textarea()
            .attr("spellcheck", "false")
            .attr("autocapitalize", "off")
            .attr("autocorrect", "off")
            .attr("autocomplete", "off")
            .on("input", () => this.update())
            .on("keydown", e => this.key(e));

        this.$input.el.value = this.value;
        this.update();
    }

    update(){
        const src = this.$input.el.value;

        // <pre> swallows a trailing newline; the textarea doesn't
        this.$code.syntax(this.lang, src.endsWith("\n") ? src + " " : src);
        this.onchange?.(src);

        return this;
    }

    key(event){
        if (event.key !== "Tab" || event.ctrlKey || event.altKey)
            return;

        event.preventDefault();

        // deprecated, and the only insertion that survives Ctrl+Z — see above
        document.execCommand("insertText", false, "\t");
        this.update();
    }

    get code(){ return this.$input.el.value; }
    set code(src){ this.$input.el.value = src; this.update(); }
}
```

Used the way everything else here is used — assign-based, so there is nothing
to remember about argument order:

```js
new Editor({ lang: "js", value: "const x = 1;" });
new Editor({ lang: "css", value: css, onchange: src => preview.style(src) });
```

The `onchange` hook is the entire extension point, and it's what makes this
worth building rather than borrowing: a live editor next to a live `demo()` is
the thing this docs site actually wants.

### editor.css sketch

```css
@layer base, theme, util;

@layer theme {
    .editor {
        display: grid;
        background: rgba(0,0,0,0.1);
        border-radius: 0.3em;
        overflow: hidden;
    }

    /* one cell, two layers — identical box, guaranteed identical width */
    .editor > pre,
    .editor > textarea {
        grid-area: 1 / 1;
        margin: 0;
        padding: 0.75em 1em;
        border: 0;                    /* framework.css puts one on textarea */
        background: none;
        font: inherit;
        font-family: Consolas, 'Courier New', Monaco, monospace;
        font-size: 0.9em;
        line-height: 1.55;
        tab-size: 4;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        overflow: hidden;
    }

    .editor > pre { pointer-events: none; }

    .editor > textarea {
        color: transparent;
        caret-color: var(--prim);
        resize: none;                 /* framework.css says vertical */
        max-width: none;
        min-height: 3em;
    }

    .editor > textarea::selection { background: rgba(0,0,0,0.18); }
    .editor > textarea:focus-visible { outline-offset: -2px; }
}
```

---

## Scope

**In:** type, edit, see colors, Tab indents, auto-grows, `onchange`.

**Out, deliberately:** line numbers (breaks alignment), bracket matching,
auto-closing pairs, search/replace, multiple cursors, undo beyond the browser's
own, mobile-specific handling. Every one of those is where this stops being 60
lines, and the moment two of them are genuinely needed the honest move is to
reach for `prism-code-editor` or CodeMirror rather than grow this into a worse
version of them.

---

## Known limits

- **Tab is trapped while focused**, which is an accessibility problem: keyboard
  users can't tab out. The standard mitigation is Esc-then-Tab (Esc sets a flag
  that lets the next Tab through). Not in the sketch above; it should be, before
  this ships anywhere real.
- `execCommand` is deprecated and will eventually go. There is no replacement
  that preserves undo. When it breaks, the fallback is `setRangeText` plus a
  hand-rolled undo stack — a large step up in complexity, and the point at which
  borrowing an editor library gets re-evaluated.
- Very long documents re-highlight the whole buffer per keystroke. Fine for
  doc-sized snippets, not for files. If it ever matters, debounce before
  optimizing anything else.

---

## Prior art

- **[Prism Live](https://github.com/PrismJS/live)** — Lea Verou (who wrote
  Prism). Exactly this structure: a `<textarea>`, a `<pre>`, and a wrapping
  `<div>`, all classed `prism-live`. Self-described "a work in progress, try it
  out at your own risk," and tied to Prism v1's global loading — read it for the
  design, don't depend on it.
- **[prism-code-editor](https://github.com/jonpyt/prism-code-editor)** — the
  actively maintained version of the same idea. Textarea overlay, ESM, trimmed
  Prism core, plus line numbers, bracket matching and search. The thing to
  graduate to.
- **[CodeJar](https://github.com/antonmedv/codejar)** (~2.5 kB) — same "overlay"
  name but `contenteditable`, not a textarea, and it re-implements caret
  restoration after every render. The comparison is the argument for the
  textarea: `contenteditable` moves the caret on every DOM write and you spend
  the rest of your life putting it back.
- **[CSS-Tricks: an editable textarea that supports syntax-highlighted
  code](https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/)**
  — the clearest write-up of the four alignment gotchas above.
