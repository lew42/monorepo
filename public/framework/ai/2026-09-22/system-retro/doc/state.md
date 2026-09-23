# Where the system stands

Nine pieces. Each gets three lines: what is real and proven today, what is half-built or not
wired together yet, and the one change that would help the most.

## Fast assistant (`assistant-fast`)

**Proven.** Lives inside Servex ([`prompt-lifecycle`](../../prompt-lifecycle/)); every spoken or
typed sentence gets a name, a card, and a refined reading citing the sentence it came from, at a
measured median of 2.05 seconds over five real sentences.
**Half-built.** Its replies sometimes arrive with no `type` — a whole answer written to the log
that the browser cannot render (found at 19:44, being fixed in `open-mic`). It also stamps UTC
while typed prompts stamp local time: two clocks in one log.
**Would help most.** Fixing those two shape bugs, because right now "the assistant didn't answer"
is sometimes true and sometimes just a card the page can't draw.

## Master assistant (`assistant-master`)

**Proven.** The role is designed in [`tiers-design`](../../tiers-design/doc/roles.md): supervise
the three tiers below it, say the one thing about to be forgotten, audit a mistake once it reaches
the owner.
**Half-built.** It has never run. Nothing feeds it — that is planned for tomorrow's `open-mic`
follow-on, where it gets the full transcript for a second opinion beside the fast assistant.
**Would help most.** Standing it up on even one real evening would answer the question the design
can't: does a slower second opinion actually catch something the fast one missed, or is it a tier
that looks necessary on paper and adds nothing in practice.

## The mastermind (this sidebar session)

**Proven.** Ran the whole day: 34 landed tasks, six-way fan-outs when usage allowed, one incident
response inside four minutes (the popup windows), budget-mode pacing at 18:36 when the weekly
number got close.
**Half-built.** It is still a sidebar Claude Code session, not a Servex-hosted agent — so its own
run ledger is a hand-appended `task.jsonl`, not an event stream anyone else's tooling can watch
live, and a second mastermind could start by accident with nobody able to see both at once.
**Would help most.** Hosting it in Servex, so its own notes become events other agents (and the
board) can read live instead of a human-shaped log a browser has to poll.

## Task masterminds (Dispatcher)

**Proven.** [`card-to-task`](../../card-to-task/) closed the loop for real: a spoken request
became a landed page in 5 minutes 41 seconds for $2.04, through `Servex/agents/Dispatcher.js`
spawning one Sonnet task mastermind per queued task, two at a time.
**Half-built.** Depth stops at two — a task mastermind cannot spawn another task mastermind yet,
because [`sub-mastermind-live`](../../sub-mastermind-live/) only proved that a child's landing
wakes its *parent*, not a grandparent. Parallel teams with a judge (phase 3) do not exist.
**Would help most.** A second real run of the Dispatcher on a task that actually needs two or three
minions in sequence, not just one — today's proof was a single-minion task.

## Minions (CLI sessions in worktrees)

**Proven.** [`worktree-design`](../../worktree-design/) measured a full worktree at 274 MB and 771
GB free; [`worktree-proof`](../../worktree-proof/) built and landed a real fix from inside one in
5.3 seconds; from 17:55 the rule is every editing minion gets its own worktree
([`minions-in-worktrees` decision](../../mastermind-servex/)), and most of tonight's minions
followed it.
**Half-built.** Two teardown bugs bit tonight: a worktree's server was removed without being
stopped first (a runaway `node` at 120% of a core, twice), and the worktree-registry lookup can
report exit 2 even though the minion is still running. Servex also only scans two folders deep, so
it cannot see into a worktree at all — a worktree server is reached by its raw port, not the proxy.
**Would help most.** `wt-teardown.ps1` becoming the only way anyone tears one down (it already
exists and does the kill-then-remove in the right order) — the two runaway servers tonight both
came from skipping it.

## The log — four stores, one decision made tonight

**Proven.** Four stores exist and each has a clear job: Servex's single writer (`Servex/Log.js`,
per-agent JSONL, naming-checked since [`naming-checks`](../../naming-checks/)), `board.jsonl` (the
board's cards), `ai/prompts.jsonl` (what was said), and each task's own `task.jsonl` (the spine
this whole report was built from).
**Half-built.** `board.jsonl` cannot hold a conversation — a card that grows past one event has
nowhere to put the rest, which is exactly what broke tonight (five headless-proof cards landed on
the live board with no way to tell they weren't the owner's). The decision to fix this
(`card-storage`, 19:42) is made but not built: the board becomes an index, a card gets its own
`ai/cards/<slug>.jsonl` on its second event, a directory only when it needs a page.
**Would help most.** Building that migration first thing tomorrow, before any more of AI 2 is
built on top of the shape that is already known to be wrong.

## The boards — five surfaces

**Proven.** The old board (`/framework/ai/`, "V3") now opens on Days — one line per finished task,
newest first — with Now/Grid/Timeline/Prompts one click away and a URL for each
([`days-view`](../../days-view/), [`board-declutter`](../../board-declutter/)). AI 2
(`/framework/ai2/`) went from a blank page to a working rail-plus-detail inbox today: previews on
the left, a real routed page per card on the right, nothing jumps
([`inbox-model`](../../inbox-model/), [`ai2-master-detail`](../../ai2-master-detail/)). Talk and
Record are small, focused, working pages.
**Half-built.** Two boards for the same job. The owner is dictating into AI 2 while V3 still
exists; five AI 2 items (pinned topics, the dark session card, sub-cards in a third column, the
sessions/days sub-views, promote-to-main-list) are written up but deferred to tomorrow.
**Would help most.** Picking one board and freezing the other, in writing — the `ai2-rebuild`
decision already says "AI 2 replaces V3" but nothing has told the owner V3 is now frozen, so a
stray click could still land a fix on the board being replaced.

## Live reload

**Proven.** [`reload-rethink`](../../reload-rethink/) measured the actual problem: 215 reloads on
the owner's tab today, 203 of them (94%) triggered by `directory.json`, which is rebuilt every time
any agent creates a task directory. Fixed: a file the page only *reads* now updates in place over
the socket instead of reloading; a reload that is still needed restores the scroll position; a
hold now covers only the files named in its `--paths`, so the owner's own saves elsewhere are never
blocked — the exact complaint that reached the owner twice tonight before the fix landed.
**Half-built.** The per-tab pause switch on the dev bar exists but is not yet the default anyone
reaches for; `dev/DevBar/hold.js` was found wired in, but `ai/health/devbar.js` was found not.
**Would help most.** Nothing large — this is the one tier that closed cleanly today. The remaining
gap is small: making the held-fence readout on the dev bar something the owner checks by habit,
not something they have to be told about mid-incident.

## Worktrees

**Proven.** From a design and a measurement this morning to routine practice by evening: eleven or
more worktrees ran tonight, most torn down clean, one real multi-file feature
(`ai2-master-detail`) built entirely inside one and landed as a single patch.
**Half-built.** The launcher (`launch-wt.sh`) reports a false exit code when its registry lookup
fails, even though the minion inside is running fine — twice tonight the mastermind had to
recognize this rather than trust the exit code. The `carry-in` git tag is shared across every
worktree, so a second worktree's `git diff carry-in` can silently diff against the wrong base.
**Would help most.** Fixing the shared `carry-in` tag first — it is a correctness bug (a landed
patch could contain the wrong changes) hiding inside a convenience feature, and nobody would notice
until a landed patch looked wrong.
