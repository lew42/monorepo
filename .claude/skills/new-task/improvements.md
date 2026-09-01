# new-task — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.
2026-08-31 · claude-usage.py --json returns "utilization" as a whole percent (e.g. 2.0), but `window.before` in the launch line needs percent/100 (0.02) · pasted the raw number once before catching it in review; the skill shows the divide in the launch template but not beside the usage.py call itself, where the mistake actually happens.
2026-08-31 · when a private dev server is needed and a sibling task's port (8097) is already taken, `netstat -ano | grep LISTENING | grep -E ":80(8\|9)[0-9]\s"` finds every claimed port in the 808x/809x range in one call, so the next free one is picked without a guess-and-retry cycle · improve-feeds-vary hit 8097 already bound on the first try.
