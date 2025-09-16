# users.py
from fastapi import APIRouter, HTTPException
from models import UserCreate, UserLogin
from database import user_collection
from auth import create_access_token
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
def register(user: UserCreate):
    if user_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    hashed_password = pwd_context.hash(user.password)
    user_collection.insert_one({
        "username": user.username,
        "email": user.email,
        "password": hashed_password
    })

    token = create_access_token({"sub": user.email})
    return {"access_token": token}

@router.post("/login")
def login(user: UserLogin):
    db_user = user_collection.find_one({"username": user.username})
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    token = create_access_token({"sub": db_user["email"]})  # use db_user, not user here
    
    return {
        "access_token": token,
        "user": {
            "username": db_user["username"],
            "email": db_user["email"]
        }
    }
