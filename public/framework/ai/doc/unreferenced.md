# Unreferenced files: a census

**0 files** under `public/framework/{core,ext,ui,ux,styles}` and `public/web` have no reference anywhere: no `import`, no link in a `.md`, no `files.jsonl` row, no `children:` path. Searched 7302 text files with `node Server/Unreferenced.mjs --write`.

**A reference-free file is a candidate, not a verdict.** A file can be loaded by a name built at runtime, by a script tag, or by the owner typing its URL. Nothing here was moved or deleted; the owner decides.

Not counted: the 663 per-member docs under `doc/method|property|file/` (the Doc system lists those by folder), `readme.md`, `page.js`, `files.jsonl`, `index.html`, tests, and anything under `ai/sessions`. A path (`./Foo.js`, `/framework/ext/Foo/Foo.js`) must resolve to the file; a bare file name counts only when no other file shares it, unless a `.js` in the same folder quotes it or its `page.jsonl` (`place`) or `files.jsonl` (`file`) names it. Back to [follow-up.md](follow-up.md).

