from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from sqlalchemy import func
from ..extensions import db
from ..models import Order, OrderItem, Product, VALID_STATUSES
from ..schemas import OrderStatusSchema
from ..security import admin_required, csrf_required

bp = Blueprint("admin_orders", __name__)
_status_schema = OrderStatusSchema()

LOW_STOCK_THRESHOLD = 5


@bp.route("/orders")
@admin_required
def list_orders():
    status_filter = request.args.get("status")
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(100, max(1, int(request.args.get("per_page", 20))))

    query = Order.query
    if status_filter:
        if status_filter not in VALID_STATUSES:
            return jsonify({"error": "Invalid status filter"}), 400
        query = query.filter_by(status=status_filter)

    paginated = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "orders": [o.to_dict() for o in paginated.items],
        "total": paginated.total,
        "page": page,
        "per_page": per_page,
    })


@bp.route("/orders/<order_id>")
@admin_required
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Not found"}), 404
    return jsonify(order.to_dict())


@bp.route("/orders/<order_id>/status", methods=["PUT"])
@admin_required
@csrf_required
def update_order_status(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Not found"}), 404

    try:
        data = _status_schema.load(request.get_json(force=True) or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    order.status = data["status"]
    db.session.commit()
    return jsonify(order.to_dict())


@bp.route("/stats")
@admin_required
def stats():
    revenue = db.session.query(func.sum(Order.amount_cents)).filter_by(status="paid").scalar() or 0

    counts = (
        db.session.query(Order.status, func.count(Order.id))
        .group_by(Order.status)
        .all()
    )
    order_counts = {status: count for status, count in counts}

    low_stock = (
        Product.query.filter(Product.stock <= LOW_STOCK_THRESHOLD, Product.active == True)
        .order_by(Product.stock.asc())
        .all()
    )

    return jsonify({
        "total_revenue_cents": revenue,
        "order_counts": order_counts,
        "low_stock": [p.to_admin_dict() for p in low_stock],
    })
