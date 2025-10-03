import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Phone, Navigation, Building2 } from 'lucide-react';

function ReferralList({ referrals }) {
  const { t } = useTranslation();

  const handleCallClick = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleDirectionsClick = (referral) => {
    const query = encodeURIComponent(`${referral.name} ${referral.address}`);
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'dots center':
        return <Building2 className="h-4 w-4 text-teal-600" />;
      case 'hospital':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'clinic':
        return <Building2 className="h-4 w-4 text-green-600" />;
      default:
        return <MapPin className="h-4 w-4 text-slate-600" />;
    }
  };

  if (!referrals || referrals.length === 0) {
    return (
      <p className="text-slate-500 italic text-center py-4">
        {t('result.no_referrals')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((referral, index) => (
        <Card key={index} className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(referral.type)}
                  <h4 className="font-semibold text-slate-900">{referral.name}</h4>
                </div>
                
                <p className="text-sm text-slate-600 mb-1 capitalize">
                  {referral.type}
                </p>
                
                <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                  {referral.address}
                </p>
                
                {referral.distance && (
                  <p className="text-xs text-slate-500 mb-3">
                    {t('result.distance')}: {referral.distance}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {referral.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCallClick(referral.phone)}
                      className="text-slate-600 hover:text-slate-900 border-slate-300"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {t('result.call')}
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDirectionsClick(referral)}
                    className="text-slate-600 hover:text-slate-900 border-slate-300"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    {t('result.directions')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-center pt-4">
        <Button
          variant="outline"
          className="text-slate-600 hover:text-slate-900 border-slate-300"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {t('result.view_on_map')}
        </Button>
      </div>
    </div>
  );
}

export default ReferralList;