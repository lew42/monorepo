# Dos and don'ts — the traps that never throw

Nothing here raises an error. That's what makes it a list: the only way to catch one of these is
to already know it's there. Full detail with the worked examples and incident links:
[doc/traps.md](doc/traps.md). The house opinions on formatting and file size:
[doc/opinions.md](doc/opinions.md).

## Index

- Names that collide with core
- The ambient captor
- Config fields that mean something narrower than they look
- Timing and lifecycle
- Blast radius — what takes the whole site down
- Layout and CSS that never throw
- The tools themselves
- Opinions: file size, dependencies, comments

## Use

Before naming a page method, a field or a class, check the "Names that collide with core" list —
`render`, `naming`, `text`, `toggle`, `show`, `hide`, `html`, `click`, `on`, `card`, `label`,
`icon`, `description`, `classes`, `topic`, `topics`, `width`, `index`, `leaf`, `src`, `depth` are
all already spoken for.

## Watch out

- **A factory call written after an `await` lands in the wrong place** — see [patterns](../patterns/)
  for the fix.
- **`div.c("row", () => chip(x))` appends the chip TWICE** if the callback also returns a value —
  a captured callback's return value is appended too. End a builder callback in a statement.
- **Every process you start is hidden** — `windowsHide: true` on every Node spawn; PowerShell uses
  `Start-Process -WindowStyle Hidden`. A visible window popping up in front of the owner has broken
  his work more than once.

## More

- [doc/traps.md](doc/traps.md) — the full list, one entry per trap, incident links where they exist
- [doc/opinions.md](doc/opinions.md) — no npm dependency, no black magic, ~100 lines is a try not a rule
- [patterns](../patterns/) — the shapes these traps are the failure mode of
