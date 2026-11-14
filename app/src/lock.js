// The single-editor lock of one document. Pure functions over a plain {holder, name, expires} record (or null),
// so the Durable Object stays thin and this is testable in node. The holder keeps it alive with a heartbeat; a silent
// holder loses it after TTL.
export const TTL = 12_000;     // ms a lock lives without a heartbeat
export const BEAT = 4_000;     // ms between a client's heartbeats

export const live = (lock, now) => (lock && lock.expires > now ? lock : null);

// Answers the new lock record, or null when somebody else holds a live one.
export function acquire(lock, who, now){
	const held = live(lock, now);
	if (held && held.holder !== who.id) return null;
	return { holder: who.id, name: who.name, expires: now + TTL };
}

// A heartbeat: only the holder of a live lock extends it. Answers the new record, or null.
export function beat(lock, who, now){
	const held = live(lock, now);
	return held && held.holder === who.id ? { ...held, expires: now + TTL } : null;
}

export const release = (lock, who) => (lock && lock.holder === who.id ? null : lock);

export const can_write = (lock, who, now) => live(lock, now)?.holder === who.id;
