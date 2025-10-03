import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useScreening } from '../context/ScreeningContext';
import { Button } from './ui/button';
import { CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { QuestionFlowManager } from '../utils/questionFlowLogic';

function EnhancedSymptomsForm({ onNext, onPrevious }) {
  const { t } = useTranslation();
  const { symptoms, deepQuestions, dispatch } = useScreening();
  const [localSymptoms, setLocalSymptoms] = useState(symptoms);
  const [showWarning, setShowWarning] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(5);

  const flowManager = new QuestionFlowManager(localSymptoms, deepQuestions);

  useEffect(() => {
    // Update estimated completion time
    const time = flowManager.getEstimatedTime(2);
    setEstimatedTime(time);

    // Show warning for critical symptoms
    const hasCriticalSymptoms = localSymptoms.cough_with_blood;
    setShowWarning(hasCriticalSymptoms);
  }, [localSymptoms]);

  const symptomOptions = [
    { 
      key: 'cough_gt_2_weeks', 
      label: t('screening.symptoms.cough_gt_2_weeks'),
      critical: false,
      description: 'Persistent cough lasting more than 2 weeks'
    },
    { 
      key: 'cough_with_sputum', 
      label: t('screening.symptoms.cough_with_sputum'),
      critical: false,
      description: 'Cough that produces phlegm or mucus'
    },
    { 
      key: 'cough_with_blood', 
      label: t('screening.symptoms.cough_with_blood'),
      critical: true,
      description: 'Coughing up blood or blood-stained sputum (hemoptysis)'
    },
    { 
      key: 'fever_evening', 
      label: t('screening.symptoms.fever_evening'),
      critical: false,
      description: 'Fever, especially during evening or nighttime'
    },
    { 
      key: 'weight_loss', 
      label: t('screening.symptoms.weight_loss'),
      critical: false,
      description: 'Unintentional weight loss without dieting'
    },
    { 
      key: 'night_sweats', 
      label: t('screening.symptoms.night_sweats'),
      critical: false,
      description: 'Profuse sweating during sleep'
    },
    { 
      key: 'chest_pain', 
      label: t('screening.symptoms.chest_pain'),
      critical: false,
      description: 'Chest pain or difficulty breathing'
    },
    { 
      key: 'loss_of_appetite', 
      label: t('screening.symptoms.loss_of_appetite'),
      critical: false,
      description: 'Reduced desire to eat or lack of appetite'
    }
  ];

  const handleSymptomChange = (key, checked) => {
    let newSymptoms = { ...localSymptoms };
    
    if (key === 'none_of_the_above') {
      if (checked) {
        // Clear all other symptoms if "none" is selected
        newSymptoms = {
          ...Object.keys(newSymptoms).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
          none_of_the_above: true
        };
      } else {
        newSymptoms.none_of_the_above = false;
      }
    } else {
      // Clear "none" if any symptom is selected
      if (checked && localSymptoms.none_of_the_above) {
        newSymptoms.none_of_the_above = false;
      }
      newSymptoms[key] = checked;
    }
    
    setLocalSymptoms(newSymptoms);
  };

  const handleNext = () => {
    dispatch({ type: 'SET_SYMPTOMS', payload: localSymptoms });
    onNext();
  };

  const hasAnySymptom = Object.keys(localSymptoms).some(key => 
    key !== 'none_of_the_above' && localSymptoms[key]
  );

  const canProceed = localSymptoms.none_of_the_above || hasAnySymptom;
  const selectedCount = Object.keys(localSymptoms).filter(key => 
    key !== 'none_of_the_above' && localSymptoms[key]
  ).length;

  return (
    <div className="p-8 slide-up">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-2xl text-slate-900">
              {t('screening.symptoms.title')}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {t('screening.symptoms.subtitle')}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-slate-500">
              <Clock className="h-4 w-4 mr-1" />
              {estimatedTime} min remaining
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {selectedCount} symptoms selected
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <Progress value={20} className="h-2 mb-6" />
      </CardHeader>

      {/* Critical symptom warning */}
      {showWarning && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Important:</strong> Coughing up blood requires immediate medical attention. 
            Please seek emergency care while completing this screening.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 mb-8">
        {symptomOptions.map((symptom) => (
          <div 
            key={symptom.key} 
            className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-slate-50 transition-all duration-200 ${
              symptom.critical ? 'border-red-200 hover:bg-red-50' : 'border-slate-200'
            } ${
              localSymptoms[symptom.key] ? 'bg-blue-50 border-blue-300' : ''
            }`}
          >
            <Checkbox
              id={symptom.key}
              checked={localSymptoms[symptom.key] || false}
              onCheckedChange={(checked) => handleSymptomChange(symptom.key, checked)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
            />
            <div className="flex-1 cursor-pointer" onClick={() => handleSymptomChange(symptom.key, !localSymptoms[symptom.key])}>
              <label className="text-slate-700 cursor-pointer font-medium leading-relaxed">
                {symptom.label}
                {symptom.critical && (
                  <AlertCircle className="inline h-4 w-4 ml-2 text-red-500" />
                )}
              </label>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                {symptom.description}
              </p>
            </div>
          </div>
        ))}

        {/* None of the above option */}
        <div className="border-t border-slate-200 pt-6 mt-8">
          <div className={`flex items-center space-x-3 p-4 border-2 border-dashed rounded-lg hover:bg-slate-50 transition-colors ${
            localSymptoms.none_of_the_above ? 'bg-green-50 border-green-300' : 'border-slate-300'
          }`}>
            <Checkbox
              id="none_of_the_above"
              checked={localSymptoms.none_of_the_above || false}
              onCheckedChange={(checked) => handleSymptomChange('none_of_the_above', checked)}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <div className="flex-1">
              <label
                htmlFor="none_of_the_above"
                className="text-slate-700 cursor-pointer font-medium"
              >
                {t('screening.symptoms.none_of_the_above')}
              </label>
              <p className="text-sm text-slate-500 mt-1">
                Select this if you don't have any of the symptoms listed above
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Helper text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <strong>Tip:</strong> Be thorough and honest about your symptoms. 
          This information helps provide the most accurate assessment.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.previous')}
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          className="medical-button-primary px-8 flex items-center"
        >
          {t('common.next')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default EnhancedSymptomsForm;