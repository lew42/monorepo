# Sessions docs: the index

The Sessions tab's detail, by subsystem. The tab itself: [`../readme.md`](../readme.md). Superseded files sit in [`archive/`](archive/moved.md) with a line saying where their content went.

| Folder | What is in it | Load it when |
|---|---|---|
| [`asks/`](asks/asks.md) | [What the owner asked, ranked](asks/asks.md), [why sessions read as stuck](asks/stuck-sessions.md), [the full decision log](asks/decisions.md) | you start work here (read `asks.md` first) |
| [`data/`](data/layout.md) | [Folder layout + migration](data/layout.md), [data architecture](data/data-architecture.md), [record spec](data/record-spec.md), [patterns](data/patterns.md), [path tags](data/path-tags.md), [what the detail loads](data/findings.md) | you read or write session data |
| [`ui/`](ui/classes.md) | [The classes](ui/classes.md), [the Session class](ui/session-class.md), [the views](ui/views.md) | you change the page |
| [`live/`](live/realtime.md) | [Real time: index, tailer, plan](live/realtime.md) | you touch streaming; [how the grid loads](live/grid-loading.md) |
| [`commit-rule.md`](commit-rule.md) | [What is committed, what is ignored, the log sweeper, and the append-only rule for record files](commit-rule.md) | `git status` is full of machine logs |
| [`picture-archive.md`](picture-archive.md) | [Where old months' screenshots live (the E: drive), how to read or restore one, how to archive the next month](picture-archive.md) | a picture on an old report is broken, or the disk is full |
| [`cost/`](cost/spend-tree.md) | [Spend tree](cost/spend-tree.md), [context cost](cost/context-cost.md), [OpenRouter dollars](cost/openrouter-dollars.md), [the account-vs-log gap](cost/openrouter-gap.md) | you touch cost numbers |
