from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime
from bson import ObjectId
from database import get_collection
from models.review import ReviewCreate, ReviewResponse, ReviewStats, ReviewListResponse

router = APIRouter()

# Mock reviews for when DB is not connected
MOCK_REVIEWS = [
    {
        "_id": "1",
        "name": "Ahmed Khan",
        "rating": 5,
        "comment": "Excellent service and quality glasses! The staff was very helpful in choosing the right frame for my face. Highly recommended!",
        "avatar": None,
        "user_id": None,
        "createdAt": datetime(2026, 1, 10, 10, 0, 0),
    },
    {
        "_id": "2",
        "name": "Sara Ali",
        "rating": 5,
        "comment": "Best optical shop in the area. They have a wide variety of frames and lenses. Very professional eye testing.",
        "avatar": None,
        "user_id": None,
        "createdAt": datetime(2026, 1, 8, 14, 30, 0),
    },
    {
        "_id": "3",
        "name": "Muhammad Usman",
        "rating": 4,
        "comment": "Good experience overall. The glasses are comfortable and stylish. Delivery was a bit delayed but quality is great.",
        "avatar": None,
        "user_id": None,
        "createdAt": datetime(2026, 1, 5, 9, 15, 0),
    },
    {
        "_id": "4",
        "name": "Fatima Zahra",
        "rating": 5,
        "comment": "Amazing collection of designer frames! Got my progressive lenses here and they are perfect. Great customer service.",
        "avatar": None,
        "user_id": None,
        "createdAt": datetime(2026, 1, 3, 16, 45, 0),
    },
    {
        "_id": "5",
        "name": "Hassan Raza",
        "rating": 4,
        "comment": "Very satisfied with my purchase. The anti-glare coating is excellent for computer work. Will visit again!",
        "avatar": None,
        "user_id": None,
        "createdAt": datetime(2025, 12, 28, 11, 20, 0),
    },
    {
        "_id": "6",
        "name": "Ayesha Malik",
        "rating": 5,
        "comment": "Owais Optics has the best prices in town with premium quality. The eye check-up was thorough and professional.",
        "avatar": None,
        "user_id": None,
        "createdAt": datetime(2025, 12, 25, 13, 0, 0),
    },
]

@router.get("", response_model=ReviewListResponse)
async def get_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all reviews with pagination"""
    collection = get_collection("reviews")
    
    if collection is None:
        # Return mock data if DB is not connected
        start = (page - 1) * limit
        end = start + limit
        return ReviewListResponse(
            reviews=MOCK_REVIEWS[start:end],
            total=len(MOCK_REVIEWS),
            page=page,
            limit=limit
        )
    
    # Calculate skip value
    skip = (page - 1) * limit
    
    # Get total count
    total = await collection.count_documents({})
    
    # Fetch reviews sorted by date (newest first)
    cursor = collection.find().sort("createdAt", -1).skip(skip).limit(limit)
    reviews = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for review in reviews:
        review["_id"] = str(review["_id"])
    
    return ReviewListResponse(
        reviews=reviews,
        total=total,
        page=page,
        limit=limit
    )

@router.get("/stats", response_model=ReviewStats)
async def get_review_stats():
    """Get average rating and total review count"""
    collection = get_collection("reviews")
    
    if collection is None:
        # Return mock stats
        ratings = [r["rating"] for r in MOCK_REVIEWS]
        avg = sum(ratings) / len(ratings) if ratings else 0
        return ReviewStats(
            averageRating=round(avg, 1),
            totalReviews=len(MOCK_REVIEWS)
        )
    
    # Aggregate to get stats
    pipeline = [
        {
            "$group": {
                "_id": None,
                "averageRating": {"$avg": "$rating"},
                "totalReviews": {"$sum": 1}
            }
        }
    ]
    
    result = await collection.aggregate(pipeline).to_list(1)
    
    if not result:
        return ReviewStats(averageRating=0, totalReviews=0)
    
    return ReviewStats(
        averageRating=round(result[0]["averageRating"], 1),
        totalReviews=result[0]["totalReviews"]
    )

@router.post("", response_model=ReviewResponse)
async def create_review(review: ReviewCreate):
    """Create a new review"""
    collection = get_collection("reviews")
    
    if collection is None:
        raise HTTPException(
            status_code=503,
            detail="Database not available. Please try again later."
        )
    
    # Create review document - use provided name and avatar
    review_doc = {
        "name": review.name if review.name else "Anonymous User",
        "rating": review.rating,
        "comment": review.comment,
        "avatar": review.avatar,  # Use avatar from request (Google profile pic)
        "user_id": review.user_id,  # Track user_id for one-review-per-user
        "createdAt": datetime.utcnow()
    }
    
    # Insert into database
    result = await collection.insert_one(review_doc)
    
    # Return created review
    review_doc["_id"] = str(result.inserted_id)
    return review_doc

@router.delete("/{review_id}")
async def delete_review(review_id: str):
    """Delete a review by ID"""
    collection = get_collection("reviews")
    
    if collection is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="Invalid review ID")
    
    result = await collection.delete_one({"_id": ObjectId(review_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Review deleted successfully"}

@router.put("/user/{user_id}")
async def update_user_review(user_id: str, review: ReviewCreate):
    """Update a review by user_id"""
    collection = get_collection("reviews")
    
    if collection is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    # Find and update the user's review
    update_doc = {
        "name": review.name if review.name else "Anonymous User",
        "rating": review.rating,
        "comment": review.comment,
        "avatar": review.avatar,
    }
    
    result = await collection.find_one_and_update(
        {"user_id": user_id},
        {"$set": update_doc},
        return_document=True
    )
    
    if result is None:
        raise HTTPException(status_code=404, detail="Review not found for this user")
    
    result["_id"] = str(result["_id"])
    return result
