/* Playwright with every launched browser fenced off from the live Servex (see Server/ServexFence.mjs). TestRunner.browser() points
 * PWENTRY here and the real entry in PW_REAL, so a script that does `import(PWENTRY)` and `chromium.launch()` is fenced without changing. */
import { pathToFileURL } from "node:url";
import { fence_servex } from "../../../../Server/ServexFence.mjs";

const real = await import(pathToFileURL(process.env.PW_REAL).href);
for (const type of [real.chromium, real.firefox, real.webkit]) {
	const launch = type.launch.bind(type);
	type.launch = async (...a) => fence_servex(await launch(...a));
}
export const { chromium, firefox, webkit, devices, request } = real;
export default real.default ?? real;
