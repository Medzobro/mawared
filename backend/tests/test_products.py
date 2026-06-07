import pytest

def test_list_products(client):
    res = client.get("/api/products")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data

def test_create_product(client):
    res = client.post("/api/products", json={
        "name": "Test Product", "sku": "TST-001", "barcode": "1234567890123",
        "category": "Test", "price": 100, "cost": 50, "stock": 10,
        "min_stock": 2, "unit": "piece", "is_pharmacy": False,
        "prescription": False, "supplier": "Test", "status": "active"
    })
    assert res.status_code == 200
    assert res.json()["name"] == "Test Product"

def test_duplicate_sku(client):
    p = {"name": "A", "sku": "DUP", "barcode": "111", "category": "T", "price": 10, "cost": 5, "stock": 5, "min_stock": 1, "unit": "pc", "is_pharmacy": False, "prescription": False, "supplier": "", "status": "active"}
    client.post("/api/products", json=p)
    res = client.post("/api/products", json={**p, "barcode": "222"})
    assert res.status_code == 400
