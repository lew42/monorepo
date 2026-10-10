# Proposal: a page's tasks live in its own folder

This is a proposal only. Nothing has been moved.

You said: "putting tasks into the class folders themselves actually makes kind of a lot of sense."
Here is the smallest way to do it.

```
public/framework/core/Page/
├── page.js            the page (unchanged)
├── readme.md
├── doc/
└── tasks/                             ← new: this page's work, and only this page's
    ├── 2026-09-28-tab-labels/
    │   ├── requirements.md
    │   └── task.jsonl                 same file, same verbs as ai/<date>/<slug>/
    └── 2026-09-30-columns-fill/
        └── task.jsonl
```

**Where it sits.** A task about one page goes in `<that page's folder>/tasks/<date>-<slug>/`. A task
that spans many pages, or that is about the agents themselves, stays in `ai/<date>/<slug>/`, as it
does today.

**How the rail finds it.** It uses the same `"page"` event as the Page row: when a task opens,
lands or makes a decision, it also writes one line to the day log, with
`"page": "/framework/core/Page/"`. The rail already streams that log, so the page rises. When you
open the page, it shows its own tasks from its `tasks/` folder, in the Docs tab or in a small "Work"
tab.

**What changes for the `new-task` skill.** It asks one question first: "Is this about one page?" If
it is, it makes the dir under that page's `tasks/`, and the launch line carries `"page": "<path>"`.
Every milestone line to the day log carries it too.

**What changes for the task loop.** `Servex/TaskLoop.js` scans `ai/<date>/` today. It would also scan
every `*/tasks/*/task.jsonl` named in `directory.json`. Chasing, escalating and `close_task` all
stay the same. A task that goes stale in a class folder is the loop's job, like any other task.

**The cost.** Page folders get a `tasks/` dir, so it has to be kept out of the site's crawl and
out of `files:` listings. It must not be a declared child either. Nothing crawls, so this is the
default already.
