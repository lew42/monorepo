import ReviewList from "./ReviewList.js";
import MobileSession from "../mobile/MobileSession.js";

ReviewList.Session = MobileSession;   // a session id under v/review/ opens the phone session page, as under v/mobile/

export default new ReviewList({ meta: import.meta });
