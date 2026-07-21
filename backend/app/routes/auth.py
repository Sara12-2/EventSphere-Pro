from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
    set_refresh_cookies,
    unset_jwt_cookies,
)

from app.decorators import any_authenticated
from app.extensions import bcrypt, db, limiter
from app.models.user import User
from app.schemas.auth_schemas import LoginSchema, RegisterSchema

auth_bp = Blueprint("auth", __name__)

register_schema = RegisterSchema()
login_schema = LoginSchema()


def _issue_tokens(user):
    claims = {"role": user.role}
    access_token = create_access_token(identity=str(user.id), additional_claims=claims)
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims=claims)
    return access_token, refresh_token


@auth_bp.post("/register")
@limiter.limit("5 per minute")
def register():
    data = register_schema.load(request.get_json(force=True, silent=True) or {})

    if User.query.filter_by(email=data["email"].lower()).first():
        # Generic message — do not confirm whether the email is already registered.
        return jsonify({"error": "registration_failed", "message": "Unable to complete registration with the given details."}), 409

    user = User(
        name=data["name"].strip(),
        email=data["email"].lower(),
        password_hash=bcrypt.generate_password_hash(data["password"]).decode("utf-8"),
        role=data["role"],
    )
    db.session.add(user)
    db.session.commit()

    access_token, refresh_token = _issue_tokens(user)
    response = jsonify({"user": user.to_public_dict(), "access_token": access_token})
    set_refresh_cookies(response, refresh_token)
    return response, 201


@auth_bp.post("/login")
@limiter.limit("8 per minute")
def login():
    data = login_schema.load(request.get_json(force=True, silent=True) or {})

    user = User.query.filter_by(email=data["email"].lower()).first()
    if not user or not user.is_active or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "invalid_credentials", "message": "Incorrect email or password."}), 401

    access_token, refresh_token = _issue_tokens(user)
    response = jsonify({"user": user.to_public_dict(), "access_token": access_token})
    set_refresh_cookies(response, refresh_token)
    return response, 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True, locations=["cookies"])
def refresh():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        return jsonify({"error": "invalid_session", "message": "Session is no longer valid."}), 401

    access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"access_token": access_token, "user": user.to_public_dict()})


@auth_bp.post("/logout")
@jwt_required(refresh=True, locations=["cookies"])
def logout():
    response = jsonify({"message": "Logged out."})
    unset_jwt_cookies(response)
    return response


@auth_bp.get("/me")
@any_authenticated
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "not_found", "message": "User not found."}), 404
    return jsonify({"user": user.to_public_dict()})
