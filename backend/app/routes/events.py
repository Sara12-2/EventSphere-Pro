from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.decorators import current_user_id, roles_required
from app.extensions import db
from app.models.category import Category
from app.models.event import Event, EventStatus
from app.models.user import Role, User
from app.schemas.event_schemas import EventCreateSchema, EventUpdateSchema

events_bp = Blueprint("events", __name__)

event_create_schema = EventCreateSchema()
event_update_schema = EventUpdateSchema()


def _get_owned_event_or_error(event_id, user_id, allow_admin_role=None):
    event = db.session.get(Event, event_id)
    if not event:
        return None, (jsonify({"error": "not_found", "message": "Event not found."}), 404)
    if event.organizer_id != user_id and allow_admin_role != Role.ADMIN:
        return None, (jsonify({"error": "forbidden", "message": "You do not own this event."}), 403)
    return event, None


@events_bp.get("/categories")
def list_public_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({"categories": [c.to_dict() for c in categories]})


@events_bp.get("/events")
def list_events():
    query = Event.query.filter(Event.status == EventStatus.PUBLISHED)

    category_slug = request.args.get("category")
    if category_slug and category_slug.lower() != "all":
        query = query.join(Category).filter(Category.slug == category_slug)

    city = request.args.get("city")
    if city:
        query = query.filter(Event.city.ilike(f"%{city}%"))

    search = request.args.get("q")
    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(Event.title.ilike(like), Event.venue.ilike(like), Event.city.ilike(like)))

    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", 12, type=int), 1), 50)

    query = query.order_by(Event.date_time.asc())
    total = query.count()
    events = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify(
        {
            "events": [e.to_dict(include_organizer=True) for e in events],
            "page": page,
            "per_page": per_page,
            "total": total,
        }
    )


@events_bp.get("/events/mine")
@roles_required(Role.ORGANIZER)
def list_my_events():
    events = Event.query.filter_by(organizer_id=current_user_id()).order_by(Event.created_at.desc()).all()
    return jsonify({"events": [e.to_dict() for e in events]})


@events_bp.get("/events/<int:event_id>")
def get_event(event_id):
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"error": "not_found", "message": "Event not found."}), 404

    if event.status != EventStatus.PUBLISHED:
        # Draft/closed events are only visible to their owner or an admin.
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            uid = int(get_jwt_identity())
        except Exception:
            return jsonify({"error": "not_found", "message": "Event not found."}), 404
        if event.organizer_id != uid and claims.get("role") != Role.ADMIN:
            return jsonify({"error": "not_found", "message": "Event not found."}), 404

    return jsonify({"event": event.to_dict(include_organizer=True)})


@events_bp.post("/events")
@roles_required(Role.ORGANIZER)
def create_event():
    user = db.session.get(User, current_user_id())
    data = event_create_schema.load(request.get_json(force=True, silent=True) or {})

    category = db.session.get(Category, data["category_id"])
    if not category:
        return jsonify({"error": "validation_error", "message": "Invalid category.", "fields": {"category_id": ["Category does not exist."]}}), 422

    # Unverified organizers can save drafts, but nothing goes live until an admin approves them.
    status = EventStatus.DRAFT

    event = Event(
        organizer_id=user.id,
        category_id=category.id,
        title=data["title"].strip(),
        description=data.get("description", ""),
        venue=data["venue"].strip(),
        city=data["city"].strip(),
        date_time=data["date_time"],
        capacity=data["capacity"],
        price=data["price"],
        status=status,
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({"event": event.to_dict()}), 201


@events_bp.patch("/events/<int:event_id>")
@roles_required(Role.ORGANIZER, Role.ADMIN)
def update_event(event_id):
    claims = get_jwt()
    user_id = current_user_id()
    event, error = _get_owned_event_or_error(event_id, user_id, allow_admin_role=claims.get("role"))
    if error:
        return error

    data = event_update_schema.load(request.get_json(force=True, silent=True) or {})

    if "category_id" in data:
        category = db.session.get(Category, data["category_id"])
        if not category:
            return jsonify({"error": "validation_error", "message": "Invalid category.", "fields": {"category_id": ["Category does not exist."]}}), 422
        event.category_id = category.id

    if "capacity" in data and data["capacity"] < event.seats_booked:
        return jsonify({"error": "validation_error", "message": "Invalid capacity.", "fields": {"capacity": ["Capacity cannot be lower than seats already booked."]}}), 422

    if "status" in data and data["status"] == EventStatus.PUBLISHED:
        user = db.session.get(User, user_id) if claims.get("role") == Role.ORGANIZER else event.organizer
        if not user.is_verified_organizer:
            return jsonify({"error": "forbidden", "message": "Your organizer account is not yet approved to publish events."}), 403

    for field in ("title", "description", "venue", "city", "date_time", "capacity", "price", "status"):
        if field in data:
            setattr(event, field, data[field])

    db.session.commit()
    return jsonify({"event": event.to_dict()})


@events_bp.delete("/events/<int:event_id>")
@roles_required(Role.ORGANIZER, Role.ADMIN)
def delete_event(event_id):
    claims = get_jwt()
    event, error = _get_owned_event_or_error(event_id, current_user_id(), allow_admin_role=claims.get("role"))
    if error:
        return error

    db.session.delete(event)
    db.session.commit()
    return "", 204
