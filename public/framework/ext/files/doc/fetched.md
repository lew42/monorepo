# Why the files are fetched, not pasted in

**question → options → weighing → verdict**, as everywhere.

---

## Where does the example project live?

`/framework/start/` used to show `index.html`, `app.js` and `page.js` as string
literals inside `code.html(...)` / `code.js(...)` calls. Three problems, all
real:

- **It rots.** Nothing runs those strings — `app.js`'s three lines were correct
  the day they were written, and nobody would find out if they stopped being.
- **It reads as a wall.** A full `index.html`, doctype and all, is fifteen
  lines of which two matter, and the reader has to find them.
- **It cannot show structure.** "A folder with a `page.js` in it is a url" is
  the central idea, and a code block cannot show a folder.

| option | why not |
|---|---|
| keep the literals | the three problems above |
| generate the page from the filesystem at build time | there is no build step, by constitution |
| a JSON manifest of file contents | a hand-maintained second copy, in the worst format for the job |
| **fetch real files** | ✓ |

**Verdict: real files, fetched at view time.**
`public/framework/start/example/` is a working site — five files, correct,
importable if a server pointed at it. The doc page shows the file that is
actually there.

The cost is honest and small: a directory of files nobody imports. Its payment
is that the "getting started" page cannot be wrong about the getting-started
files.

## Why they don't become routes

`example/page.js` looks exactly like a page module, because it is one. It is
not reachable, because **nothing crawls the filesystem** — a page exists only
if its parent named it in `children`, and `/framework/start/`'s children do not
include `example`. The file is served as a static asset (which is what `fetch`
wants) and never imported.
