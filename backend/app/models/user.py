from datetime import datetime, timezone

from app.extensions import db


class Role:
    ADMIN = "admin"
    ORGANIZER = "organizer"
    ATTENDEE = "attendee"
    ALL = (ADMIN, ORGANIZER, ATTENDEE)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(*Role.ALL, name="user_role"), nullable=False)

    # Organizers must be approved by an admin before they can publish events.
    # Irrelevant for admin/attendee accounts.
    is_verified_organizer = db.Column(db.Boolean, nullable=False, default=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    events = db.relationship("Event", back_populates="organizer", foreign_keys="Event.organizer_id")
    bookings = db.relationship("Booking", back_populates="attendee", foreign_keys="Booking.attendee_id")

    def to_public_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_verified_organizer": self.is_verified_organizer,
            "created_at": self.created_at.isoformat(),
        }
