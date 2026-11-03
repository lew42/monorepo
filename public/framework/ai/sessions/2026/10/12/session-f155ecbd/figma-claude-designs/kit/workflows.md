# Kit · Workflows (Figma page `144:1140`, file `QYN0G2URSBHYH5I06MOjxU`)

13 phone screens (390×844, Resolution `Mobile`) that click through, built from the existing kit plus 8 new components. Press Present: six flows are set in `page.flowStartingPoints`.

## Components (left column `144:1141`, each under a Section header)

| Component | Node | Site path | Props |
|---|---|---|---|
| App bar | `144:1142` | ux/Inbox, ux/Tree, ux/Card | Title, Back, Action, Show back, Show action |
| Tab bar (Active 1–4) | `144:1198` | ux/Inbox shell | Icon 1–4, Label 1–4 |
| Chat bubble (Me/AI) | `145:1068` | ux/Card chat | Text |
| Mic button (Idle/Listening/Heard) | `145:1081` | ux/Dictate | Label |
| Field | `145:1082` | ux/Auth | Label, Value |
| Sheet | `145:1086` | ux/Tree layers | Title, Content (SLOT) |
| Popover | `145:1090` | ux/Popover, ux/Menu | Content (SLOT) |
| Step bar (1–4) | `145:1124` | ux/Course, ux/Wizard | Label, Title |

## Screens (x=600, one row per module)

Inbox list → detail; Tree drill-in → layers sheet; Course lesson → Wizard step; Auth login → signup; Dictate idle → listening → heard → idle; Menu closed → open (anchored Popover of Row instances); Card page (head, outline, chat, mic). Links: rows, buttons, the app bar Back and Action icons (nested instance children accept reactions).

## Values no token gives

- Sheet top radius 16, mic circle radius 36 (token `radius` is 4).
- Chat bubble inset 48 (the side opposite the speaker).
- Mic circle 72, handle 40×4, progress segments 4 tall (named `fixed` with reasons).
- Prototype NAVIGATE needs top-level frames, so screens sit on the page, not inside group frames.

## Not done / mapped loosely

- No per-component phone strips: the screens are the phone proof.
- ux/Tree has no nesting indent on the phone screens (flat Tree row instances).
- Tabs in the tab bar are not linked (one instance, four tabs).
- ux/Dictate real streaming and ux/Card's real layout were not read in code; drawn from the brief.

## Looks off

Screenshots of Card, Layers sheet, open Menu and Inbox list read well. Chat bubbles inside a padded body get a double side pad, the Inbox list's rows run edge to edge while its title is inset, and the open Menu has no dim behind it. Prime renders as coral red in this file (`#FF6157`), not the blue the older doc says.
