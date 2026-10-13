# directory.json is off (2026-10-09)

The owner turned off the one-file site listing: it had grown to 16 MB and rebuilt about once a second, reloading every tab. `Server/plugins/Directory.js` no longer builds or watches it; the last `public/directory.json` and `public/framework/directory.json` stay on disk, **frozen** (new folders will not appear in them). `DIRECTORY_JSON=on` turns rebuilding back on.

**The system to lean into:** each folder's own `files.jsonl` (written live by `Server/plugins/PageFiles.js`, 2,854 folders today); `core/Page/Page.class.js` already reads it.

## Readers still on the frozen file (move each to files.jsonl when touched)

- `public/framework/ai/AISession/AISessionDetail.js`
- `public/framework/ai/rail/groups.js`
- `public/framework/ai/v/2/page.js`
- `public/framework/ai/v/new.js`
- `public/framework/core/Page/Markdown.js`
- `public/framework/core/Page/Page.class.js`
- `public/framework/core/Page/settings/settings.js`
- `public/framework/core/Page/weight/ai-cost.js`
- `public/framework/core/Page/weight/weight.js`
- `public/framework/core/Search/Search.js`
- `public/framework/dev/DevBar/page.js`
- `public/framework/dev/Socket/Socket.js`
- `public/framework/ai/AITask/dashboard.js`
- `public/framework/ai/AITask/day-prompts.js`
- `public/framework/ai/AITask/listing.js`
- `public/framework/ai/AITask/tree.js`
- `public/framework/ext/DesignTool/vision/browse.js`
- `public/framework/ext/Doc/page.js`
- `public/framework/ext/Omnibox/page.js`
- `public/framework/ext/Panel/Workspace/documents.js`
- `public/framework/ext/Panel/Workspace/page.js`
- `public/framework/ext/Research/Program.js`
- `public/framework/ext/Research/Topic.js`
- `public/framework/ext/drawer/tabs/sessions.js`
- `public/framework/ext/files/explorer.js`
- `public/framework/ext/files/fs.js`
- `public/framework/ext/filesystem/Dir.js`
- `public/framework/ext/filesystem/FsFile.js`
- `public/framework/ext/filesystem/file_link.js`
- `public/framework/ext/filesystem/tree.js`
- `public/framework/research/page.js`
- `public/framework/servex/fs/page.js`
