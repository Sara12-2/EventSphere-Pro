from datetime import datetime, timezone

from app.extensions import db


class EventStatus:
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    ALL = (DRAFT, PUBLISHED, CLOSED)


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False, index=True)

    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=False, default="")
    venue = db.Column(db.String(160), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)

    capacity = db.Column(db.Integer, nullable=False)
    seats_booked = db.Column(db.Integer, nullable=False, default=0)
    price = db.Column(db.Numeric(10, 2), nullable=False, default=0)

    status = db.Column(db.Enum(*EventStatus.ALL, name="event_status"), nullable=False, default=EventStatus.DRAFT)

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    organizer = db.relationship("User", back_populates="events", foreign_keys=[organizer_id])
    category = db.relationship("Category", back_populates="events")
    bookings = db.relationship("Booking", back_populates="event", cascade="all, delete-orphan")

    @property
    def seats_left(self):
        return self.capacity - self.seats_booked

    def to_dict(self, include_organizer=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "venue": self.venue,
            "city": self.city,
            "date_time": self.date_time.isoformat(),
            "capacity": self.capacity,
            "seats_booked": self.seats_booked,
            "seats_left": self.seats_left,
            "price": str(self.price),
            "status": self.status,
            "category": self.category.to_dict() if self.category else None,
            "organizer_id": self.organizer_id,
            "created_at": self.created_at.isoformat(),
        }
        if include_organizer and self.organizer:
            data["organizer"] = {"id": self.organizer.id, "name": self.organizer.name}
        return data
