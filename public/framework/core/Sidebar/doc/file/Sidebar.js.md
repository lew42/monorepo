The whole component, one class, ~125 lines. `render()` is `bar()` over `menu()`;
everything else is one of those two methods or something they call.

## The split the CSS depends on

`bar()` is `[ header | toggle ]`; `menu()` is `nav()` over `footer()`. That
structural split — not `position` — is what pins the header and footer while
`.sidebar-nav` scrolls: the nav is the only flex child with
`min-height: 0; overflow-y: auto`.

## Two methods are replaced, not configured

`header` and `footer` shadow the methods of the same name when passed to the
constructor (assign-based, house-wide). `header()` is deliberately not called
`brand()` — a method named after the `brand` property would collide with it in
the same assignment pass.

## One static, and it reads DOM it doesn't own

`Sidebar.favicon()` — the default `logo` — reads `document.querySelector('link[rel~="icon"]')`.
Nothing in this file emits that link and nothing in the document knows a
`Sidebar` might read it. It is the one piece of magic in an otherwise
inert-data component.

## Improvements

1. **The 14-line JSDoc block (lines 8–21) duplicates the readme, `page.js`'s API
   tab, and every `doc/property/*.md` file** — and is the only file in this
   directory that carries one; `core/View/View.js` states only traps as
   comments. CLAUDE.md is explicit: *"Comments: near zero… everything else
   lives in the module's readme.md or nowhere."* Trim to one line and a
   pointer, the way the sibling core classes do. *(simple, important)*
2. **`$bar`, `$menu`, `$mode` are assigned and never read** (`doc/views.md`
   has the grep). Dropping the three leaves `$toggle` as the one handle,
   and it then means something: *this is here because something reads it*.
   *(simple, useful — readme already recommends this)*
3. **`open()`'s computed method name** — `this[on ? "ac" : "rc"]("open")` reads
   twice for no shorter a line than `on ? this.ac("open") : this.rc("open")`.
   *(simple, useful, cosmetic)*
4. **A group nested inside a group renders `href="undefined"` with no warning**
   — `nav()` → `group()` → `link()` reads `.url` off an entry that never had
   one. A `console.warn` in `group()` when an inner entry itself has `pages`
   costs one line and turns a silent bug into a message. *(simple, useful)*
