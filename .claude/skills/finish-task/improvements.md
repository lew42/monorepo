# finish-task — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.
- 2026-09-29 (mastermind-servex-6): minion slow-card-fix landed with its Server/Server.js edit and a new Server/compress.js uncommitted in the main tree; file-system's merge then swept the edit into its own merge commit by mistake. Landing should check `git status --short` for the files the task touched and refuse to land while any are uncommitted. → applied 2026-09-30
