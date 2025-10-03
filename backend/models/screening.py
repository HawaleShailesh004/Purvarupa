from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class UserInfo(BaseModel):
    name: Optional[str] = None
    age: int
    gender: Optional[str] = None
    location: Optional[str] = None
    contact: Optional[str] = None

class Symptoms(BaseModel):
    cough_gt_2_weeks: bool = False
    cough_with_sputum: bool = False
    cough_with_blood: bool = False
    fever_evening: bool = False
    weight_loss: bool = False
    night_sweats: bool = False
    chest_pain: bool = False
    loss_of_appetite: bool = False
    none_of_the_above: bool = False

class DeepQuestions(BaseModel):
    cough_duration_weeks: Optional[str] = None
    cough_type: Optional[str] = None
    fever_pattern: Optional[str] = None
    weight_appetite: Optional[str] = None
    night_sweats_fatigue: Optional[str] = None
    exposure_contact: Optional[str] = None
    previous_conditions: List[str] = []

class FileUpload(BaseModel):
    type: str
    filename: str
    content_base64: str
    size: Optional[int] = None

class ScreeningRequest(BaseModel):
    user: UserInfo
    symptoms: Symptoms
    deep_questions: DeepQuestions
    uploads: List[FileUpload] = []
    local_score: int
    session_id: Optional[str] = None

class Referral(BaseModel):
    id: str
    name: str
    type: str
    phone: str
    address: str
    lat: float
    lng: float
    distance: Optional[str] = None

class AnalysisResult(BaseModel):
    likelihood: str  # High, Moderate, Low, Confirmed
    confidence_percent: int
    reasons: List[str]
    urgency: str  # Immediate, TestSoon, Monitor
    recommended_tests: List[str]
    referrals: List[Referral]
    explanation_plain: str
    session_id: str
    risk_score: int
    ai_analysis: Optional[str] = None

class ScreeningSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_info: UserInfo
    symptoms: Symptoms
    deep_questions: DeepQuestions
    uploads: List[FileUpload] = []
    local_score: int
    analysis_result: Optional[AnalysisResult] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
class SavedReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_info: UserInfo
    analysis_result: AnalysisResult
    saved_at: datetime = Field(default_factory=datetime.utcnow)