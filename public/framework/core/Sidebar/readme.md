# Sidebar — design record

A brand over a list of links. The only component `core/` ships, and the only one
that has to justify being there at all.

---

## 1. Why a component tier exists for exactly one thing

`core/` is four classes you meet — `View`, `Page`, `Router`, `App` — and then
this, which is none of them. It is a `View` subclass, so it adds no tier and
nothing depends on it.

**It stays because a sidebar is the one piece of chrome that is genuinely the
same everywhere**, and because it was extracted from the old `ColumnPager`
precisely so it wouldn't be owned by one layout. Any page can render one.

**The test if a second component is ever proposed:** does every site want it, and
does it work with no configuration? A tab bar failed that test — it's a method on
`Page`, because which children are tabs is a *placement* decision. A card failed
it — that's `.page-preview`, a class, because a card is a link with a border.

---

## 2. `pages` is one property, and a group is just an entry with pages

```js
new Sidebar({ brand: "LEW42", pages: [
    { title: "Framework", pages: [               // a GROUP
        { title: "Core", url: "/core/", icon: "dashboard" },
    ]},
    { title: "Flat", url: "/flat/" },            // an ITEM
]});
```

**Options.** (a) A second `groups` property. (b) Duck-type off `.pages`.

**Verdict: (b).** `pages` stays the one thing to remember, a flat sidebar and a
grouped one are the same call, and it nests without a new concept. The cost is
that an entry with a `pages` key can never also be a link — which is correct
anyway: a group heading that navigates is a link pretending to be a heading.

Entries are **duck-typed**, so a real `Page` (which knows its url from
`import.meta`) and a plain `{title, url}` both work — both answer `.title` and
`.url`, which is all a row needs. That is how a site lists sections it does not
want to eager-load.

### 2a. `link()` builds its own anchor now

`Sidebar.link()` used to borrow the anchor from `page.link()` when the entry was
a real `Page`. That handed a sidebar row a **second component's class**:
`.page-link` brings `font-weight: 600` and its own `.active { color: --prim }`,
at the same specificity as `.sidebar-link`'s — so which one won came down to
stylesheet load order, and a Page-derived row and a POJO-derived row in the same
panel could render differently.

**Verdict: build it here.** A row in a sidebar is a sidebar's row. The cost is
one line of anchor construction; the win is that one panel has one look.

### 2b. An entry may say `label` instead of `title`

`page.label ?? page.title`. Not two spellings of one thing — **a label belongs to
the list it appears in, a title belongs to the page** (the distinction
`core/Page/readme.md` argues at length, and the reason `nav` exists at all).

`Page.nav_for(name)` already returns `{url, label, icon}`, so a parent hands its
nav entries straight to `pages`:

```js
pages: [...this.children.keys()].map(name => this.nav_for(name))
```

That is `/framework/`'s entire navigation, and it means the panel, the tab bar
and the preview cards read **one** source. Before this, `/framework/` hand-rolled
its nav from `nav_for()` while `/michael/` hand-rolled its own from `page.title`
— two menus over the same tree, already disagreeing.

### 2c. `header` is replaced, not configured

A site with its own mark passes `header`, and the assign-based constructor makes
that shadow the method:

```js
new Sidebar({ header: () => this.app.brand("Framework", this.url), pages })
```

**Options.** (a) `logo` / `logo_url` / `brand` / `brand_url` grow until they
cover every mark. (b) Accept a View. (c) Replace the method.

**Verdict: (c),** with (a) kept as the zero-config default. (b) is the trap: a
View built to be passed in is constructed *before* the Sidebar captures, so it
lands wherever the captor happened to be and then gets moved — the async-capture
failure mode, in synchronous clothing. A function runs while the Sidebar is
capturing, so what it builds is simply in the right place. An arrow keeps `this`
as the page that knows the brand.

---

## 3. Two component tokens, and everything else is `color-mix`

This file used to hardcode `color: #fff` plus **six** `rgba(255,255,255,…)`
values — correct on a dark panel, invisible on a light one. The lew42 comp has a
white sidebar, which is what forced the fix.

```css
background: var(--sidebar-bg,  var(--bg));
color:      var(--sidebar-ink, #fff);

.sidebar-link.active { background: color-mix(in srgb, var(--sidebar-ink, #fff) 7%, transparent); }
```

**Verdict: promote exactly two tokens, derive the rest.** Ladder rung 2, and the
promotion is justified because a theme *actually needed* to differ — not
speculation. Deriving the group title, icons, hover and active tints from one ink
means a theme **cannot set them inconsistently**, which is how that class of bug
happens.

The comp's two sidebar treatments — white and near-black — are the same component
two token values apart. There is no second design.

### 3a. Why the active fill isn't `--wash`

The comp's active row is `#f2f2f2`, which is exactly `--wash` under theme-lew42.
Using it directly would have been one word shorter and **wrong**: `--wash` tracks
the document's brightness, and `--sidebar-bg: #1f1f1f` on a light page is a
supported combination this very record ships (§3). A light fill would have landed
on a dark panel.

`color-mix(… var(--sidebar-ink) 7%, transparent)` over white resolves to
`#f2f2f2` — the comp's value, arrived at by derivation rather than declared. The
general principle: **when a literal and a derivation agree, take the derivation.**
They only agree in the case you happened to be looking at.

---

## 3b. Porting the July 2026 comp

Frame `110:436`, 307×1316, drawn at 1440 where 1em = 16px.

| | comp | here |
|---|---|---|
| panel width | 307 | `--sidebar: 19em` |
| row | 307×56, x=0 | full width, no margin, no radius |
| row padding | 16 / 16 / 16 / 42 | `1em 1em 1em var(--gutter)` |
| label | 18px | `.sidebar-label { font-size: 1.125em }` |
| active fill | `#f2f2f2` | 7% of the ink (§3a) |
| active icon | `#ff8f60` | `var(--prim)` |

