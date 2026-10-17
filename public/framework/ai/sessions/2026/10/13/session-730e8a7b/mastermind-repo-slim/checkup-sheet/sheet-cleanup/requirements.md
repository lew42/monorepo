# Sheet cleanup: remove the old markup the new Sheet replaced

Budget: $2. Haiku for the census, Sonnet for the edit. Runs after steps 2 to 7 of [the sheet proposal](../../../../../../../2026/10/16/voice-20261016/sheet/proposal.md) (this is its step 9).

**Why.** The new `Sheet` replaced the old `hides-nav` markup. Ten pages still carry it, and nothing uses it. [The audit](../../../../../../../2026/10/16/voice-20261016/sheet/audit.md) names the ten.

**Asks**
- [ ] Remove the `hides-nav` markup from the ten audited pages.
- [ ] Decide whether `VoiceStrip` stays or folds into `Sheet.Strip`: weigh both, write a `decision` line, then do it.
- [ ] Delete nothing: retired code moves to an archive file.

**Done when**
- [ ] A grep for `hides-nav` finds only the archive.
- [ ] The ten pages pass `check_page`.
- [ ] One commit, through a worktree and `merge.mjs`.
