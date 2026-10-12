# ext-doc-rename

Mike, 2026-08-17: *"rename ext/Doc to ext/Doc... and ext/Doc.ss"* — read as `ext/Doc/` → `ext/Doc/` and `doc.css` → `Doc.css`, matching the class-module convention (`ext/Panel/Panel.js`, `core/Page/Page.css`).

Steps: git mv · sweep references (js/md/css; not `.jsonl` logs) · verify the page renders.
