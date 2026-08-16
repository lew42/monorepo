# Sidebar — design record

A brand over a list of links, over a footer that stays put. The only component
`core/` ships, and the only one that has to justify being there at all.

Long form in `./doc/`, one file per question, each also served as a note page under
`/framework/core/Sidebar/`: `entries.md` (what an entry is, and where labels come
from), `placement.md` (why this file has no width), `views.md` (the four `$`
handles), `tokens.md` (the two tokens and the derivations), `narrow.md` (below 52em),
`comp.md` (porting the July 2026 comp, with the two em traps it caught).
**Every member also has its own file** — `./doc/method/<name>.md` and
`./doc/property/<name>.md`, three concerns each: usage, necessity, simplicity.

## Who uses it

Seven real `import { Sidebar }` sites, all constructing it directly (never
subclassed):

| caller | for | url |
|---|---|---|
| `framework/page.js` | the site's own section nav — `header` replaced with `app.brand()`, `pages: this.sections()` | `/framework/` |
| `page.js` (site root) | the homepage's nav, over plain `{title, url}` data | `/` |
| `michael/page.js` | a sandbox's own section nav | `/michael/` |
| `styles/layers/theme/lew42/page.js` | the theme comp, exercising both `brand` and grouped `pages` | `/framework/styles/layers/theme/lew42/` |
| `styles/layouts/sidebar/page.js` | the "no-rule" placement demo — `.ac("basis").style("--basis", "var(--sidebar)")` | `/framework/styles/layouts/sidebar/` |
| `core/Page/nav/page.js` | a nested demo showing `nav_for()` feeding a Sidebar | `/framework/core/Page/nav/` |
| `core/Sidebar/page.js` | this module's own three demos | `/framework/core/Sidebar/` |

A dozen more files (`faq/`, `ui/accordion/`, `web/nav/sidebar/`, `core/App/page.js`,
`core/page.js`, `core/Page/shell/page.js`, the layout galleries) **link to or
quote** `Sidebar` in prose without constructing one — not counted above.

**Not a module with no callers** — the opposite finding: it is the site's real
navigation chrome, in production at `/` and `/framework/`, not just a demo of
itself.

## Decisions

**Why a component tier for exactly one thing?** Because a sidebar is the one piece
of chrome that is genuinely the same everywhere, and it was extracted from the old
`ColumnPager` precisely so no layout would own it. It is a `View` subclass, so it
adds no tier. **The test if a second is proposed:** does every site want it, and does
it work with no configuration? A tab bar failed (which children are tabs is a
*placement* decision, so it is a method on `Page`); a card failed (a card is a link
with a border, so it is `.page-preview`).

**One `pages` property, or a second `groups`?** One. An entry with its own `pages`
**is** a group, duck-typed — a flat sidebar, a grouped one and a mix are the same
call, and it nests without a new concept. The cost is that a group heading can never
also be a link, which is correct anyway: a heading that navigates is a link
pretending to be a heading.

**What is an entry?** Anything answering `.label ?? .title` and `.url`. So a real
`Page` and a plain POJO both work — and `Page.nav_for(name)` returns exactly that
shape, which is how a parent hands its whole nav in:

```js
pages: [...this.children.keys()].map(name => this.nav_for(name))
```

That is `/framework/`'s entire navigation, and it means the panel, the tab bar and
the preview cards read **one** source. Before it, `/framework/` and `/michael/`
hand-rolled two menus over the same tree and already disagreed. See ./doc/entries.md.

**Where do labels and icons come from?** The child page's own `title` / `icon` —
and a menu name that differs from the title is `label` **on the child**, not a map
on the parent. There is no relabelling table: one was tried and removed, because it
put a child's name in two files and the parent's copy won silently when they
drifted. This section has now said the opposite twice and cited the file that had
already reversed it — **a cross-reference is not a check.** See
`core/Page/doc/labels.md` and ./doc/entries.md.

**Is `header` configured or replaced?** Replaced. The assign-based constructor makes
a passed `header` shadow the method, and the same is true of `footer` (`footer: null`
for none). **Accepting a View instead is the trap:** a View built to be passed in is
constructed *before* the Sidebar captures, so it lands wherever the captor happened
to be and then gets moved — the async-capture failure in synchronous clothing. A
function runs *while* the Sidebar is capturing. Use an arrow, so `this` stays the
page that knows the brand.

**Where does the footer go?** Below the nav, outside the scroller. `render()` is
`bar()` over `menu()`, and `menu()` is the nav over the footer; the nav is the only
scroller (`flex: 1 1 auto; min-height: 0; overflow-y: auto`), so the header and
footer are pinned **by structure, not by `position`**. It replaced a
`position: fixed` mode pill that floated over every page, full-bleed ones included.

**Why is the chevron `›` and not `chevron_right`?** `Sidebar.css` must not depend on
a font the app may never have loaded, or an un-themed sidebar reads
**"chevron_right"** down its margin. A ligature font fails *legibly*, which is a
virtue everywhere except in CSS `content`, where nobody chose to load it. It is
written `"\203A"`, never the literal — the deployed host serves CSS with no charset,
so a raw multi-byte character decodes as Windows-1252 and renders `â€º`.

