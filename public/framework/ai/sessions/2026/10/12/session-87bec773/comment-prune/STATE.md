# Comment prune: state

All eight files pruned; code verified identical to HEAD by `verify.mjs` (strips comments, compares) and `node --check`. History moved verbatim to each module's `doc/`, linked from its readme.

| File | Comment lines before | After | Doc |
|---|---|---|---|
| `ai/v/3/page.js` | 1132 | 132 | `ai/v/3/doc/notes.md` |
| `ext/drawer/rail.js` | 527 | 12 | `ext/drawer/doc/rail-notes.md` |
| `ux/Dictate/Dictate.js` | 510 | 43 | `ux/Dictate/doc/notes.md` |
| `ux/Dictate/Widget.js` | ~444 | 61 | `ux/Dictate/doc/widget-notes.md` |
| `ext/Chat/Mic.js` | ~327 | 104 | `ext/Chat/doc/mic-notes.md` |
| `ai/cards/card.js` | 269 | 122 | `ai/cards/doc/notes.md` |
| `ai/rail/inbox.js` | ~312 | 59 | `ai/rail/doc/notes.md` |
| `ext/Chat/Chat.js` | ~150 | 58 | `ext/Chat/doc/notes.md` |

Whole-repo census: 167,455 lines / 34,787 comment (21%) / 2,976 blocks of 4+ before; 163,952 / 31,293 (19%) / 2,601 after.
