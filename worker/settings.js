// One Durable Object per user: their settings (theme, ...), kept in the object's own SQLite. Reached only through the Worker,
// which authenticates first and names the object after the user id.
import { DurableObject } from "cloudflare:workers";
import { migrate } from "./dostorage.js";

const STEPS = [
	sql => sql.exec("CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated INTEGER NOT NULL)"),
];
const ALLOWED = { theme: ["light", "dark", "auto"], compact: [true, false] };

export class UserDO extends DurableObject {
	constructor(ctx, env){
		super(ctx, env);
		this.sql = ctx.storage.sql;
		ctx.blockConcurrencyWhile(async () => { migrate(this.sql, STEPS); });
	}

	all(){ return Object.fromEntries(this.sql.exec("SELECT key, value FROM settings").toArray().map(r => [r.key, JSON.parse(r.value)])); }

	async fetch(request){
		if (request.method === "PUT"){
			const body = await request.json().catch(() => ({}));
			for (const [key, value] of Object.entries(body)){
				if (!ALLOWED[key]?.includes(value)) return Response.json({ error: `bad setting ${key}` }, { status: 400 });
				this.sql.exec("INSERT INTO settings (key, value, updated) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated = excluded.updated", key, JSON.stringify(value), Date.now());
			}
		}
		return Response.json({ settings: this.all() });
	}
}
