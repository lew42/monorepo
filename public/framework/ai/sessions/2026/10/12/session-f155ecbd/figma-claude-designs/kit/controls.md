# Kit · Controls (Figma page `145:13667`, file `QYN0G2URSBHYH5I06MOjxU`)

Everything is in one display column `Controls kit` (`145:14232`: a section header, then a white card with the variants and a 390 `Mobile` phone strip, per component) plus two phone screens to its right.

## Built (component set → node id → site path)
- Input `145:13680`, Select `145:13690`, Tab `145:13697` → `ui/controls`
- Field `145:13712` (Content is a SLOT, verified in a variant set) → `ui/field`
- Badge `145:13725` (Dot is a boolean) → `ui/badge`
- Tag `145:13732` (Removable is a boolean) → `ui/tags`, `ux/Tags`
- Kbd `145:13735` → `ui/kbd`
- Tool button `145:13832`, Toolbar `145:13841` (Tools is a SLOT) → `ui/toolbar`
- Crumb `145:13848` → `ui/crumbs`
- Page `145:13861` (Kind Number/Icon × State) → `ui/pagination`
- Progress `145:13889` (Value 25/50/75/100) → `ui/progress`
- Avatar `145:13908` (Size S/M/L × Tone) → `ui/avatar`
- Alert `145:13924` → `ui/alert`
- Tooltip `145:13927` → `ui/tooltip`
- Segment `145:13934` (Label, Count) → `ux/Filter` (the search is an Input with Show icon)
- Phone screens: filter + search list `145:15198`, new-project form `145:15272`.
- Button was not extended: the site has no Size/State variant I could find in the time.

## Not mapped
- Textarea, checkbox and switch (`ui/controls` has them; I did the three named in the brief).
- Tooltip is the bubble only, with no caret and no hover wiring.
- Tags' `ux/Tags` input behaviour (typing to add) is not drawn.

## Values no token gives
- **Error red** `#D93030` (literal): the site has `--error`, Figma has no variable. Used on Input/Field error, Alert error.
- **Small text**: no 12px style. Chips, badges and tabs use `h4` (Bold 14, uppercase look); Avatar S shrinks the initials to 11 by hand.
- **Code text** (Kbd): Cousine Bold 14 by hand.
- **Disabled** is opacity 50% / 40%, not a token.
- **Neutral chip ground** is black 10% alone, not the white + 10% inset stack, so a chip stays visible on an inset phone strip.
- Fixed sizes, each named for its reason: Progress track 6, Avatar 24/32/40, Dot 8, Tab underline 3, 44 minimum on touch targets. Main widths (Input 280, Field/Progress 320, Alert 360) are display only; instances FILL.

## Still looks off
- `prime` renders red in this file, so Input Focus and Error are both red outlines and hard to tell apart; the doc says `prime` is #72C4FF, so check the variable.
- Field's nested Input shows its default "Search sessions" text, because the slot's Input Value is not lifted into a Field property.
