import json
import time
import hmac
import hashlib
import pytest
from unittest.mock import patch, MagicMock
from app.models import Order, OrderItem, Product
from app.extensions import db


WEBHOOK_SECRET = "whsec_test"


def _sign_payload(payload: bytes, secret: str) -> str:
    ts = int(time.time())
    signed = f"{ts}.{payload.decode()}"
    sig = hmac.new(secret.encode(), signed.encode(), hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}"


def _make_event(pi_id: str, event_type: str) -> dict:
    return {
        "id": "evt_test",
        "type": event_type,
        "data": {
            "object": {
                "id": pi_id,
                "amount": 10000,
                "currency": "usd",
            }
        },
    }


def _post_webhook(client, event: dict, secret=WEBHOOK_SECRET):
    payload = json.dumps(event).encode()
    sig = _sign_payload(payload, secret)
    return client.post(
        "/api/webhooks/stripe",
        data=payload,
        content_type="application/json",
        headers={"Stripe-Signature": sig},
    )


def _create_order_and_product(app):
    with app.app_context():
        p = Product(slug="wh-product", name="WH Product", category="abaya", price_cents=10000, stock=5)
        db.session.add(p)
        db.session.flush()
        order = Order(payment_intent_id="pi_wh_test", amount_cents=10000, status="pending")
        db.session.add(order)
        db.session.flush()
        item = OrderItem(
            order_id=order.id, product_id=p.id,
            product_name="WH Product", unit_price_cents=10000, quantity=2,
        )
        db.session.add(item)
        db.session.commit()
        return order.id, p.id


def test_webhook_missing_signature(client):
    payload = json.dumps(_make_event("pi_x", "payment_intent.succeeded")).encode()
    resp = client.post("/api/webhooks/stripe", data=payload, content_type="application/json")
    assert resp.status_code == 400


def test_webhook_forged_signature(client, app):
    _create_order_and_product(app)
    event = _make_event("pi_wh_test", "payment_intent.succeeded")
    payload = json.dumps(event).encode()
    resp = client.post(
        "/api/webhooks/stripe",
        data=payload,
        content_type="application/json",
        headers={"Stripe-Signature": "t=1,v1=badhash"},
    )
    assert resp.status_code == 400


def test_webhook_valid_marks_order_paid_and_decrements_stock(client, app):
    order_id, product_id = _create_order_and_product(app)

    event = _make_event("pi_wh_test", "payment_intent.succeeded")
    with patch("stripe.Webhook.construct_event", return_value=event):
        resp = client.post(
            "/api/webhooks/stripe",
            data=json.dumps(event).encode(),
            content_type="application/json",
            headers={"Stripe-Signature": "t=1,v1=valid"},
        )

    assert resp.status_code == 200

    with app.app_context():
        order = Order.query.get(order_id)
        assert order.status == "paid"
        product = Product.query.get(product_id)
        assert product.stock == 3  # 5 - 2


def test_webhook_idempotent(client, app):
    order_id, product_id = _create_order_and_product(app)

    event = _make_event("pi_wh_test", "payment_intent.succeeded")
    for _ in range(2):
        with patch("stripe.Webhook.construct_event", return_value=event):
            resp = client.post(
                "/api/webhooks/stripe",
                data=json.dumps(event).encode(),
                content_type="application/json",
                headers={"Stripe-Signature": "t=1,v1=valid"},
            )
        assert resp.status_code == 200

    with app.app_context():
        product = Product.query.get(product_id)
        assert product.stock == 3  # not 1 (not double-decremented)


def test_webhook_payment_failed(client, app):
    order_id, _ = _create_order_and_product(app)
    event = _make_event("pi_wh_test", "payment_intent.payment_failed")
    with patch("stripe.Webhook.construct_event", return_value=event):
        resp = client.post(
            "/api/webhooks/stripe",
            data=json.dumps(event).encode(),
            content_type="application/json",
            headers={"Stripe-Signature": "t=1,v1=valid"},
        )
    assert resp.status_code == 200
    with app.app_context():
        order = Order.query.get(order_id)
        assert order.status == "failed"


def test_webhook_for_update_decrement_is_correct(client, app):
    """Stock decrement via the select-for-update query path gives the right result."""
    order_id, product_id = _create_order_and_product(app)  # stock=5, qty=2

    event = _make_event("pi_wh_test", "payment_intent.succeeded")
    with patch("stripe.Webhook.construct_event", return_value=event):
        resp = client.post(
            "/api/webhooks/stripe",
            data=json.dumps(event).encode(),
            content_type="application/json",
            headers={"Stripe-Signature": "t=1,v1=valid"},
        )
    assert resp.status_code == 200
    with app.app_context():
        product = Product.query.get(product_id)
        assert product.stock == 3  # 5 - 2


def test_webhook_for_update_stock_floor_is_zero(client, app):
    """Stock never goes below zero even if quantity exceeds available stock."""
    with app.app_context():
        p = Product(slug="low-stock", name="Low Stock", category="abaya", price_cents=5000, stock=1)
        db.session.add(p)
        db.session.flush()
        order = Order(payment_intent_id="pi_floor_test", amount_cents=5000, status="pending")
        db.session.add(order)
        db.session.flush()
        item = OrderItem(
            order_id=order.id, product_id=p.id,
            product_name="Low Stock", unit_price_cents=5000, quantity=5,
        )
        db.session.add(item)
        db.session.commit()
        order_id, product_id = order.id, p.id

    event = _make_event("pi_floor_test", "payment_intent.succeeded")
    with patch("stripe.Webhook.construct_event", return_value=event):
        resp = client.post(
            "/api/webhooks/stripe",
            data=json.dumps(event).encode(),
            content_type="application/json",
            headers={"Stripe-Signature": "t=1,v1=valid"},
        )
    assert resp.status_code == 200
    with app.app_context():
        product = Product.query.get(product_id)
        assert product.stock == 0  # max(0, 1 - 5) == 0


@pytest.mark.skip(
    reason=(
        "True concurrency test requires Postgres; SELECT ... FOR UPDATE "
        "is a no-op on SQLite so row-level locking cannot be exercised here. "
        "Run against a real Postgres instance with two threads to verify."
    )
)
def test_concurrent_webhooks_no_oversell(client, app):
    """Two simultaneous payment_intent.succeeded events must not double-decrement stock."""
    pass
