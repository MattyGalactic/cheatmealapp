CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_chain BOOLEAN NOT NULL DEFAULT TRUE,
  rating_weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  distance_miles DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL CHECK (calories > 0),
  protein_grams INTEGER NOT NULL DEFAULT 0,
  price_usd NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY,
  event_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  calories_budget INTEGER,
  restaurant_id TEXT,
  restaurant_name TEXT,
  item_id TEXT,
  item_name TEXT,
  rank_position INTEGER,
  cravings_selected JSONB,
  match_mode TEXT,
  sort_mode TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS rank_position INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cravings_selected JSONB;
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_mode TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS sort_mode TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS restaurant_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS item_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS provider TEXT;

CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON events (event_name);
