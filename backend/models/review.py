from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, values):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: str = Field(..., min_length=10, max_length=500)

class ReviewCreate(ReviewBase):
    name: Optional[str] = None  # User name from frontend
    avatar: Optional[str] = None  # User avatar URL from frontend
    user_id: Optional[str] = None  # User ID for one-review-per-user tracking

class ReviewResponse(ReviewBase):
    id: str = Field(alias="_id")
    name: str
    avatar: Optional[str] = None
    user_id: Optional[str] = None
    createdAt: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ReviewStats(BaseModel):
    averageRating: float
    totalReviews: int

class ReviewListResponse(BaseModel):
    reviews: list[ReviewResponse]
    total: int
    page: int
    limit: int