Two deltas, both deliberate:

- **No left accent bar.** The comp doesn't draw one, and the `border-left: 3px`
  it replaces was the only thing in this file that moved the label by a pixel
  between states.
- **Icons stay at `1.25em` of the base (20px), not the comp's 24.** Asked for
  directly — the label going to 18px shouldn't drag the icon up with it.

**The 18px lives on the label, not on the row.** Put it on `.sidebar-link` and
every box value below it is suddenly an em of 18 — `16px` becomes `0.89em`, `42px`
becomes `2.33em`, and the file reads as arbitrary numbers. A span costs one
element and keeps the box measured against the base while the type does what the
comp asks. Two sizes in one row is the normal case.

### 3c. `--gutter` is `em`, and that nearly defeated the whole point

The gutter is one number — 42px for the brand, the group titles and the links —
declared locally as `.sidebar { --gutter: 2.6em }` with the comment *"one number,
so nothing in this column can misalign."* It was wrong when it was written.

**A custom property carries a TOKEN, not a resolved length.** For an unregistered
property the substituted value is the literal string `2.6em`, and `em` resolves
against the element that *uses* it. `.sidebar-group-title` carried `.h4`
(`font-size: 0.875em`), so its `2.6em` measured 36.5px while every link measured
41.8px. The single knob quietly had two values.

**Options.** (a) `@property --gutter { syntax: "<length>" }`, which computes the
value once at declaration and inherits it as an absolute length. (b) Switch to
`rem`. (c) Stop sizing text on the padded box.

**Verdict: (c)** — the fix already used one section above for exactly the same
reason. `.h4` moves to an inner span, the padded div stays at the base size, and
`2.6em` means one thing everywhere. (b) would work and would also stop the gutter
tracking `framework.css`'s body clamp, since `rem` is the root's 16px and the
clamp is on `body`. (a) is correct and is real machinery for one value.

**The rule that generalises: size the text, pad the box, never the same element.**
Both bugs in this file were the same bug.

`line-height` is pinned on the row for the same class of reason: it decides the
row height together with the label, and a theme is entitled to a loose one for
body copy. lew42's `1.8` turned the 56px row into 64px.

---

## 4. The chevron is `›`, not `chevron_right`

An active item gets a chevron. Material Icons would be the obvious source and is
the wrong one: `Sidebar.css` must not depend on a font the app may never have
loaded, or an un-themed sidebar reads **"chevron_right"** down its margin.

A ligature font fails *legibly*, which is a virtue everywhere except in CSS
`content`, where nobody chose to load it.

---

## 5. Icons are on the entry, not on the page

`icon: "dashboard"` sits in the `pages` array, which is parent-side data — the
same call as `Page`'s `nav` map, for the same reason.

An icon identifies **this entry in this menu**, not the page. So it costs no
import, and a sidebar is complete before any of the pages it lists exist. See
`core/Page/readme.md` for the long form; the trilemma it dissolves (duplicate /
eager-load / neither) is the interesting part.

---

## 6. Placement is not its business

```css
.topic > .sidebar { flex: 0 0 var(--sidebar); }
```

One line, at the call site, and always the shared token — **no
`var(--sidebar, 19em)` fallback.** The sharing is the point: a fallback
reintroduces exactly the two-numbers-that-drift problem the token exists to
solve.

It drifted anyway, without a fallback, by a route worth recording: `/styles.css`
styled a `.section-nav` it hand-rolled at `flex: 0 0 14em` while `--sidebar` sat
at `13em` and this component went unrendered. **A token cannot keep two things in
agreement if one of them isn't using it.** The fix wasn't the number; it was
deleting the second sidebar.

`.active` / `.in-path` come from `Router.mark_links()`. **No view compares
`window.location` itself**; one pass sets both classes and CSS decides what each
kind of link does with them. A sidebar treats them the same — both mean "this
section" — while a preview card distinguishes them.

---

## 7. Open

- **The favicon is the default logo.** `Sidebar.favicon()` reads the document's
  `<link rel="icon">` rather than hardcoding an asset path. Neat, and slightly
  magic — it reads DOM the class doesn't own. Nothing has needed otherwise.
- **No mobile behaviour.** The old ColumnPager had an off-canvas burger; this has
  none, and `/styles.css` handles the one case on this site with a media query.
  A component that ships responsive behaviour is deciding layout, which is the
  thing §6 says it must not do — so this is probably correct, but it is
  untested against a second consumer.
- **`/framework/`'s group data is hand-typed, and can drift.** `sidebar_nav` in
  `framework/page.js` lists five groups and twenty entries; each section's own
  `children` string lists the same names again. Reading them instead would mean
  importing all five sections at `/framework/`, which is what laziness exists to
  avoid — the same call `/page.js` makes with `sections`. If it starts drifting,
  the fix is `load_all_children()` in `initialize()` and filling each group after
  first paint, the shape `tabs()` already uses.
- **A group leads with its section rather than linking its heading.** §2's verdict
  stands — a heading that navigates is a link pretending to be a heading — so
  every group's first entry is "Overview", pointing at the section's own url.
  This is what the comp draws, and without it a grouped sidebar has no way to
  reach `/framework/core/` at all.
- **`.brand` has two owners.** `Sidebar.header()` emits it and so does the site's
  `app.brand()` — same class, two components, which is exactly what the naming
  rule forbids. It works because the site passes `header` and only one of them
  ever runs, and because this file scopes its rules to `.sidebar .brand`. It is
  still one class name short of a collision.
