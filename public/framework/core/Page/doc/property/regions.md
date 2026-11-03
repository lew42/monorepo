A Map of `child name → the View that child mounts into`.

**Usage** — read in one place, `container()` (`Page.class.js:99`). **Written
nowhere in core** — `ext/tabs` creates and fills it
(`framework/ext/tabs/tabs.js:28-29`), pointing every tab's name at the tab panel.

**Necessity** — yes, given tabs. `$pages` claims *everything below you*; this claims
*one named child*. Two tab sets on one page cannot share a single `$pages`, and that
is exactly what forced the second level.

**Simplicity** — right-sized as a data structure, and it is the honest edge of the
"no black magic" rule:

> Core reads a property core never writes, filled by an ext core may not import. The
> file that names `regions` and the file that fills it never mention each other.

Two things make it survivable rather than magic: `container()` **logs** which claim
it took, and the ext is the only writer, so there is one grep to find. It is
recorded in `readme.md` and in `ext/tabs/readme.md` rather than in a comment,
because the coordination is a design decision, not a line of code.
