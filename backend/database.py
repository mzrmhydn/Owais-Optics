from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL, DATABASE_NAME
import certifi

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    try:
        # Use certifi for SSL certificates (required for Render deployment)
        client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
        db = client[DATABASE_NAME]
        # Test connection
        await client.admin.command('ping')
        print(f"✓ Connected to MongoDB: {DATABASE_NAME}")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        # Continue without DB for demo purposes
        db = None

async def close_db():
    global client
    if client:
        client.close()
        print("✓ MongoDB connection closed")

def get_database():
    return db

def get_collection(name: str):
    if db is None:
        return None
    return db[name]
