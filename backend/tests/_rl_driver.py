"""Standalone driver used by test_rate_limits.py, run as a subprocess.

A real fix can't be proven inside the normal pytest process: app/extensions.py
holds one module-level Limiter() object, and flask_limiter.Limiter.init_app()
overwrites that shared instance's `enabled` flag and storage backend on every
call. Creating a second, differently-configured Flask app in the same
process (e.g. RATELIMIT_ENABLED=True for a rate-limit test) silently
reconfigures the limiter for every other app already using it -- including
the session-scoped test app the rest of the suite shares.

Each gunicorn worker is a separate OS process in real deployments anyway, so
driving these scenarios as real subprocesses is both the workaround and the
more faithful test.
"""
import argparse
import json
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--storage-uri", default="memory://")
    parser.add_argument("--db-path", required=True)
    parser.add_argument("--endpoint", choices=["login", "checkout", "webhook"], required=True)
    parser.add_argument("--count", type=int, required=True)
    parser.add_argument("--seed-admin", action="store_true")
    args = parser.parse_args()

    from app import create_app
    from app.extensions import db as _db
    from app.models import AdminUser
    from app.security import hash_password
    from app.config import Config

    class DriverConfig(Config):
        TESTING = True
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{args.db_path}"
        SECRET_KEY = "test-secret"
        STRIPE_SECRET_KEY = "sk_test_fake"
        STRIPE_WEBHOOK_SECRET = "whsec_test"
        RATELIMIT_ENABLED = True
        RATELIMIT_STORAGE_URI = args.storage_uri
        FORCE_HTTPS = False

    app = create_app(DriverConfig())
    with app.app_context():
        _db.create_all()
        if args.seed_admin and not AdminUser.query.filter_by(email="rl@test.com").first():
            _db.session.add(AdminUser(email="rl@test.com", password_hash=hash_password("secret123")))
            _db.session.commit()

    client = app.test_client()
    statuses = []
    for _ in range(args.count):
        if args.endpoint == "login":
            resp = client.post("/api/admin/login", json={"email": "rl@test.com", "password": "wrong"})
        elif args.endpoint == "checkout":
            resp = client.post("/api/checkout/create-payment-intent", json={"items": []})
        else:
            resp = client.post(
                "/api/webhooks/stripe",
                data=b'{"type": "irrelevant"}',
                content_type="application/json",
                headers={"Stripe-Signature": "t=1,v1=bad"},
            )
        statuses.append(resp.status_code)

    print(json.dumps(statuses))


if __name__ == "__main__":
    main()
