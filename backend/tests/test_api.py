FUTURE_DATE = "2030-06-15T18:00:00+00:00"


def register(client, name, email, password, role):
    return client.post("/api/auth/register", json={"name": name, "email": email, "password": password, "role": role})


def login(client, email, password):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def auth_header(access_token):
    return {"Authorization": f"Bearer {access_token}"}


def login_as_admin(client, admin_user):
    resp = login(client, "admin@test.local", "AdminPass123")
    assert resp.status_code == 200
    return resp.get_json()["access_token"]


def _register_and_login(client, name, email, password, role):
    reg = register(client, name, email, password, role)
    assert reg.status_code == 201, reg.get_json()
    log = login(client, email, password)
    assert log.status_code == 200
    return log.get_json()["access_token"]


def _create_draft_event(client, organizer_token, category_id, **overrides):
    payload = {
        "title": "AI Summit 2030",
        "description": "A summit about AI.",
        "venue": "Expo Center",
        "city": "Lahore",
        "date_time": FUTURE_DATE,
        "capacity": 5,
        "price": "1000.00",
        "category_id": category_id,
    }
    payload.update(overrides)
    resp = client.post("/api/events", json=payload, headers=auth_header(organizer_token))
    return resp


def test_register_and_login_roundtrip(client):
    token = _register_and_login(client, "Sara Organizer", "sara@test.local", "Passw0rd!", "organizer")
    me = client.get("/api/auth/me", headers=auth_header(token))
    assert me.status_code == 200
    body = me.get_json()["user"]
    assert body["email"] == "sara@test.local"
    assert body["role"] == "organizer"
    assert "password" not in body


def test_duplicate_email_registration_rejected(client):
    register(client, "Sara", "dup@test.local", "Passw0rd!", "organizer")
    second = register(client, "Sara Clone", "dup@test.local", "Passw0rd!", "attendee")
    assert second.status_code == 409


def test_weak_password_rejected(client):
    resp = register(client, "Weak Pw", "weak@test.local", "abc", "organizer")
    assert resp.status_code == 422


def test_admin_role_cannot_self_register(client):
    resp = register(client, "Sneaky", "sneaky@test.local", "Passw0rd!", "admin")
    assert resp.status_code == 422


def test_event_stays_draft_until_organizer_verified_then_can_publish(client, category, admin_user):
    organizer_token = _register_and_login(client, "Sara Organizer", "sara2@test.local", "Passw0rd!", "organizer")

    created = _create_draft_event(client, organizer_token, category)
    assert created.status_code == 201
    event = created.get_json()["event"]
    assert event["status"] == "draft"
    event_id = event["id"]

    publish_attempt = client.patch(f"/api/events/{event_id}", json={"status": "published"}, headers=auth_header(organizer_token))
    assert publish_attempt.status_code == 403

    admin_token = login_as_admin(client, admin_user)
    me = client.get("/api/auth/me", headers=auth_header(organizer_token)).get_json()["user"]
    approve = client.post(f"/api/admin/organizers/{me['id']}/approve", headers=auth_header(admin_token))
    assert approve.status_code == 200

    publish_ok = client.patch(f"/api/events/{event_id}", json={"status": "published"}, headers=auth_header(organizer_token))
    assert publish_ok.status_code == 200
    assert publish_ok.get_json()["event"]["status"] == "published"

    listing = client.get("/api/events")
    assert listing.status_code == 200
    ids = [e["id"] for e in listing.get_json()["events"]]
    assert event_id in ids


def _publish_event(client, organizer_token, admin_token, category, capacity=3, price="500.00"):
    created = _create_draft_event(client, organizer_token, category, capacity=capacity, price=price)
    event_id = created.get_json()["event"]["id"]
    me = client.get("/api/auth/me", headers=auth_header(organizer_token)).get_json()["user"]
    client.post(f"/api/admin/organizers/{me['id']}/approve", headers=auth_header(admin_token))
    client.patch(f"/api/events/{event_id}", json={"status": "published"}, headers=auth_header(organizer_token))
    return event_id


def test_booking_flow_with_overbooking_rejected_and_cancel_restores_seats(client, category, admin_user):
    organizer_token = _register_and_login(client, "Owen Organizer", "owen@test.local", "Passw0rd!", "organizer")
    admin_token = login_as_admin(client, admin_user)
    event_id = _publish_event(client, organizer_token, admin_token, category, capacity=3)

    attendee_token = _register_and_login(client, "Amy Attendee", "amy@test.local", "Passw0rd!", "attendee")

    book = client.post(f"/api/events/{event_id}/bookings", json={"quantity": 2}, headers=auth_header(attendee_token))
    assert book.status_code == 201
    booking = book.get_json()["booking"]
    assert booking["quantity"] == 2
    assert booking["ticket_code"].startswith("ES-")

    event_after = client.get(f"/api/events/{event_id}").get_json()["event"]
    assert event_after["seats_left"] == 1

    overbook = client.post(f"/api/events/{event_id}/bookings", json={"quantity": 2}, headers=auth_header(attendee_token))
    assert overbook.status_code == 409

    cancel = client.patch(f"/api/bookings/{booking['id']}/cancel", headers=auth_header(attendee_token))
    assert cancel.status_code == 200
    assert cancel.get_json()["booking"]["status"] == "cancelled"

    event_restored = client.get(f"/api/events/{event_id}").get_json()["event"]
    assert event_restored["seats_left"] == 3


def test_attendee_cannot_create_event(client, category):
    attendee_token = _register_and_login(client, "Amy Attendee", "amy2@test.local", "Passw0rd!", "attendee")
    resp = _create_draft_event(client, attendee_token, category)
    assert resp.status_code == 403


def test_organizer_cannot_book_event(client, category, admin_user):
    organizer_token = _register_and_login(client, "Owen Organizer", "owen2@test.local", "Passw0rd!", "organizer")
    admin_token = login_as_admin(client, admin_user)
    event_id = _publish_event(client, organizer_token, admin_token, category)

    resp = client.post(f"/api/events/{event_id}/bookings", json={"quantity": 1}, headers=auth_header(organizer_token))
    assert resp.status_code == 403


def test_organizer_cannot_edit_or_delete_events_they_do_not_own(client, category, admin_user):
    owner_token = _register_and_login(client, "Owner", "owner@test.local", "Passw0rd!", "organizer")
    other_token = _register_and_login(client, "Other", "other@test.local", "Passw0rd!", "organizer")

    created = _create_draft_event(client, owner_token, category)
    event_id = created.get_json()["event"]["id"]

    edit_attempt = client.patch(f"/api/events/{event_id}", json={"title": "Hijacked title"}, headers=auth_header(other_token))
    assert edit_attempt.status_code == 403

    delete_attempt = client.delete(f"/api/events/{event_id}", headers=auth_header(other_token))
    assert delete_attempt.status_code == 403


def test_unauthenticated_requests_rejected(client, category):
    resp = client.post("/api/events", json={"title": "x"})
    assert resp.status_code == 401

    resp2 = client.get("/api/events/mine")
    assert resp2.status_code == 401


def test_refresh_token_flow(client):
    register(client, "Rae Refresh", "rae@test.local", "Passw0rd!", "attendee")
    log = login(client, "rae@test.local", "Passw0rd!")
    assert log.status_code == 200

    refresh = client.post("/api/auth/refresh")
    assert refresh.status_code == 200
    assert "access_token" in refresh.get_json()

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200

    refresh_after_logout = client.post("/api/auth/refresh")
    assert refresh_after_logout.status_code == 401
