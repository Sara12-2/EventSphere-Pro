# Dev-oriented image: runs the Flask debug server with source bind-mounted
# for hot reload (see ../docker-compose.yml). Not a production image.
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY . .

ENV PYTHONUNBUFFERED=1

EXPOSE 5057

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["python", "run.py"]
