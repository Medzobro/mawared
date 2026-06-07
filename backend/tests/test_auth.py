import pytest

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data

def test_register_and_login(client):
    res = client.post("/api/auth/register", json={"username": "testuser", "password": "testpass123"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert token
    
    res = client.post("/api/auth/login", json={"username": "testuser", "password": "testpass123"})
    assert res.status_code == 200
    assert res.json()["access_token"]
    
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["username"] == "testuser"

def test_duplicate_username(client):
    client.post("/api/auth/register", json={"username": "dupuser", "password": "pass123"})
    res = client.post("/api/auth/register", json={"username": "dupuser", "password": "pass123"})
    assert res.status_code == 400
