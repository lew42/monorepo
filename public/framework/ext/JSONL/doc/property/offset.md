The byte offset the dev server has read this file up to — set by
[`live()`](/framework/ext/JSONL/api/live/)'s transport on every streamed frame,
and unset on an instance that only ever [`load()`](/framework/ext/JSONL/api/load/)ed.

**⚠ Opaque. The client never computes it.** It is stored to be echoed back: a
re-subscribe after a reconnect sends `subscribe(url, offset)` and gets only the
lines written in the gap. A UTF-8 string's length is not its byte length, so an
offset a client calculated from the text it holds would eventually land inside a
character and split a line — which is why the protocol has the server hand out
every offset there is.

It is also the guard against applying the same lines twice: a frame whose offset
is not past this one is content this instance already has. That happens for real —
a second reader subscribing to the same path replays the file from 0, and the
server sends that frame to the whole socket, readers included.

`reset()` does not clear it (the transport sets it to 0 alongside), because
`offset` belongs to the wire and the rest of the class does not know the socket
exists. Full contract: [live](/framework/ext/JSONL/doc/live/).
