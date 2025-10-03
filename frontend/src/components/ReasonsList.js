import React from 'react';
import { useTranslation } from 'react-i18next';

function ReasonsList({ reasons }) {
  const { t } = useTranslation();

  if (!reasons || reasons.length === 0) {
    return (
      <p className="text-slate-500 italic">{t('result.no_reasons')}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {reasons.map((reason, index) => (
        <li key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
          <span className="text-slate-700 leading-relaxed">{reason}</span>
        </li>
      ))}
    </ul>
  );
}

export default ReasonsList;