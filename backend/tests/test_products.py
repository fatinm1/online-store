def test_list_all_products(client, sample_products):
    resp = client.get("/api/products")
    assert resp.status_code == 200
    data = resp.get_json()
    # Only active products returned
    assert all(p.get("in_stock") is not None for p in data)
    names = [p["name"] for p in data]
    assert "Inactive Item" not in names
    assert "Test Abaya" in names


def test_list_products_by_category(client, sample_products):
    resp = client.get("/api/products?category=abaya")
    assert resp.status_code == 200
    data = resp.get_json()
    assert all(p["category"] == "abaya" for p in data)


def test_list_products_invalid_category(client):
    resp = client.get("/api/products?category=shoes")
    assert resp.status_code == 400


def test_get_product_by_slug(client, sample_products):
    resp = client.get("/api/products/test-abaya")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["slug"] == "test-abaya"
    assert "stock" not in data  # raw stock not exposed
    assert "in_stock" in data


def test_get_product_not_found(client):
    resp = client.get("/api/products/no-such-slug")
    assert resp.status_code == 404


def test_inactive_product_not_found_by_slug(client, sample_products):
    resp = client.get("/api/products/inactive-item")
    assert resp.status_code == 404


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"
