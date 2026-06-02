import os


def _normalize_db_url(url: str) -> str:
    # Supabase / Heroku emit postgres:// but SQLAlchemy 2.x requires postgresql://
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY") or "dev-insecure-key"
    SQLALCHEMY_DATABASE_URI = _normalize_db_url(
        os.environ.get("DATABASE_URL") or "sqlite:///numme.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
    FORCE_HTTPS = os.environ.get("FORCE_HTTPS", "false").lower() == "true"
    CURRENCY = os.environ.get("CURRENCY", "usd")

    MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads")
    ORDER_MAX_CENTS = 20_000_00  # $20 000 ceiling
    CART_MAX_ITEMS = 50
    QUANTITY_MAX = 99

    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False


class ProductionConfig(Config):
    # validate() raises before app starts if FLASK_SECRET_KEY is absent,
    # so the dev fallback in Config.SECRET_KEY is never reachable in production.
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True

    @classmethod
    def validate(cls):
        required = [
            "FLASK_SECRET_KEY",
            "STRIPE_SECRET_KEY",
            "STRIPE_WEBHOOK_SECRET",
            "FRONTEND_ORIGIN",
            "ADMIN_EMAIL",
            "ADMIN_PASSWORD",
        ]
        missing = [k for k in required if not os.environ.get(k)]
        if missing:
            raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")


def get_config():
    env = os.environ.get("FLASK_ENV", "development")
    if env == "production":
        cfg = ProductionConfig()
        cfg.validate()
        return cfg
    return Config()
