import os


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY") or "dev-insecure-key"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///numme.db"
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


class ProductionConfig(Config):
    @classmethod
    def validate(cls):
        required = ["FLASK_SECRET_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
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
