# Comment prune round 3: state

**Census before → after:** 1639 files; comment lines 29,209 (18%) → 25,154 (16%); blocks of 4+ lines 2,384 → 2,006; total lines 161,856 → 157,748.

Note: the 8 round-2 files in the top 40 were swapped for the next 8 in the census (Search, DesignTool rules, kit, rank, Frame, day-prompts, Layout, taste/corpus).

40 files pruned, one commit each, every one passing `verify.mjs` (code identical); history moved to the notes docs below, each linked from its module readme.

| File | Diff lines | Notes doc |
|---|---|---|
| `ai/cards/card.js` | 105 removed, 105 added | |
| `ai/page.js` | 101 removed, 24 added | |
| `ai/rail/Processes.js` | 98 removed, 22 added | |
| `ai/rail/groups.js` | 129 removed, 7 added | |
| `ai/talk/page.js` | 123 removed, 11 added | |
| `ai/v/3/page.js` | 246 removed, 2 added | |
| `core/Layout/Layout.js` | 97 removed, 13 added | |
| `core/Layout/rules.js` | 104 removed, 6 added | |
| `core/Page/Frame.js` | 101 removed, 13 added | |
| `core/Page/Page.class.js` | 120 removed, 18 added | |
| `core/Page/ext/Inbox/Rail.js` | 115 removed, 16 added | |
| `core/Page/generator/controls.js` | 99 removed, 14 added | |
| `core/Page/generator/export.js` | 127 removed, 10 added | |
| `core/Page/generator/tree.js` | 129 removed, 3 added | |
| `core/Page/page.js` | 110 removed, 10 added | |
| `core/Search/Search.js` | 89 removed, 12 added | |
| `core/Section/Section.js` | 147 removed, 33 added | |
| `core/new/1/site/chrome/chrome.js` | 122 removed, 3 added | |
| `core/new/1/site/kit/kit.js` | 103 removed, 7 added | |
| `core/new/1/site/library/page.js` | 148 removed, 3 added | |
| `dev/DevBar/says.js` | 108 removed, 16 added | |
| `dev/Socket/Socket.js` | 132 removed, 10 added | |
| `ext/AITask/AITask.js` | 152 removed, 7 added | |
| `ext/AITask/dashboard.js` | 145 removed, 23 added | |
| `ext/AITask/day-prompts.js` | 99 removed, 18 added | |
| `ext/AITask/rank.js` | 87 removed, 1 added | |
| `ext/Chat/ChatPanel.js` | 123 removed, 6 added | |
| `ext/Chat/Composer.js` | 110 removed, 1 added | |
| `ext/DesignTool/polish.js` | 108 removed, 19 added | |
| `ext/DesignTool/rules.js` | 101 removed, 21 added | |
| `ext/DesignTool/taste/corpus.js` | 94 removed, 2 added | |
| `ext/Mention/Mention.js` | 94 removed, 15 added | |
| `ext/Panel/glyphs.js` | 119 removed, 1 added | |
| `ext/Panel/text.js` | 94 removed, 20 added | |
| `ext/Research/Program.js` | 97 removed, 17 added | |
| `ext/catalog/browse.js` | 100 removed, 14 added | |
| `ext/demo/demo.js` | 120 removed, 12 added | |
| `ext/files/explorer.js` | 115 removed, 10 added | |
| `ext/files/files.js` | 135 removed, 4 added | |
| `styles/system/studies/lists/page.js` | 126 removed, 16 added | |

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
