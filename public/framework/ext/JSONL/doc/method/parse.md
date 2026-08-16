Two of them, and the split is the point. `JSONL.parse(text, bad)` is **static and
pure**: split on `\n`, skip blank lines, `JSON.parse` each remaining one inside its
own `try`, and push anything that throws into `bad`. `this.parse(text)` is the
**instance door every real read goes through** — `load()` and each streamed batch —
which calls the static, adds what was dropped to
[`unparsed`](/framework/ext/JSONL/api/unparsed/), and `console.warn`s **once per
file** with the first bad line's text.

That tolerance is the whole reason this exists instead of one `JSON.parse` around
the file: a log is written by repeated appends, and a torn last line (a crash
mid-write, a concurrent writer) should cost one line, never the file.

**⚠ Tolerance without a count is a lie.** A landing line whose `outcome` escaped a
backtick with a backslash — not one of JSON's eight legal escapes — was dropped in
silence, and the board read a finished task as "running since 2:20 PM" for a day
while a session hunted the dashboard for the bug. The line is still dropped; it is
no longer invisible.

Returns plain entries — `{verb: value}` objects — not yet applied to anything;
[`read()`](/framework/ext/JSONL/api/read/) is the next step. A caller holding no
instance (a demo, a test) uses the static directly and simply gets no count.
