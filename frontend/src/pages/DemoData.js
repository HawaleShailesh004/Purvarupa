import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Play, FileText, MapPin } from 'lucide-react';
import { mockReferrals, testCases } from '../data/referrals';
import { useScreening } from '../context/ScreeningContext';

function DemoData() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dispatch } = useScreening();

  const loadTestCase = (testCase) => {
    // Reset screening state
    dispatch({ type: 'RESET_SCREENING' });
    
    // Load test data
    dispatch({ type: 'SET_BASIC_INFO', payload: testCase.data.basicInfo });
    dispatch({ type: 'SET_SYMPTOMS', payload: testCase.data.symptoms });
    
    if (testCase.data.deepQuestions) {
      Object.keys(testCase.data.deepQuestions).forEach(key => {
        dispatch({ 
          type: 'SET_DEEP_QUESTION', 
          key, 
          value: testCase.data.deepQuestions[key] 
        });
      });
    }
    
    // Navigate to screening to see the flow
    navigate('/screening');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <h1 className="text-xl font-semibold text-slate-900">
              Demo Data & Test Cases
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Cases */}
          <div>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <FileText className="h-5 w-5 mr-2 text-slate-600" />
                  Test Cases for Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6 text-sm">
                  These test cases demonstrate different risk scenarios and screening flows.
                </p>
                
                <div className="space-y-4">
                  {testCases.map((testCase) => (
                    <Card key={testCase.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 mb-1">
                              {testCase.name}
                            </h4>
                            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                              {testCase.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {testCase.data.basicInfo && (
                                <Badge variant="outline" className="text-xs">
                                  Age: {testCase.data.basicInfo.age}
                                </Badge>
                              )}
                              {testCase.data.symptoms?.none_of_the_above && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  No Symptoms
                                </Badge>
                              )}
                              {Object.keys(testCase.data.symptoms || {}).filter(key => 
                                key !== 'none_of_the_above' && testCase.data.symptoms[key]
                              ).length > 0 && (
                                <Badge className="bg-amber-100 text-amber-800 text-xs">
                                  {Object.keys(testCase.data.symptoms || {}).filter(key => 
                                    key !== 'none_of_the_above' && testCase.data.symptoms[key]
                                  ).length} Symptoms
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => loadTestCase(testCase)}
                            className="ml-4 bg-slate-800 hover:bg-slate-700"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Try
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mock Referrals */}
          <div>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <MapPin className="h-5 w-5 mr-2 text-slate-600" />
                  Sample TB Centers Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6 text-sm">
                  Mock TB testing centers and healthcare facilities used in demo results.
                </p>
                
                <div className="space-y-3">
                  {mockReferrals.map((referral) => (
                    <Card key={referral.id} className="border border-slate-200">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 text-sm mb-1">
                              {referral.name}
                            </h4>
                            <p className="text-xs text-slate-600 mb-2 capitalize">
                              {referral.type}
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {referral.address}
                            </p>
                            
                            <div className="flex items-center space-x-3 mt-2">
                              {referral.phone && (
                                <span className="text-xs text-slate-600">
                                  📞 {referral.phone}
                                </span>
                              )}
                              {referral.distance && (
                                <span className="text-xs text-slate-500">
                                  📍 {referral.distance}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Mock Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Development & Testing Notes</h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p>• All API calls are currently mocked for frontend-only testing</p>
              <p>• Scoring algorithm runs client-side with immediate feedback</p>
              <p>• Google Maps integration ready (requires VITE_GOOGLE_MAPS_API_KEY)</p>
              <p>• PDF generation works client-side using jsPDF</p>
              <p>• Multi-language support configured for English, Hindi, and Marathi</p>
              <p>• Data persistence uses LocalStorage for demo purposes</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default DemoData;