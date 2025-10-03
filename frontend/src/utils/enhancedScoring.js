/**
 * Enhanced TB screening scoring with improved medical logic
 */

// Enhanced symptom weights based on medical literature
export const SYMPTOM_WEIGHTS = {
  cough_gt_2_weeks: 3,
  cough_with_sputum: 2, 
  cough_with_blood: 4,  // Increased - hemoptysis is highly significant
  fever_evening: 2,
  weight_loss: 3,       // Increased - constitutional symptom
  night_sweats: 2,
  chest_pain: 1,
  loss_of_appetite: 1
};

// Risk factor adjustments
export const RISK_ADJUSTMENTS = {
  previous_tb_not_completed: 5, // Critical risk factor
  previous_tb_completed: 2,
  diabetes: 2,
  hiv: 4,              // High immunocompromised risk
  kidney_disease: 2,
  cancer: 3,           // Immunocompromised
  smoker: 1,
  alcohol_use: 1
};

// Exposure risk weights
export const EXPOSURE_WEIGHTS = {
  'Family member with TB': 4,        // Increased from 3
  'Close workplace contact': 3,      // Increased from 2  
  'Neighbour / Community contact': 2, // Increased from 1
  'No known contact': 0
};

/**
 * Calculate enhanced TB risk score with detailed reasoning
 */
export function calculateEnhancedScore(symptoms, deepQuestions) {
  let score = 0;
  const reasons = [];

  // Handle "none of the above" case
  if (symptoms.none_of_the_above) {
    return {
      score: 0,
      reasons: ['No TB-related symptoms reported'],
      classification: 'Low',
      urgency: 'Monitor'
    };
  }

  // Calculate base symptom score
  Object.keys(SYMPTOM_WEIGHTS).forEach(symptom => {
    if (symptoms[symptom]) {
      const weight = SYMPTOM_WEIGHTS[symptom];
      score += weight;
      const symptomName = formatSymptomName(symptom);
      reasons.push(`${symptomName} (${weight} pts)`);
    }
  });

  // Add risk factor adjustments
  if (deepQuestions.previous_conditions) {
    deepQuestions.previous_conditions.forEach(condition => {
      if (RISK_ADJUSTMENTS[condition]) {
        const weight = RISK_ADJUSTMENTS[condition];
        score += weight;
        const conditionName = formatConditionName(condition);
        reasons.push(`${conditionName} (+${weight} pts)`);
      }
    });
  }

  // Add exposure risk
  const exposure = deepQuestions.exposure_contact;
  if (exposure && EXPOSURE_WEIGHTS[exposure]) {
    const weight = EXPOSURE_WEIGHTS[exposure];
    if (weight > 0) {
      score += weight;
      reasons.push(`${exposure} (+${weight} pts)`);
    }
  }

  // Duration and severity escalation
  if (deepQuestions.cough_duration_weeks === '> 1 month' && 
      (symptoms.cough_gt_2_weeks || symptoms.cough_with_sputum) && 
      score >= 4) {
    score += 2;
    reasons.push('Prolonged cough duration (>1 month) with other symptoms (+2 pts)');
  }

  // Blood in sputum with fever - high concern combination
  if (symptoms.cough_with_blood && symptoms.fever_evening) {
    score += 2;
    reasons.push('Blood in sputum with fever - high concern (+2 pts)');
  }

  // Multiple constitutional symptoms
  const constitutionalSymptoms = [
    symptoms.fever_evening,
    symptoms.weight_loss,
    symptoms.night_sweats,
    symptoms.loss_of_appetite
  ].filter(Boolean).length;

  if (constitutionalSymptoms >= 3) {
    score += 1;
    reasons.push('Multiple constitutional symptoms (+1 pt)');
  }

  // Cap the score
  const finalScore = Math.min(score, 20);

  return {
    score: finalScore,
    reasons,
    classification: getRiskClassification(finalScore),
    urgency: getUrgencyLevel(finalScore, symptoms, deepQuestions)
  };
}

