"""
Main FastAPI application entry point.
This file creates the FastAPI app, includes routers, and sets up the database.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, chat, upload, doctors

# Create database tables
# In production, use Alembic for migrations instead
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Smart Medical Triage Assistant API",
    description="Backend API for medical triage assistant with chat, uploads, and doctor recommendations",
    version="1.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing)
# In production, specify exact origins instead of "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins - change in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(upload.router)
app.include_router(doctors.router)


@app.get("/")
def root():
    """
    Root endpoint - API information.
    """
    return {
        "message": "Smart Medical Triage Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}


# Initialize database with sample doctors (for development)
# In production, this would be done via a separate script or migration
@app.on_event("startup")
def init_db():
    """
    Initialize database with sample data on startup.
    This runs once when the application starts.
    """
    from app.database import SessionLocal
    from app.models import Doctor
    
    db = SessionLocal()
    
    # Check if doctors already exist
    if db.query(Doctor).count() == 0:
        # Add sample doctors
        sample_doctors = [
            Doctor(
                name="Dr. Sarah Johnson",
                specialty="cardiology",
                location_text="Downtown Medical Center, Floor 3",
                contact_info="+1-555-0101"
            ),
            Doctor(
                name="Dr. Michael Chen",
                specialty="cardiology",
                location_text="City Hospital, Cardiology Wing",
                contact_info="+1-555-0102"
            ),
            Doctor(
                name="Dr. Emily Rodriguez",
                specialty="general",
                location_text="Community Health Clinic",
                contact_info="+1-555-0103"
            ),
            Doctor(
                name="Dr. James Wilson",
                specialty="general",
                location_text="Family Medical Practice",
                contact_info="+1-555-0104"
            ),
            Doctor(
                name="Dr. Lisa Anderson",
                specialty="gastroenterology",
                location_text="Digestive Health Center",
                contact_info="+1-555-0105"
            ),
            Doctor(
                name="Dr. Robert Taylor",
                specialty="neurology",
                location_text="Neurological Institute",
                contact_info="+1-555-0106"
            ),
            Doctor(
                name="Dr. Maria Garcia",
                specialty="dermatology",
                location_text="Skin Care Clinic",
                contact_info="+1-555-0107"
            ),
            Doctor(
                name="Dr. David Brown",
                specialty="emergency",
                location_text="Emergency Department, City Hospital",
                contact_info="+1-555-0108"
            ),
        ]
        
        for doctor in sample_doctors:
            db.add(doctor)
        
        db.commit()
        print("Sample doctors initialized")
    
    db.close()









