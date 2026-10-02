import hmac
import secrets
from functools import wraps
from flask import session, jsonify, request, current_app
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError

_ph = PasswordHasher()

CSRF_HEADER = "X-CSRF-Token"
CSRF_SESSION_KEY = "csrf_token"

# A real argon2 hash, computed once at import. Used as a stand-in password
# hash when a login's email doesn't match any admin, so verify_password()
# always does genuine KDF work on both branches of admin_login() and the
# response time can't be used to tell whether the email exists. A malformed
# hash string would fail argon2's own parsing almost instantly instead,
# which is faster than a real mismatch and leaks exactly that signal.
DUMMY_PASSWORD_HASH = _ph.hash(secrets.token_hex(32))


def hash_password(plain: str) -> str:
    return _ph.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _ph.verify(hashed, plain)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def generate_csrf_token() -> str:
    token = secrets.token_hex(32)
    session[CSRF_SESSION_KEY] = token
    return token


def _check_csrf():
    client_token = request.headers.get(CSRF_HEADER) or (
        request.get_json(silent=True) or {}
    ).get("csrf_token", "")
    server_token = session.get(CSRF_SESSION_KEY, "")
    if not server_token or not hmac.compare_digest(client_token, server_token):
        return False
    return True


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("admin_id"):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("admin_id"):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


def csrf_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not _check_csrf():
            return jsonify({"error": "CSRF token missing or invalid"}), 403
        return f(*args, **kwargs)
    return decorated
