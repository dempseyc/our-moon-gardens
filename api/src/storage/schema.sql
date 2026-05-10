DROP TABLE IF EXISTS interactions;
DROP TABLE IF EXISTS layers;
DROP TABLE IF EXISTS plots;
DROP TABLE IF EXISTS stickers;
DROP TABLE IF EXISTS glyph_collections;
DROP TABLE IF EXISTS glyphs;
DROP TABLE IF EXISTS user_tokens;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at_unix INT NOT NULL,
  credentials JSON,
  user_status VARCHAR(50) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  meta JSON
);

CREATE TABLE user_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  token VARCHAR(255) NOT NULL,
  expires_at INT NOT NULL,
  meta JSON
);

CREATE TABLE glyphs (
  id UUID PRIMARY KEY,
  height INT NOT NULL,
  width INT NOT NULL,
  src VARCHAR(255) NOT NULL,
  src_type VARCHAR(50) NOT NULL,
  collection_id UUID NOT NULL REFERENCES glyph_collections(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  meta JSON
);

CREATE TABLE glyph_collections (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at_unix INT NOT NULL,
  meta JSON
);

CREATE TABLE stickers (
  id UUID PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES users(id),
  glyph_id   UUID NOT NULL REFERENCES glyphs(id),
  plot_id    UUID NOT NULL REFERENCES plots(id),
  layer_id   UUID NOT NULL REFERENCES layers(id),
  x INT NOT NULL,
  y INT NOT NULL,
  z_index INT NOT NULL,
  created_at_unix INT NOT NULL,
  created_at_tick INT NOT NULL,
  expires_at_tick INT,
  meta JSON
);

CREATE TABLE plots (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  tick INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at_unix INT NOT NULL,
  address VARCHAR(255) NOT NULL,
  meta JSON
);

CREATE TABLE layers (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  rule_set JSON,
  meta JSON
);

CREATE TABLE interactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  sticker_id UUID NOT NULL REFERENCES stickers(id),
  plot_id UUID NOT NULL REFERENCES plots(id),
  type VARCHAR(50) NOT NULL,
  created_at_unix INT NOT NULL,
  meta JSON
);

CREATE INDEX idx_stickers_plot ON stickers(plot_id);
CREATE INDEX idx_stickers_plot_xy ON stickers(plot_id, x, y);
CREATE INDEX idx_stickers_expiry ON stickers(plot_id, expires_at_tick);
CREATE INDEX idx_stickers_layer ON stickers(layer_id);