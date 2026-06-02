from flask import Blueprint, jsonify, request
from ..models import Product
from ..schemas import VALID_CATEGORIES

bp = Blueprint("products", __name__)


@bp.route("/products")
def list_products():
    category = request.args.get("category")
    if category is not None and category not in VALID_CATEGORIES:
        return jsonify({"error": "Invalid category"}), 400

    query = Product.query.filter_by(active=True)
    if category:
        query = query.filter_by(category=category)

    products = query.order_by(Product.created_at.desc()).all()
    return jsonify([p.to_public_dict() for p in products])


@bp.route("/products/<slug>")
def get_product(slug):
    product = Product.query.filter_by(slug=slug, active=True).first()
    if not product:
        return jsonify({"error": "Not found"}), 404
    return jsonify(product.to_public_dict())
