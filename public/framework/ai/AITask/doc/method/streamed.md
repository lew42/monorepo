Every panel that draws from the manifest, redrawn once per appended line.
`session()` hands this to `TaskJSONL.live()` as its `changed` callback, so a
running task's own page follows its log with no reload — and a verdict the
reader just pressed comes back off the wire and updates its row.

⚠ **Each panel is guarded, because a tab's panel is not built until the reader
first selects it** (`tab_bar`). Before this method existed the callback read
`this.$live && this.refresh(t)`, naming the Report panel directly — so on a task
that opens on **Asks**, `$live` did not exist yet and *nothing streamed at all*.
Adding a second live panel is now one line here, not a new condition at the
call site.
