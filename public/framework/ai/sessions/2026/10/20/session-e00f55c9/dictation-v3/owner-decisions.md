# The owner's decisions for the chat structure (2026-11-01, relayed by the web voice session)

1. **Dual write, 18:04:**
   - **V1 stays exactly as it is:** its pseudo `chat` and `place` lines stay.
   - **Every message written today is ALSO written into one new, real list,** in its proper order: the owner's sentences, smart replies, fast-seat lines. The name doesn't matter: `chat.messages` or `session.messages`.
   - **V2 and V3 read only the new list,** never the pseudo lines.
   - **Later, V1 switches over too.**
2. **Order is kept well:**
   - New dictation always appends at the bottom.
   - A reply never splits a message that is still in progress.

   Today, `place` lines reorder V1's bubbles: a reply lands at the bottom while the owner keeps dictating, then the new words go into a bubble far above, or a reply cuts a message in half.
3. **The list belongs to the chat widget.** A message can stand alone, and a prompt card links to its messages. Replies attached only to prompt cards would be too narrow.
4. **No migration of old lines** until the new list exists and works.
5. **Settings (later):** dictation settings are saved per browser today. The owner wants global settings that apply on every device.
6. **What each view is for (18:19):**
   - **V1 is the raw chat:** the owner still needs to see the raw dictation.
   - **V2 and V3 are condensed cards** (prompts and questions) made by AI.
   - **The end goal is ONE view showing both.** For now, V3 keeps the raw dictation visible, below or behind each card.
   - **A bug to fix:** switching to V3 on v-u48msei made "a huge wall of text just randomly appear".
