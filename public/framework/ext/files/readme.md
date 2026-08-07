# files — design record

**question → options → weighing → verdict**, as everywhere.

---

## 1. Where does the example project live?

The `/framework/start/` page used to show `index.html`, `app.js` and `page.js` as
string literals inside `code.html(...)` / `code.js(...)` calls. Three problems, all
of them real:

- **It rots.** Nothing runs those strings. `app.js`'s three lines were correct when
  written and nobody would ever find out if they stopped being.
- **It reads as a wall.** A full `index.html`, doctype and all, is fifteen lines of
  which two matter — and the reader has to find them.
- **It cannot show structure.** "A folder with a `page.js` in it is a url" is the
  central idea, and a code block cannot show a folder.

| option | why not |
|---|---|
| keep the literals | the three problems above |
| generate the page from the filesystem at build time | there is no build step, by constitution |
| a JSON manifest of file contents | a hand-maintained second copy, in the worst format for the job |
| **fetch real files** | ✓ |

**Verdict: real files, fetched at view time.** `public/framework/start/example/` is
a working site — five files, correct, importable if you pointed a server at it.
The doc page shows the file that is actually there.

The cost is honest and small: a directory of files nobody imports. Its payment is
that the "getting started" page cannot be wrong about the getting-started files.

### Why they don't become routes

`example/page.js` looks exactly like a page module, because it is one. It is not
reachable, because **nothing crawls the filesystem** — a page exists only if its
parent named it in `children`, and `/framework/start/`'s children do not include
`example`. The file is served as a static asset (which is what `fetch` wants) and
never imported.

---

## 2. Tabs across the top, or a tree down the side?

- **Tabs** reuse `.tab-bar` and cost no CSS. They also cannot show a directory,
  and they run out of room: this ext exists partly to show `about/team/page.js`.
- **A tree** shows nesting, which is the thing being taught.

**Verdict: a tree.** The tab bar is right when the files are peers and there are
four of them, and that case is already served by `Page.tabs()` — a second way to
spell it would be the API bloat and not the feature.

---

## 3. How does the display path get shortened?

The files live at `example/app.js` and must read as `app.js`, or the tree teaches
the doc folder's layout instead of a site's.

- **An option** (`files(meta, { base: "example/", … })`) — API surface forever, and
  the caller has to say the same directory twice.
- **Strip the longest common directory** — one rule, no options, and it does the
  right thing on every input anyone has tried. Adding `example/about/page.js` to
  the set still leaves the common prefix at `example/`, so the tree grows an
  `about/` folder exactly when the author adds a file in one.

**Verdict: strip the common directory.** Segment-wise, never character-wise —
a character comparison of `app.js` and `app2.js` would cut mid-name.

---

## 4. Selection: index into the list, or read it off the row?

The first version matched a clicked row to its path by index into the declared
list. It was wrong, and it is the kind of wrong that works in every test you would
think to write: `nest()` groups paths by directory, so tree order is declaration
order **until two paths interleave folders** —
`"sub/b.js a.js sub/c.js"` renders `b.js c.js a.js` and every click after the
first is off by one.

**Verdict: the row carries its own `data-path`.** The leaf of the nested map holds
the fetchable path rather than `null`, so the thing that knows the answer is the
thing that is asked.

---

## 5. Kept: no expand/collapse

Folders render open and stay open. A disclosure triangle is the obvious next
feature and it should not be built: these trees have three to six entries by
construction — a doc example that needs collapsing is a doc example that is too
big. If one ever genuinely does, `<details>` already does this with no JS.

---

## 6. Open

- **No line numbers, and no deep link to a line.** Both are wanted the moment a
  file gets long enough to discuss a specific line, and neither is wanted now.
- **`max-height: 26em` on the pane** is a guess that reads well for the five
  example files. A long file scrolls inside the box, which is right; a very short
  one leaves the tree taller than the pane, which looks slightly odd and has not
  been worth a rule.
