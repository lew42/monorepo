# models-asks: state

- ✅ Suite: `quick.mjs` has 27 known-answer tasks in 5 job shapes (+ summary, extraction, reasoning); 5 models (2 Claude), 2 thinking levels; 270 calls cost $0.15 ([run1.log](run1.log)). Table on [/framework/ai/models](/framework/ai/models).
- ✅ Result: luna, Haiku 5.5 (27/27); DeepSeek high 27/27 but 10x the price; Sonnet 5.5 25-26/27.
- ✅ Recommendations and fallback: [ai/doc/models.md](/framework/ai/doc/models.md). Voice pair + Refine default to `openai/gpt-6-luna`; Claude fallback when OpenRouter has no key or errors (`Sessions.js`, `RefineCall.js`).
- ✅ Proof on a private Servex (`Servex/agents/voice-models-proof.mjs`): with key, refine and both session agents ran luna; without key, Claude.
- ⚠️ Not verified: a session chat reply text from the fast agent in the proof (`answered` stays false; agents and models are right). Refine took ~10 s on luna (4 parallel calls of ~2.5 s) versus the 6.6 s baseline; the voice walk is re-run after the restart.
- Asks updated: [ai/doc/asks.md](/framework/ai/doc/asks.md) #1, [Dictate asks](/framework/ux/Dictate/doc/asks.md) voice-model-policy and per-sentence-model-clean.
- Alternative not taken: DeepSeek v4.1 flash high (also 27/27) as voice model; 10x the cost of luna for no gain.
