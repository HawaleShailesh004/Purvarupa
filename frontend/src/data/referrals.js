import referralsData from './referrals.json';

export const mockReferrals = referralsData;

// Test cases for demo
export const testCases = [
  {
    id: 'test_a',
    name: 'No Symptoms Test',
    description: 'Test case with no symptoms - should show low risk',
    data: {
      basicInfo: {
        fullName: 'Test User A',
        age: 25,
        gender: 'Male',
        location: 'Mumbai, Maharashtra'
      },
      symptoms: {
        none_of_the_above: true,
        cough_gt_2_weeks: false,
        cough_with_sputum: false,
        cough_with_blood: false,
        fever_evening: false,
        weight_loss: false,
        night_sweats: false,
        chest_pain: false,
        loss_of_appetite: false
      }
    }
  },
  {
    id: 'test_b',
    name: 'High Risk Test',
    description: 'Test case with multiple symptoms and family contact - should show high risk',
    data: {
      basicInfo: {
        fullName: 'Test User B',
        age: 45,
        gender: 'Female',
        location: 'Delhi'
      },
      symptoms: {
        cough_gt_2_weeks: true,
        cough_with_sputum: true,
        fever_evening: true,
        weight_loss: true,
        night_sweats: true,
        chest_pain: false,
        loss_of_appetite: true,
        none_of_the_above: false
      },
      deepQuestions: {
        cough_duration_weeks: '> 1 month',
        cough_type: 'With sputum',
        fever_pattern: 'Evening/low-grade',
        weight_appetite: 'Both',
        night_sweats_fatigue: 'Both',
        exposure_contact: 'Family member with TB',
        previous_conditions: ['diabetes']
      }
    }
  },
  {
    id: 'test_c',
    name: 'Moderate Risk Test',
    description: 'Test case with some symptoms - should show moderate risk',
    data: {
      basicInfo: {
        fullName: 'Test User C',
        age: 35,
        gender: 'Male',
        location: 'Pune, Maharashtra'
      },
      symptoms: {
        cough_gt_2_weeks: true,
        fever_evening: true,
        weight_loss: false,
        night_sweats: false,
        chest_pain: false,
        loss_of_appetite: false,
        none_of_the_above: false
      },
      deepQuestions: {
        cough_duration_weeks: '2-4 weeks',
        cough_type: 'Dry',
        fever_pattern: 'Evening/low-grade',
        weight_appetite: 'None',
        night_sweats_fatigue: 'None',
        exposure_contact: 'No known contact',
        previous_conditions: []
      }
    }
  },
  {
    id: 'test_d',
    name: 'Previous TB Test',
    description: 'Test case with previous incomplete TB treatment - should escalate to high risk',
    data: {
      basicInfo: {
        fullName: 'Test User D',
        age: 40,
        gender: 'Female',
        location: 'Kolkata, West Bengal'
      },
      symptoms: {
        cough_gt_2_weeks: true,
        cough_with_sputum: false,
        fever_evening: false,
        weight_loss: false,
        night_sweats: false,
        chest_pain: false,
        loss_of_appetite: false,
        none_of_the_above: false
      },
      deepQuestions: {
        cough_duration_weeks: '2-4 weeks',
        cough_type: 'Dry',
        fever_pattern: 'No fever',
        weight_appetite: 'None',
        night_sweats_fatigue: 'None',
        exposure_contact: 'No known contact',
        previous_conditions: ['previous_tb_not_completed']
      }
    }
  }
];