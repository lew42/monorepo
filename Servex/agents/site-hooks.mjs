// A node module hook: a site-absolute import ("/framework/dev/Socket/Socket.js") resolves under public/, the way the dev server serves it.
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "public");
export async function resolve(spec, ctx, next){
	if (spec.startsWith("/") && !spec.startsWith("//") && !/^\/[A-Za-z]:/.test(spec)) return next(pathToFileURL(path.join(PUBLIC, spec)).href, ctx);
	return next(spec, ctx);
}
