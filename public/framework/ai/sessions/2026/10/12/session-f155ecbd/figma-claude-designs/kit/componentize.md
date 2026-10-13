# Componentize: layouts, charts, Ground (2026-10-12, night)

Page `Kit · Layouts` (file `QYN0G2URSBHYH5I06MOjxU`), docs frame `178:1062`. Brief: [brief-componentize.md](brief-componentize.md).

## Components (all HUG; slots are SLOT properties; gaps/pads bound to Resolution tokens; no grounds)
- Layout / Stack `177:1068` (Title, Body, Action) · Two columns `177:1092` · Split `177:1107` · Media + text `177:1122` · Sidebar + content `177:1137` · Three columns `177:1158` (these five have `Collapsed` for the 390 stacked form) · Bands `177:1159` (Header, Body, Footer)
- Chart / Bars `177:1236` (bar heights = instance `resize`) · Stacked bar `177:1282` (segment `layoutGrow` shares) · Donut `177:1292` (per-segment ellipse `arcData`) · Sparkline `177:1299`. Accent + muted only. All three overrides verified.
- Ground `177:1312` (Content slot, variant Dark / Near-black / Light / Gray).

## Near-black decision: a `Ground` component, no new Text mode
Near-black is `Dark BG` plus a 50% black layer. A mode would add a token to the Text collection (off limits here) and would duplicate Dark BG's ink values. The component sets mode + layer once, so screens use one instance.

## Swapped
- `DS · 6` dashboard `171:1351`: Ground `179:23100` + Bands `179:23104`. Article `171:1420`: Bands `179:23137`. Prototype reactions kept (3 tab reactions on the dashboard, 1 Back on the article); screenshot-checked.
- `DS · 4.1`: one live instance of each of the seven layouts in frame `181:2070`, right of the page (placed there rather than rewriting the existing frame specimens).

## Not done / caveats
- Nav link: no DS page's nav row lists kit pages (only `DS · 3` mentions "Kit built" as text), so `Kit · Layouts` is not linked from any page.
- The 4.1 instances show default placeholder text in their slots, not real content. Existing 4.1 specimens are still frames.
- Moved nodes keep stale FILL/grow; reset to HUG/grow 0 when you drop them in a slot. A FILL child in a HUG parent collapses.
