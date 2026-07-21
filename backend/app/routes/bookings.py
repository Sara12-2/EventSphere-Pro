import secrets
import string

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt

from app.decorators import current_user_id, roles_required
from app.extensions import db
from app.models.booking import Booking, BookingStatus
from app.models.event import Event, EventStatus
from app.models.user import Role
from app.schemas.booking_schemas import BookingCreateSchema

bookings_bp = Blueprint("bookings", __name__)

booking_create_schema = BookingCreateSchema()


def _generate_ticket_code():
    for _ in range(10):
        candidate = "ES-" + "".join(secrets.choice(string.digits) for _ in range(5))
        if not Booking.query.filter_by(ticket_code=candidate).first():
            return candidate
    raise RuntimeError("Could not generate a unique ticket code.")


@bookings_bp.post("/events/<int:event_id>/bookings")
@roles_required(Role.ATTENDEE)
def create_booking(event_id):
    data = booking_create_schema.load(request.get_json(force=True, silent=True) or {})
    quantity = data["quantity"]

    event_query = Event.query.filter_by(id=event_id)
    try:
        event = event_query.with_for_update().first()
    except Exception:
        db.session.rollback()
        event = event_query.first()

    if not event or event.status != EventStatus.PUBLISHED:
        return jsonify({"error": "not_found", "message": "Event not found."}), 404

    if event.seats_left < quantity:
        return jsonify({"error": "sold_out", "message": f"Only {event.seats_left} seat(s) left for this event."}), 409

    booking = Booking(
        event_id=event.id,
        attendee_id=current_user_id(),
        quantity=quantity,
        total_amount=event.price * quantity,
        status=BookingStatus.CONFIRMED,
        ticket_code=_generate_ticket_code(),
    )
    event.seats_booked += quantity

    db.session.add(booking)
    db.session.commit()
    return jsonify({"booking": booking.to_dict(include_event=True)}), 201


@bookings_bp.get("/bookings/mine")
@roles_required(Role.ATTENDEE)
def list_my_bookings():
    bookings = (
        Booking.query.filter_by(attendee_id=current_user_id())
        .order_by(Booking.created_at.desc())
        .all()
    )
    return jsonify({"bookings": [b.to_dict(include_event=True) for b in bookings]})


@bookings_bp.get("/events/<int:event_id>/bookings")
@roles_required(Role.ORGANIZER, Role.ADMIN)
def list_event_bookings(event_id):
    claims = get_jwt()
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"error": "not_found", "message": "Event not found."}), 404
    if event.organizer_id != current_user_id() and claims.get("role") != Role.ADMIN:
        return jsonify({"error": "forbidden", "message": "You do not own this event."}), 403

    bookings = Booking.query.filter_by(event_id=event_id).order_by(Booking.created_at.desc()).all()
    return jsonify({"bookings": [b.to_dict() for b in bookings]})


@bookings_bp.patch("/bookings/<int:booking_id>/cancel")
@roles_required(Role.ATTENDEE)
def cancel_booking(booking_id):
    booking = db.session.get(Booking, booking_id)
    if not booking or booking.attendee_id != current_user_id():
        return jsonify({"error": "not_found", "message": "Booking not found."}), 404

    if booking.status == BookingStatus.CANCELLED:
        return jsonify({"error": "already_cancelled", "message": "This booking is already cancelled."}), 409

    booking.status = BookingStatus.CANCELLED
    if booking.event:
        booking.event.seats_booked = max(0, booking.event.seats_booked - booking.quantity)

    db.session.commit()
    return jsonify({"booking": booking.to_dict(include_event=True)})
