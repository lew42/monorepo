// Shim: AICost is the class now; this path keeps old imports working.
import AICost from "./AICost.js";
export const { money, cost_of, cost_figure, total, total_line, day_costs, model_name, agents_of, summary_line, breakdown } = AICost;
export default AICost;
