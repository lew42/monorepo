One line, and only when the log lost one: *"⚠ N unparsed lines — this record is
incomplete. The console has the first one."* Drawn inside
[`refresh()`](/framework/ext/AITask/api/refresh/)'s box, right under the checklist,
because that is where a reader is already asking "how far along is this".

The count comes from [`ext/JSONL`'s `unparsed`](/framework/ext/JSONL/api/unparsed/)
— the number of lines that failed `JSON.parse` while the manifest was being
assembled. A legacy `session.json` manifest has no such field and renders nothing.

**⚠ This is the only visible symptom of a dropped line.** Everything else on the
page still renders, and renders *plausibly*: the task whose landing line carried an
illegal backslash escape showed as "running since 2:20 PM" for a day, with a
checklist, a spend and an agent table that all looked fine. Whatever the dropped
line said — `landed_at`, `outcome`, a `step` — is simply absent, so the notice says
"incomplete" rather than naming a field it cannot know.

Nothing here can repair it. The fix is in the file, and the console warning carries
the offending text to grep for.
