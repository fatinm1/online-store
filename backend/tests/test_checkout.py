import json
from unittest.mock import patch, MagicMock
from app.models import Order, OrderItem
from app.extensions import db


def _make_intent(amount):
    intent = MagicMock()
    intent.id = "pi_test123"
    intent.client_secret = "pi_test123_secret_abc"
    intent.amount = amount
    return intent


def test_checkout_server_side_pricing(client, sample_products, app):
    """Server computes the real total; any injected price field is ignored."""
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = _make_intent(10000)
        resp = client.post(
            "/api/checkout/create-payment-intent",
            json={"items": [{"product_id": _get_id(app, "test-abaya"), "quantity": 1}]},
        )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["amount_cents"] == 10000
    assert "client_secret" in data
    assert "sk_" not in json.dumps(data)  # no secret key leaked

    # Verify Stripe was called with server-computed amount
    mock_create.assert_called_once()
    assert mock_create.call_args[1]["amount"] == 10000


def test_checkout_price_tampering_ignored(client, sample_products, app):
    """Even if client sends a price field, server uses DB price."""
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = _make_intent(10000)
        resp = client.post(
            "/api/checkout/create-payment-intent",
            json={
                "items": [{"product_id": _get_id(app, "test-abaya"), "quantity": 1}],
                "price_cents": 1,  # attacker tries to pay $0.01
            },
        )
    assert resp.status_code == 200
    assert mock_create.call_args[1]["amount"] == 10000  # real price used


def test_checkout_unknown_product(client, app):
    resp = client.post(
        "/api/checkout/create-payment-intent",
        json={"items": [{"product_id": "nonexistent000000000000000000000", "quantity": 1}]},
    )
    assert resp.status_code == 400


def test_checkout_sold_out(client, sample_products, app):
    resp = client.post(
        "/api/checkout/create-payment-intent",
        json={"items": [{"product_id": _get_id(app, "test-thobe"), "quantity": 1}]},
    )
    assert resp.status_code == 400


def test_checkout_empty_cart(client):
    resp = client.post(
        "/api/checkout/create-payment-intent",
        json={"items": []},
    )
    assert resp.status_code == 400


def test_checkout_quantity_over_max(client, sample_products, app):
    resp = client.post(
        "/api/checkout/create-payment-intent",
        json={"items": [{"product_id": _get_id(app, "test-abaya"), "quantity": 100}]},
    )
    assert resp.status_code == 400


def test_checkout_malformed_json(client):
    resp = client.post(
        "/api/checkout/create-payment-intent",
        data="not json",
        content_type="application/json",
    )
    assert resp.status_code == 400


def test_checkout_pending_order_recorded(client, sample_products, app):
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = _make_intent(10000)
        resp = client.post(
            "/api/checkout/create-payment-intent",
            json={"items": [{"product_id": _get_id(app, "test-abaya"), "quantity": 1}], "email": "x@x.com"},
        )
    assert resp.status_code == 200
    with app.app_context():
        order = Order.query.filter_by(payment_intent_id="pi_test123").first()
        assert order is not None
        assert order.status == "pending"
        assert order.customer_email == "x@x.com"
        assert len(order.items) == 1


def test_checkout_idempotency_key_forwarded_to_stripe(client, sample_products, app):
    """A client-supplied idempotency key is passed through to Stripe."""
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = _make_intent(10000)
        client.post(
            "/api/checkout/create-payment-intent",
            json={
                "items": [{"product_id": _get_id(app, "test-abaya"), "quantity": 1}],
                "idempotency_key": "retry-key-abc123",
            },
        )
    assert mock_create.call_args[1]["idempotency_key"] == "retry-key-abc123"


def test_checkout_missing_idempotency_key_still_generates_one(client, sample_products, app):
    """No key from the client -- server still sends one so Stripe-side retries are safe."""
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = _make_intent(10000)
        client.post(
            "/api/checkout/create-payment-intent",
            json={"items": [{"product_id": _get_id(app, "test-abaya"), "quantity": 1}]},
        )
    assert mock_create.call_args[1]["idempotency_key"]


def test_checkout_retry_with_same_intent_does_not_duplicate_order(client, sample_products, app):
    """If Stripe returns the same PaymentIntent for a retried request (same
    idempotency key), the second response reuses the existing order instead
    of inserting a duplicate row for the same payment_intent_id."""
    with patch("stripe.PaymentIntent.create") as mock_create:
        mock_create.return_value = _make_intent(10000)
        payload = {
            "items": [{"product_id": _get_id(app, "test-abaya"), "quantity": 1}],
            "idempotency_key": "same-attempt-key",
        }
        first = client.post("/api/checkout/create-payment-intent", json=payload)
        second = client.post("/api/checkout/create-payment-intent", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.get_json()["client_secret"] == second.get_json()["client_secret"]

    with app.app_context():
        orders = Order.query.filter_by(payment_intent_id="pi_test123").all()
        assert len(orders) == 1


def _get_id(app, slug):
    from app.models import Product
    with app.app_context():
        p = Product.query.filter_by(slug=slug).first()
        return p.id
