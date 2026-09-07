from flask import Blueprint, jsonify, request, session
from marshmallow import ValidationError
from ..extensions import db, limiter
from ..models import AdminUser
from ..schemas import AdminLoginSchema
from ..security import verify_password, hash_password, generate_csrf_token, admin_required

bp = Blueprint("admin_auth", __name__)
_schema = AdminLoginSchema()


@bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def admin_login():
    try:
        data = _schema.load(request.get_json(force=True) or {})
    except ValidationError as err:
        return jsonify({"error": "Invalid credentials"}), 401

    admin = AdminUser.query.filter_by(email=data["email"]).first()

    # Always run verify to prevent timing attacks even if admin not found
    dummy_hash = "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy"
    pw_hash = admin.password_hash if admin else dummy_hash
    ok = verify_password(data["password"], pw_hash)

    if not admin or not ok:
        return jsonify({"error": "Invalid credentials"}), 401

    session.clear()
    session["admin_id"] = admin.id
    session.permanent = True
    csrf_token = generate_csrf_token()

    return jsonify({"admin": admin.to_dict(), "csrf_token": csrf_token})


@bp.route("/logout", methods=["POST"])
def admin_logout():
    session.clear()
    return jsonify({"ok": True})


@bp.route("/me")
@admin_required
def admin_me():
    from ..models import AdminUser
    admin = AdminUser.query.get(session["admin_id"])
    if not admin:
        return jsonify({"error": "Unauthorized"}), 401
    # Re-issue a CSRF token here too, not just on /login. The token only
    # lives in the SPA's in-memory JS state, so a page reload or a fresh
    # tab that resumes an existing session cookie would otherwise have no
    # token at all and every mutation would fail with "CSRF token missing
    # or invalid" until the admin explicitly logged out and back in.
    csrf_token = generate_csrf_token()
    return jsonify({"admin": admin.to_dict(), "csrf_token": csrf_token})
