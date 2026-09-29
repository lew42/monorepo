**[AI 2, step by step →](/framework/ai/2026-09-25/ai2-lead/)** — press Next to see the rail, a card, Live, and how to make a card.

## Next

- [x] A card standard: name, state, checklist, live objects ([card-standard.md](/framework/ai2/doc/card-standard.md))
- [ ] One object widget, reused everywhere
- [ ] The Servex card redone as the first example
- [ ] New cards appear at the top of the list

## How this card is stored

```
public/framework/ai/2026/09/25/cards-that-show-the-thing/
├── page.jsonl   the card itself: one line per event, the latest wins
└── about.md     this text
```

```json page.jsonl
{"title": "Cards that show the thing", "type": "request"}   ← line 1, written by Servex
{"group": "ai-dashboard"}                                    ← filed under AI dashboard
{"message": {"by": "servex-mastermind-opus", "text": "…"}}   ← a note
{"place": "about.md"}                                        ← draws this file here
```
