# NUMME Online Store

Modest luxury clothing: abayas, thobes, and accessories.

## Stack

- **Backend**: Python 3.11+, Flask, SQLAlchemy, marshmallow, Stripe
- **Frontend**: React 18, Vite, Tailwind CSS, Stripe.js
- **Database**: SQLite (dev), Postgres (prod via `DATABASE_URL`; `psycopg2-binary` included)

## Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real secrets
python seed.py         # creates sample products and one admin user
python run.py
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # fill in your Stripe publishable key
npm run dev
```

## Stripe CLI webhook forwarding (local dev)

```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

Copy the `whsec_...` secret printed by the CLI into `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

## Test cards

| Card number          | Result  |
|----------------------|---------|
| 4242 4242 4242 4242  | Success |
| 4000 0000 0000 9995  | Decline |

Use any future expiry date, any 3-digit CVC, any ZIP.

## Running tests

```bash
# backend
cd backend
python -m pytest -v

# frontend
cd frontend
npm test
```

## Cart persistence

The shopping cart is saved to `localStorage` on every change and reloaded on page
open. On reload the cart is re-validated against the live catalog: items that no
longer exist, are deactivated, or are out of stock are removed, and names/prices
are refreshed from the server. The server always recomputes the real order total at
checkout — `localStorage` data is display-only and never trusted for pricing.

## Deployment

- Set `DATABASE_URL` to a Postgres connection string.
- Set `FORCE_HTTPS=true` and provide all required secrets via environment variables.
- Store uploads in S3 or Cloudinary (see SECURITY.md).
- Run `flask db upgrade` or re-run `seed.py` to initialize schema.
- `psycopg2-binary` is included in `requirements.txt` for Postgres support. It can
  be omitted from a dev environment that uses only SQLite.
