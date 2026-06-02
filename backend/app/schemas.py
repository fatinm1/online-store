from marshmallow import Schema, fields, validate, EXCLUDE

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
