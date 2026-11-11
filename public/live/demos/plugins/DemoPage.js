// The host: one box element its plugins change. See readme.md for the shape of the whole demo.
import { Plugin } from "../../../framework/core/Plugin/Plugin.js";
import Border from "./Border.js";
import Badge from "./Badge.js";
import Wide from "./Wide.js";

export class DemoPage extends Plugin {}
DemoPage.use(Border, Badge).available(Wide);   // Wide is known but off until switched on

export default DemoPage;
