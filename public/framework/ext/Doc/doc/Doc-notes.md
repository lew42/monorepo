# Doc.js — Design and Implementation Notes

## Class API and Purpose

Doc — a module documented as a page: its files, its members, its notes.

```javascript
export default new Doc({ meta: import.meta, title: "View", subject: View,
    methods: "append ac", properties: "el", notes: "capturing",
    files: "View.js View.css", overview: demos, content(){ … } });
```

Overview | …declared children… | API | Docs | Files, derived — a call site lists
members and never says "tab". `subject` is whatever owns those members: a class,
a function with properties (`md`, `demo`), a namespace object, or nothing at all.

Every part is a method, so a module with a different shape subclasses rather than
grows an option.

## CSS Classes

.doc-page, .doc-well, .doc-title, .doc-section, .doc-decision(-wrap|-btn|-pop|-link) —
all emitted in Doc.js. Also .tab-bar (../tabs), .files (../files) and .page-catalog-pages /
.page--intro / .page-title (../catalog and core/Page) — every emitter is imported above.

## Key Implementation Details

### nav() — is_class flag

One flag, read everywhere a preview card is drawn (Page.preview_card(), the sidebar
tree, a future Mention chip): does this module's page document a real ES CLASS, or a
plain function/namespace (`md`, `demo`) that merely has members? `Doc.is_class()`
already answered this for the Overrides note below — this is the same fact, exposed
through the one method every card-drawing caller already calls (`nav_for()` →
`child.nav()`), so nothing has to ask `instanceof Doc` or re-derive it a second way.

### child() — redirect "docs" to "doc"

"docs/" is not a real page anywhere — the convention is `doc/`, everywhere (75
modules use it) — but someone will type "docs" out of habit (it happened once
already), so make it resolve instead of 404ing, with no Router change. Router.js
never parses a whole url: it just asks each page for `child(name)`, one segment
at a time (Router.js:77-88). So catching the ONE segment "docs" here is enough —
`docs/method/foo/` keeps walking correctly afterward, because the page this
returns already carries the real `.../doc/` url, and every later hop calls
`.child()` on THAT page object, never on a re-parsed url.

⚠ `history.replaceState`, never `pushState`: for an in-app click, Router's own
`go()` calls `load()` (which is what reaches here) BEFORE `history.pushState(...)`
— a `pushState` made here would just be overwritten a moment later by that later
call. Typing the url directly — this feature's real case — never runs `go()` at
all, so the fix made here is the only write to history and it sticks. Because it
REPLACES the current entry instead of pushing a new one, Back leaves one entry to
undo, not two.

⚠ Only ever fires when *I* (the page asked for "docs") am a Doc instance. The two
real pages named "docs" today (styles/layouts/docs/, core/Page/overview/docs/)
are children of a plain Page — a `new Page({...})` module and a `section()`-built
tab, respectively, never a Doc — so this override never runs for them at all.

### section() — tab visibility

A top tab: a page whose own children are a left rail. Two levels of real pages,
so a member is /View/api/append/ and every tab is a url.

