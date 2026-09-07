"""Seed sample products and one admin user."""
import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.extensions import db
from app.models import Product, AdminUser
from app.security import hash_password

SAMPLE_PRODUCTS = [
    {
        "slug": "midnight-abaya",
        "name": "Midnight Abaya",
        "category": "abaya",
        "description": "A flowing open-front abaya in deep midnight blue with subtle pleating.",
        "price_cents": 28500,
        "stock": 12,
        "image_url": "https://images.pexels.com/photos/7148620/pexels-photo-7148620.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "ivory-abaya",
        "name": "Ivory Drape Abaya",
        "category": "abaya",
        "description": "Ivory crepe abaya with a draped front and wide sleeves.",
        "price_cents": 32000,
        "stock": 8,
        "image_url": "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "classic-thobe",
        "name": "Classic White Thobe",
        "category": "thobe",
        "description": "Pristine white cotton thobe with a mandarin collar and fine embroidery.",
        "price_cents": 19500,
        "stock": 20,
        "image_url": "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "charcoal-thobe",
        "name": "Charcoal Linen Thobe",
        "category": "thobe",
        "description": "Contemporary linen thobe in charcoal grey, relaxed fit.",
        "price_cents": 22000,
        "stock": 15,
        "image_url": "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "pearl-pin",
        "name": "Pearl Hijab Pin Set",
        "category": "accessory",
        "description": "Set of three lustrous faux-pearl hijab pins in gold tone.",
        "price_cents": 1800,
        "stock": 50,
        "image_url": "https://images.pexels.com/photos/3266700/pexels-photo-3266700.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "prayer-beads",
        "name": "Sandalwood Tasbih",
        "category": "accessory",
        "description": "33-bead tasbih in fragrant sandalwood with a silver separator.",
        "price_cents": 3500,
        "stock": 30,
        "image_url": "https://images.pexels.com/photos/4498162/pexels-photo-4498162.jpeg?w=600&h=800&fit=crop",
    },
    # ── New products ──────────────────────────────────────────────────────────
    {
        "slug": "sage-abaya",
        "name": "Sage Wrap Abaya",
        "category": "abaya",
        "description": "Soft sage-green abaya with a wrap silhouette and flared cuffs, cut from lightweight chiffon.",
        "price_cents": 26000,
        "stock": 10,
        "image_url": "https://images.pexels.com/photos/7691043/pexels-photo-7691043.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "onyx-embroidered-abaya",
        "name": "Onyx Embroidered Abaya",
        "category": "abaya",
        "description": "Black closed-front abaya with delicate gold thread embroidery along the cuffs and hem.",
        "price_cents": 38500,
        "stock": 0,
        "image_url": "https://images.pexels.com/photos/8838944/pexels-photo-8838944.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "taupe-abaya",
        "name": "Taupe Relaxed Abaya",
        "category": "abaya",
        "description": "Everyday taupe abaya in breathable cotton-blend with a clean minimal cut and hidden pocket.",
        "price_cents": 21500,
        "stock": 18,
        "image_url": "https://images.pexels.com/photos/13838842/pexels-photo-13838842.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "navy-thobe",
        "name": "Navy Formal Thobe",
        "category": "thobe",
        "description": "Deep navy thobe in premium cotton-polyester blend, ideal for formal occasions and Eid.",
        "price_cents": 24500,
        "stock": 9,
        "image_url": "https://images.pexels.com/photos/8164508/pexels-photo-8164508.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "stone-casual-thobe",
        "name": "Stone Casual Thobe",
        "category": "thobe",
        "description": "Off-white stone thobe with a relaxed collar and side-seam pockets, perfect for everyday wear.",
        "price_cents": 17000,
        "stock": 0,
        "image_url": "https://images.pexels.com/photos/8928770/pexels-photo-8928770.jpeg?w=600&h=800&fit=crop",
    },
    {
        "slug": "silk-prayer-scarf",
        "name": "Silk Prayer Scarf",
        "category": "accessory",
        "description": "Lightweight silk-blend prayer scarf in ivory, generously sized for full coverage with a soft drape.",
        "price_cents": 4800,
        "stock": 25,
        "image_url": "https://images.pexels.com/photos/7691168/pexels-photo-7691168.jpeg?w=600&h=800&fit=crop",
    },
]


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        for data in SAMPLE_PRODUCTS:
            if not Product.query.filter_by(slug=data["slug"]).first():
                db.session.add(Product(**data))

        admin_email = os.environ.get("ADMIN_EMAIL", "admin@numme.com")
        admin_password = os.environ.get("ADMIN_PASSWORD", "change-me-now")

        if not AdminUser.query.filter_by(email=admin_email).first():
            db.session.add(AdminUser(
                email=admin_email,
                password_hash=hash_password(admin_password),
            ))

        db.session.commit()
        total = Product.query.count()
        print(f"Seed complete. {total} products in database.")


if __name__ == "__main__":
    seed()
