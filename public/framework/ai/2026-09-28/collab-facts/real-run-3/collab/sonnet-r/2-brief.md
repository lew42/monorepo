# When a merge needs a before-and-after screenshot, and whether an agent can skip review

This repo (Lew42) isn't public, so a web search turns up nothing about it — the answer below
comes straight from `Server/doc/review.md` and `Server/merge.mjs`, which is where the rule
actually lives.

## Screenshots: tied to size, not to "shared CSS"

There are three review sizes, and only one of them carries a screenshot requirement:

- **none** — CSS or docs only, 20 lines or fewer, no new file → no review, no screenshot.
- **light** — code changed, but no new page/module/Servex part → a fresh Sonnet reads the diff. No screenshot.
- **full** — a new page, module, tool, or Servex change → a fresh Opus, plus screenshots at
  1280/1920/3440 and four UX questions.

Screenshots are a "full" thing, triggered by *what kind of thing* changed (a new page/module/tool),
not by whether the CSS is "shared." **There is no line in `review.md` that says "shared CSS
change → always take a before/after screenshot."** A shared-CSS edit under 20 lines with no new
file is `none` by the letter of the rule — no review, no screenshot — unless someone decides it's
risky enough to bump the size up.

That bump is where judgment lives: raising the size needs no justification at all, and the task
mastermind is the one who does it (or leaves it alone). So: **hard rule** = the size tiers and
what each tier requires; **judgment call** = whether a particular shared-CSS change is scary
enough to treat as bigger than its line count says, and if so, to ask for a before/after shot on
top of what the tier already demands. Nothing in the two files makes that screenshot mandatory by
rule — it would be the mastermind choosing to be careful, not `review.md` requiring it.

## Can an agent skip the review gate for a "light" change on its own confidence?

No, not on its own authority — and this part **is** a hard rule, mechanically enforced:
`Server/merge.mjs` always refuses to merge a `light` or `full` branch that has no review newer
than its last commit, or that has any `[fix]` finding still unanswered. That check runs in code,
not in an agent's judgment, every time.

There is one real escape hatch, but it isn't an agent's private call: `merge.mjs` accepts a
`--no-review "why"` flag that skips the gate outright, printing a loud `!!!` warning and logging
the reason. That flag exists in the script, so it's real — but nothing in `review.md` or the
`sub-mastermind` skill hands a plain agent the discretion to reach for it because it feels
confident. The `sub-mastermind` skill's own "Never" list forbids things like killing the server or
driving the owner's tabs on a hunch; skipping a merge safety net on a similar hunch reads the same
way — the kind of decision that belongs to a human or to whoever owns the merge, logged with a
reason, not to an agent quietly deciding "this one's safe."

The one place `review.md` explicitly grants discretion is different: the **task mastermind** may
*lower* a computed size (e.g. full → light) with `--why "self-evident: <one line>"`, logged as a
decision. That's a size adjustment before review runs, not a way to skip the review a light/full
size already requires. Skipping outright is `--no-review`, and that's a bigger, louder, separately
logged act — not something described anywhere as a routine judgment call an agent makes for
itself.

## Bottom line

- **Hard rule:** light/full always needs a fresh review before merge; the gate is mechanical.
- **Hard rule:** full always gets screenshots; none/light never do, by the size definition alone.
- **Judgment call (mastermind only):** whether to raise a shared-CSS change's size (and thus
  require a screenshot) beyond what its line count implies, and whether to lower a size with a
  logged "self-evident" reason.
- **Not a normal judgment call for any agent:** reaching for `--no-review` to skip the gate on
  confidence alone. It exists as a flag, but using it is a loud, logged exception, not routine
  discretion.

## Sources

- `Server/doc/review.md` (this repo) — size table, merge gate section.
- `Server/merge.mjs` (this repo) — the `--no-review` flag and its warning text.
- Web search turned up nothing relevant (private repo); results were unrelated open-source
  issues about generic "merge gate" scripts in other projects, none matching this codebase.
