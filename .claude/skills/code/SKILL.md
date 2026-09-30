---
name: code
description: Load once per session before writing or editing JS under public/ — the lifecycle of a task, house style (assign-based OOP, every method a seam, parts as static subclasses), and the traps that never throw. Reference skill; reload only after a long gap. Companions it will remind you of — new-task, layout, css, new-css-class, new-page, documentation, finish-task.
---

# Code

Read the readme chain at [/framework/code/](/framework/code/) (root → framework → code), then its
`patterns`, `dos-and-donts` and `objects` children. This skill just tells you the knowledge moved
there; the rules themselves live on the pages now, not here.

Overview: `public/` is no-build native ESM — read a class top to bottom and know what happens.
Every constructor is assign-based (`this.assign(...args)`). Capturing is synchronous: never build
DOM after an `await`. A page method named `render()` collides with core. Every process you start
is hidden (`windowsHide: true`). Every class ends up with a view of its own state — a chip, a row,
a panel.

Improve this skill: append to [`improvements.md`](improvements.md).
