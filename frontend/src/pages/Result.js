import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useScreening } from '../context/ScreeningContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Download, MapPin, Phone, Share, FileText } from 'lucide-react';
import ResultCard from '../components/ResultCard';
import ReasonsList from '../components/ReasonsList';
import ReferralList from '../components/ReferralList';
import { generatePDF } from '../utils/pdfGenerator';
import { mockReferrals } from '../data/referrals';

function Result() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { result, localScore, basicInfo, symptoms, deepQuestions } = useScreening();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 mb-4">{t('result.no_data')}</p>
            <Button onClick={() => navigate('/screening')}>
              {t('result.start_screening')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF({
        result,
        localScore,
        basicInfo,
        symptoms,
        deepQuestions,
        referrals: mockReferrals.slice(0, 3)
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
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

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'immediate':
        return 'bg-red-600 text-white';
      case 'testsoon':
        return 'bg-amber-600 text-white';
      case 'monitor':
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                {isGeneratingPDF ? t('result.generating') : t('result.download_pdf')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/screening')}
              >
                {t('result.new_screening')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Result Card */}
        <Card className="mb-8 border-slate-200">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {t('result.likelihood_title')}: 
                <span className={`ml-2 px-4 py-2 rounded-lg border ${getLikelihoodColor(result.likelihood)}`}>
                  {t(`result.likelihood.${result.likelihood?.toLowerCase()}`)}
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {result.explanation_plain}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('result.local_score')}</p>
                <p className="text-2xl font-semibold text-slate-900">{localScore}/15</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('result.confidence')}</p>
                <p className="text-2xl font-semibold text-slate-900">{result.confidence_percent}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('result.urgency')}</p>
                <Badge className={getUrgencyColor(result.urgency)}>
                  {t(`result.urgency.${result.urgency?.toLowerCase()}`)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Why This Result */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <FileText className="h-5 w-5 mr-2 text-slate-600" />
                  {t('result.why_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReasonsList reasons={result.reasons} />
              </CardContent>
            </Card>

            {/* Recommended Tests */}
            {result.recommended_tests && result.recommended_tests.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">{t('result.recommended_tests')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommended_tests.map((test, index) => (
                      <li key={index} className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                        {test}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Education Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3">{t('result.education.title')}</h3>
                <div className="space-y-2 text-blue-800 text-sm">
                  <p>{t('result.education.what_is_tb')}</p>
                  <p>{t('result.education.how_spreads')}</p>
                  <p>{t('result.education.curable')}</p>
                  <p>{t('result.education.next_steps')}</p>
                </div>
                <p className="text-blue-700 font-medium mt-4">
                  {t('result.education.helpline')}: <a href="tel:1800116666" className="underline">1800-11-6666</a>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Referrals */}
          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <MapPin className="h-5 w-5 mr-2 text-slate-600" />
                  {t('result.referrals_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReferralList referrals={result.referrals || mockReferrals.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 bg-slate-100 border-slate-200">
          <CardContent className="p-6 text-center">
            <p className="text-slate-700 font-medium mb-2">
              {t('result.disclaimer.title')}
            </p>
            <p className="text-slate-600 text-sm">
              {t('result.disclaimer.text')}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Result;