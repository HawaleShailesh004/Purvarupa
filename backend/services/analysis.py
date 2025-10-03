from typing import Dict, List, Optional
from models.screening import ScreeningRequest, AnalysisResult, Referral
from services.scoring import TBScoringService
from services.referrals import ReferralService
import logging
import uuid

logger = logging.getLogger(__name__)

class AnalysisService:
    """
    Main service for analyzing TB screening data and generating comprehensive results
    """
    
    def __init__(self):
        self.scoring_service = TBScoringService()
        self.referral_service = ReferralService()
    
    async def analyze_screening(self, screening_request: ScreeningRequest, 
                              user_location: Optional[Dict] = None) -> AnalysisResult:
        """
        Perform comprehensive analysis of TB screening data
        """
        logger.info(f"Starting analysis for screening session: {screening_request.session_id}")
        
        # Calculate comprehensive risk score and reasoning
        risk_score, reasons = self.scoring_service.calculate_comprehensive_score(
            screening_request.symptoms, 
            screening_request.deep_questions
        )
        
        # Determine risk classification
        likelihood = self.scoring_service.get_risk_classification(risk_score)
        
        # Determine urgency level
        urgency = self.scoring_service.get_urgency_level(
            risk_score, 
            screening_request.symptoms, 
            screening_request.deep_questions
        )
        
        # Get recommended tests
        recommended_tests = self.scoring_service.get_recommended_tests(
            likelihood, 
            screening_request.symptoms
        )
        
        # Get appropriate referrals based on urgency and location
        user_lat = user_location.get('lat') if user_location else None
        user_lng = user_location.get('lng') if user_location else None
        
        referrals = self.referral_service.get_priority_centers_by_urgency(
            urgency, user_lat, user_lng
        )
        
        # Enhance referrals with emergency information if needed
        if urgency == "Immediate":
            referrals = self.referral_service.add_emergency_contacts(referrals)
        
        # Calculate confidence percentage
        confidence = self._calculate_confidence(risk_score, screening_request)
        
        # Generate natural language explanation
        explanation = self.scoring_service.generate_explanation(
            risk_score, likelihood, reasons, "en"  # TODO: Add language detection
        )
        
        # Enhance explanation with AI analysis if available
        ai_analysis = await self._generate_ai_analysis(screening_request, risk_score)
        
        # Generate session ID if not provided
        session_id = screening_request.session_id or str(uuid.uuid4())
        
        result = AnalysisResult(
            likelihood=likelihood,
            confidence_percent=confidence,
            reasons=reasons,
            urgency=urgency,
            recommended_tests=recommended_tests,
            referrals=referrals,
            explanation_plain=explanation,
            session_id=session_id,
            risk_score=risk_score,
            ai_analysis=ai_analysis
        )
        
        logger.info(f"Analysis completed: {likelihood} risk ({risk_score}/20), {urgency} urgency")
        return result
    
    def _calculate_confidence(self, risk_score: int, screening_request: ScreeningRequest) -> int:
        """
        Calculate confidence percentage based on various factors
        """
        base_confidence = 60  # Base confidence level
        
        # Increase confidence based on number of symptoms
        symptom_count = sum([
            screening_request.symptoms.cough_gt_2_weeks,
            screening_request.symptoms.cough_with_sputum,
            screening_request.symptoms.cough_with_blood,
            screening_request.symptoms.fever_evening,
            screening_request.symptoms.weight_loss,
            screening_request.symptoms.night_sweats,
            screening_request.symptoms.chest_pain,
            screening_request.symptoms.loss_of_appetite
        ])
        
        # More symptoms = higher confidence
        confidence_boost = min(symptom_count * 3, 15)
        
        # Risk factors boost confidence
        risk_factor_count = len(screening_request.deep_questions.previous_conditions)
        confidence_boost += min(risk_factor_count * 2, 10)
        
        # High-risk indicators boost confidence significantly
        if ('previous_tb_not_completed' in screening_request.deep_questions.previous_conditions or
            screening_request.symptoms.cough_with_blood):
            confidence_boost += 10
        
        # Age factor (if available)
        if screening_request.user.age:
            if screening_request.user.age > 65 or screening_request.user.age < 5:
                confidence_boost += 5  # Higher risk age groups
        
        # File uploads increase confidence
        if screening_request.uploads:
            confidence_boost += len(screening_request.uploads) * 3
        
        final_confidence = min(base_confidence + confidence_boost, 95)  # Cap at 95%
        return max(final_confidence, 65)  # Minimum 65% confidence
    
    async def _generate_ai_analysis(self, screening_request: ScreeningRequest, risk_score: int) -> Optional[str]:
        """
        Generate AI-powered analysis (placeholder for future AI integration)
        """
        # TODO: Integrate with AI service for natural language analysis
        # For now, return a structured analysis based on the data
        
        try:
            analysis_parts = []
            
            # Symptom analysis
            if screening_request.symptoms.cough_with_blood:
                analysis_parts.append("Hemoptysis (blood in sputum) is a significant symptom requiring immediate medical attention.")
            
            if screening_request.symptoms.cough_gt_2_weeks and screening_request.symptoms.fever_evening:
                analysis_parts.append("The combination of persistent cough and evening fever is highly suggestive of pulmonary TB.")
            
            # Risk factor analysis
            if 'diabetes' in screening_request.deep_questions.previous_conditions:
                analysis_parts.append("Diabetes significantly increases TB susceptibility and may complicate treatment.")
            
            if screening_request.deep_questions.exposure_contact != "No known contact":
                analysis_parts.append("Known TB exposure history significantly increases infection probability.")
            
            # Return combined analysis or None if no specific insights
            return " ".join(analysis_parts) if analysis_parts else None
            
        except Exception as e:
            logger.warning(f"AI analysis generation failed: {e}")
            return None
    
    def get_followup_recommendations(self, analysis_result: AnalysisResult) -> Dict[str, List[str]]:
        """
        Generate follow-up recommendations based on analysis results
        """
        recommendations = {
            "immediate_actions": [],
            "medical_tests": analysis_result.recommended_tests,
            "lifestyle_advice": [],
            "monitoring_instructions": []
        }
        
        if analysis_result.urgency == "Immediate":
            recommendations["immediate_actions"] = [
                "Seek medical attention immediately",
                "Contact the nearest TB center or hospital",
                "Avoid close contact with others until evaluated",
                "Wear a mask in public spaces"
            ]
        elif analysis_result.urgency == "TestSoon":
            recommendations["immediate_actions"] = [
                "Schedule medical consultation within 48-72 hours",
                "Get recommended tests done promptly",
                "Monitor symptoms closely"
            ]
        else:  # Monitor
            recommendations["monitoring_instructions"] = [
                "Monitor for development of TB symptoms",
                "Maintain good nutrition and hygiene",
                "Seek care if symptoms worsen or new symptoms develop"
            ]
        
        # General lifestyle advice
        recommendations["lifestyle_advice"] = [
            "Maintain good nutrition and adequate rest",
            "Avoid smoking and alcohol",
            "Practice good cough etiquette",
            "Ensure adequate ventilation in living spaces"
        ]
        
        return recommendations