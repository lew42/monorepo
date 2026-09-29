- Spawn a mastermind research task using the research system and a worktree [S1-S4]

- Research whether to use Open Router or go directly to individual providers like Google's Gemini, Anthropic, OpenAI, Grok [S5-S6]

- Open Router might be cheaper, but the bigger question is whether it has feature parity with individual APIs [S7]

- Each API works differently, and trying to have a user experience that seamlessly switches between any model will face a lot of hurdles because of API inconsistencies [S8-S9]

- Create our own AI harness system to use with Open Router [S10-S11]

- Open Router has an agent package like Claude Code, but creating our own harness might be better [S12-S13]

- The harness needs to work into the whole system with MCP servers, Claude Code SDK for spawning minions, and be integrated with the Servex mastermind [S16-S20]

- Build a review process into the task system; a fresh agent with the same prompt can provide fresh insight versus the writer reviewing their own work [S20-S27]

- Don't need complex review for simple tasks like CSS fixes, but do need it for architecture, screenshots, UX and layout questions, navigation [S28-S33]

- Start efficiently: preliminary round with Opus and Sonnet research, then have a fresh Opus or Sonnet review the preliminary plan [S37-S40]

- Work with the Servex mastermind to document what works and figure out how to use Open Router to switch to any provider quickly [S41-S42]

- Future: pay careful attention to cost and spawn fleets of minions using different models to approach the same task, get different opinions, then review to cross-reference and see if it produces useful outcomes [S43]

- Research questions should be: does this make sense, is it true, is it logical, can we dispute it? [S44-S47]

- The research page should be very simple and clear, with structured content showing the structure of the research [S48-S51]

- Spawn a minion to design a system for structured content architecture with highly prioritized, essential, foundational, visual, familiar things [S52-S53]

- Structured content uses icon items with three to five named things per section, like outlines where naming creates pictures with words and shows parent-child-grandchild relationships [S54-S57]

- When designing UI cards, think about space per card, what can go on it, what goes first, how to divide into rows or columns [S59-S60]

- Lean into structured content instead of multiple paragraphs; use bulleted or nested lists instead of prose [S61-S63]

- A list can be a UI card without needing a background [S64-S65]

- Core design decision for all content: does it need a background? If it has background, it needs padding; if no background, no padding [S67-S70]

- Don't put things in too many boxes, but a background with a title and three cards is a simple grouping that labels related things [S73]

- Icon cards with a big icon and name below make sense for big ideas instead of pictures on the card [S74-S75]

- Icon cards might have different sizes to represent weight [S76]

- Harness needs MCP servers, skill system with Claude.md plus skills on demand, tools, a loop, auto-compact context, session IDs for forking and resuming [S83-S88]

- Open Router API has cost built in, which shouldn't be hard [S89-S91]

- Need an agent switching UI for the dictation widget; dictation is really the chat widget everywhere [S92-S94]

- Permissions and sandboxing should be handled at the system level with worktrees having their own dev server; try routing as much as possible using node instead of bash for more control over IO and processing [S98-S102]

- Sequence: research first, then start fresh masterminds based on what was gathered, then build the harness [S104]

- Build an Open Router integration with agent switcher, integrated into the whole system so you can switch models and dictate in real time when creating a new card on the AI dashboard [S105-S107]

- The assistant transparently gets transcriptions and relays to the model; the manager or mastermind sees everything; the assistant does quick real-time updates and cleans up the transcription [S108-S115]

- Add another task for the dictation process; create a playground to see better how it works and work on the process [S117-S119]
