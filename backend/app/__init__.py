import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_talisman import Talisman
from .config import get_config
from .extensions import db, limiter


def create_app(config=None):
    app = Flask(__name__)

    cfg = config or get_config()
    app.config.from_object(cfg)

    # Ensure upload folder exists
    os.makedirs(app.config.get("UPLOAD_FOLDER", "uploads"), exist_ok=True)

    # Extensions
    db.init_app(app)
    limiter.init_app(app)

    # CORS: credentials only for same origin (admin)
    frontend_origin = app.config["FRONTEND_ORIGIN"]
    CORS(
        app,
        origins=[frontend_origin],
        supports_credentials=True,
        allow_headers=["Content-Type", "X-CSRF-Token"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    force_https = app.config.get("FORCE_HTTPS", False)
    csp = {
        "default-src": "'self'",
        "script-src": ["'self'", "https://js.stripe.com"],
        "frame-src": ["https://js.stripe.com"],
        "connect-src": ["'self'", "https://api.stripe.com"],
        "img-src": ["'self'", "data:", "blob:"],
        "style-src": ["'self'", "'unsafe-inline'"],
    }
    Talisman(
        app,
        force_https=force_https,
        strict_transport_security=force_https,
        content_security_policy=csp,
        referrer_policy="no-referrer",
        frame_options="DENY",
    )

    # Blueprints
    from .routes.products import bp as products_bp
    from .routes.checkout import bp as checkout_bp
    from .routes.webhooks import bp as webhooks_bp
    from .routes.admin_auth import bp as admin_auth_bp
    from .routes.admin_products import bp as admin_products_bp
    from .routes.admin_orders import bp as admin_orders_bp

    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(checkout_bp, url_prefix="/api")
    app.register_blueprint(webhooks_bp, url_prefix="/api")
    app.register_blueprint(admin_auth_bp, url_prefix="/api/admin")
    app.register_blueprint(admin_products_bp, url_prefix="/api/admin")
    app.register_blueprint(admin_orders_bp, url_prefix="/api/admin")

    # Serve uploaded images as static files in dev
    from flask import send_from_directory
    upload_folder = app.config.get("UPLOAD_FOLDER", "uploads")

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(upload_folder, filename)

    # Health check
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # Error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({"error": "Too many requests"}), 429

    @app.errorhandler(500)
    def server_error(e):
        app.logger.error("Internal server error: %s", e)
        return jsonify({"error": "Internal server error"}), 500

    with app.app_context():
        db.create_all()

    return app
