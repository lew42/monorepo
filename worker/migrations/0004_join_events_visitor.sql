-- The per-visitor cap in worker/join.js (300 rows a day) filters on visitor and at; without this index every beacon scans the table.
CREATE INDEX join_events_visitor_at ON join_events(visitor, at);
