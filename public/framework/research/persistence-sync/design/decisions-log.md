# Decisions log

Owner choices, newest last. Source: chat or the app's decision buttons (artifact database collection `decisions`).

- 2026-10-30T05:35Z **D1 List extends Item or wraps it:** owner leans to **keep `List extends Item`** (chat, tentative; wanted the lookup problem explained, now in the card).
- 2026-10-30T05:43Z **D1:** owner raised a shared base class (Item and List both extend a base that extends Events). Written up as option B in `design/d1-explained.md`; recommendation: fix lookup now (A), base class later (B).
