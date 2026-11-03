# Prompt boundaries: one bubble per smart batch (Servex-side change needed)

The owner's rule (2026-10-25): V1 bubble and V2 card are one experience; a NEW bubble/card per SMART-assistant prompt, meaning per batch actually delivered to smart (the wake batch), not per fast pause. Fast chunks inside it are the moving ✓; the gray-to-stamp 🧠 belongs to that bubble.

## How a Prompt ends today (read from `Servex/agents/Sessions.js`)

- `assign_prompt` (L475) grows the open Prompt `s.prompt`, or mints a new one when `s.prompt` is empty.
- `release_thought` (L1134) sets `s.prompt = null` the moment the FAST seat is handed the thought. That fires on owner quiet of at least `answer_quiet_ms` (2.5 s), the mic going off, the 8 s `hold_max_ms` cap, or a typed send. So **a Prompt ends at every fast pause** (`say()` L1014 does the same for the non-floor case).
- Smart is fed separately: `WakePolicy` (L255) collects the same lines with `waker.add(...)` and flushes to `feed_smart` (L265) on its own gap (`wake_gap_s`) or sentence count (`wake_every`). One smart batch therefore covers several Prompts.

## Does it need a Servex change? Yes

The client cannot merge Prompts: each Prompt already has its own `p-…` id and lines, and the smart seat answers by those ids. To get "one bubble per smart batch", the boundary must move:

1. `release_thought` should keep sending to fast with the SAME open Prompt id but **not** clear `s.prompt`; the fast `(prompt p-…)` tail stays the same.
2. `s.prompt` is cleared in the `WakePolicy.flush` path (`feed_smart`), i.e. when the batch is actually delivered to smart. The next owner line then starts the next Prompt.
3. Each fast release inside the batch writes its own `{sent:{to:"fast", at}}` (already per release) so the client can move the ✓ cursor to the newest chunk; `feed_smart` writes `{sent:{to:"smart"}}` once for the Prompt (the gray 🧠), and the stamp is smart clearing `working` or writing its refine.
4. Risk to check before changing: the fast seat's `(new paragraph)` / `{place}` bookkeeping keys off `s.fast_thought_at` per thought, which stays per release, so it should not change; the Prompt would just hold several fast thoughts. Test with the existing queue-and-follow tests.

Not hand-edited here (Sessions.js is outside this task's fence); the owner of `Servex/agents/Sessions.js` (dictation-debug / queue-and-follow work) builds it behind a test.

## Follow-up (owner, tentative): a bubble per SENTENCE delivered to smart

Today `WakePolicy` (`Servex/agents/WakePolicy.js`) delivers to smart when (1) the owner paused `gap_ms` = 12 s, (2) a line is a question or addressed to the assistant (flushes at once, "asked"), or (3) `every` = 6 sentences piled up. Limits: gap 1-60 s, every 1-50. So a smart delivery is a batch of up to 6 sentences, not one sentence.

Options:
- **A (recommended, no code change):** keep "one bubble per smart batch". A per-sentence bubble would show a stack of one-sentence bubbles that smart sees together anyway, and the 🧠 gray-to-stamp would be identical on all of them.
- **B (setting only):** set `wake_every: 1` (already a field in the dictation settings, limit 1). Then every sentence is its own smart delivery, hence its own bubble, with the Prompt boundary moved to the flush as described above. It costs a smart turn per sentence (more tokens, and smart answers sentence by sentence rather than with the context of a paragraph).
- **C (view only):** one bubble per batch, but draw each sentence on its own line inside it. This gives the per-sentence feel without extra smart turns.

Do not build until the owner's wording is settled; B needs only the Prompt-boundary change above plus a settings value.
