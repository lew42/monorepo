// Maps site-absolute imports ("/framework/...", "/app.js") to files under public/, the way the dev server does.
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../..");
export async function resolve(spec, ctx, next){
	if (spec.startsWith("/") && !spec.startsWith("//") && !/^\/[A-Za-z]:/.test(spec)) return next(pathToFileURL(path.join(PUBLIC, spec)).href, ctx);
	return next(spec, ctx);
}
