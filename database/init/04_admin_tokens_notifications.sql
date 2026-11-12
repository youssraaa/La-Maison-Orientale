-- Tokens invitation + notifications (bases déjà initialisées)

CREATE TABLE IF NOT EXISTS user_token (
    id                  BIGSERIAL PRIMARY KEY,
    utilisateur_id      BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    token               VARCHAR(64) NOT NULL UNIQUE,
    type_token          VARCHAR(30) NOT NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    used_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (type_token IN ('INVITE_AGENT'))
);

CREATE INDEX IF NOT EXISTS idx_user_token_lookup ON user_token (token, type_token);

CREATE TABLE IF NOT EXISTS notification (
    id                  BIGSERIAL PRIMARY KEY,
    utilisateur_id      BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    type_notif          VARCHAR(40) NOT NULL,
    titre               VARCHAR(150) NOT NULL,
    message             TEXT NOT NULL,
    lien                VARCHAR(255),
    lue                 BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_user ON notification (utilisateur_id, lue, created_at DESC);
