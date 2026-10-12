---
name: code
description: Load once per session before writing or editing JS under public/ — classes not function bags (one class per file, named for the file, page templates extend Page), assign-based OOP, every method a seam, the lifecycle of a task, and the traps that never throw. Reference skill; reload only after a long gap. Companions it will remind you of — new-task, layout, css, new-css-class, new-page, documentation, finish-task.
---

# Code

## Write classes, not function bags (the owner, 2026-10-08; CLAUDE.md)

Before you write a function, ask "which class owns this?" A thing with state or behaviour is a class.

1. **One class per file; the file, folder and class share one capitalised name** (`SessionsPage.js` holds `class SessionsPage`). Export the class, not a dozen named functions. A small helper class may live in its parent's file.
2. **Helpers are methods or statics** on the class that uses them (`Thing.parse(...)`, `this.draw()`), never loose functions beside it. A file that is only `export function a, b, c` is a bag: turn it into a class.
3. **A page is a class that extends `Page`; a view extends `View`.** `page.js` stays tiny: import the class, instantiate it. Never put 40 functions and 1,400 lines in a `page.js`.
4. **Subclass to vary, never copy.** Parts are static subclasses (`List.View`), so a subclass swaps one part.
5. **Before you copy a neighbour, check it is a class.** Many old files are lowercase bags of functions (`node public/framework/code/patterns/function-bag-census.mjs --repo` ranks them by how many files import them); they are a refactor backlog, not a pattern to imitate. When you edit one, move what you touch into a class.
6. Mind the base API: `Page` extends `Item`, so check for a name clash (`render()` collides with core).

## The hierarchy explains the module (the owner, 2026-10-09)

A reader should understand how a module works from its class names and what extends or holds what, before reading a method.

- **One class is the manager.** A module of several classes has one that orchestrates the rest (`Servex/Servex.js` holds `servex.agents`, `servex.task_loop`, `servex.lifecycle`); its name sounds like the system. The others are its parts, held as properties or statics (`Servex.Agents`, `Thing.View`), so a subclass can swap one.
- **Design it first.** Before you build more than one class, write each class's name and one-line job, and what extends or holds what, in the module's readme `## Architecture` block, where the owner can see it.
- **`architecture.md` holds the decisions.** Beside the readme, in `doc/architecture.md`: each decision in a line or two (why this class, why this name, what was rejected), linking the session or task where it was decided. Add to it; don't retell it in the readme.
- **The readme is small enough to read whole:** an index of the classes and docs, under about 100 lines.

**The view pattern (the owner, 2026-10-08):** the view class is attached AFTER the class, never nested inside its body, and the instance reaches it through `this.constructor`, so a subclass can replace it.
```js
class EventLog extends Lab {
	entries = [];
	render(){ return new this.constructor.View({ item: this }); }
}
EventLog.View = class EventLogView extends LiveView {   // or: EventLog.View = EventLogView, from its own file
	draw(){ div.c("lab-log", () => this.item.entries.forEach(e => div(e.text))); }
};
class PrettyLog extends EventLog {}
PrettyLog.View = class PrettyLogView extends EventLog.View { /* override draw() */ };
```
Never `static View = class …` inside the class body, never `new EventLog.View(…)` (the lexical name defeats the subclass), never a hand-built `.view` field. Reference: `audio/Voice/Voice.js` (`Voice.View = class extends PartView`); some older lab classes still nest it and are being moved.

The shape, the statics and the naming: [/framework/code/patterns/](/framework/code/patterns/) (read it, then `dos-and-donts` and `objects`).

**A system's logs and debug view belong to its class (the owner, 2026-10-09).** Whisper's log is `Whisper`'s own view, not something a page like `ext/Refine` builds by hand; any page that uses Whisper shows that view. A server and its many uses are separate instances (one `Whisper` server, many `WhisperSession`s, one per dictation surface), each with its own log. Every system renders the same way: an icon item you can expand into its live properties and log (the instance explorer), so the class hierarchy and the live UI sit side by side and you watch instances appear and change as you use it. Never build a page-specific debug UI for a class.

## Comments: a pointer, not an essay (the owner, 2026-10-12)

The code speaks for itself, so most lines need no comment. Write one only where the code would surprise a reader (a trap, a non-obvious why), and keep it to a line, ideally a pointer: `// see doc/columns.md` or `// Windows fires change on read: Server/doc/watch.md`. A paragraph is more for every reader, human or AI, to read and interpret, and it buries the code. History, lessons learned and design reasons go in the module's `doc/*.md` (or `doc/architecture.md`), linked from the comment. When you edit a file with long comments, move what you touch to `doc/` and leave the one-line pointer.

## Always

`public/` is no-build native ESM: read a class top to bottom and know what happens. Every constructor is assign-based (`this.assign(...args)`). Capturing is synchronous: never build DOM after an `await`. Every process you start is hidden (`windowsHide: true`). Every class ends up with a view of its own state (a chip, a row, a panel).

Improve this skill: append to [`improvements.md`](improvements.md).
