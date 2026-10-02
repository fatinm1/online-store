import os

import boto3


def save_product_image(app, filename: str, data: bytes, content_type: str) -> str:
    """Persist an already-validated, already-re-encoded image and return its
    public URL.

    Uses S3-compatible object storage (e.g. Supabase Storage) when S3_BUCKET
    is configured; falls back to local disk otherwise. Local disk is fine
    for dev, but NOT for Railway/Heroku-style deployments with an ephemeral
    filesystem -- every admin-uploaded image would be lost on the next
    deploy or restart, so ProductionConfig.validate() requires S3 config.
    """
    bucket = app.config.get("S3_BUCKET")
    if bucket:
        return _save_to_s3(app, bucket, filename, data, content_type)
    return _save_to_disk(app, filename, data)


def _save_to_disk(app, filename: str, data: bytes) -> str:
    upload_folder = app.config.get("UPLOAD_FOLDER", "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    with open(os.path.join(upload_folder, filename), "wb") as f:
        f.write(data)
    return f"/uploads/{filename}"


def _save_to_s3(app, bucket: str, filename: str, data: bytes, content_type: str) -> str:
    client = boto3.client(
        "s3",
        endpoint_url=app.config["S3_ENDPOINT_URL"],
        aws_access_key_id=app.config["S3_ACCESS_KEY_ID"],
        aws_secret_access_key=app.config["S3_SECRET_ACCESS_KEY"],
        region_name=app.config.get("S3_REGION", "us-east-1"),
    )
    client.put_object(
        Bucket=bucket,
        Key=filename,
        Body=data,
        ContentType=content_type,
        CacheControl="public, max-age=31536000, immutable",
    )
    base = app.config["S3_PUBLIC_URL_BASE"].rstrip("/")
    return f"{base}/{filename}"
