import os
from datetime import timedelta


class BaseConfig:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me-please-in-prod")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-me-please-in-prod-32b")

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg2://eventsphere:eventsphere@localhost:5432/eventsphere",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    # Access tokens travel in the Authorization header only (frontend keeps
    # them in memory). Only the refresh token is ever set as a cookie, and
    # only the /auth/refresh + /auth/logout routes request the cookie
    # location explicitly — this keeps the CSRF-protected surface minimal.
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_REFRESH_COOKIE_PATH = "/api/auth"
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_SECURE = os.environ.get("FLASK_ENV") == "production"

    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

    RATELIMIT_STORAGE_URI = os.environ.get("RATELIMIT_STORAGE_URI", "memory://")


class DevConfig(BaseConfig):
    DEBUG = True


class TestConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_COOKIE_CSRF_PROTECT = False
    RATELIMIT_ENABLED = False
    PROPAGATE_EXCEPTIONS = False


class ProdConfig(BaseConfig):
    DEBUG = False


config_by_name = {
    "development": DevConfig,
    "testing": TestConfig,
    "production": ProdConfig,
}
