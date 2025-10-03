import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useScreening } from '../context/ScreeningContext';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import BasicInfoForm from '../components/BasicInfoForm';
import SymptomsForm from '../components/SymptomsForm';
import DeepQuestion from '../components/DeepQuestion';
import FileUpload from '../components/FileUpload';
import ReviewStep from '../components/ReviewStep';
import { mockApiCall } from '../utils/mockApi';

function Screening() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStep, totalSteps, symptoms, dispatch } = useScreening();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progressPercentage = (currentStep / totalSteps) * 100;

  // Check if we should skip deep questions (none of the above selected)
  const shouldSkipDeepQuestions = symptoms.none_of_the_above && 
    !Object.keys(symptoms).some(key => key !== 'none_of_the_above' && symptoms[key]);

  const handleNext = () => {
    if (currentStep === 2 && shouldSkipDeepQuestions) {
      // Skip to final step if no symptoms
      dispatch({ type: 'SET_STEP', payload: totalSteps });
    } else {
      dispatch({ type: 'SET_STEP', payload: Math.min(currentStep + 1, totalSteps) });
    }
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_STEP', payload: Math.max(currentStep - 1, 1) });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Calculate local score
    dispatch({ type: 'CALCULATE_SCORE' });
    
    try {
      // Mock API call to analyze results
      const result = await mockApiCall();
      dispatch({ type: 'SET_RESULT', payload: result });
      navigate('/result');
    } catch (error) {
      console.error('Failed to analyze screening:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm onNext={handleNext} />;
      case 2:
        return <SymptomsForm onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return (
          <DeepQuestion
            questionKey="cough_duration_weeks"
            title={t('screening.deep.cough_duration.title')}
            options={[
              { value: '< 2 weeks', label: t('screening.deep.cough_duration.options.short') },
              { value: '2-4 weeks', label: t('screening.deep.cough_duration.options.medium') },
              { value: '> 1 month', label: t('screening.deep.cough_duration.options.long') }
            ]}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <DeepQuestion
            questionKey="cough_type"
            title={t('screening.deep.cough_type.title')}
            options={[
              { value: 'Dry', label: t('screening.deep.cough_type.options.dry') },
              { value: 'With sputum', label: t('screening.deep.cough_type.options.sputum') },
              { value: 'With blood', label: t('screening.deep.cough_type.options.blood') }
            ]}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <DeepQuestion
            questionKey="fever_pattern"
            title={t('screening.deep.fever_pattern.title')}
            options={[
              { value: 'Evening/low-grade', label: t('screening.deep.fever_pattern.options.evening') },
              { value: 'High with chills', label: t('screening.deep.fever_pattern.options.high') },
              { value: 'No fever', label: t('screening.deep.fever_pattern.options.none') }
            ]}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <DeepQuestion
            questionKey="weight_appetite"
            title={t('screening.deep.weight_appetite.title')}
            options={[
              { value: 'Weight loss', label: t('screening.deep.weight_appetite.options.weight') },
              { value: 'Loss of appetite', label: t('screening.deep.weight_appetite.options.appetite') },
              { value: 'Both', label: t('screening.deep.weight_appetite.options.both') },
              { value: 'None', label: t('screening.deep.weight_appetite.options.none') }
            ]}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 7:
        return (
          <DeepQuestion
            questionKey="night_sweats_fatigue"
            title={t('screening.deep.night_sweats.title')}
            options={[
              { value: 'Night sweats', label: t('screening.deep.night_sweats.options.sweats') },
              { value: 'Persistent fatigue', label: t('screening.deep.night_sweats.options.fatigue') },
              { value: 'Both', label: t('screening.deep.night_sweats.options.both') },
              { value: 'None', label: t('screening.deep.night_sweats.options.none') }
            ]}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 8:
        return (
          <DeepQuestion
            questionKey="exposure_contact"
            title={t('screening.deep.exposure.title')}
            options={[
              { value: 'Family member with TB', label: t('screening.deep.exposure.options.family') },
              { value: 'Close workplace contact', label: t('screening.deep.exposure.options.workplace') },
              { value: 'Neighbour / Community contact', label: t('screening.deep.exposure.options.community') },
              { value: 'No known contact', label: t('screening.deep.exposure.options.none') }
            ]}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 9:
        return <FileUpload onNext={handleNext} onPrevious={handlePrevious} />;
      case 10:
        return (
          <ReviewStep 
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Progress */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <span className="text-sm text-slate-500">
              {t('screening.step')} {currentStep} {t('common.of')} {totalSteps}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-slate-200">
          <CardContent className="p-0">
            {renderStepContent()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Screening;