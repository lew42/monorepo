# Chat V2 and V3: how they differ, and which to keep

**Recommendation: keep V3, retire V2.** Both draw the same session's Prompts; V3 does it from one replay and already shows every reply. V2's two good ideas move into V3, then V2 leaves the dropdown.

| | V2 (`ext/Chat/v2/ChatV2.js`, 320 lines + `ChatV2Model.js` 177) | V3 (`ext/Chat/v3/ChatV3.js`, 195 lines) |
|---|---|---|
| How it reads the file | Folds the task lines by hand (`ChatV2Model`) | Replays them into a real `core/Session`, the same replay the item tool uses |
| Replies | Only the 6% written into a Prompt | Every reply, old `{chat}` ones too, plus the reply as it streams |
| Live words | None | The unsent draft at the bottom, gray; written words solid |
| Cursors | A ✓ (fast) and 🧠 (smart) cursor beside sentences and dots at the bottom: they take room on a phone (the owner, 2026-11-01) | None |
| Updates | Patches only the element a line touched (fast on long sessions) | Redraws the one card a line touched |
| Read-aloud highlight | Not marked as a root | A root for `Recite.Highlight` |

**What moves from V2 into V3 before V2 goes:** patching one element instead of a whole card (worth it only if long sessions feel slow), and "resurface" (an answered Question rises to the bottom). The cursors are dropped: with the fast seat off there is one assistant, and V3's streaming reply already shows that it is writing.

**V2's lag** in live transcription is not worth fixing: V2 has no live words at all; what lags is the Prompt's raw text, which arrives only when a sentence is written. V3 shows the draft as it is heard.

## One assistant or two, and sending per sentence (plain answers)

- **Today there are still two assistants.** The code that turns the fast seat off by default is merged (18:03), but Servex reads that switch when it starts, and it last started at 17:37. The next Servex restart leaves one assistant, the smart seat.
- **Per-sentence sending:** the page cuts a send at each sentence end, but during the owner's long dictation at 17:53 to 18:00 seven minutes of talk arrived as one line. Why that phone held it is being traced next (it is the parent's item A).
- **V3's colours:** the words still being heard are gray (now 75%, readable); every written sentence is full colour at once.
