from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_validation_error(err):
        return jsonify({"error": "validation_error", "message": "Invalid input.", "fields": err.messages}), 422

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        return jsonify({"error": err.name.lower().replace(" ", "_"), "message": err.description}), err.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(err):
        app.logger.exception("Unhandled exception")
        return jsonify({"error": "internal_server_error", "message": "Something went wrong. Please try again."}), 500
