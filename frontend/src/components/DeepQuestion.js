import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScreening } from '../context/ScreeningContext';
import { Button } from './ui/button';
import { CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function DeepQuestion({ questionKey, title, options, onNext, onPrevious }) {
  const { t } = useTranslation();
  const { deepQuestions, dispatch } = useScreening();
  const [selectedValue, setSelectedValue] = useState(deepQuestions[questionKey] || '');

  const handleNext = () => {
    dispatch({ type: 'SET_DEEP_QUESTION', key: questionKey, value: selectedValue });
    onNext();
  };

  const canProceed = selectedValue !== '';

  return (
    <div className="p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl text-slate-900 mb-4">
          {title}
        </CardTitle>
        <p className="text-slate-600">
          {t('screening.deep.select_one')}
        </p>
      </CardHeader>

      <div className="mb-8">
        <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <RadioGroupItem 
                  value={option.value} 
                  id={`option-${index}`}
                  className="text-slate-800 border-slate-400 data-[state=checked]:border-slate-800"
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="text-slate-700 cursor-pointer flex-1 leading-relaxed"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.previous')}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          className="bg-slate-800 hover:bg-slate-700 px-8"
        >
          {t('common.next')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default DeepQuestion;