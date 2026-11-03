// Shim: DesignScore is the class now; this path keeps old imports working.
import DesignScore from "./DesignScore.js";
export const { grade, weigh, worst_first, census, severity, leading, metrics } = DesignScore;
export default DesignScore;
