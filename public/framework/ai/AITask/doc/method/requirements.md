Fetches `requirements.md` beside this task, for `head()` to fold into an
"Requirements — the brief" `<details>`. Same content-type guard as
`legacy()`, for the same SPA-fallback reason.

A task started from the board (`compose.js` → `Server/plugins/Start.js`)
always has one — it's the first file `scaffold()` writes, before the log
exists at all. A task opened by hand via the `new-task` skill has one too, by
convention rather than by anything this method enforces.
