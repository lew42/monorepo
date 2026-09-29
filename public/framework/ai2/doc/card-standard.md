# The card standard: show it, then say it

![The Servex card, drawn to this standard](/framework/ai/2026-09-25/servex-mastermind/card-quality.svg)

```
Card ─────────────────────────────── one screen
├── Name          + one sentence: what it is
├── State         ● Running · 11 agents · 3 working
├── Folder        ext/files: the tree, source on click
├── Objects       live instances, counts, + New where safe
├── Checklist     [x] done   [ ] next
├── Words         last, and few
└── One click →   tasks · chat · cost · doc
Rail preview      one line, 60 characters at most, never a log line
```

Before writing a card, load the `page` skill (it brings in `content`). Every element on a card passes its two tests: **self-evident** (the owner knows what it is without reading more) and **necessary** (it earns its space, or it moves one click down).

- Every name on a card is a link: a class, an instance, a task or an agent.
- Every view a click reaches has its own URL.
- One name per idea: a *card* is a topic, a *request* is one thing asked in it, a *task* is an agent's work, and an *instance* is a live object of a *class*.
- At landing, `Server/text-check.mjs` flags walls of text.
