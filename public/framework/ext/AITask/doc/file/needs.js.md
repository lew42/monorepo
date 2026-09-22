The **"Needs you" strip** — the few things only the owner can do, shortest first.

An `ask` or a `decision` carrying `needs: {owner, minutes}` becomes one line here:
the minutes, what it is, and a link to the work waiting on it. `needs_of(m, base)`
reads one task's log; `needs_all(rows)` reads a whole board's worth, which is what
the front page's rail draws above everything else.

The strip is **silent when empty**, which is the normal state and deserves no box
of its own.

⚠ **The off switch is `needs.done`, never the ask's own `status`.** The ask this was
built against — `sqlite-status`, "Cloudflare login and wrangler d1 create" — is
marked **landed** while the owner has still never logged in. An ask's status is the
bot's half of the work; `needs.done` is the owner's half. A decision has a second,
free off switch: a verdict on it.

⚠ The row's gap is in its own `em`, never `--gap`: the spacing clamp caps at 2.6em,
which would put 47px between a "5 min" badge and the sentence it belongs to at 3440.

Design record: [ranking](/framework/ext/AITask/doc/ranking/) · the verb:
[`ext/JSONL`](/framework/ext/JSONL/doc/task-jsonl/).
