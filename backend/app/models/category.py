from app.extensions import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)
    slug = db.Column(db.String(80), nullable=False, unique=True)

    events = db.relationship("Event", back_populates="category")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "slug": self.slug}
