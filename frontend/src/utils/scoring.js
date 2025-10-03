/**
 * Calculate local TB screening score based on symptoms and deep questions
 * This provides immediate feedback while waiting for AI analysis
 */
export function calculateLocalScore(symptoms, deepQuestions) {
  let score = 0;

  // Symptom weights
  const symptomWeights = {
    cough_gt_2_weeks: 3,
    cough_with_sputum: 2,
    cough_with_blood: 3,
    fever_evening: 2,
    weight_loss: 2,
    night_sweats: 2,
    chest_pain: 1,
    loss_of_appetite: 1
  };

  // Calculate base symptom score
  Object.keys(symptomWeights).forEach(symptom => {
    if (symptoms[symptom]) {
      score += symptomWeights[symptom];
    }
  });

  // Risk adjustments from deep questions
  if (deepQuestions.previous_conditions) {
    if (deepQuestions.previous_conditions.includes('previous_tb_not_completed')) {
      score += 3;
    } else if (deepQuestions.previous_conditions.includes('previous_tb_completed')) {
      score += 2;
    }

    if (deepQuestions.previous_conditions.includes('diabetes')) {
      score += 2;
    }
    if (deepQuestions.previous_conditions.includes('hiv')) {
      score += 3;
    }
    if (deepQuestions.previous_conditions.includes('kidney_disease') || 
        deepQuestions.previous_conditions.includes('cancer')) {
      score += 2;
    }
    if (deepQuestions.previous_conditions.includes('smoker')) {
      score += 1;
    }
    if (deepQuestions.previous_conditions.includes('alcohol_use')) {
      score += 1;
    }
  }

  // Exposure contact adjustments
  switch (deepQuestions.exposure_contact) {
    case 'Family member with TB':
      score += 3;
      break;
    case 'Close workplace contact':
      score += 2;
      break;
    case 'Neighbour / Community contact':
      score += 1;
      break;
    default:
      break;
  }

  // Duration escalation
  if (deepQuestions.cough_duration_weeks === '> 1 month' && score >= 5) {
    score += 2;
  }

  return Math.min(score, 15); // Cap at 15
}

/**
 * Get risk classification based on local score
 */
export function getLocalRiskClassification(score) {
  if (score >= 9) {
    return 'High';
  } else if (score >= 5) {
    return 'Moderate';
  } else {
    return 'Low';
  }
}

/**
 * Get urgency level based on score and symptoms
 */
export function getUrgencyLevel(score, symptoms, deepQuestions) {
  // Immediate if high score with concerning symptoms
  if (score >= 9 || symptoms.cough_with_blood || 
      deepQuestions.previous_conditions?.includes('previous_tb_not_completed')) {
    return 'Immediate';
  }
  
  // Test soon for moderate risk
  if (score >= 5) {
    return 'TestSoon';
  }
  
  // Monitor for low risk
  return 'Monitor';
}

/**
 * Generate reasons list for local scoring
 */
export function generateLocalReasons(symptoms, deepQuestions, score) {
  const reasons = [];
  
  // Add symptom-based reasons
  if (symptoms.cough_gt_2_weeks) {
    reasons.push('Persistent cough > 2 weeks (3 pts)');
  }
  if (symptoms.cough_with_blood) {
    reasons.push('Blood in cough/sputum (3 pts)');
  }
  if (symptoms.fever_evening) {
    reasons.push('Evening fever pattern (2 pts)');
  }
  if (symptoms.weight_loss) {
    reasons.push('Unexplained weight loss (2 pts)');
  }
  if (symptoms.night_sweats) {
    reasons.push('Night sweats reported (2 pts)');
  }
  
  // Add contact history
  if (deepQuestions.exposure_contact === 'Family member with TB') {
    reasons.push('Family member TB contact (3 pts)');
  } else if (deepQuestions.exposure_contact === 'Close workplace contact') {
    reasons.push('Workplace TB contact (2 pts)');
  }
  
  // Add risk factors
  if (deepQuestions.previous_conditions?.includes('diabetes')) {
    reasons.push('Diabetes (increased risk factor, 2 pts)');
  }
  if (deepQuestions.previous_conditions?.includes('previous_tb_completed')) {
    reasons.push('Previous TB treatment history (2 pts)');
  }
  
  return reasons;
}