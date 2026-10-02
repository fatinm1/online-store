import json
import os
import subprocess
import sys

import pytest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRIVER = os.path.join(BACKEND_DIR, "tests", "_rl_driver.py")


def _run_driver(**kwargs):
    args = [sys.executable, DRIVER]
    for key, value in kwargs.items():
        flag = f"--{key.replace('_', '-')}"
        if value is True:
            args.append(flag)
        else:
            args += [flag, str(value)]
    env = {**os.environ, "PYTHONPATH": BACKEND_DIR}
    result = subprocess.run(args, capture_output=True, text=True, timeout=30, cwd=BACKEND_DIR, env=env)
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout.strip().splitlines()[-1])


def test_admin_login_rate_limited(tmp_path):
    """The whole suite normally runs with RATELIMIT_ENABLED=False, so the
    '5 per minute' decorator on /login was never actually exercised. This
    proves it really does cut requests off."""
    statuses = _run_driver(db_path=tmp_path / "rl_login.db", endpoint="login", count=6, seed_admin=True)
    assert statuses == [401, 401, 401, 401, 401, 429]


def test_checkout_rate_limited(tmp_path):
    statuses = _run_driver(db_path=tmp_path / "rl_checkout.db", endpoint="checkout", count=11)
    assert statuses[:10] == [400] * 10
    assert statuses[10] == 429


def test_webhook_rate_limited(tmp_path):
    """The webhook route had no rate limit at all before this fix."""
    statuses = _run_driver(db_path=tmp_path / "rl_webhook.db", endpoint="webhook", count=61)
    assert statuses[:60] == [400] * 60
    assert statuses[60] == 429


@pytest.mark.skipif(
    not os.environ.get("REDIS_URL"),
    reason=(
        "Requires a real Redis instance to prove limits are shared across "
        "processes. Run with REDIS_URL set, e.g.: "
        "docker run --rm -p 6379:6379 redis:7-alpine, then "
        "REDIS_URL=redis://localhost:6379/0 pytest tests/test_rate_limits.py -k redis"
    ),
)
def test_rate_limit_shared_across_processes_via_redis(tmp_path):
    """In-memory storage is private to one process -- two gunicorn workers
    each get their own '5 per minute' bucket, so the real limit is
    workers*5. Redis storage shares one bucket across processes. Two
    genuinely separate subprocesses (standing in for two gunicorn workers)
    share one Redis and one sqlite file; the combined limit must still be 5,
    not 10."""
    import redis as redis_lib

    redis_url = os.environ["REDIS_URL"]
    redis_lib.Redis.from_url(redis_url).flushdb()
    db_path = tmp_path / "rl_redis.db"

    worker_a = _run_driver(
        db_path=db_path, endpoint="login", count=3, seed_admin=True, storage_uri=redis_url,
    )
    assert worker_a == [401, 401, 401]

    # A second, independent subprocess ("worker B") sharing the same Redis
    # and the same admin row. It has used 0 requests from its own
    # (nonexistent) in-memory counter, but Redis already has 3 recorded.
    worker_b = _run_driver(
        db_path=db_path, endpoint="login", count=3, storage_uri=redis_url,
    )
    assert worker_b == [401, 401, 429]
