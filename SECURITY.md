# NUMME Security Model

## Admin Authentication

NUMME uses **session-based authentication** with Flask-managed sessions stored
in a signed, httpOnly cookie. The approach:

- On successful login, Flask sets a session cookie with `httpOnly=True`,
  `SameSite=Lax` (dev) or `SameSite=None; Secure` (prod).
- A CSRF token (64-char hex secret) is generated and returned in the login
  response body. The React SPA stores it in memory (never in localStorage or
  a cookie) and echoes it in the `X-CSRF-Token` header on every mutating
  request (POST, PUT, DELETE).
- The server uses double-submit validation: the header token is compared
  against the session-stored token using `hmac.compare_digest` to prevent
  timing attacks.
- Login is rate-limited to 5 requests per minute per IP to blunt brute force.
  Flask-Limiter's storage backend is Redis in production (`REDIS_URL`),
  shared across all gunicorn workers; falling back to its default in-memory
  storage there would give each worker its own private counter, so the real
  limit would be `workers * 5` and would reset on every deploy.
  `ProductionConfig.validate()` requires `REDIS_URL` be set.
- Error messages are always "Invalid credentials" regardless of whether the
  email exists, preventing user enumeration. A login with an unknown email
  still runs a full argon2 verify against a precomputed dummy hash
  (`security.DUMMY_PASSWORD_HASH`), so the response time doesn't leak
  whether the email exists either.
- Passwords are hashed with Argon2id (argon2-cffi). Plain passwords are never
  stored, logged, or returned.

If cross-origin cookie handling proves brittle in production, the acceptable
alternative is a short-lived JWT kept in React state (never localStorage) with
a refresh token in an httpOnly cookie. This is documented here but not
implemented; the session approach is the default.

## Server-Side Pricing

The browser **never sends prices**. The checkout endpoint accepts only
`product_id` and `quantity`. The marshmallow schema drops any extra fields,
so a price-injection attempt is silently discarded. The server fetches the
canonical price from the database and computes the total itself.

## Stripe

- The Stripe **secret key** is server-side only. The browser receives only the
  publishable key (via `VITE_STRIPE_PUBLISHABLE_KEY`) and the short-lived
  `client_secret` for a specific PaymentIntent.
- Orders transition to `paid` **only** via a Stripe webhook whose
  `Stripe-Signature` header is verified with `stripe.Webhook.construct_event`.
  A forged or missing signature returns 400 and leaves the order untouched.
  The endpoint is rate-limited to 60 requests per minute per IP.
- The webhook handler is idempotent: if an event is re-delivered, it checks
  the current order status and skips re-processing if already paid.
- Stock decrements use `SELECT ... FOR UPDATE` (via SQLAlchemy's
  `with_for_update()`) so that two concurrent `payment_intent.succeeded`
  webhooks for the same product serialize at the database row level, preventing
  overselling. This is a no-op on SQLite (used in development and tests) and
  takes full effect on Postgres in production.

## Cart localStorage

The shopping cart is persisted to `localStorage` for user convenience. On page
load, stored items are re-validated against the live catalog before display:
items that are no longer active, out of stock, or missing from the catalog are
removed, and names and prices are refreshed from the server. The `localStorage`
values are **never** trusted for pricing at checkout — the server always
recomputes the total from the database.

## Image Upload

1. File size is capped at 5 MB server-side.
2. The file is opened with Pillow and the image format is checked against an
   allowlist (`PNG`, `JPEG`, `WEBP`). The MIME type and file extension are
   not trusted.
3. The image is re-encoded through Pillow, stripping all EXIF and embedded
   metadata.
4. A random UUID filename is generated; the client-provided filename is never
   used.
5. In development, uploads are stored outside the code directory and served
   with a correct, non-executable content type via Flask's
   `send_from_directory`.
6. In production, uploads go to S3-compatible object storage instead of
   local disk (`app/storage.py`, selected automatically when `S3_BUCKET` is
   configured) -- both to prevent path traversal / co-location with
   executable code, and because Railway's filesystem is ephemeral: a local
   file would be silently deleted on every deploy or restart. Supabase
   Storage (S3-compatible) is used by default since the project already has
   a Supabase account for Postgres; any S3-compatible provider works.
   `ProductionConfig.validate()` fails fast at startup if the S3 env vars
   are missing, rather than silently falling back to disk in production.

## Security Headers (Flask-Talisman)

- `Content-Security-Policy`: restricts scripts to `'self'` and
  `https://js.stripe.com`, frames to Stripe, and image sources to `'self'`,
  `data:`, and `blob:`.
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Strict-Transport-Security` and forced HTTPS enabled when `FORCE_HTTPS=true`.

## CORS

CORS is restricted to `FRONTEND_ORIGIN`. The wildcard origin is never used.
Credentials (`withCredentials`) are allowed only for the known admin origin.

## Input Validation

Every mutating endpoint uses a marshmallow schema with `unknown = EXCLUDE`
to drop unexpected fields. Category values, status values, and quantity
ranges are whitelisted. The SQLAlchemy ORM is used throughout; no raw string
SQL appears anywhere.

## Error Hygiene

Clients receive clean JSON error objects. Stack traces, Stripe internals, and
server paths are logged server-side only and are never included in HTTP
responses.

## Secrets

All secrets are loaded from environment variables. A `.env.example` file with
placeholders is committed; actual `.env` files are excluded by `.gitignore`.
The production config class raises `RuntimeError` at startup if any required
secret is missing.
