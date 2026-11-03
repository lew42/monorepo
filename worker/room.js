// worker/room.js — the Room Durable Object. One per url (`env.ROOM.idFromName(url)`,
// data.md's tie-break), hibernatable WebSockets, one SQLite table of deltas.
// Shape from /imagine/stream/doc/durable-objects.md.

import { can } from "./can.js";

export class Room {
    constructor(ctx, env) {
        this.ctx = ctx;
        this.env = env;

        // ctx.storage.sql is synchronous — no blockConcurrencyWhile needed.
        this.ctx.storage.sql.exec(`
            CREATE TABLE IF NOT EXISTS deltas (
                id     INTEGER PRIMARY KEY AUTOINCREMENT,
                at     INTEGER NOT NULL,
                author TEXT NOT NULL,
                role   TEXT NOT NULL,
                text   TEXT NOT NULL
            )
        `);

        // Keepalives must not wake a hibernated object (durable-objects.md).
        this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    }

    // index.js already ran can(user, "read") before forwarding here; this is the
    // room's OWN check, per identity.md ruling 2 — "the room bans itself
    // instantly" is a property of the room, not of can()'s six rows.
    async fetch(request) {
        const header = request.headers.get("X-Resolved-User");
        const user = header ? JSON.parse(header) : null;

        if (user?.banned) return new Response("banned", { status: 403 });

        const { server, client } = this.accept(user);

        // Resume by row id, never a byte offset (durable-objects.md).
        const since = Number(new URL(request.url).searchParams.get("since") || 0);
        const rows = this.ctx.storage.sql
            .exec(`SELECT id, at, author, role, text FROM deltas WHERE id > ? ORDER BY id`, since)
            .toArray();
        for (const row of rows) server.send(JSON.stringify({ type: "message", ...row }));

        return new Response(null, { status: 101, webSocket: client });
    }

    accept(user) {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        this.ctx.acceptWebSocket(server);
        server.serializeAttachment(user);   // in-memory state is destroyed on hibernation; the attachment is what survives
        return { client, server };
    }

    webSocketMessage(ws, message) {
        const user = ws.deserializeAttachment();

        if (user?.banned || !can(user, "write")) {
            ws.send(JSON.stringify({ type: "error", error: "refused" }));
            return;
        }

        let text;
        try { text = JSON.parse(message)?.text; } catch { return; }
        if (!text || typeof text !== "string") return;

        const at = Date.now();
        const { id } = this.ctx.storage.sql
            .exec(`INSERT INTO deltas (at, author, role, text) VALUES (?, ?, ?, ?) RETURNING id`,
                at, user.handle, user.role, text)
            .one();

        // Fan-out is a loop — there is no broadcast primitive (durable-objects.md).
        const delta = JSON.stringify({ type: "message", id, at, author: user.handle, role: user.role, text });
        for (const socket of this.ctx.getWebSockets()) socket.send(delta);
    }

    webSocketClose(ws, code, reason) {
        ws.close(code, reason);
    }
    webSocketError(ws) {
        ws.close();
    }
}
