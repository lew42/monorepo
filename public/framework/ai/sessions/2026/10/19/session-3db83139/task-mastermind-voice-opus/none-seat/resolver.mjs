// Retry a missing bare package as if imported from the MAIN tree's Servex/ (read-only; no link).
export async function resolve(spec, ctx, next){
	try { return await next(spec, ctx); }
	catch (e){
		if (e.code !== "ERR_MODULE_NOT_FOUND" || spec.startsWith(".") || spec.startsWith("file:")) throw e;
		return next(spec, { ...ctx, parentURL: "file:///C:/Code/lew42/monorepo/Servex/x.js" });
	}
}
