import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, FileText, Download, Calendar } from 'lucide-react';

function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [savedReports, setSavedReports] = useState([]);

  useEffect(() => {
    // Load saved reports from localStorage
    const reports = JSON.parse(localStorage.getItem('tb_screening_reports') || '[]');
    setSavedReports(reports);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLikelihoodColor = (likelihood) => {
    switch (likelihood?.toLowerCase()) {
      case 'high':
      case 'confirmed':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-800';
      case 'low':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
                {t('profile.title', 'My Screening History')}
              </h1>
            </div>
            <Button onClick={() => navigate('/screening')}>
              {t('result.new_screening')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedReports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {t('profile.no_reports', 'No Saved Reports')}
              </h3>
              <p className="text-slate-600 mb-6">
                {t('profile.no_reports_desc', 'You haven\'t saved any screening reports yet.')}
              </p>
              <Button onClick={() => navigate('/screening')}>
                {t('profile.start_first', 'Start Your First Screening')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {t('profile.saved_reports', 'Saved Reports')} ({savedReports.length})
              </h2>
            </div>

            <div className="grid gap-6">
              {savedReports.map((report, index) => (
                <Card key={report.id || index} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-slate-600" />
                        <div>
                          <CardTitle className="text-slate-900">
                            {t('profile.screening_report', 'Screening Report')}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-500">
                              {formatDate(report.savedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getLikelihoodColor(report.result?.likelihood)}>
                        {report.result?.likelihood || 'Unknown'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">{t('result.local_score')}:</span>
                        <span className="ml-1 font-medium text-slate-900">
                          {report.localScore}/15
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">{t('result.confidence')}:</span>
                        <span className="ml-1 font-medium text-slate-900">
                          {report.result?.confidence_percent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">{t('result.urgency')}:</span>
                        <span className="ml-1 font-medium text-slate-900">
                          {report.result?.urgency}
                        </span>
                      </div>
                    </div>
                    
                    {report.basicInfo?.fullName && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                          {t('profile.patient', 'Patient')}: 
                          <span className="font-medium text-slate-900 ml-1">
                            {report.basicInfo.fullName}, {report.basicInfo.age} {t('common.years')}
                          </span>
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Generate PDF for saved report
                          console.log('Download report:', report.id);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('result.download_pdf')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;