# finish-task — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.
- 2026-09-05 (paging-audit-1): the clock trap has a second half — inside `node -e`/`execSync("date -Iseconds")` on Windows, `date` resolves to cmd's `date.exe`, which PROMPTS for a new date and exits 1 ("The system cannot accept the date entered"). A script that builds its own timestamp dies mid-append. Get the stamp in bash (`NOW=$(date -Iseconds)`) and pass it into node as argv.
