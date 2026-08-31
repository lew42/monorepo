# finish-task — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.
2026-08-31 · landed_at should be re-read from the clock immediately before writing it, same as every other timestamp, even though it goes into a Write-tool JSON payload rather than a bash append · wrote "10:25:00" from memory while building the outcome text, then a `date -Iseconds` two minutes later for the day-log line showed 10:18 — the landed_at had been typed 7 minutes into the future. Caught only by chance; the skill only warns about backticks in the shell-append path, not about the timestamp itself drifting when composed by hand.
