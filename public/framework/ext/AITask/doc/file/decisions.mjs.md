The CLI that closes the loop: an **Improve** is a defect in the rule that
produced the decision, and this is what carries it there.

```bash
node public/framework/ext/AITask/decisions.mjs list
node public/framework/ext/AITask/decisions.mjs file
node public/framework/ext/AITask/decisions.mjs file --dry
```

`file` walks every `<date>/<slug>/task.jsonl`, merges decisions and verdicts by
`id` exactly as `TaskJSONL` does in the browser, and for each unfiled Improve
whose decision names a `rule` writes one dated line into that skill's
`improvements.md`, then appends `{"verdict": {"id": …, "filed": …}}` back to the
log. Filing is idempotent; running it twice is a no-op.

**Why a CLI at all:** the browser cannot append to `.claude/`. `rpc:append`
resolves every path under `public/` and refuses everything else, deliberately,
and widening a dev-server writer is how this server's one RCE happened.

⚠ Two things it leaves alone. A decision with **no `rule`** — not every choice
comes from a skill. And an Improve a **later verdict replaced**: only the newest
verdict on a decision counts, or a complaint the owner withdrew would still end
up in a skill.

`--root` and `--skills` point it at other trees, which is how its write path is
tested without touching a real skill.

Design record: [decisions tab](/framework/ext/AITask/doc/decisions-tab/).
