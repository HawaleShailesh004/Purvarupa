from typing import Dict, List, Tuple
from models.screening import Symptoms, DeepQuestions
import logging

logger = logging.getLogger(__name__)

class TBScoringService:
    """
    Enhanced TB screening scoring service with improved logic and risk assessment
    """
    
    # Symptom weights based on medical literature
    SYMPTOM_WEIGHTS = {
        'cough_gt_2_weeks': 3,
        'cough_with_sputum': 2,
        'cough_with_blood': 4,  # Increased weight for blood in sputum
        'fever_evening': 2,
        'weight_loss': 3,  # Increased weight for unexplained weight loss
        'night_sweats': 2,
        'chest_pain': 1,
        'loss_of_appetite': 1
    }
    
    # Risk factor adjustments
    RISK_ADJUSTMENTS = {
        'previous_tb_not_completed': 5,  # Critical risk factor
        'previous_tb_completed': 2,
        'diabetes': 2,
        'hiv': 4,  # High risk factor
        'kidney_disease': 2,
        'cancer': 3,
        'smoker': 1,
        'alcohol_use': 1
    }
    
    # Exposure risk weights
    EXPOSURE_WEIGHTS = {
        'Family member with TB': 4,  # Increased from 3
        'Close workplace contact': 3,  # Increased from 2
        'Neighbour / Community contact': 2,  # Increased from 1
        'No known contact': 0
    }
    
    def calculate_comprehensive_score(self, symptoms: Symptoms, deep_questions: DeepQuestions) -> Tuple[int, List[str]]:
        """
        Calculate comprehensive TB risk score with detailed reasoning
        """
        score = 0
        reasons = []
        
        # Calculate base symptom score
        symptom_score, symptom_reasons = self._calculate_symptom_score(symptoms)
        score += symptom_score
        reasons.extend(symptom_reasons)
        
        # Add risk factor adjustments
        risk_score, risk_reasons = self._calculate_risk_factors(deep_questions)
        score += risk_score
        reasons.extend(risk_reasons)
        
        # Add exposure adjustments
        exposure_score, exposure_reasons = self._calculate_exposure_risk(deep_questions)
        score += exposure_score
        reasons.extend(exposure_reasons)
        
        # Duration and severity escalation
        duration_score, duration_reasons = self._calculate_duration_escalation(symptoms, deep_questions, score)
        score += duration_score
        reasons.extend(duration_reasons)
        
        # Age-based risk adjustment
        age_adjustment = self._calculate_age_risk(deep_questions)
        score += age_adjustment
        if age_adjustment > 0:
            reasons.append(f"Age-related risk factor (+{age_adjustment} pts)")
        
        # Cap the maximum score
        final_score = min(score, 20)
        
        logger.info(f"Calculated TB risk score: {final_score}/20, reasons: {len(reasons)}")
        return final_score, reasons
    
    def _calculate_symptom_score(self, symptoms: Symptoms) -> Tuple[int, List[str]]:
        """
        Calculate score based on reported symptoms
        """
        score = 0
        reasons = []
        
        # Handle "none of the above" case
        if symptoms.none_of_the_above:
            return 0, ["No TB-related symptoms reported"]
        
        # Calculate individual symptom scores
        for symptom_key, weight in self.SYMPTOM_WEIGHTS.items():
            if getattr(symptoms, symptom_key, False):
                score += weight
                symptom_name = self._format_symptom_name(symptom_key)
                reasons.append(f"{symptom_name} ({weight} pts)")
        
        return score, reasons
    
    def _calculate_risk_factors(self, deep_questions: DeepQuestions) -> Tuple[int, List[str]]:
        """
        Calculate score adjustments based on risk factors
        """
        score = 0
        reasons = []
        
        for condition in deep_questions.previous_conditions:
            if condition in self.RISK_ADJUSTMENTS:
                weight = self.RISK_ADJUSTMENTS[condition]
                score += weight
                condition_name = self._format_condition_name(condition)
                reasons.append(f"{condition_name} (+{weight} pts)")
        
        return score, reasons
    
    def _calculate_exposure_risk(self, deep_questions: DeepQuestions) -> Tuple[int, List[str]]:
        """
        Calculate score based on TB exposure history
        """
        exposure = deep_questions.exposure_contact
        if exposure and exposure in self.EXPOSURE_WEIGHTS:
            weight = self.EXPOSURE_WEIGHTS[exposure]
            if weight > 0:
                return weight, [f"{exposure} (+{weight} pts)"]
        
        return 0, []
    
    def _calculate_duration_escalation(self, symptoms: Symptoms, deep_questions: DeepQuestions, base_score: int) -> Tuple[int, List[str]]:
        """
        Apply escalation based on symptom duration and severity
        """
        score = 0
        reasons = []
        
        # Prolonged cough escalation
        if (deep_questions.cough_duration_weeks == "> 1 month" and 
            (symptoms.cough_gt_2_weeks or symptoms.cough_with_sputum) and 
            base_score >= 4):
            score += 2
            reasons.append("Prolonged cough duration (>1 month) with other symptoms (+2 pts)")
        
        # Blood in sputum with fever - high concern
        if symptoms.cough_with_blood and symptoms.fever_evening:
            score += 2
            reasons.append("Blood in sputum with fever - high concern (+2 pts)")
        
        # Multiple constitutional symptoms
        constitutional_symptoms = sum([
            symptoms.fever_evening,
            symptoms.weight_loss,
            symptoms.night_sweats,
            symptoms.loss_of_appetite
        ])
        
        if constitutional_symptoms >= 3:
            score += 1
            reasons.append("Multiple constitutional symptoms (+1 pt)")
        
        return score, reasons
    
    def _calculate_age_risk(self, deep_questions: DeepQuestions) -> int:
        """
        Calculate age-related risk adjustment
        Note: This would need user age from the request
        """
        # This could be enhanced with actual age data
        # For now, keeping it simple
        return 0
    
    def get_risk_classification(self, score: int) -> str:
        """
        Classify risk level based on comprehensive score
        """
        if score >= 12:
            return "Confirmed"
        elif score >= 8:
            return "High"
        elif score >= 4:
            return "Moderate" 
        else:
            return "Low"
    
    def get_urgency_level(self, score: int, symptoms: Symptoms, deep_questions: DeepQuestions) -> str:
        """
        Determine urgency level based on score and critical symptoms
        """
        # Immediate if critical symptoms or very high score
        if (score >= 10 or 
            symptoms.cough_with_blood or 
            'previous_tb_not_completed' in deep_questions.previous_conditions or
            'hiv' in deep_questions.previous_conditions):
            return "Immediate"
        
        # Test soon for moderate-high risk
        if score >= 6:
            return "TestSoon"
        
        # Monitor for low risk
        return "Monitor"
    
    def get_recommended_tests(self, risk_level: str, symptoms: Symptoms) -> List[str]:
        """
        Recommend appropriate tests based on risk level and symptoms
        """
        base_tests = ["Chest X-ray", "Sputum smear microscopy"]
        
        if risk_level in ["High", "Confirmed"]:
            return base_tests + ["CBNAAT (GeneXpert)", "Sputum culture", "Complete Blood Count"]
        elif risk_level == "Moderate":
            tests = base_tests + ["CBNAAT (GeneXpert)"]
            if symptoms.cough_with_sputum or symptoms.cough_with_blood:
                tests.append("Sputum AFB staining")
            return tests
        else:
            return base_tests
    
    def generate_explanation(self, score: int, risk_level: str, reasons: List[str], user_language: str = "en") -> str:
        """
        Generate natural language explanation of the screening result
        """
        explanations = {
            "en": {
                "Confirmed": f"Based on your symptoms and risk factors (score: {score}/20), there is very high likelihood of TB infection. Immediate medical evaluation and testing is strongly recommended.",
                "High": f"Your symptoms and risk assessment (score: {score}/20) indicate high TB risk. Please seek medical testing as soon as possible for proper evaluation.",
                "Moderate": f"Your screening shows moderate TB risk (score: {score}/20). Medical consultation and testing is recommended to rule out TB infection.",
                "Low": f"Your screening indicates low TB risk (score: {score}/20). Continue monitoring your health and seek care if symptoms develop or worsen."
            }
        }
        
        base_explanation = explanations.get(user_language, explanations["en"])[risk_level]
        
        if len(reasons) > 3:
            base_explanation += f" Key factors include: {', '.join(reasons[:3])} and {len(reasons)-3} other indicators."
        elif reasons:
            base_explanation += f" Key factors: {', '.join(reasons)}."
        
        return base_explanation
    
    def _format_symptom_name(self, symptom_key: str) -> str:
        """
        Format symptom keys into readable names
        """
        formatting = {
            'cough_gt_2_weeks': 'Persistent cough >2 weeks',
            'cough_with_sputum': 'Productive cough',
            'cough_with_blood': 'Blood in sputum',
            'fever_evening': 'Evening fever',
            'weight_loss': 'Unexplained weight loss',
            'night_sweats': 'Night sweats',
            'chest_pain': 'Chest pain',
            'loss_of_appetite': 'Loss of appetite'
        }
        return formatting.get(symptom_key, symptom_key.replace('_', ' ').title())
    
    def _format_condition_name(self, condition_key: str) -> str:
        """
        Format condition keys into readable names
        """
        formatting = {
            'previous_tb_not_completed': 'Incomplete previous TB treatment',
            'previous_tb_completed': 'Previous TB treatment history',
            'diabetes': 'Diabetes mellitus',
            'hiv': 'HIV infection',
            'kidney_disease': 'Chronic kidney disease',
            'cancer': 'Cancer/malignancy',
            'smoker': 'Smoking history',
            'alcohol_use': 'Alcohol use'
        }
        return formatting.get(condition_key, condition_key.replace('_', ' ').title())