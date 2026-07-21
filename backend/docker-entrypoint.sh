#!/bin/sh
set -e

echo "Waiting for database migrations..."
flask db upgrade

echo "Seeding categories and admin user..."
python seed.py

exec "$@"
