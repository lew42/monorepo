# Comment prune round 3: state

**Census before → after:** 1639 files; comment lines 29,209 (18%) → 25,154 (16%); blocks of 4+ lines 2,384 → 2,006; total lines 161,856 → 157,748.

Note: the 8 round-2 files in the top 40 were swapped for the next 8 in the census (Search, DesignTool rules, kit, rank, Frame, day-prompts, Layout, taste/corpus).

40 files pruned, one commit each, every one passing `verify.mjs` (code identical); history moved to the notes docs below, each linked from its module readme.

| File | Lines before → after | Notes doc |
|---|---|---|
| `ai/cards/card.js` | -105 comment lines, +105 | |
| `ai/page.js` | -24 comment lines, +101 | |
| `ai/rail/Processes.js` | -22 comment lines, +98 | |
| `ai/rail/groups.js` | -7 comment lines, +129 | |
| `ai/talk/page.js` | -11 comment lines, +123 | |
| `ai/v/3/page.js` | -2 comment lines, +246 | |
| `core/Layout/Layout.js` | -13 comment lines, +97 | |
| `core/Layout/rules.js` | -6 comment lines, +104 | |
| `core/Page/Frame.js` | -13 comment lines, +101 | |
| `core/Page/Page.class.js` | -18 comment lines, +120 | |
| `core/Page/ext/Inbox/Rail.js` | -16 comment lines, +115 | |
| `core/Page/generator/controls.js` | -14 comment lines, +99 | |
| `core/Page/generator/export.js` | -10 comment lines, +127 | |
| `core/Page/generator/tree.js` | -3 comment lines, +129 | |
| `core/Page/page.js` | -10 comment lines, +110 | |
| `core/Search/Search.js` | -12 comment lines, +89 | |
| `core/Section/Section.js` | -33 comment lines, +147 | |
| `core/new/1/site/chrome/chrome.js` | -3 comment lines, +122 | |
| `core/new/1/site/kit/kit.js` | -7 comment lines, +103 | |
| `core/new/1/site/library/page.js` | -3 comment lines, +148 | |
| `dev/DevBar/says.js` | -16 comment lines, +108 | |
| `dev/Socket/Socket.js` | -10 comment lines, +132 | |
| `ext/AITask/AITask.js` | -7 comment lines, +152 | |
| `ext/AITask/dashboard.js` | -23 comment lines, +145 | |
| `ext/AITask/day-prompts.js` | -18 comment lines, +99 | |
| `ext/AITask/rank.js` | -1 comment lines, +87 | |
| `ext/Chat/ChatPanel.js` | -6 comment lines, +123 | |
| `ext/Chat/Composer.js` | -1 comment lines, +110 | |
| `ext/DesignTool/polish.js` | -19 comment lines, +108 | |
| `ext/DesignTool/rules.js` | -21 comment lines, +101 | |
| `ext/DesignTool/taste/corpus.js` | -2 comment lines, +94 | |
| `ext/Mention/Mention.js` | -15 comment lines, +94 | |
| `ext/Panel/glyphs.js` | -1 comment lines, +119 | |
| `ext/Panel/text.js` | -20 comment lines, +94 | |
| `ext/Research/Program.js` | -17 comment lines, +97 | |
| `ext/catalog/browse.js` | -14 comment lines, +100 | |
| `ext/demo/demo.js` | -12 comment lines, +120 | |
| `ext/files/explorer.js` | -10 comment lines, +115 | |
| `ext/files/files.js` | -4 comment lines, +135 | |
| `styles/system/studies/lists/page.js` | -16 comment lines, +126 | |

Notes docs added:
- [ai/cards/doc/card-notes.md]
- [ai/doc/ai-page-notes.md]
- [ai/rail/doc/Processes-notes.md]
- [ai/rail/doc/groups-notes.md]
- [ai/talk/doc/talk-page-notes.md]
- [ai/v/3/doc/v3-page-notes.md]
- [core/Layout/doc/Layout-notes.md]
- [core/Layout/doc/rules-notes.md]
- [core/Page/doc/Frame-notes.md]
- [core/Page/doc/Page-notes.md]
- [core/Page/doc/page-js-notes.md]
- [core/Page/ext/Inbox/doc/InboxRail-notes.md]
- [core/Page/generator/doc/generator-controls-notes.md]
- [core/Page/generator/doc/generator-export-notes.md]
- [core/Page/generator/doc/generator-tree-notes.md]
- [core/Search/doc/Search-notes.md]
- [core/Section/doc/Section-notes.md]
- [core/new/1/site/chrome/doc/chrome-notes.md]
- [core/new/1/site/kit/doc/kit-notes.md]
- [core/new/1/site/library/doc/library-page-notes.md]
- [dev/DevBar/doc/says-notes.md]
- [dev/Socket/doc/Socket-notes.md]
- [ext/AITask/doc/AITask-notes.md]
- [ext/AITask/doc/dashboard-notes.md]
- [ext/AITask/doc/day-prompts-notes.md]
- [ext/AITask/doc/rank-notes.md]
- [ext/Chat/doc/ChatPanel-notes.md]
- [ext/Chat/doc/Composer-notes.md]
- [ext/DesignTool/doc/polish-notes.md]
- [ext/DesignTool/doc/rules-notes.md]
- [ext/DesignTool/taste/doc/corpus-notes.md]
- [ext/Mention/doc/Mention-notes.md]
- [ext/Panel/doc/glyphs-notes.md]
- [ext/Panel/doc/text-notes.md]
- [ext/Research/doc/Program-notes.md]
- [ext/catalog/doc/browse-notes.md]
- [ext/demo/doc/demo-notes.md]
- [ext/files/doc/explorer-notes.md]
- [ext/files/doc/files-notes.md]
- [styles/system/studies/lists/doc/page-notes.md]
