import MobileHome from "./MobileHome.js";
import MobileAll from "./MobileAll.js";
import MobileSession from "./MobileSession.js";
import MobileTask from "./MobileTask.js";

MobileHome.All = MobileAll;
MobileHome.Session = MobileSession;
MobileSession.Task = MobileTask;

export default new MobileHome({ meta: import.meta });
