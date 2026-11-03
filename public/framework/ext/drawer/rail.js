// Renamed 2026-10-16: the phone sheet is ./Sheet.js (class Sheet). This path keeps old imports (rail(app), named classes) working.
import Sheet from "./Sheet.js";
export * from "./Sheet.js";
export default function rail(app){ return Sheet.of(app); }
rail.navigated = () => Sheet.navigated();
export { rail };
