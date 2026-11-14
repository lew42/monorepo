// Lazy schema migration for a Durable Object's own SQLite. Each object keeps `schema_version` in its `meta` table
// and runs the steps it is behind on when it wakes (call from the constructor, inside blockConcurrencyWhile).
// To change the schema: append ONE step to the class's list; never edit an old one.
export function migrate(sql, steps){
	sql.exec("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)");
	let version = Number(sql.exec("SELECT value FROM meta WHERE key = 'schema_version'").toArray()[0]?.value ?? 0);
	for (; version < steps.length; version++){
		steps[version](sql);
		sql.exec("INSERT INTO meta (key, value) VALUES ('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", String(version + 1));
	}
	return version;
}

export const meta_get = (sql, key) => sql.exec("SELECT value FROM meta WHERE key = ?", key).toArray()[0]?.value ?? null;
export const meta_set = (sql, key, value) => sql.exec("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, String(value));
