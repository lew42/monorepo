# finish-task — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

- 2026-08-29 (screens-comp): the landing line was built inside `node -e "..."` from bash and every backticked code span in the outcome was eaten by command substitution — the append SUCCEEDED and printed "landed", so nothing failed; the card just rendered with holes in it. Any outcome with `code` in it: write the markdown to a scratchpad file with the Write tool and have node read it, or use single quotes for the `-e` body. Then re-parse every line of the jsonl before walking away.

- The outcome markdown is full of backticks. Writing the landing line through `node -e "..."` inside a DOUBLE-QUOTED bash string ran every code span as a command substitution and landed a line with all the code words missing - it parsed as valid JSON, so nothing complained. Put backticked prose in a FILE and run the file (2026-08-30, alpha-flip).
