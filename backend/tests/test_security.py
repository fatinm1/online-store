def test_security_headers_present(client):
    resp = client.get("/api/health")
    headers = {k.lower(): v for k, v in resp.headers}
    assert "x-frame-options" in headers
    assert headers["x-frame-options"].upper() == "DENY"
    assert "x-content-type-options" in headers


def test_cors_disallowed_origin(client):
    resp = client.get("/api/products", headers={"Origin": "https://evil.example.com"})
    # Flask-CORS should not echo the disallowed origin
    assert resp.headers.get("Access-Control-Allow-Origin", "") != "https://evil.example.com"


def test_error_responses_no_stack_trace(client):
    resp = client.get("/api/products/no-such-slug")
    body = resp.get_json()
    assert "traceback" not in str(body).lower()
    assert "Traceback" not in resp.get_data(as_text=True)
