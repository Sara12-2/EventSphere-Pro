from marshmallow import RAISE, Schema, fields, validate


class CategorySchema(Schema):
    class Meta:
        unknown = RAISE

    name = fields.String(required=True, validate=validate.Length(min=2, max=80))
    slug = fields.String(
        required=True,
        validate=validate.Regexp(r"^[a-z0-9]+(-[a-z0-9]+)*$", error="Slug must be lowercase, alphanumeric, hyphen-separated."),
    )
