from datetime import datetime, timezone

from marshmallow import RAISE, Schema, fields, validate, ValidationError

from app.models.event import EventStatus


def validate_future_datetime(value):
    now = datetime.now(timezone.utc) if value.tzinfo else datetime.utcnow()
    if value <= now:
        raise ValidationError("Event date/time must be in the future.")


class EventCreateSchema(Schema):
    class Meta:
        unknown = RAISE

    title = fields.String(required=True, validate=validate.Length(min=3, max=160))
    description = fields.String(required=False, load_default="", validate=validate.Length(max=4000))
    venue = fields.String(required=True, validate=validate.Length(min=2, max=160))
    city = fields.String(required=True, validate=validate.Length(min=2, max=80))
    date_time = fields.DateTime(required=True, validate=validate_future_datetime)
    capacity = fields.Integer(required=True, validate=validate.Range(min=1, max=1_000_000))
    price = fields.Decimal(required=True, places=2, validate=validate.Range(min=0))
    category_id = fields.Integer(required=True, validate=validate.Range(min=1))


class EventUpdateSchema(Schema):
    class Meta:
        unknown = RAISE

    title = fields.String(validate=validate.Length(min=3, max=160))
    description = fields.String(validate=validate.Length(max=4000))
    venue = fields.String(validate=validate.Length(min=2, max=160))
    city = fields.String(validate=validate.Length(min=2, max=80))
    date_time = fields.DateTime(validate=validate_future_datetime)
    capacity = fields.Integer(validate=validate.Range(min=1, max=1_000_000))
    price = fields.Decimal(places=2, validate=validate.Range(min=0))
    category_id = fields.Integer(validate=validate.Range(min=1))
    status = fields.String(validate=validate.OneOf(EventStatus.ALL))
