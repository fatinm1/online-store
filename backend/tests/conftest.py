import pytest
from app import create_app
from app.extensions import db as _db
from app.models import Product, AdminUser, Order, OrderItem
from app.security import hash_password
from app.config import Config


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret"
    STRIPE_SECRET_KEY = "sk_test_fake"
    STRIPE_WEBHOOK_SECRET = "whsec_test"
    WTF_CSRF_ENABLED = False
    RATELIMIT_ENABLED = False
    FORCE_HTTPS = False


@pytest.fixture(scope="session")
def app():
    application = create_app(TestConfig())
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture(autouse=True)
def clean_db(app):
    with app.app_context():
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def sample_products(app):
    with app.app_context():
        products = [
            Product(
                slug="test-abaya",
                name="Test Abaya",
                category="abaya",
                price_cents=10000,
                stock=5,
                active=True,
            ),
            Product(
                slug="test-thobe",
                name="Test Thobe",
                category="thobe",
                price_cents=15000,
                stock=0,
                active=True,
            ),
            Product(
                slug="test-accessory",
                name="Test Accessory",
                category="accessory",
                price_cents=2000,
                stock=10,
                active=True,
            ),
            Product(
                slug="inactive-item",
                name="Inactive Item",
                category="abaya",
                price_cents=9999,
                stock=3,
                active=False,
            ),
        ]
        for p in products:
            _db.session.add(p)
        _db.session.commit()
        return [p.id for p in products]


@pytest.fixture
def admin_user(app):
    with app.app_context():
        user = AdminUser(email="admin@test.com", password_hash=hash_password("secret123"))
        _db.session.add(user)
        _db.session.commit()
        return user.id


@pytest.fixture
def admin_client(client, admin_user):
    """Authenticated admin client with CSRF token."""
    resp = client.post("/api/admin/login", json={"email": "admin@test.com", "password": "secret123"})
    assert resp.status_code == 200
    csrf = resp.get_json()["csrf_token"]
    client.environ_base["HTTP_X_CSRF_TOKEN"] = csrf
    return client
