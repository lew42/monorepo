-- The ad funnel: one row per step of /join/, keyed only by a random visitor id the browser keeps in localStorage.
-- No user id, IP or user agent is stored, so deleting an account needs no change here (worker/join.js, worker/readme.md).
CREATE TABLE join_events (
    at           INTEGER NOT NULL,
    visitor      TEXT    NOT NULL,
    event        TEXT    NOT NULL,
    inapp        TEXT    NOT NULL DEFAULT '',
    os           TEXT    NOT NULL DEFAULT '',
    utm_source   TEXT    NOT NULL DEFAULT '',
    utm_campaign TEXT    NOT NULL DEFAULT '',
    utm_content  TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX join_events_event_at ON join_events(event, at);
