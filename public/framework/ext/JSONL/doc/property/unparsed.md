How many lines this instance failed to `JSON.parse`, summed over every batch it
has read — `0` on a healthy log, and the number `ext/AITask` prints beside the
checklist as *"N unparsed lines"*.

Written by [`parse()`](/framework/ext/JSONL/api/parse/), which also warns once per
file with the first offending line, so the fix is greppable from the console.
Cleared by [`reset()`](/framework/ext/JSONL/api/reset/) — a reset replays the file
from scratch, so the old count would double.

**⚠ Nonzero means the assembled object is INCOMPLETE, not merely noisy.** Whatever
that line carried — a `landed_at`, an `outcome`, a `step` — is simply absent, and
everything rendered from this instance is a plausible-looking record of a log that
says something else. That is why it is surfaced in the UI rather than only logged:
the failure has no other symptom.

Not an error a caller has to handle. The rest of the log still parses and every
renderer keeps working; the only useful response is to open the console and fix the
line in the file.
