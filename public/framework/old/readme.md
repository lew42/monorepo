# Framework (old) — the /framework/ home page as it stood before the 2026-10-02 sprawl rebuild

Nothing was deleted when `/framework/` was rebuilt into a wall of sections that reads
straight from the sidebar's own tree — the old hero, live clock and tutorial just moved
here, as an ordinary child page, so an old link or bookmark still works.

## Use

Open [/framework/old/](/framework/old/) to see it as it was. There's nothing to extend —
it's a kept copy, not a module.

## Watch out

- It's a CHILD of `/framework/` now, not its own root — it must never build its own
  `Sidebar` (the one real sidebar already wraps every child page); see the comment at the
  top of [`page.js`](page.js) for the bug that shape caused the first time around.

## More

- The new [`/framework/`](/framework/) home page, and the task that moved this here:
  [`ai/2026-10-02/framework-home/`](/framework/ai/2026-10-02/framework-home/).
