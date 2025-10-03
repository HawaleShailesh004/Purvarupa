/**
 * Mock API calls for development and testing
 * Simulates backend responses with realistic delays
 */

import { calculateLocalScore, getLocalRiskClassification, getUrgencyLevel, generateLocalReasons } from './scoring';
import { mockReferrals } from '../data/referrals';

/**
 * Mock analyze endpoint - simulates AI processing
 */
export async function mockApiCall(screeningData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Calculate local score for mock response
  const localScore = screeningData ? 
    calculateLocalScore(screeningData.symptoms, screeningData.deepQuestions) : 
    Math.floor(Math.random() * 15);

  const likelihood = getLocalRiskClassification(localScore);
  const urgency = screeningData ? 
    getUrgencyLevel(localScore, screeningData.symptoms, screeningData.deepQuestions) :
    'Monitor';

  // Generate mock response based on score
  const mockResponse = {
    likelihood,
    confidence_percent: Math.floor(Math.random() * 25) + 65, // 65-90%
    reasons: screeningData ? 
      generateLocalReasons(screeningData.symptoms, screeningData.deepQuestions, localScore) :
      [
        'Persistent cough > 2 weeks (3 pts)',
        'Evening fever pattern (2 pts)',
        'Family member TB contact (3 pts)'
      ],
    urgency,
    recommended_tests: getRecommendedTests(likelihood),
    referrals: mockReferrals.slice(0, 5),
    explanation_plain: getExplanationText(likelihood, localScore)
  };

  return mockResponse;
}

function getRecommendedTests(likelihood) {
  const baseTests = ['Sputum smear microscopy', 'Chest X-ray'];
  
  if (likelihood === 'High' || likelihood === 'Confirmed') {
    return [...baseTests, 'CBNAAT (GeneXpert)', 'Sputum culture'];
  } else if (likelihood === 'Moderate') {
    return [...baseTests, 'CBNAAT (GeneXpert)'];
  } else {
    return baseTests;
  }
}

function getExplanationText(likelihood, score) {
  switch (likelihood) {
    case 'High':
      return `Based on your symptoms and risk factors (score: ${score}/15), there is a high likelihood of TB infection. Immediate medical evaluation is recommended.`;
    case 'Moderate':
      return `Your symptoms and risk assessment (score: ${score}/15) suggest moderate TB risk. Please seek medical testing soon for proper evaluation.`;
    case 'Low':
    default:
      return `Your screening indicates low TB risk (score: ${score}/15). Continue monitoring your health and seek care if symptoms develop or worsen.`;
  }
}

/**
 * Mock upload endpoint
 */
export async function mockUploadFile(file) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    url: `/uploads/${Date.now()}_${file.name}`,
    filename: file.name,
    size: file.size
  };
}

/**
 * Mock save report endpoint
 */
export async function mockSaveReport(reportData) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const reportId = `report_${Date.now()}`;
  
  // Save to localStorage for demo
  const existingReports = JSON.parse(localStorage.getItem('tb_screening_reports') || '[]');
  existingReports.push({
    id: reportId,
    ...reportData,
    savedAt: new Date().toISOString()
  });
  localStorage.setItem('tb_screening_reports', JSON.stringify(existingReports));
  
  return {
    success: true,
    reportId,
    message: 'Report saved successfully'
  };
}