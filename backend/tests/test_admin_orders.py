from app.models import Order, OrderItem
from app.extensions import db


def _create_order(app, pi_id, status="paid", email="buyer@test.com"):
    with app.app_context():
        order = Order(
            payment_intent_id=pi_id,
            amount_cents=10000,
            status=status,
            customer_email=email,
        )
        db.session.add(order)
        db.session.commit()
        return order.id


def test_list_orders(admin_client, app):
    _create_order(app, "pi_order1", "paid")
    _create_order(app, "pi_order2", "pending")
    resp = admin_client.get("/api/admin/orders")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["total"] == 2


def test_list_orders_filter_by_status(admin_client, app):
    _create_order(app, "pi_filterA", "paid")
    _create_order(app, "pi_filterB", "pending")
    resp = admin_client.get("/api/admin/orders?status=paid")
    assert resp.status_code == 200
    for o in resp.get_json()["orders"]:
        assert o["status"] == "paid"


def test_get_order_detail(admin_client, app):
    oid = _create_order(app, "pi_detail1", "paid")
    resp = admin_client.get(f"/api/admin/orders/{oid}")
    assert resp.status_code == 200
    assert resp.get_json()["id"] == oid


def test_update_order_status(admin_client, app):
    oid = _create_order(app, "pi_upd1", "paid")
    resp = admin_client.put(f"/api/admin/orders/{oid}/status", json={"status": "fulfilled"})
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "fulfilled"


def test_stats(admin_client, app):
    _create_order(app, "pi_stats1", "paid")
    _create_order(app, "pi_stats2", "pending")
    resp = admin_client.get("/api/admin/stats")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "total_revenue_cents" in data
    assert "order_counts" in data
    assert "low_stock" in data
