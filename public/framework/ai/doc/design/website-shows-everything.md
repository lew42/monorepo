# Long-term strategy: the website shows everything — owner, 2026-10-08

Recorded from dictation. Not a task for now (no template changes yet); a direction every agent should follow.

- The owner cannot track every problem one by one, and often misses what *did* land ("maybe it landed and I just didn't see it"). The fix is the website, not more reporting: it must **visualise all the work**, so the problems stop happening.
- Build and improve: **index pages** where every system's pieces are visible and clickable; **better demos** (a demo you can open beats a description); a **recently-landed view** (what shipped lately, computed from git and task records, linked) so landed work is seen; the Sessions, Inbox and Log views as live, trustworthy windows onto the system.
- Rule of thumb for every agent: when you finish something, make sure the owner can *see* it on the site (an index entry, a demo, a card), not only read about it in chat.
- First concrete candidates: a "recently landed" index (computed by script from `git log` + `task.jsonl`, newest first, with links), index pages for each major system (see the systems map from `mastermind-ai-system-docs`), and the Sessions dashboard (`minion-session-class`).
