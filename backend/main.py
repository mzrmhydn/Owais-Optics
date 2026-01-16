from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import reviews, auth
from database import connect_db, close_db
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    yield
    # Shutdown
    await close_db()

app = FastAPI(
    title="Owais Optics API",
    description="Backend API for Owais Optics website",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {"message": "Welcome to Owais Optics API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
