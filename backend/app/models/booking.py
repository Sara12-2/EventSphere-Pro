from datetime import datetime, timezone

from app.extensions import db


class BookingStatus:
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    ALL = (CONFIRMED, CANCELLED)


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False, index=True)
    attendee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    quantity = db.Column(db.Integer, nullable=False, default=1)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum(*BookingStatus.ALL, name="booking_status"), nullable=False, default=BookingStatus.CONFIRMED)
    ticket_code = db.Column(db.String(20), nullable=False, unique=True, index=True)

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    event = db.relationship("Event", back_populates="bookings")
    attendee = db.relationship("User", back_populates="bookings", foreign_keys=[attendee_id])

    def to_dict(self, include_event=False):
        data = {
            "id": self.id,
            "event_id": self.event_id,
            "attendee_id": self.attendee_id,
            "quantity": self.quantity,
            "total_amount": str(self.total_amount),
            "status": self.status,
            "ticket_code": self.ticket_code,
            "created_at": self.created_at.isoformat(),
        }
        if include_event and self.event:
            data["event"] = self.event.to_dict()
        return data
