def test_dashboard(client):
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "weekly_sales" in data
