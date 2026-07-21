import os

from flask import Flask, jsonify

from app.config import config_by_name
from app.errors import register_error_handlers
from app.extensions import bcrypt, cors, db, jwt, limiter, migrate


def create_app(config_name=None):
    config_name = config_name or os.environ.get("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}},
        supports_credentials=True,
    )

    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    from app.routes.bookings import bookings_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(events_bp, url_prefix="/api")
    app.register_blueprint(bookings_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    register_error_handlers(app)

    return app
