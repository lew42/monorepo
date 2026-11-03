import { pathToFileURL } from "node:url";
import path from "node:path";
let parent;
export function initialize(data){ parent = pathToFileURL(path.join(data.from, "Servex", "agents", "x.js")).href; }
export async function resolve(spec, ctx, next){
	try { return await next(spec, ctx); }
	catch (e) {
		if (e.code !== "ERR_MODULE_NOT_FOUND" || /^[./]|^file:|^node:/.test(spec)) throw e;
		return next(spec, { ...ctx, parentURL: parent });
	}
}