⚠ 2026-09-29 fix round, finding 3: `nav: true` here PINS this tab always-shown,
with no fetch — Overview/API/Docs/Files are this class's own derived chrome,
never a real page anyone's `settings.jsonl` describes, and `this.url + name +
"/"` could, for an unlucky name, collide with a REAL folder somewhere that
does have one (core/Page/'s own "overview/" folder, for one). `tab_visible()`
(core/Page/Log.js) treats an explicit `nav: true` the same way it already
treats `nav: false` — it wins outright, no page_settings() lookup at all.

### overview_section() — catalog and binding

The Overview is a CATALOG: the demos as a rail of live cards, and catalog() makes
`content` the rail's first card — the intro, wearing my title, label and icon — so
a module with demos and one without are the same shape. `overview:` hands the demos
in as child configs (an array) or names sibling directories (a string).

⚠ `content` is BOUND to me, not to the section. catalog() makes it the intro
child's and would otherwise call it with the section as `this` — but it was
written as a method of THIS config, beside the helpers it calls, so `this.look()`
has to mean what the author typed. Two audit agents wrote exactly that and both
pages threw; the binding was the bug, not the pages.

### docs_section() — order of api_section

The "Docs" tab, PLUS a second door every member gets at the same time: whatever
api() (above) just built landed in `member_index` by kind, and member_group()
below answers `doc/method/<name>/` / `doc/property/<name>/` from it — the address
where the `.md` itself actually sits (declaring.md), same as a note's own
`doc/<name>/`. A module with members but no notes still gets this node; render()
only ever lists real notes, and bar() only shows the tab when one exists, so
nothing looks different until you go looking for the second door.

A flat list (no "/" in any name) renders exactly as it always has: a
vertical tab bar. Only when a name NESTS ("guide/setup") does this switch
to note_tree() below — same classes either way, so the ~75 flat-list
modules see zero change.

### member_group() — aliasing by kind

One container per kind, answering `doc/<kind>/<name>/` from whatever api() (via
member_page()) actually recorded — so a second, prefixed subject
(`members(section, History, { prefix: "History." })`, readme.md's own example)
aliases exactly like the first, with nothing here naming it specially.

### files_section() — layout structure

One view, not a rail — so it declares its own render rather than taking section()'s.

`.doc-files` itself is a flex ROW (Doc.css) built for exactly ONE
child, `doc.browser()`'s tree|about|source panels — so a second
child (the link) needs its OWN box, one that stacks the two
vertically, rather than becoming a squeezed fourth column in that
same row. Inline styles only: Doc.css is outside this fence.

This tab's own box is small — nested in the tab panel, the page
padding and the site sidebar — so a reader who wants the real
size gets the module's own full-screen `fs/` route instead.
See core/Page/Page.class.js's fs_folder() seam; ext/files/fs.js.

### api() — override pattern

What fills the API tab. One subject is the whole job for most modules; a module
with a SECOND class overrides this and calls members() again — the seam this
class exists for. `prefix` keeps the two sets from colliding, in the url and in
the filename both:

```javascript
api(section){
    super.api(section);
    this.members(section, History, { methods: "push undo", prefix: "History." });
}
```

### docs() — notes as prose

A note is prose that earned a url — the whole page is `doc/<name>.md`, the same
file the readme cites. No source pane, and no `call`: there is nothing to override.
A name may NEST ("guide/setup") — declare_note() below is where that is handled;
a flat name (no "/") goes through it too and comes out exactly as before.

### declare_note() — nested note page sharing

One plain pass-through page per segment before the last — its only job is to hold
the next segment's children, the same one-level trick member_group() (above)
plays for "method"/"property", generalized here to any depth. `guide/setup` and
`guide/config` share one real "guide" page, built the first time either is seen
and reused the second time. The LAST segment gets the real note page, the exact
shape a flat note always got — `doc/${name}.md`, slashes and all, is already the
right file, because the whole name IS the path.

### member_page() and member_page_config()

The one member page shape: an optional banner, an optional source pane, the prose.
`kind` ("method" | "property") is the ONLY thing that makes a member open a
second way — recorded here into `member_index`, read back by member_group()
above. A note (docs(), no kind) keeps its one address, `doc/<name>/`.

Pulled out of member_page() so member_group() can build the SAME page a second
time, at a second address, without member_page() growing a second job.
`kind` ("method" | "property") is also what turns on the ⋯ menu below — a note
(docs(), no kind) never gets one, because nothing wires a collab decision to a name
that isn't a real class member.

The owner's want (file-explorer-fs/owner-words.md, first half): a method's own
page shows the ⋯ the moment a design collab named it, with no AI having to
remember to wire the link. decision_menu() is a promise: append() places it
once Collab.Decisions.for() resolves, and does nothing when it resolves empty.

### module() — extract module path

Framework-relative module path this page documents — "ext/Saver" for a page whose
`this.url` is "/framework/ext/Saver/" — matched against the shared decisions.jsonl's
own `module` field (Server/Collab.mjs's `target.module`, a collab.json's own words).

### overrides() — shadow instance members

The framework's own override lever, and the only one a member page can name from
what it knows: every constructor here is Object.assign-based, so an assigned member
shadows the prototype's. A static has no instance to assign to, so it gets no line —
and a subject that is not a class has no constructor to speak of at all.

### bar() — tab strip ordering

Overview first and the reference sections last, whatever order they were added in;
a declared child sits between. Filtered, because an empty section was never added
— except "doc", which docs_section() now also builds for a module with members and
no notes (so `doc/method/<name>/` has a node to live under): that one shows only
when there is a real NOTE to read, so a module gains no tab it did not have before.

⚠ 2026-09-29, page-system task: a declared child can carry a `tab` line
  (core/Page/Log.js's `tab()`) — `tab_visible()`/`tab_order()` read it. Neither
  finds anything for a page that never wrote one, so this is a no-op for every
  Doc page that doesn't use the new lines.

### wall() and well()

My declared children as a wall, WITHOUT the sections I derived — those are the tab
strip, and a module previewing them on its own Overview is previewing its own
chrome. `/framework/ui/` drew four extra cards that way.

The title and the tab strip share one row in a full-bleed band.
The page's own icon before its name (the owner, 2026-10-03): the same icon the
sidebar shows, so the heading and the nav entry read as one thing.

### nested_in_doc() — render strategy

True once an ANCESTOR is another Doc — I am rendering inside its `.tab-panel`.
Two `--well` bands stacked over `--wash` read as broken alternating stripes
(ux/*, 2026-08-26): the fix is the shape ext/Panel/Workspace/page.js already
hand-wrote — no well, no second `.doc-page`, just a left rail like Doc's own
api/doc/files sections. render() below picks it automatically.

### note_tree() — tree styling

The Docs tab as a TREE, once any note nests — reusing ext/files' own nest() for the
grouping and its CSS classes for the look (folder icon, indent, .file-tree/.file-dir/
.file-name — files.css), so this inherits the styling rather than forking it. The one
real difference from ext/files' own rows(): each leaf here is a REAL routed link to
the note's own page (`a().href(...)`), because a note has a bookmarkable url — ext/
files draws a click handler that swaps a query param instead, right for browsing a
file selection, wrong for a note that is its own page.

### SECTIONS — static list

The sections this class derives, as opposed to the children a call site declared.
One list, two readers: `bar()` orders the strip by it, `wall()` subtracts it.

## Utilities

Doc.names — parse space-separated names, filter empty strings.

Doc.label — the subject's name or "the subject"; uses `||` not `??` to catch functions with empty `name`.

Doc.is_class — checks for `class` keyword in source; distinguishes real classes from functions with properties.

Doc.intrinsic — regex to skip function intrinsic properties (name, length, prototype, caller, arguments).

Doc.declared — checks if a member exists on the prototype (real class member, not a function-expression property).

Doc.declaration — extracts property declaration source when possible (descriptors, not accessor evaluation).
