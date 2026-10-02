import io
import struct
import zlib
from unittest.mock import patch, MagicMock
from app import create_app
from app.extensions import db as _db
from app.models import Product, AdminUser
from app.security import hash_password
from app.config import Config


class S3TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret"
    STRIPE_SECRET_KEY = "sk_test_fake"
    STRIPE_WEBHOOK_SECRET = "whsec_test"
    RATELIMIT_ENABLED = False  # matches the shared session app -- see test_rate_limits.py
    FORCE_HTTPS = False
    S3_BUCKET = "numme-test-bucket"
    S3_ENDPOINT_URL = "https://xyz.supabase.co/storage/v1/s3"
    S3_ACCESS_KEY_ID = "test-key"
    S3_SECRET_ACCESS_KEY = "test-secret-key"
    S3_PUBLIC_URL_BASE = "https://xyz.supabase.co/storage/v1/object/public/numme-test-bucket"


def _minimal_png() -> bytes:
    def chunk(name, data):
        c = name + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    signature = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    idat_data = zlib.compress(b"\x00\xff\xff\xff")
    return signature + chunk(b"IHDR", ihdr_data) + chunk(b"IDAT", idat_data) + chunk(b"IEND", b"")


def test_image_upload_uses_s3_when_configured():
    """When S3_BUCKET etc. are set (production), the upload goes to S3-
    compatible object storage instead of local disk, and the returned URL
    points at the public S3 base -- not /uploads/, which wouldn't survive a
    Railway redeploy."""
    app = create_app(S3TestConfig())
    with app.app_context():
        _db.create_all()
        admin = AdminUser(email="s3@test.com", password_hash=hash_password("secret123"))
        product = Product(slug="s3-product", name="S3 Product", category="abaya", price_cents=1000, stock=1)
        _db.session.add_all([admin, product])
        _db.session.commit()
        product_id = product.id

    client = app.test_client()
    login = client.post("/api/admin/login", json={"email": "s3@test.com", "password": "secret123"})
    csrf = login.get_json()["csrf_token"]

    with patch("app.storage.boto3.client") as mock_boto_client:
        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        resp = client.post(
            f"/api/admin/products/{product_id}/image",
            data={"image": (io.BytesIO(_minimal_png()), "test.png", "image/png")},
            content_type="multipart/form-data",
            headers={"X-CSRF-Token": csrf},
        )

    assert resp.status_code == 200
    image_url = resp.get_json()["image_url"]
    assert image_url.startswith(S3TestConfig.S3_PUBLIC_URL_BASE + "/")
    assert "/uploads/" not in image_url

    mock_boto_client.assert_called_once_with(
        "s3",
        endpoint_url=S3TestConfig.S3_ENDPOINT_URL,
        aws_access_key_id=S3TestConfig.S3_ACCESS_KEY_ID,
        aws_secret_access_key=S3TestConfig.S3_SECRET_ACCESS_KEY,
        region_name=S3TestConfig.S3_REGION,
    )
    mock_s3.put_object.assert_called_once()
    kwargs = mock_s3.put_object.call_args.kwargs
    assert kwargs["Bucket"] == S3TestConfig.S3_BUCKET
    assert kwargs["Key"] == image_url.rsplit("/", 1)[-1]
    assert kwargs["ContentType"] == "image/png"
    assert len(kwargs["Body"]) > 0

    with app.app_context():
        _db.drop_all()
