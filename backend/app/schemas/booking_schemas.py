from marshmallow import RAISE, Schema, fields, validate


class BookingCreateSchema(Schema):
    class Meta:
        unknown = RAISE

    quantity = fields.Integer(required=False, load_default=1, validate=validate.Range(min=1, max=20))
