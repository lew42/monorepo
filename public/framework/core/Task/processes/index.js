// The process templates, registered by name on Process.TEMPLATES (import Process from here to get the templates). A new template: a new file here and one line below.
import Process from "../Process.js";
import BuildProcess from "./BuildProcess.js";
import DesignProcess from "./DesignProcess.js";
import InvestigateProcess from "./InvestigateProcess.js";

for (const T of [BuildProcess, DesignProcess, InvestigateProcess]) Process.TEMPLATES[T.template] = T;

export { Process };
export default Process;
