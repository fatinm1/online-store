def test_admin_login_success(client, admin_user):
    resp = client.post("/api/admin/login", json={"email": "admin@test.com", "password": "secret123"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert "csrf_token" in data
    assert data["admin"]["email"] == "admin@test.com"
    assert "password" not in str(data)


def test_admin_login_wrong_password(client, admin_user):
    resp = client.post("/api/admin/login", json={"email": "admin@test.com", "password": "wrong"})
    assert resp.status_code == 401
    body = resp.get_json()["error"]
    assert body == "Invalid credentials"


def test_admin_login_unknown_email(client):
    resp = client.post("/api/admin/login", json={"email": "nobody@test.com", "password": "x"})
    assert resp.status_code == 401
    # Generic error -- does not reveal whether email exists
    assert resp.get_json()["error"] == "Invalid credentials"


def test_admin_me_unauthenticated(client):
    resp = client.get("/api/admin/me")
    assert resp.status_code == 401


def test_admin_me_authenticated(client, admin_user):
    client.post("/api/admin/login", json={"email": "admin@test.com", "password": "secret123"})
    resp = client.get("/api/admin/me")
    assert resp.status_code == 200
    assert resp.get_json()["email"] == "admin@test.com"


def test_admin_logout(client, admin_user):
    client.post("/api/admin/login", json={"email": "admin@test.com", "password": "secret123"})
    client.post("/api/admin/logout")
    resp = client.get("/api/admin/me")
    assert resp.status_code == 401


def test_admin_products_requires_auth(client):
    resp = client.get("/api/admin/products")
    assert resp.status_code == 401


def test_admin_orders_requires_auth(client):
    resp = client.get("/api/admin/orders")
    assert resp.status_code == 401


def test_admin_stats_requires_auth(client):
    resp = client.get("/api/admin/stats")
    assert resp.status_code == 401


def test_csrf_missing_returns_403(client, admin_user):
    # Login but don't send CSRF
    resp = client.post("/api/admin/login", json={"email": "admin@test.com", "password": "secret123"})
    assert resp.status_code == 200
    resp = client.post("/api/admin/products", json={"name": "X", "category": "abaya", "price_cents": 100, "stock": 1})
    assert resp.status_code == 403
