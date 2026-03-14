from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import bcrypt
import jwt
import os
from db.mongodb_client import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.environ.get("JWT_SECRET", "change-this-secret-in-production")
JWT_EXPIRES_HOURS = 72

class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def make_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRES_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def safe_user(doc: dict) -> dict:
    return {
        "id":        str(doc["_id"]),
        "full_name": doc.get("full_name"),
        "email":     doc.get("email"),
        "role":      doc.get("role"),
        "phone":     doc.get("phone"),
    }

@router.post("/signup")
async def signup(data: SignupRequest):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    if db["users"].find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    new_user = {
        "full_name":  data.full_name,
        "email":      data.email,
        "password":   hashed,
        "role":       data.role,
        "phone":      data.phone,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = db["users"].insert_one(new_user)
    new_user["_id"] = result.inserted_id
    db["profiles"].insert_one({
        "user_id":    str(result.inserted_id),
        "full_name":  data.full_name,
        "role":       data.role,
        "region":     "Not set",
        "updated_at": datetime.utcnow().isoformat(),
    })
    token = make_token(str(result.inserted_id), data.email, data.role)
    return {"token": token, "user": safe_user(new_user)}

@router.post("/login")
async def login(data: LoginRequest):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    user = db["users"].find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not bcrypt.checkpw(data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = make_token(str(user["_id"]), user["email"], user["role"])
    return {"token": token, "user": safe_user(user)}
