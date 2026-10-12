# CLAUDE.md consolidation: review page

Nothing was lost, and nothing waits on you. `CLAUDE.md` went from **3,870 to 3,436 words (-11%)**. All 207 old sentences are accounted for by a script, and git can undo every step.

## The numbers (computed by `ClaudeMd.mjs`, not recalled)

- ✅ **161 kept** word for word in `CLAUDE.md`.
- ✅ **24 moved** word for word to the doc where they belong (listed below).
- ✅ **22 archived**: folded into a shorter rule, original wording kept in [claude-md-archive.md](../../doc/claude-md-archive.md).
- Strength words ("never", "always", "must"): 62 before, 60 after. None got stronger.
- Re-check any time: `node run.mjs check` in this folder. The full map, one row per sentence: [manifest.md](manifest.md). The 23 sentences that were reworded: [reworded.md](reworded.md).

## Where the moved text went

- [writing.md](../../doc/writing.md): 7 finer points on clarity and index pages.
- [classes.md](../../doc/classes.md): 7 finer points on class cards and naming.
- [readmes.md](../../doc/readmes.md): 5 finer points on readmes.
- [Mention ideas.md](../../../ext/Mention/doc/ideas.md): the "run all text through one processor" idea.
- [Servex budget.md](../../../../../Servex/doc/budget.md): Haiku pricing detail.
- [Page markdown.md](../../../core/Page/doc/markdown.md): how `.md` links render.
- [Server watch.md](../../../../../Server/doc/watch.md): streams keep flowing during a hold.

## One conflict found

Law 5 said "Superceded docs can be deleted cleanly" (2026-10-05). **Never destructive** (2026-10-08) says nothing is deleted. I kept the later rule and the line "Files are what survive"; the older sentence is in the archive. Tell me if you want it back.

## Merged rules

- "Link every mention" + "Everything is linked" + "References" are now one rule, **Link every mention, and every page**.
- "The iceberg readme" + "A readme is a module's memory" are now one rule.
- Haiku pricing + the 100k-token limit are now one rule.
- The systems list is split into **Cost and roles** and **Pages, cards, review**.

## The fresh reviewer

A separate Sonnet read the 24 rewordings against the old file ([report](review/report.md)). It found eight small drifts and no conflicts. Seven were fixed by restoring the lost clause: the helper-class exception, the "questions and tradeoffs" list, "treat this file as the root readme", "many AI-system pieces should be classes", the debug-view detail, the chunking detail, and "text link first". The eighth, the deliberate Law 5 cut, is the conflict above.

## Still long, if you want it shorter later

The remaining size is mostly your recent rules, which I kept. These pairs overlap and could be merged next: **Cards** with **Chat is the headline**, the **readme chain** with **Readmes are the cheap index**, and **Usage pace** with **Mind the token burn**. I did not merge them because each carries a separate dated rule of yours.

## Merged with a live edit

While this ran, you changed **How to respond** on main (heading path inline, 2026-10-12). I merged main in and kept your new wording; the old sentence is archived and the check still shows zero loss.
