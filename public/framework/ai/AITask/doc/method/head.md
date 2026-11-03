The request, verbatim, as a blockquote — then the brief, folded shut behind a
"Requirements — the brief" `<details>` if `requirements.md` exists. Runs even
when there's no manifest at all (a `requirements.md`-only, not-yet-started
task), which is what lets `report()` bail out right after it (`if (!m) return;`)
without leaving the page blank.
