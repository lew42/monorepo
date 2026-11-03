# Trim the long readmes to an index (non-destructive)

**Found by** [asks-by-module](../../session-d4cd44ab/asks-by-module/STATE.md): `core/Page/readme.md` 124 lines, the sessions readme 205, the Servex readme 392, against CLAUDE.md's "readmes are the cheap index, under about 100 lines".

## Done when
- [ ] Each of the three is under about 100 lines: an index of what exists, one line each, with links.
- [ ] Nothing is lost: every moved paragraph lands in a `doc/*.md` beside the module (append, keep the wording), linked from the readme. A script checks every original sentence appears in the new readme or a linked doc, and prints the count.
- [ ] The owner's quotes and dates move with their text.

Sonnet 5.5, low effort. Commit each readme; merge. One-sentence chat replies; `STATE.md`; land with `finish-task`.
