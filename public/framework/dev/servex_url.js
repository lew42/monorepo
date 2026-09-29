/* Where Servex answers, from any page. On localhost/127.0.0.1/*.localhost — this
 * machine — `127.0.0.1:8090` (Servex's own address) is exactly right. From anywhere
 * else, most of all a phone on the LAN reading the dev server by its IP
 * (http://10.0.0.135:8137/), "127.0.0.1" means the PHONE, not the PC running Servex,
 * so the page's own dev server proxies it instead, same-origin: `<origin>/servex/…`.
 * `Server/plugins/ServexProxy.js` is the other end of this wire — the same pattern
 * `ux/Dictate`'s `default_whisper_url()` already uses for `/whisper`.
 *
 *     import { servex_url } from "/framework/dev/servex_url.js";
 *     fetch(servex_url("/api/page-ai"), { method: "POST", … });
 *
 * One shared helper instead of three copies of the same localhost check — see
 * `ext/drawer/tabs/ai.js`, `ux/Dictate/Dictate.js` (`log_url`) and
 * `ux/Dictate/playground/Playground.js` (`TIDY_URL`). */
const DEV_HOST = /^(localhost|127\.0\.0\.1|.+\.localhost)$/;

export function servex_url(path = ""){
	return DEV_HOST.test(location.hostname) ? "http://127.0.0.1:8090" + path : location.origin + "/servex" + path;
}

export default servex_url;
