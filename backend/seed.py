import os

from dotenv import load_dotenv

load_dotenv()

from app import create_app  # noqa: E402
from app.extensions import bcrypt, db  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.user import Role, User  # noqa: E402

DEFAULT_CATEGORIES = [
    ("Conferences", "conferences"),
    ("Concerts", "concerts"),
    ("Workshops", "workshops"),
    ("Weddings", "weddings"),
]


def seed():
    app = create_app(os.environ.get("FLASK_ENV", "development"))
    with app.app_context():
        for name, slug in DEFAULT_CATEGORIES:
            if not Category.query.filter_by(slug=slug).first():
                db.session.add(Category(name=name, slug=slug))

        admin_email = os.environ.get("ADMIN_EMAIL", "admin@eventspherepro.test").lower()
        if not User.query.filter_by(email=admin_email).first():
            admin = User(
                name=os.environ.get("ADMIN_NAME", "Platform Admin"),
                email=admin_email,
                password_hash=bcrypt.generate_password_hash(os.environ.get("ADMIN_PASSWORD", "ChangeMe123!")).decode("utf-8"),
                role=Role.ADMIN,
                is_verified_organizer=False,
                is_active=True,
            )
            db.session.add(admin)

        db.session.commit()
        print("Seed complete: categories ensured, admin user ensured.")


if __name__ == "__main__":
    seed()