## Traps

- **Size the text, pad the box, never the same element.** Both em bugs in this
  component were this bug: `--gutter: 2.6em` measured 36.5px on a `.h4` group title
  and 41.8px on every link. A custom property carries a **token**, not a resolved
  length. ./doc/comp.md.
- **Placement is not its business** — one line at the call site, and always the
  shared token with **no fallback**. ./doc/placement.md.
- **Anything that renders links late must re-run `mark_links()`.** `Router.mark()`
  has already been and gone. No view compares `window.location` itself.
- **A sidebar built without `app` has no mode toggle and says nothing.** Fine when
  meant; invisible when not — and it happens by accident inside a `Doc`
  overview, where `this.app` is `undefined`. `core/App/doc/adoption.md`.
- **⚠ One bad `icon:` on one child page WIDENS THE WHOLE SIDEBAR** — and nothing
  throws. Material Icons is a ligature font, so a name it does not carry renders as
  the literal *word*; that word is unbreakable, so it sets the link's min-content
  width, and a flex item's `min-width: auto` refuses to shrink below it. The
  `flex-basis` still reads the correct `19em` while the box renders wider, which is
  what makes it so hard to find. Measured 2026-08-16: `icon: "right_panel_open"` on
  one new ext page took the framework sidebar from **231px to 344px**, and everything
  else on the page shrank to pay for it. **Measure a name against the loaded font
  before using it** — render it at 24px and check the width is 24, not 384.

## Proposed

Not applied. Each touches a core class, so it wants a critique first.

**Should `$bar`, `$menu` and `$mode` be dropped?** Measured: assigned, never read,
by anything, anywhere. `$toggle` is read twice and stays.
*Options:* (a) drop the three; (b) keep all four on consistency — a component's
parts are public by convention, and a subclass shouldn't have to `querySelector`;
(c) drop all four and let `open()` find the toggle by query.
*Weighing:* (c) trades a stored reference for a DOM query on every toggle, for
nothing. (b) is defensible but nobody has ever subclassed `Sidebar`, so it is
speculative surface. (a) makes the one remaining handle *mean* something.
**Recommendation: (a).** Three lines shorter, and the note in ./doc/views.md becomes
unnecessary.

**Should the Escape handler live in `toggle()` rather than `render()`?**
`render()` is four lines, three of which are a keydown listener about narrow-screen
behaviour.
*Options:* (a) leave it; (b) move it into `toggle()`, beside the button it refocuses.
*Weighing:* the listener is on the sidebar, not the button — Escape has to work from
anywhere inside the panel — so (b) would attach a listener to `this` from inside a
method that builds a child, which is worse than the thing it fixes.
**Recommendation: (a), and stop calling it a wart.**

**Should the four header properties collapse?** `brand`, `brand_url`, `logo`,
`logo_url` — the widest surface on the class, and **two of them have never been
set** in five sandboxes and the whole framework.
*Options:* (a) keep all four; (b) drop `brand_url` and `logo_url`, on the grounds
that a site with an opinion about either should pass `header`; (c) collapse to
`brand: { text, url, logo, logo_url }`.
*Weighing:* (c) is one option instead of four and reads worse at every call site.
(b) removes two `??` from a line that has to exist anyway, and the case they serve
is real — `framework/page.js` needs a wordmark pointing at the section, and meets it
by replacing `header` entirely, which is the evidence for (b).
**Recommendation: (a), recorded** — the cost of keeping them is two `??`, and the
cost of removing them is a breaking change for a case that will come. Revisit if a
year passes with neither set.

**Should nested groups recurse, or be refused?** A group inside a group reaches
`link()` with an entry that has no `url` and renders `href="undefined"`, silently.
*Options:* (a) recurse in `nav()`; (b) `console.warn` on an entry with `pages`
inside a group; (c) leave it.
*Weighing:* (a) is one line and invites a nesting depth nobody has asked for, which
the CSS does not indent anyway. (c) is the current silent failure. (b) costs one
line and turns an invisible bug into a message.
**Recommendation: (b).**

**Should `open()` drop the computed method name?** `this[on ? "ac" : "rc"]("open")`
reads twice; `on ? this.ac("open") : this.rc("open")` is the same length.
**Recommendation: rename it to the plain ternary.** Local, obvious, no caller
affected.

## Open

- **`.brand` has two owners.** `Sidebar.header()` emits it and so does the site's
  `app.brand()` — same class, two components, which the naming rule forbids. It works
  because the site passes `header` so only one ever runs, and because this file scopes
  to `.sidebar .brand`. Still one class name short of a collision.
- **The favicon is the default logo.** `Sidebar.favicon()` reads the document's
  `<link rel="icon">` rather than hardcoding an asset path. Neat, and slightly magic —
  it reads DOM the class doesn't own.
- **The avatar is a placeholder.** A styled empty box with `title="Account"` that
  does nothing. The only speculative piece of the component.
- **A group leads with its section rather than linking its heading.** Every group's
  first entry is "Overview", pointing at the section's own url. Without it a grouped
  sidebar has no way to reach `/framework/core/` at all.
