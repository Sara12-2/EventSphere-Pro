import re

from marshmallow import RAISE, Schema, fields, validate, ValidationError

from app.models.user import Role


def validate_password_strength(value):
    if len(value) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Za-z]", value):
        raise ValidationError("Password must contain at least one letter.")
    if not re.search(r"\d", value):
        raise ValidationError("Password must contain at least one digit.")


class RegisterSchema(Schema):
    class Meta:
        unknown = RAISE

    name = fields.String(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate_password_strength, load_only=True)
    # Admin accounts are seeded, never self-registered.
    role = fields.String(required=True, validate=validate.OneOf([Role.ORGANIZER, Role.ATTENDEE]))


class LoginSchema(Schema):
    class Meta:
        unknown = RAISE

    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)
