import stripe
from flask import Blueprint, jsonify, request, current_app
from marshmallow import ValidationError
from ..extensions import db, limiter
from ..models import Product, Order, OrderItem
from ..schemas import CreatePaymentIntentSchema

bp = Blueprint("checkout", __name__)
_schema = CreatePaymentIntentSchema()


@bp.route("/checkout/create-payment-intent", methods=["POST"])
@limiter.limit("10 per minute")
def create_payment_intent():
    try:
        data = _schema.load(request.get_json(force=True) or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    items = data["items"]
    email = data.get("email") or ""

    # Look up real prices from DB -- never trust client prices
    product_ids = [i["product_id"] for i in items]
    products = {p.id: p for p in Product.query.filter(Product.id.in_(product_ids)).all()}

    if len(products) != len(set(product_ids)):
        return jsonify({"error": "One or more products not found"}), 400

    total_cents = 0
    for item in items:
        product = products[item["product_id"]]
        if not product.active:
            return jsonify({"error": f"Product '{product.name}' is not available"}), 400
        if product.stock < item["quantity"]:
            return jsonify({"error": f"Insufficient stock for '{product.name}'"}), 400
        total_cents += product.price_cents * item["quantity"]

    order_max = current_app.config.get("ORDER_MAX_CENTS", 2_000_000)
    if total_cents > order_max:
        return jsonify({"error": "Order total exceeds maximum allowed"}), 400

    currency = current_app.config.get("CURRENCY", "usd")
    stripe.api_key = current_app.config["STRIPE_SECRET_KEY"]

    try:
        intent = stripe.PaymentIntent.create(
            amount=total_cents,
            currency=currency,
            receipt_email=email or None,
            metadata={"source": "numme"},
        )
    except stripe.error.StripeError as exc:
        current_app.logger.error("Stripe error: %s", exc)
        return jsonify({"error": "Payment service unavailable"}), 502

    order = Order(
        payment_intent_id=intent.id,
        amount_cents=total_cents,
        currency=currency,
        status="pending",
        customer_email=email,
    )
    db.session.add(order)
    db.session.flush()

    for item in items:
        product = products[item["product_id"]]
        db.session.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=product.name,
            unit_price_cents=product.price_cents,
            quantity=item["quantity"],
        ))

    db.session.commit()

    return jsonify({
        "client_secret": intent.client_secret,
        "amount_cents": total_cents,
        "currency": currency,
    })
