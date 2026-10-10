# task-page fix (reconstructed for this proof)

This quick fix landed straight from its own commit message, with no separate requirements.md of
its own at the time — so this file is that commit message, written out as the ask it answers:

> AI 2's file list was `listing()`, which shadowed `Page.listing()` (the framework's own method of
> that name) on every standalone task page. Rename it to `known_files` so a task page's file list
> and the framework's page-listing method never collide, and every standalone task page draws its
> title correctly again (before this fix, it drew only the title and nothing else).

Commit: `e8f04db67e6e43f90d1d4fa6b29d0a4bdb248ed6`, "Merge task-page fix: AI 2's file list is
known_files, no longer shadowing Page.listing()".
