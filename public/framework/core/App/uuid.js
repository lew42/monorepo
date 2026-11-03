/* crypto.randomUUID exists only in a secure context (https, or localhost). Over plain
 * http on the LAN (a phone at http://10.0.0.x:port/) it is undefined, and Socket, Item
 * and Ask throw on it. getRandomValues works everywhere, so fill the gap with it.
 * Imported FIRST by app.js, so it runs before any module that mints an id. */
if (globalThis.crypto && !crypto.randomUUID) {
	crypto.randomUUID = () => {
		const b = crypto.getRandomValues(new Uint8Array(16));
		b[6] = (b[6] & 0x0f) | 0x40;
		b[8] = (b[8] & 0x3f) | 0x80;
		const h = [...b].map(x => x.toString(16).padStart(2, "0")).join("");
		return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
	};
}
