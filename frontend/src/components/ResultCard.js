import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

function ResultCard({ result, localScore }) {
  const { t } = useTranslation();

  const getLikelihoodIcon = (likelihood) => {
    switch (likelihood?.toLowerCase()) {
      case 'high':
      case 'confirmed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'moderate':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'low':
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
  };

  const getLikelihoodColor = (likelihood) => {
    switch (likelihood?.toLowerCase()) {
      case 'high':
      case 'confirmed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          {getLikelihoodIcon(result.likelihood)}
          <span className="text-slate-900">{t('result.likelihood_title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">{t('result.likelihood')}:</span>
            <Badge className={`px-3 py-1 ${getLikelihoodColor(result.likelihood)}`}>
              {t(`result.likelihood.${result.likelihood?.toLowerCase()}`)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-600">{t('result.confidence')}:</span>
            <span className="font-semibold text-slate-900">{result.confidence_percent}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-600">{t('result.local_score')}:</span>
            <span className="font-semibold text-slate-900">{localScore}/15</span>
          </div>
          
          {result.explanation_plain && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-slate-700 leading-relaxed">{result.explanation_plain}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ResultCard;