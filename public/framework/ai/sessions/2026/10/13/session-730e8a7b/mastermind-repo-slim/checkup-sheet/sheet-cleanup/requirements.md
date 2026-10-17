# Sheet step 9: cleanup

Budget: $2. Haiku for the census, Sonnet for the edit. After steps 2 to 7.

**What.** Step 9 of [the sheet proposal](../../../../../2026/10/16/voice-20261016/sheet/proposal.md): drop the dead `hides-nav` markup on the ten pages [the audit](../../../../../2026/10/16/voice-20261016/sheet/audit.md) names, and decide `VoiceStrip`'s fate (weigh keep vs. fold into `Sheet.Strip`, write a `decision` line, do it). Nothing is deleted: retired code moves to an archive file.

**Done when.** A grep for `hides-nav` finds only the archive; the ten pages pass `check_page`; one commit through a worktree and `merge.mjs`.