/**
 * Get risk classification based on score
 */
export function getRiskClassification(score) {
  if (score >= 12) return 'Confirmed';
  if (score >= 8) return 'High';
  if (score >= 4) return 'Moderate';
  return 'Low';
}

/**
 * Get urgency level based on score and critical symptoms
 */
export function getUrgencyLevel(score, symptoms, deepQuestions) {
  // Immediate if critical symptoms or very high score
  if (score >= 10 || 
      symptoms.cough_with_blood ||
      (deepQuestions.previous_conditions && 
       deepQuestions.previous_conditions.includes('previous_tb_not_completed')) ||
      (deepQuestions.previous_conditions && 
       deepQuestions.previous_conditions.includes('hiv'))) {
    return 'Immediate';
  }

  // Test soon for moderate-high risk
  if (score >= 6) {
    return 'TestSoon';
  }

  // Monitor for low risk
  return 'Monitor';
}

/**
 * Get recommended tests based on risk level
 */
export function getRecommendedTests(riskLevel, symptoms) {
  const baseTests = ['Chest X-ray', 'Sputum smear microscopy'];

  if (riskLevel === 'Confirmed' || riskLevel === 'High') {
    return [...baseTests, 'CBNAAT (GeneXpert)', 'Sputum culture', 'Complete Blood Count'];
  } else if (riskLevel === 'Moderate') {
    const tests = [...baseTests, 'CBNAAT (GeneXpert)'];
    if (symptoms.cough_with_sputum || symptoms.cough_with_blood) {
      tests.push('Sputum AFB staining');
    }
    return tests;
  } else {
    return baseTests;
  }
}

/**
 * Generate explanation text
 */
export function generateExplanation(score, riskLevel, reasons) {
  const explanations = {
    'Confirmed': `Based on your symptoms and risk factors (score: ${score}/20), there is very high likelihood of TB infection. Immediate medical evaluation and testing is strongly recommended.`,
    'High': `Your symptoms and risk assessment (score: ${score}/20) indicate high TB risk. Please seek medical testing as soon as possible for proper evaluation.`,
    'Moderate': `Your screening shows moderate TB risk (score: ${score}/20). Medical consultation and testing is recommended to rule out TB infection.`,
    'Low': `Your screening indicates low TB risk (score: ${score}/20). Continue monitoring your health and seek care if symptoms develop or worsen.`
  };

  let baseExplanation = explanations[riskLevel];
  
  if (reasons.length > 3) {
    baseExplanation += ` Key factors include: ${reasons.slice(0, 3).join(', ')} and ${reasons.length - 3} other indicators.`;
  } else if (reasons.length > 0) {
    baseExplanation += ` Key factors: ${reasons.join(', ')}.`;
  }

  return baseExplanation;
}

// Helper functions
function formatSymptomName(symptomKey) {
  const formatting = {
    'cough_gt_2_weeks': 'Persistent cough >2 weeks',
    'cough_with_sputum': 'Productive cough',
    'cough_with_blood': 'Blood in sputum',
    'fever_evening': 'Evening fever',
    'weight_loss': 'Unexplained weight loss',
    'night_sweats': 'Night sweats',
    'chest_pain': 'Chest pain',
    'loss_of_appetite': 'Loss of appetite'
  };
  return formatting[symptomKey] || symptomKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatConditionName(conditionKey) {
  const formatting = {
    'previous_tb_not_completed': 'Incomplete previous TB treatment',
    'previous_tb_completed': 'Previous TB treatment history',
    'diabetes': 'Diabetes mellitus',
    'hiv': 'HIV infection',
    'kidney_disease': 'Chronic kidney disease',
    'cancer': 'Cancer/malignancy',
    'smoker': 'Smoking history',
    'alcohol_use': 'Alcohol use'
  };
  return formatting[conditionKey] || conditionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}