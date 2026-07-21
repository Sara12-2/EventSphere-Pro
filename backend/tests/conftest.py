import pytest

from app import create_app
from app.extensions import bcrypt, db as _db
from app.models.category import Category
from app.models.user import Role, User


@pytest.fixture()
def app():
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def category(app):
    with app.app_context():
        cat = Category(name="Conferences", slug="conferences")
        _db.session.add(cat)
        _db.session.commit()
        return cat.id


@pytest.fixture()
def admin_user(app):
    with app.app_context():
        admin = User(
            name="Platform Admin",
            email="admin@test.local",
            password_hash=bcrypt.generate_password_hash("AdminPass123").decode("utf-8"),
            role=Role.ADMIN,
            is_verified_organizer=False,
            is_active=True,
        )
        _db.session.add(admin)
        _db.session.commit()
        return admin.id


