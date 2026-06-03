import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    res = await client.post("/api/v1/auth/signup", json={
        "email": "test@example.com",
        "password": "Secret123!",
        "full_name": "Test User",
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@example.com", "password": "pass", "full_name": "Dup"}
    await client.post("/api/v1/auth/signup", json=payload)
    res = await client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_signin(client: AsyncClient):
    await client.post("/api/v1/auth/signup", json={
        "email": "signin@example.com", "password": "pass123", "full_name": "Sign In"
    })
    res = await client.post("/api/v1/auth/signin", json={
        "email": "signin@example.com", "password": "pass123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_signin_bad_password(client: AsyncClient):
    res = await client.post("/api/v1/auth/signin", json={
        "email": "noone@example.com", "password": "wrong"
    })
    assert res.status_code == 401
