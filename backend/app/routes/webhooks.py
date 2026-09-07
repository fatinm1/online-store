import stripe
from flask import Blueprint, jsonify, request, current_app
from ..extensions import db
from ..models import Order, OrderItem, Product

bp = Blueprint("webhooks", __name__)


@bp.route("/webhooks/stripe", methods=["POST"])
def stripe_webhook():
    payload = request.get_data()
    sig = request.headers.get("Stripe-Signature", "")
    webhook_secret = current_app.config.get("STRIPE_WEBHOOK_SECRET", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        current_app.logger.warning("Stripe webhook signature verification failed")
        return jsonify({"error": "Invalid signature"}), 400

    intent = event["data"]["object"]
    pi_id = intent.get("id")

    if event["type"] == "payment_intent.succeeded":
        _handle_succeeded(pi_id, intent)
    elif event["type"] == "payment_intent.payment_failed":
        _handle_failed(pi_id)

    return jsonify({"received": True})


def _handle_succeeded(pi_id: str, intent):
    order = Order.query.filter_by(payment_intent_id=pi_id).first()
    if not order:
        current_app.logger.warning("Webhook: order not found for pi %s", pi_id)
        return

    # Idempotency guard -- already processed
    if order.status == "paid":
        return

    order.status = "paid"

    for item in order.items:
        if item.product_id:
            # SELECT ... FOR UPDATE serialises concurrent webhooks for the same
            # product row, preventing two simultaneous events from overselling.
            # with_for_update() is a no-op on SQLite; it takes effect on Postgres.
            product = (
                Product.query
                .filter_by(id=item.product_id)
                .with_for_update()
                .first()
            )
            if product:
                product.stock = max(0, product.stock - item.quantity)

    db.session.commit()
    # TODO: send confirmation email to order.customer_email
    current_app.logger.info("Order %s marked paid (pi: %s)", order.id, pi_id)


def _handle_failed(pi_id: str):
    order = Order.query.filter_by(payment_intent_id=pi_id).first()
    if not order:
        return
    if order.status not in ("pending",):
        return
    order.status = "failed"
    db.session.commit()
    current_app.logger.info("Order %s marked failed (pi: %s)", order.id, pi_id)
