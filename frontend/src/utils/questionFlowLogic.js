/**
 * Enhanced question flow logic with smart branching and medical prioritization
 */

export class QuestionFlowManager {
  constructor(symptoms, deepQuestions) {
    this.symptoms = symptoms;
    this.deepQuestions = deepQuestions;
  }

  /**
   * Determine if deep questions should be shown based on symptoms
   */
  shouldShowDeepQuestions() {
    // Skip deep questions if "none of the above" is selected
    if (this.symptoms.none_of_the_above) {
      return false;
    }

    // Show deep questions if any symptom is selected
    const hasSymptoms = Object.keys(this.symptoms).some(
      key => key !== 'none_of_the_above' && this.symptoms[key]
    );

    return hasSymptoms;
  }

  /**
   * Get the next step in the screening flow
   */
  getNextStep(currentStep) {
    switch (currentStep) {
      case 1: // Basic Info -> Symptoms
        return 2;
      
      case 2: // Symptoms -> Deep Questions or Upload
        return this.shouldShowDeepQuestions() ? 3 : 9;
      
      case 3: // Cough Duration
        return this.shouldAskCoughType() ? 4 : this.getNextAfterCough();
      
      case 4: // Cough Type
        return this.shouldAskFeverPattern() ? 5 : this.getNextAfterFever();
      
      case 5: // Fever Pattern
        return this.shouldAskWeightAppetite() ? 6 : this.getNextAfterWeight();
      
      case 6: // Weight & Appetite
        return this.shouldAskNightSweats() ? 7 : this.getNextAfterSweats();
      
      case 7: // Night Sweats & Fatigue
        return 8; // Always ask exposure
      
      case 8: // Exposure/Contact -> Previous Conditions or Upload
        return this.shouldAskPreviousConditions() ? this.getPreviousConditionsStep() : 9;
      
      case 9: // File Upload
        return 10;
      
      case 10: // Review & Submit
        return 11; // Complete
      
      default:
        return currentStep + 1;
    }
  }

  /**
   * Get the previous step in the screening flow
   */
  getPreviousStep(currentStep) {
    switch (currentStep) {
      case 2: // Symptoms -> Basic Info
        return 1;
      
      case 3: // Deep Questions -> Symptoms
        return 2;
      
      case 9: // Upload -> Last Deep Question or Symptoms
        return this.shouldShowDeepQuestions() ? this.getLastDeepQuestionStep() : 2;
      
      case 10: // Review -> Upload
        return 9;
      
      default:
        return Math.max(currentStep - 1, 1);
    }
  }

  /**
   * Determine if cough type question should be asked
   */
  shouldAskCoughType() {
    return this.symptoms.cough_gt_2_weeks || 
           this.symptoms.cough_with_sputum || 
           this.symptoms.cough_with_blood;
  }

  /**
   * Determine if fever pattern question should be asked
   */
  shouldAskFeverPattern() {
    return this.symptoms.fever_evening;
  }

  /**
   * Determine if weight/appetite question should be asked
   */
  shouldAskWeightAppetite() {
    return this.symptoms.weight_loss || this.symptoms.loss_of_appetite;
  }

  /**
   * Determine if night sweats question should be asked
   */
  shouldAskNightSweats() {
    return this.symptoms.night_sweats;
  }

  /**
   * Determine if previous conditions question should be asked
   */
  shouldAskPreviousConditions() {
    // Always ask about previous conditions for complete risk assessment
    return true;
  }

  /**
   * Get the step number for previous conditions question
   */
  getPreviousConditionsStep() {
    // This would be a separate step for previous TB history and comorbidities
    return 8.5; // Conceptually between 8 and 9
  }

  /**
   * Get next step after cough questions
   */
  getNextAfterCough() {
    if (this.shouldAskFeverPattern()) return 5;
    return this.getNextAfterFever();
  }

  /**
   * Get next step after fever questions
   */
  getNextAfterFever() {
    if (this.shouldAskWeightAppetite()) return 6;
    return this.getNextAfterWeight();
  }

  /**
   * Get next step after weight questions
   */
  getNextAfterWeight() {
    if (this.shouldAskNightSweats()) return 7;
    return this.getNextAfterSweats();
  }

  /**
   * Get next step after sweats questions
   */
  getNextAfterSweats() {
    return 8; // Always ask exposure
  }

  /**
   * Get the last deep question step number
   */
  getLastDeepQuestionStep() {
    // Return the highest step number in the deep questions sequence
    let lastStep = 8;
    
    if (this.shouldAskPreviousConditions()) {
      lastStep = Math.max(lastStep, 8.5);
    }
    
    return Math.floor(lastStep);
  }

  /**
   * Get progress percentage for the current step
   */
  getProgressPercentage(currentStep, totalSteps = 10) {
    if (currentStep === 2 && !this.shouldShowDeepQuestions()) {
      // Skip to upload step, so progress jumps
      return 80;
    }
    
    return Math.min((currentStep / totalSteps) * 100, 100);
  }

  /**
   * Get estimated completion time based on current progress
   */
  getEstimatedTime(currentStep) {
    const baseTime = this.shouldShowDeepQuestions() ? 8 : 3; // minutes
    const progressRatio = this.getProgressPercentage(currentStep) / 100;
    const remainingTime = Math.ceil(baseTime * (1 - progressRatio));
    
    return Math.max(remainingTime, 1);
  }

  /**
   * Check if current step requires immediate attention
   */
  requiresImmediateAttention(currentStep) {
    // Flag critical symptoms that require immediate medical attention
    if (currentStep >= 2) {
      return this.symptoms.cough_with_blood || 
             (this.deepQuestions.previous_conditions && 
              this.deepQuestions.previous_conditions.includes('previous_tb_not_completed'));
    }
    return false;
  }

  /**
   * Get contextual help text for current step
   */
  getStepHelpText(currentStep) {
    const helpTexts = {
      1: 'Basic information helps us provide personalized recommendations.',
      2: 'Select all symptoms you have experienced recently. Be honest and thorough.',
      3: 'Duration of cough is important for TB risk assessment.',
      4: 'Type of cough provides clues about potential lung involvement.',
      5: 'Fever patterns can indicate the severity and nature of infection.',
      6: 'Constitutional symptoms like weight loss are significant TB indicators.',
      7: 'Night sweats and fatigue are common early TB symptoms.',
      8: 'TB exposure history is crucial for risk assessment.',
      9: 'Upload any relevant medical reports to enhance accuracy (optional).',
      10: 'Review your information before submitting for analysis.'
    };
    
    return helpTexts[currentStep] || 'Please provide accurate information for better assessment.';
  }

  /**
   * Validate if step can be completed
   */
  canCompleteStep(currentStep, formData) {
    switch (currentStep) {
      case 1:
        return formData.age && formData.age > 0 && formData.age <= 110;
      
      case 2:
        const hasSelection = Object.values(formData).some(value => value === true);
        return hasSelection;
      
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return formData && formData.trim() !== '';
      
      case 9:
        return true; // File upload is optional
      
      case 10:
        return true; // Review step is always completable
      
      default:
        return true;
    }
  }
}