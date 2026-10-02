from marshmallow import Schema, fields, validate, pre_load, EXCLUDE

VALID_CATEGORIES = ["abaya", "thobe", "accessory"]
VALID_STATUSES = ["pending", "paid", "failed", "fulfilled"]


class CartItemSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    product_id = fields.Str(required=True, validate=validate.Length(min=1, max=32))
    quantity = fields.Int(required=True, validate=validate.Range(min=1, max=99))


class CreatePaymentIntentSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    items = fields.List(
        fields.Nested(CartItemSchema),
        required=True,
        validate=validate.Length(min=1, max=50),
    )
    email = fields.Email(load_default="", allow_none=True)
    idempotency_key = fields.Str(
        load_default=None,
        allow_none=True,
        validate=[
            validate.Length(max=128),
            validate.Regexp(r"^[A-Za-z0-9_-]+$"),
        ],
    )

    @pre_load
    def blank_email_to_none(self, data, **kwargs):
        # The email field is optional in the UI and the frontend always
        # sends "" (never omits the key) when the customer leaves it blank.
        # fields.Email() with allow_none=True only exempts None from format
        # validation, not an empty string, so every blank-email checkout was
        # rejected with 400 "Not a valid email address" -- normalize "" to
        # None here so it reaches allow_none instead of the format check.
        if isinstance(data, dict) and data.get("email") == "":
            data = {**data, "email": None}
        return data


class AdminLoginSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=1, max=200))


class ProductCreateSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    category = fields.Str(required=True, validate=validate.OneOf(VALID_CATEGORIES))
    description = fields.Str(load_default="", validate=validate.Length(max=5000))
    price_cents = fields.Int(required=True, validate=validate.Range(min=1))
    stock = fields.Int(required=True, validate=validate.Range(min=0))
    active = fields.Bool(load_default=True)


class ProductUpdateSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name = fields.Str(validate=validate.Length(min=1, max=200))
    category = fields.Str(validate=validate.OneOf(VALID_CATEGORIES))
    description = fields.Str(validate=validate.Length(max=5000))
    price_cents = fields.Int(validate=validate.Range(min=1))
    stock = fields.Int(validate=validate.Range(min=0))
    active = fields.Bool()


class OrderStatusSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    status = fields.Str(required=True, validate=validate.OneOf(VALID_STATUSES))
