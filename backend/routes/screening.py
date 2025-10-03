from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import List, Optional, Dict
from models.screening import ScreeningRequest, AnalysisResult, ScreeningSession, SavedReport
from services.analysis import AnalysisService
from services.scoring import TBScoringService
from services.referrals import ReferralService
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import json
import base64
from datetime import datetime
import os

logger = logging.getLogger(__name__)

# Initialize services
analysis_service = AnalysisService()
scoring_service = TBScoringService()
referral_service = ReferralService()

# Router setup
router = APIRouter(prefix="/api", tags=["screening"])

# Database dependency
def get_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    return db

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_screening(screening_request: ScreeningRequest, 
                          user_location: Optional[Dict] = None,
                          db = Depends(get_database)):
    """
    Analyze TB screening data and provide comprehensive results
    """
    try:
        logger.info(f"Received screening analysis request: {screening_request.session_id}")
        
        # Perform analysis
        analysis_result = await analysis_service.analyze_screening(
            screening_request, 
            user_location
        )
        
        # Create screening session document
        session = ScreeningSession(
            id=analysis_result.session_id,
            user_info=screening_request.user,
            symptoms=screening_request.symptoms,
            deep_questions=screening_request.deep_questions,
            uploads=screening_request.uploads,
            local_score=screening_request.local_score,
            analysis_result=analysis_result,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save to database
        try:
            await db.screening_sessions.insert_one(session.dict())
            logger.info(f"Saved screening session: {session.id}")
        except Exception as db_error:
            logger.warning(f"Failed to save to database: {db_error}")
            # Continue without failing the request
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...),
                     file_type: str = Form(...),
                     db = Depends(get_database)):
    """
    Handle medical report file uploads
    """
    try:
        # Validate file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        
        # Read file content
        content = await file.read()
        
        if len(content) > max_size:
            raise HTTPException(status_code=413, detail="File size exceeds 10MB limit")
        
        # Validate file type
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.pdf']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPG, PNG, PDF")
        
        # Convert to base64 for storage
        content_base64 = base64.b64encode(content).decode('utf-8')
        
        # Create file document
        file_doc = {
            "filename": file.filename,
            "file_type": file_type,
            "content_type": file.content_type,
            "size": len(content),
            "content_base64": content_base64,
            "uploaded_at": datetime.utcnow()
        }
        
        # Save to database
        try:
            result = await db.uploaded_files.insert_one(file_doc)
            file_id = str(result.inserted_id)
            logger.info(f"Uploaded file: {file.filename} ({file_id})")
        except Exception as db_error:
            logger.warning(f"Failed to save file to database: {db_error}")
            file_id = "temp_" + str(datetime.utcnow().timestamp())
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "size": len(content),
            "url": f"/api/files/{file_id}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/referrals")
async def get_referrals(lat: Optional[float] = None,
                       lng: Optional[float] = None,
                       radius: float = 50.0,
                       urgency: Optional[str] = None,
                       max_results: int = 5):
    """
    Get nearby TB testing centers and referrals
    """
    try:
        if urgency:
            # Get priority centers based on urgency
            referrals = referral_service.get_priority_centers_by_urgency(
                urgency, lat, lng
            )
        else:
            # Get nearby centers
            referrals = referral_service.get_nearby_centers(
                lat, lng, radius, max_results
            )
        
        return {
            "success": True,
            "count": len(referrals),
            "referrals": [referral.dict() for referral in referrals]
        }
        
    except Exception as e:
        logger.error(f"Failed to get referrals: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get referrals: {str(e)}")

@router.post("/reports", response_model=SavedReport)
async def save_report(session_id: str, 
                     user_consent: bool = True,
                     db = Depends(get_database)):
    """
    Save screening report for user history
    """
    try:
        if not user_consent:
            raise HTTPException(status_code=400, detail="User consent required to save report")
        
        # Get screening session from database
        session_doc = await db.screening_sessions.find_one({"id": session_id})
        
        if not session_doc:
            raise HTTPException(status_code=404, detail="Screening session not found")
        
        session = ScreeningSession(**session_doc)
        
        if not session.analysis_result:
            raise HTTPException(status_code=400, detail="No analysis result available")
        
        # Create saved report
        saved_report = SavedReport(
            session_id=session_id,
            user_info=session.user_info,
            analysis_result=session.analysis_result,
            saved_at=datetime.utcnow()
        )
        
        # Save to database
        await db.saved_reports.insert_one(saved_report.dict())
        
        logger.info(f"Saved report: {saved_report.id}")
        return saved_report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save report: {str(e)}")

@router.get("/reports/{user_id}")
async def get_user_reports(user_id: str, db = Depends(get_database)):
    """
    Get user's saved screening reports (placeholder for user authentication)
    """
    try:
        # TODO: Implement proper user authentication
        # For now, return empty list
        return {
            "success": True,
            "reports": []
        }
        
    except Exception as e:
        logger.error(f"Failed to get user reports: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get reports: {str(e)}")

@router.get("/session/{session_id}")
async def get_screening_session(session_id: str, db = Depends(get_database)):
    """
    Get screening session details by ID
    """
    try:
        session_doc = await db.screening_sessions.find_one({"id": session_id})
        
        if not session_doc:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Remove sensitive data before returning
        session_doc.pop('_id', None)
        
        return {
            "success": True,
            "session": session_doc
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

@router.get("/score")
async def calculate_score(symptoms: str, deep_questions: str = "{}"):
    """
    Calculate TB risk score (utility endpoint)
    """
    try:
        # Parse JSON strings
        symptoms_dict = json.loads(symptoms)
        deep_dict = json.loads(deep_questions)
        
        # Create model instances
        from models.screening import Symptoms, DeepQuestions
        symptoms_obj = Symptoms(**symptoms_dict)
        deep_obj = DeepQuestions(**deep_dict)
        
        # Calculate score
        score, reasons = scoring_service.calculate_comprehensive_score(symptoms_obj, deep_obj)
        risk_level = scoring_service.get_risk_classification(score)
        urgency = scoring_service.get_urgency_level(score, symptoms_obj, deep_obj)
        
        return {
            "success": True,
            "score": score,
            "risk_level": risk_level,
            "urgency": urgency,
            "reasons": reasons
        }
        
    except Exception as e:
        logger.error(f"Score calculation failed: {e}")
        raise HTTPException(status_code=400, detail=f"Score calculation failed: {str(e)}")