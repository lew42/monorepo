# What peers found that I missed

**haiku-c**: Found a direct head-to-head paper I didn't have — "Debate or Vote: Which Yields
Better Decisions in Multi-Agent LLMs?" (2508.17536) — showing voting alone accounts for most of
debate's claimed gains across seven benchmarks, and a sharper framing of the risk: peer/debate
agreement is more effective at dragging a correct agent to a wrong answer than at fixing a wrong
one, so peer answers should trigger verification, not be treated as votes.

**haiku-a**: Same "Debate or Vote" paper, plus a useful caution I didn't have: "When
Self-Consistency Backfires" (2608.11403) — on hard science problems, more samples can entrench a
wrong answer once all agents agree, so voting isn't safe to trust blindly at higher difficulty.
Also names DelphiAgent's concrete 3-round shape (independent → see all proposals → final vote) as
the model to copy if we do add a Delphi option.
