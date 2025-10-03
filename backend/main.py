from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import route modules
from routes.screening import router as screening_router
from routes.pdf import router as pdf_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main FastAPI app
app = FastAPI(
    title="TB Pre-Screening Platform API",
    description="Backend API for tuberculosis pre-screening and referral system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(screening_router)
app.include_router(pdf_router)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await db.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "message": "TB Pre-Screening Platform API is running"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# Root endpoint
@app.get("/api/")
async def root():
    """Root API endpoint"""
    return {
        "message": "TB Pre-Screening Platform API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "analyze": "/api/analyze",
            "upload": "/api/upload", 
            "referrals": "/api/referrals",
            "reports": "/api/reports",
            "pdf": "/api/pdf/report/{session_id}",
            "health": "/api/health"
        }
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting TB Pre-Screening Platform API...")
    
    # Test database connection
    try:
        await db.admin.command('ping')
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
    
    # Create indexes for better performance
    try:
        await db.screening_sessions.create_index("id", unique=True)
        await db.screening_sessions.create_index("created_at")
        await db.saved_reports.create_index("session_id")
        await db.uploaded_files.create_index("uploaded_at")
        logger.info("Database indexes created")
    except Exception as e:
        logger.warning(f"Index creation failed: {e}")
    
    logger.info("TB Pre-Screening Platform API started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Shutting down TB Pre-Screening Platform API...")
    client.close()
    logger.info("Database connection closed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)