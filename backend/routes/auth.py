from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import httpx
from database import get_collection
from models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from config import (
    JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS,
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
    FRONTEND_URL
)

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_token(user_id: str) -> str:
    """Create JWT token"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        import hashlib
        # hashed_password format: "salt$hash"
        parts = hashed_password.split('$')
        if len(parts) != 2:
            return False
        salt, stored_hash = parts
        new_hash = hashlib.sha256((salt + plain_password).encode()).hexdigest()
        return new_hash == stored_hash
    except Exception:
        return False

def hash_password(password: str) -> str:
    """Hash password using SHA256 with salt"""
    import hashlib
    import secrets
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${password_hash}"

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    """Create a new user account"""
    collection = get_collection("users")
    
    if collection is None:
        raise HTTPException(status_code=503, detail="Database not available. Please ensure MongoDB is running.")
    
    # Validate password
    if not user_data.password or len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Check if email already exists
    existing = await collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Create user document
        user_doc = {
            "email": user_data.email,
            "name": user_data.name,
            "password": hash_password(user_data.password),
            "avatar": None,
            "provider": "email",
            "createdAt": datetime.utcnow()
        }
        
        result = await collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Generate token
        token = create_token(user_id)
        
        user_doc["_id"] = user_id
        del user_doc["password"]
        
        return TokenResponse(token=token, user=user_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create account: {str(e)}")

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with email and password"""
    collection = get_collection("users")
    
    if collection is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    # Find user by email
    user = await collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user signed up with Google
    if user.get("provider") == "google":
        raise HTTPException(
            status_code=400, 
            detail="This account was created with Google. Please use 'Continue with Google' to sign in."
        )
    
    # Check if user has a password (safety check)
    if not user.get("password"):
        raise HTTPException(
            status_code=400,
            detail="No password set for this account. Please use 'Continue with Google' to sign in."
        )
    
    # Check password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
    user_id = str(user["_id"])
    token = create_token(user_id)
    
    user["_id"] = user_id
    del user["password"]
    
    return TokenResponse(token=token, user=user)

@router.get("/google")
async def google_auth():
    """Redirect to Google OAuth"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=501,
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID in environment."
        )
    
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        "response_type=code&"
        "scope=email%20profile&"
        "access_type=offline"
    )
    
    return RedirectResponse(url=google_auth_url)

@router.get("/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    
    # Exchange code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Google tokens")
        
        tokens = token_response.json()
        access_token = tokens["access_token"]
        
        # Get user info
        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if user_info_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        google_user = user_info_response.json()
    
    # Find or create user
    collection = get_collection("users")
    if collection is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    user = await collection.find_one({"email": google_user["email"]})
    
    if user:
        # Update existing user
        user_id = str(user["_id"])
    else:
        # Create new user
        user_doc = {
            "email": google_user["email"],
            "name": google_user.get("name", "Google User"),
            "avatar": google_user.get("picture"),
            "google_id": google_user["id"],
            "provider": "google",
            "createdAt": datetime.utcnow()
        }
        result = await collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
    
    # Generate JWT token
    token = create_token(user_id)
    
    # Get user info for redirect
    user_name = google_user.get("name", "Google User")
    user_avatar = google_user.get("picture", "")
    
    # Redirect to frontend with token and user info
    import urllib.parse
    encoded_name = urllib.parse.quote(user_name)
    encoded_avatar = urllib.parse.quote(user_avatar) if user_avatar else ""
    return RedirectResponse(url=f"{FRONTEND_URL}/reviews?token={token}&name={encoded_name}&avatar={encoded_avatar}")

@router.get("/me")
async def get_current_user():
    """Get current user info (requires auth header)"""
    # This would normally extract user from JWT token in header
    # For now, return a placeholder
    raise HTTPException(status_code=401, detail="Authentication required")
