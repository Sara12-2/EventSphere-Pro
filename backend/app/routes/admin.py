from flask import Blueprint, jsonify, request

from app.decorators import roles_required
from app.extensions import db
from app.models.category import Category
from app.models.user import Role, User
from app.schemas.category_schemas import CategorySchema

admin_bp = Blueprint("admin", __name__)

category_schema = CategorySchema()


@admin_bp.get("/organizers/pending")
@roles_required(Role.ADMIN)
def pending_organizers():
    organizers = User.query.filter_by(role=Role.ORGANIZER, is_verified_organizer=False).order_by(User.created_at.asc()).all()
    return jsonify({"organizers": [o.to_public_dict() for o in organizers]})


@admin_bp.post("/organizers/<int:user_id>/approve")
@roles_required(Role.ADMIN)
def approve_organizer(user_id):
    user = db.session.get(User, user_id)
    if not user or user.role != Role.ORGANIZER:
        return jsonify({"error": "not_found", "message": "Organizer not found."}), 404

    user.is_verified_organizer = True
    db.session.commit()
    return jsonify({"user": user.to_public_dict()})


@admin_bp.get("/categories")
@roles_required(Role.ADMIN)
def list_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({"categories": [c.to_dict() for c in categories]})


@admin_bp.post("/categories")
@roles_required(Role.ADMIN)
def create_category():
    data = category_schema.load(request.get_json(force=True, silent=True) or {})
    if Category.query.filter((Category.name == data["name"]) | (Category.slug == data["slug"])).first():
        return jsonify({"error": "conflict", "message": "A category with that name or slug already exists."}), 409

    category = Category(name=data["name"], slug=data["slug"])
    db.session.add(category)
    db.session.commit()
    return jsonify({"category": category.to_dict()}), 201


@admin_bp.patch("/categories/<int:category_id>")
@roles_required(Role.ADMIN)
def update_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "not_found", "message": "Category not found."}), 404

    data = category_schema.load(request.get_json(force=True, silent=True) or {}, partial=True)
    if "name" in data:
        category.name = data["name"]
    if "slug" in data:
        category.slug = data["slug"]

    db.session.commit()
    return jsonify({"category": category.to_dict()})


@admin_bp.delete("/categories/<int:category_id>")
@roles_required(Role.ADMIN)
def delete_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "not_found", "message": "Category not found."}), 404
    if category.events:
        return jsonify({"error": "conflict", "message": "Cannot delete a category that still has events."}), 409

    db.session.delete(category)
    db.session.commit()
    return "", 204
