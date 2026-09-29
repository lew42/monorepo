```
ai/council/
├── asks.jsonl   every ask: its words, verdict, evidence and smallest fix (latest line per id wins)
├── loop.svg     the picture above
└── page.js      this page
Sources: .claude/prompts/<day>.jsonl (every prompt) · "prompt" lines in AI 2 card page.jsonl files
Each run: a dated task dir, e.g. ai/2026-09-25/feedback-council/
```

**When it runs:** after every 10 landings, or once a day if anything landed. It checks only asks that are new or still open.
