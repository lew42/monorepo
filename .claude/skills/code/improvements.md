# code — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.
2026-08-19 · Windows: `git mv` on a whole directory can EPERM ("Permission denied") while the dir-level rename is blocked (dev server file-watcher handle, seen with the server running on port 80) · per-file `git mv oldfile newfile` (mkdir -p the destination parent first) succeeds even when the directory-level rename fails — core/Page/{overview,nav,children,previews,shell,flow} -> old/ (page-docs-restructure).
