from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request


def roles_required(*roles):
    """Require a valid access token whose role claim is one of `roles`."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in roles:
                return jsonify({"error": "forbidden", "message": "You do not have permission to perform this action."}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def any_authenticated(fn):
    """Require a valid access token, any role."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)

    return wrapper


def current_user_id():
    return int(get_jwt_identity())
