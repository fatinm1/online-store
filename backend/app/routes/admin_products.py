import os
import uuid
from flask import Blueprint, jsonify, request, current_app
from marshmallow import ValidationError
from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename
from ..extensions import db, limiter
from ..models import Product, OrderItem, VALID_CATEGORIES
from ..schemas import ProductCreateSchema, ProductUpdateSchema
from ..security import admin_required, csrf_required

bp = Blueprint("admin_products", __name__)

ALLOWED_FORMATS = {"PNG", "JPEG", "WEBP"}
_create_schema = ProductCreateSchema()
_update_schema = ProductUpdateSchema()


def _generate_slug(name: str) -> str:
    base = name.lower().replace(" ", "-")
    base = "".join(c if c.isalnum() or c == "-" else "" for c in base)[:80]
    slug = base
    counter = 1
    while Product.query.filter_by(slug=slug).first():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


@bp.route("/products")
@admin_required
def list_products():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return jsonify([p.to_admin_dict() for p in products])


@bp.route("/products", methods=["POST"])
@admin_required
@csrf_required
def create_product():
    try:
        data = _create_schema.load(request.get_json(force=True) or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    slug = _generate_slug(data["name"])
    product = Product(
        slug=slug,
        name=data["name"],
        category=data["category"],
        description=data.get("description", ""),
        price_cents=data["price_cents"],
        stock=data["stock"],
        active=data.get("active", True),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_admin_dict()), 201


@bp.route("/products/<product_id>", methods=["PUT"])
@admin_required
@csrf_required
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Not found"}), 404

    try:
        data = _update_schema.load(request.get_json(force=True) or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    for field in ("name", "category", "description", "price_cents", "stock", "active"):
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()
    return jsonify(product.to_admin_dict())


@bp.route("/products/<product_id>", methods=["DELETE"])
@admin_required
@csrf_required
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Not found"}), 404

    # Soft-delete if referenced by orders to preserve history
    referenced = OrderItem.query.filter_by(product_id=product_id).first()
    if referenced:
        product.active = False
        db.session.commit()
        return jsonify({"ok": True, "soft_deleted": True})

    db.session.delete(product)
    db.session.commit()
    return jsonify({"ok": True, "soft_deleted": False})


@bp.route("/products/<product_id>/image", methods=["POST"])
@admin_required
@csrf_required
@limiter.limit("20 per minute")
def upload_image(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Not found"}), 404

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    max_bytes = current_app.config.get("MAX_UPLOAD_BYTES", 5 * 1024 * 1024)

    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > max_bytes:
        return jsonify({"error": "File too large (max 5 MB)"}), 400

    try:
        img = Image.open(file)
        img.verify()
    except (UnidentifiedImageError, Exception):
        return jsonify({"error": "Invalid image file"}), 400

    file.seek(0)
    try:
        img = Image.open(file)
        fmt = img.format
        if fmt not in ALLOWED_FORMATS:
            return jsonify({"error": "Only PNG, JPEG, and WEBP are accepted"}), 400

        # Re-encode to strip metadata
        output_format = "JPEG" if fmt == "JPEG" else "PNG" if fmt == "PNG" else "WEBP"
        extension = output_format.lower()
        filename = f"{uuid.uuid4().hex}.{extension}"

        upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
        os.makedirs(upload_folder, exist_ok=True)
        save_path = os.path.join(upload_folder, filename)

        # Convert to RGB for JPEG (no alpha)
        if output_format == "JPEG" and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(save_path, format=output_format)
    except Exception as exc:
        current_app.logger.error("Image processing error: %s", exc)
        return jsonify({"error": "Could not process image"}), 400

    image_url = f"/uploads/{filename}"
    product.image_url = image_url
    db.session.commit()

    return jsonify({"image_url": image_url})
