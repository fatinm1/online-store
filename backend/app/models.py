import uuid
from datetime import datetime, timezone
from .extensions import db


def _uuid():
    return uuid.uuid4().hex


def _now():
    return datetime.now(timezone.utc)


VALID_CATEGORIES = {"abaya", "thobe", "accessory"}
VALID_STATUSES = {"pending", "paid", "failed", "fulfilled"}


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.String(32), primary_key=True, default=_uuid)
    slug = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, default="")
    price_cents = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), default="usd")
    image_url = db.Column(db.String(500), default="")
    stock = db.Column(db.Integer, default=0)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=_now)
    updated_at = db.Column(db.DateTime(timezone=True), default=_now, onupdate=_now)

    order_items = db.relationship("OrderItem", back_populates="product")

    def to_public_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "price_cents": self.price_cents,
            "currency": self.currency,
            "image_url": self.image_url,
            "in_stock": self.stock > 0,
        }

    def to_admin_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "price_cents": self.price_cents,
            "currency": self.currency,
            "image_url": self.image_url,
            "stock": self.stock,
            "active": self.active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.String(32), primary_key=True, default=_uuid)
    payment_intent_id = db.Column(db.String(200), unique=True, nullable=False, index=True)
    amount_cents = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), default="usd")
    status = db.Column(db.String(20), default="pending")
    customer_email = db.Column(db.String(254), default="")
    created_at = db.Column(db.DateTime(timezone=True), default=_now)
    updated_at = db.Column(db.DateTime(timezone=True), default=_now, onupdate=_now)

    items = db.relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "payment_intent_id": self.payment_intent_id,
            "amount_cents": self.amount_cents,
            "currency": self.currency,
            "status": self.status,
            "customer_email": self.customer_email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "items": [i.to_dict() for i in self.items],
        }


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.String(32), primary_key=True, default=_uuid)
    order_id = db.Column(db.String(32), db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.String(32), db.ForeignKey("products.id"), nullable=True)
    product_name = db.Column(db.String(200), nullable=False)
    unit_price_cents = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    order = db.relationship("Order", back_populates="items")
    product = db.relationship("Product", back_populates="order_items")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "unit_price_cents": self.unit_price_cents,
            "quantity": self.quantity,
        }


class AdminUser(db.Model):
    __tablename__ = "admin_users"

    id = db.Column(db.String(32), primary_key=True, default=_uuid)
    email = db.Column(db.String(254), unique=True, nullable=False)
    password_hash = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=_now)

    def to_dict(self):
        return {"id": self.id, "email": self.email}
