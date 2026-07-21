import os

from dotenv import load_dotenv

load_dotenv()

from app import create_app  # noqa: E402

app = create_app(os.environ.get("FLASK_ENV", "development"))

if __name__ == "__main__":
    app.run(
        debug=app.config.get("DEBUG", False),
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", 5057)),
    )
