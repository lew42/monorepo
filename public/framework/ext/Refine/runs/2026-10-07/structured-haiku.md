# 🗳 Feedback council 2026-10-07: Live card, Cards rail, Chat, Dictation and Now card

## 🧭 Checker job
- Five checkers each check their own asks on the live site at `monorepo.localhost`, never `localhost` [S1, S2, S3, S23, S36, S37, S38, S58, S71, S72, S73, S93, S106, S107, S108, S128, S141, S142, S143]
- Read first: the card folder, the full ask history (latest line per id wins), and the run folder. No new words landed today, so only the asks count [S4, S5, S6, S7, S8, S39, S40, S41, S42, S43, S74, S75, S76, S77, S78, S109, S110, S111, S112, S113, S144, S145, S146, S147, S148]
- Each checker verifies its own asks. Prior verdicts are pointers, not truth [S9, S44, S79, S114, S149]
- For every ask: look at the real result and give one verdict (done, partly, not done, done-but-wrong) with evidence. Search the repo before saying "missing" [S20, S21, S22, S55, S56, S57, S90, S91, S92, S125, S126, S127]
- Evidence: headless Playwright at 1920 and 3440, never the owner's tabs. Time the Live card load. Measure real overflow on named URLs. No window may pop up [S24, S25, S26, S27, S59, S60, S61, S62, S94, S95, S96, S97, S129, S130, S131, S132]
- Rules: edit no repo file. Scratch and at most 12 shots go in the scratchpad. Write one votes JSON per checker that covers every id, then reply "done". Budget about $2, and be quick. Never write the owner's name [S28, S29, S30, S31, S32, S33, S34, S35, S63, S64, S65, S66, S67, S68, S69, S70, S98, S99, S100, S101, S102, S103, S104, S105, S133, S134, S135, S136, S137, S138, S139, S140]

## 🚀 Live card
- Loads fast, or is removed. The cold load gets timed [S10]
- Content reads at a glance. The preview line shows `[object Object]` [S15]
- Works without Servex is untested. The Live page needs Servex by design [S17]
- Clicking a Live agent opens a top-aligned column, not a tab with white space [S46]

## 📇 Cards and the rail
- Show, don't tell: each card leads with the picture, and words come after [S11]
- Rounded corners: task rows are separate boxes with gaps, but rail rows are flush. Open: add gaps and rounding per card [S16]
- Time-based list: newest card on top, with timestamps back [S47]
- Any agent can add a card to the top at once. Instant top insertion is not yet tested [S48]
- Cards update by themselves. The flashing behaviour is not yet seen [S49]
- Segmented progress bar: N equal segments turn green as steps finish, so the owner can read what the bars mean [S50]
- Finished cards need not stay in the list. Archived cards are hidden, but finished ones still show under Cards [S18]
- Tasks nest under their parent card with a recognizable icon, so nothing gets lost [S88]

## 📐 Layout and padding
- Layouts work at 3440, not a mobile layout stretched [S12]
- Page padding is right: content is inset from the rail, and the ai-dashboard route is still unverified [S13]
- Padding is opt-in: add a `.pad` class where needed, such as each tab's content area [S83]
- Detail pages must scroll. Open until a real overflow measure proves it [S14]
- The About page back-button icon is aligned [S19]

## 🗂 Layout explorer and catalog
- A standing, browsable catalog of the layout and navigation patterns used on every page, not a one-off audit [S87]
- A three-column layout explorer: left is layout categories. The transcript is cut off here, so the rest is not shown [S155]

## 💬 Chat
- Comfortable reading width, with no independently scrolling narrow boxes [S45]
- Auto-scroll to the newest message. It stops when the owner scrolls up, and a "jump to bottom" button returns [S115]
- Duplicate messages: assistant replies, and sometimes the owner's transcriptions, appear twice. Fix [S117]
- Avatars: the Fast and Smart assistants each get a chosen icon (two arrows, a brain) that doubles as avatar and name inline, not a labeled block [S84]
- Reactions: Fast sends a quick emoji (thumbs up, check) when a sentence isn't needed, and falls back to a sentence if Smart is slow [S85]
- Context card: a thing the owner names stays visible as a card, with its icon and name on top, not only as prose [S86]
- Element picker: the context pill shows, but the assistant never sees the selection on send. Wire it into the prompt [S154]
- A reply that mentions a card or task is a real hyperlink, not text to copy [S122]
- Threads: a reply can attach to one specific card or comment, not only the general stream [S150]

## 🎙 Dictation sheet
- Ask-by-voice sheet header: make it compact and aligned, drop the redundant back button (keep X), and merge the gear and "more" into one menu [S89]
- Clean transcribe mode: dictation goes straight into chat as it's spoken, with no editable text area. Consider making it the default [S116]
- Restore the mic start/stop sound cue, so listening state is audible with the screen away [S118]
- The audio bar becomes a small pulsing dot that grows with volume, floats (e.g. bottom-right), and reopens the sheet when tapped [S120]
- The sheet and the mic are independent. Closing the sheet keeps the mic listening, and opening can auto-start it [S123]
- Speed: text took 4–5 s to appear after transcribing, and the reply took about 5 s more. Speed up both [S153]

## 🔊 Voice
- To build: a text-to-speech Voice class that pairs with Whisper dictation. It needs streaming output, switchable voices, and timing rules so it doesn't interrupt too soon, for a full voice-chat mode [S121]

## 🧭 Now card
- The tiny top tabs become real routed pages, using the page route mechanism, not hash identifiers [S151]
- Chat stays a persistent right sidebar, and the top tabs do not include chat [S119]

## 🧩 Skills
- Skills are instructive: "could" and "should", not "have to", unless it's a law [S81]
- The layout/padding skill runs every time a layout is designed, possibly folded into the paging skill [S152]

## 📄 Page system
- Page MCP: change layouts, add content, and create pages and sub-pages from the dev-server or Servex MCP [S51]
- Page system upgrade: simpler, with live JSONL pages documented and core Page docs less wordy [S52]

## 🎨 CSS
- CSS audit by directory: a tree view of CSS amounts with proposals to cut. Tokens and container queries on columns [S54]

## 🛠 Servex
- Audit of the week's tasks: one minion per prompt finds unfinished and half-finished work [S80]
- Monitor: a watcher of console errors per worktree, plus a layout check with screenshots before committing [S82]
- Ready agent per module: a short readme as the way in, with no old bloated agents [S53]

## 🔗 Remote access
- Cloudflare Tunnel for phone access, preferred over Tailscale or a new paid service, instead of the local Wi-Fi IP [S124]
