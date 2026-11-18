# Owner's words, 2026-11-18 (Lew42 v3)

The owner dictated these by voice to the cloud voice agent (voice-app), which relayed them by message. **This is the relayed essence, not a verbatim transcript.** The raw words live in the voice agent's cloud chat, which is not in the repo. Earlier: [owner-words-2026-11-17.md](./owner-words-2026-11-17.md).

## ~17:20 · Cards, words, and how few base pieces

**What the owner did by hand in v3:**
- Card padding goes up to `size/4` at Default (64) and `size/3` at Mobile (42). Done through the `pad` alias.
- Buttons got less horizontal padding, and their icons are 24.
- One Default Card master now feeds the Mobile and Desktop versions, each with its colour-scheme permutations. He is happy with this.
- He calls the zero-padding holders **"Wrappers"**. They came with a gap he did not set on purpose (it is bound to `gap`).

**Words he is weighing:**
- **Content:** plain wrappers of raw text, not components. No fill, no padding, Fill width, Hug height, `text-gap`.
- **The padded white area inside a card:** maybe "Section", maybe "Body". He is unsure.
- **He dislikes "Container".**
- **Card ↔ section** should stay convertible.
- **Adding Media to a card:** the card drops to 0 padding. Its background can either stay (hidden behind Media and Footer) or go. He is fine with either.
- **Vertical rhythm is his worry.** `text-gap` inside Content plus a bigger gap above the button seems to need extra wrapping.
- **His big question:** how few base components give the most permutations, without slots? He is wary of slots and of complex cards.

**His ask:**
1. Look at what he has built in v3.
2. Put a short, visual recommendation on a new page, "Proposal", beside his work.
3. Keep his system; change it very little.
4. Make no edits to his masters; only propose.

The answer is the Proposal page, documented in [v3-card-proposal.md](./v3-card-proposal.md).
