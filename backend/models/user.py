from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    avatar: Optional[str] = None
    provider: str = "email"  # email or google
    createdAt: datetime

    class Config:
        populate_by_name = True

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class GoogleUser(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None
    google_id: str
