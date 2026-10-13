# Comment prune, round 2: state

All 20 files pruned (one commit each); code verified identical by `verify.mjs` against `HEAD~1` and `node --check`. History moved verbatim to each module's `doc/`, linked from its readme. Counts computed by script from git (`5f200bf53` vs `HEAD`).

| File | Comment lines before | After | Doc |
|---|---|---|---|
| `ux/Dictate/playground/Playground.js` | 260 | 37 | `ux/Dictate/doc/Playground-notes.md` |
| `ux/Dictate/variants/v1/Dictate.js` | 229 | 125 | `ux/Dictate/variants/v1/doc/` (Dictate-v1-notes.md) |
| `ext/drawer/tabs/ai.js` | 226 | 93 | `ext/drawer/doc/ai-tab-notes.md` |
| `ux/Tree/Tree.js` | 214 | 173 | `ux/Tree/doc/` (Tree-notes.md) |
| `ai/rail/rail.js` | 212 | 172 | `ai/rail/doc/` (live-notes.md, NeedsRule-notes.md, notes.md, rail-notes.md) |
| `ext/Doc/Doc.js` | 201 | 66 | `ext/Doc/doc/` (Doc-notes.md) |
| `ext/JSONL/JSONL.js` | 201 | 30 | `ext/JSONL/doc/` (JSONL-notes.md) |
| `ext/AITask/asks.js` | 182 | 48 | `ext/AITask/doc/` (asks-notes.md) |
| `ext/Panel/properties.js` | 178 | 123 | `ext/Panel/doc/` (properties-notes.md) |
| `ai/rail/NeedsRule.js` | 175 | 146 | `ai/rail/doc/` (live-notes.md, NeedsRule-notes.md, notes.md, rail-notes.md) |
| `core/Page/generator/page.js` | 174 | 88 | `core/Page/generator/doc/` (notes.md) |
| `ext/Ask/reply.js` | 170 | 110 | `ext/Ask/doc/` (notes.md) |
| `ext/Refine/engine.js` | 170 | 27 | `ext/Refine/doc/` (notes.md, tag-notes-2026-10-12.md) |
| `core/new/1/Page.class.js` | 164 | 40 | `core/new/doc/notes.md` |
| `ext/DesignTool/taste/read.js` | 164 | 129 | `ext/DesignTool/taste/doc/` (notes.md) |
| `ai/rail/live.js` | 163 | 26 | `ai/rail/doc/` (live-notes.md, NeedsRule-notes.md, notes.md, rail-notes.md) |
| `core/Sidebar/Sidebar.js` | 161 | 30 | `core/Sidebar/doc/` (sidebar-notes.md) |
| `audio/MicStream/MicStream.js` | 159 | 49 | `audio/MicStream/doc/` (micstream-notes.md) |
| `ux/Dictate/chat.js` | 159 | 14 | `ux/Dictate/doc/` (chat-notes.md, notes.md, Playground-notes.md, widget-notes.md) |
| `core/Item/Item.js` | 158 | 110 | `core/Item/doc/` (item-notes.md) |

20 files total: 3720 → 1636 comment lines.

Whole-repo census: 163,952 lines / 31,293 comment (19%) / 2,601 blocks of 4+ before; 161,856 lines / 29,209 comment (18%) / 2,384 blocks of 4+ after.
