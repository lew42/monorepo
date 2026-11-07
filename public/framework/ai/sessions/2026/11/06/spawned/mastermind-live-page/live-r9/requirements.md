# live: storage icons, the voice dot by the gear, the empty-state gap

The asks (relayed by voice-app, 2026-11-06):

1. Preview/link cards on /live/ (e.g. "Item tool", "Item test") show the item's own icon, the same one its page header shows.
2. The default icon shows storage: a small circle for an item embedded in the parent's jsonl, a file icon for its own loose .jsonl file, a folder icon for its own folder (folder/page.jsonl). An explicit page icon overrides this.
3. The status dot is separate from the storage icon, not the same gray dot. Move it out of the title area so only one icon is there; for now put it next to the gear, small.
4. "Nothing on screen yet." (.live-main.is-empty::before) sits close under the header with a modest gap.

Built in worktree live-r9 (branch worktree/live-r9), commit b5a618fde: LivePage.stored, icon_of, glyph; Card and Pages draw the icon; the dot moved into .live-head-top; tests 10 (28 pass).
