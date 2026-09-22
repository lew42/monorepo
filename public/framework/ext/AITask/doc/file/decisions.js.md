The **Decisions tab**: level 1 a list of rows, level 2 the option cards in
place, and the two buttons that write the owner's verdict.

Level 1 is a **list, not a wall** — a question is a sentence, and a 17em card
would wrap it four times; a dozen rows fit one screen, which is the point of the
tab. Level 2 draws [`ui/decision`](/framework/ui/decision/)'s markup, so there
is no second copy of the option-card CSS here.

`cast()` is the writer, and it follows `/layouts/browse/verdicts.js` exactly:
one line up the dev socket (`rpc:append`), into **this task's own
`task.jsonl`**, and **the writer does not apply its own line** — it comes back
off the wire like anybody else's, so the server is the only orderer. `expect()`
is the safety net after two seconds, because a press that visibly did nothing is
the worst failure this page has.

⚠ `rule()` is a chip and not a link, deliberately: skills live in
`.claude/skills/`, outside `public/`, and nothing serves them.

⚠ `writable()` hides both buttons off localhost. The static site still shows
every decision and every verdict, read-only.

Design record: [decisions tab](/framework/ext/AITask/doc/decisions-tab/).
