import io
import os
from app.models import Product, OrderItem
from app.extensions import db


def test_create_product(admin_client, app):
    resp = admin_client.post("/api/admin/products", json={
        "name": "New Abaya",
        "category": "abaya",
        "price_cents": 25000,
        "stock": 10,
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == "New Abaya"
    assert data["price_cents"] == 25000
    assert "slug" in data


def test_create_product_invalid_category(admin_client):
    resp = admin_client.post("/api/admin/products", json={
        "name": "Bad Cat",
        "category": "shoes",
        "price_cents": 1000,
        "stock": 1,
    })
    assert resp.status_code == 400


def test_update_product_price_and_stock(admin_client, sample_products, app):
    pid = _get_id(app, "test-abaya")
    resp = admin_client.put(f"/api/admin/products/{pid}", json={"price_cents": 99999, "stock": 3})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["price_cents"] == 99999
    assert data["stock"] == 3


def test_delete_product_hard(admin_client, app):
    with app.app_context():
        p = Product(slug="delete-me", name="Delete Me", category="accessory", price_cents=100, stock=1)
        db.session.add(p)
        db.session.commit()
        pid = p.id

    resp = admin_client.delete(f"/api/admin/products/{pid}")
    assert resp.status_code == 200
    assert resp.get_json()["soft_deleted"] is False

    with app.app_context():
        assert Product.query.get(pid) is None


def test_delete_product_soft_when_referenced(admin_client, app, sample_products):
    from app.models import Order
    pid = _get_id(app, "test-abaya")
    with app.app_context():
        order = Order(payment_intent_id="pi_soft_test", amount_cents=1000, status="paid")
        db.session.add(order)
        db.session.flush()
        item = OrderItem(
            order_id=order.id,
            product_id=pid,
            product_name="Test Abaya",
            unit_price_cents=10000,
            quantity=1,
        )
        db.session.add(item)
        db.session.commit()

    resp = admin_client.delete(f"/api/admin/products/{pid}")
    assert resp.status_code == 200
    assert resp.get_json()["soft_deleted"] is True

    with app.app_context():
        p = Product.query.get(pid)
        assert p is not None
        assert p.active is False


def test_non_admin_cannot_create_product(client):
    resp = client.post("/api/admin/products", json={
        "name": "Hacker Abaya",
        "category": "abaya",
        "price_cents": 1,
        "stock": 1,
    })
    assert resp.status_code == 401


def test_image_upload_valid_png(admin_client, app, sample_products):
    pid = _get_id(app, "test-abaya")
    png_bytes = _minimal_png()
    data = {"image": (io.BytesIO(png_bytes), "test.png", "image/png")}
    resp = admin_client.post(
        f"/api/admin/products/{pid}/image",
        data=data,
        content_type="multipart/form-data",
    )
    assert resp.status_code == 200
    assert "image_url" in resp.get_json()
    # Stored filename is randomized (not "test")
    assert "test" not in resp.get_json()["image_url"]


def test_image_upload_rejects_non_image(admin_client, app, sample_products):
    pid = _get_id(app, "test-abaya")
    data = {"image": (io.BytesIO(b"<html>not an image</html>"), "evil.png", "image/png")}
    resp = admin_client.post(
        f"/api/admin/products/{pid}/image",
        data=data,
        content_type="multipart/form-data",
    )
    assert resp.status_code == 400


def test_image_upload_rejects_oversized(admin_client, app, sample_products):
    pid = _get_id(app, "test-abaya")
    big = b"x" * (6 * 1024 * 1024)
    data = {"image": (io.BytesIO(big), "big.png", "image/png")}
    resp = admin_client.post(
        f"/api/admin/products/{pid}/image",
        data=data,
        content_type="multipart/form-data",
    )
    assert resp.status_code == 400


def _get_id(app, slug):
    with app.app_context():
        p = Product.query.filter_by(slug=slug).first()
        return p.id


def _minimal_png() -> bytes:
    """Return the bytes of a minimal valid 1x1 white PNG."""
    import struct, zlib

    def chunk(name, data):
        c = name + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    signature = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    idat_data = zlib.compress(b"\x00\xff\xff\xff")
    png = (
        signature
        + chunk(b"IHDR", ihdr_data)
        + chunk(b"IDAT", idat_data)
        + chunk(b"IEND", b"")
    )
    return png
