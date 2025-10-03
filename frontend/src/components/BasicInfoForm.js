import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useScreening } from '../context/ScreeningContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowRight } from 'lucide-react';

function BasicInfoForm({ onNext }) {
  const { t } = useTranslation();
  const { basicInfo, dispatch } = useScreening();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: basicInfo
  });

  const onSubmit = (data) => {
    dispatch({ type: 'SET_BASIC_INFO', payload: data });
    onNext();
  };

  const handleSelectChange = (field, value) => {
    setValue(field, value);
    dispatch({ type: 'SET_BASIC_INFO', payload: { [field]: value } });
  };

  return (
    <div className="p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl text-slate-900">
          {t('screening.basic.title')}
        </CardTitle>
        <p className="text-slate-600">
          {t('screening.basic.subtitle')}
        </p>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="fullName" className="text-slate-700">
            {t('screening.basic.name')} <span className="text-slate-400">({t('common.optional')})</span>
          </Label>
          <Input
            id="fullName"
            {...register('fullName')}
            className="mt-2"
            placeholder={t('screening.basic.name_placeholder')}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="age" className="text-slate-700">
              {t('screening.basic.age')} *
            </Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="110"
              {...register('age', { required: t('validation.age_required'), min: 0, max: 110 })}
              className="mt-2"
              placeholder="25"
            />
            {errors.age && (
              <p className="text-red-600 text-sm mt-1">{errors.age.message}</p>
            )}
          </div>

          <div>
            <Label className="text-slate-700">
              {t('screening.basic.gender')}
            </Label>
            <Select onValueChange={(value) => handleSelectChange('gender', value)} value={watch('gender')}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('screening.basic.gender_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{t('screening.basic.gender_options.male')}</SelectItem>
                <SelectItem value="Female">{t('screening.basic.gender_options.female')}</SelectItem>
                <SelectItem value="Other">{t('screening.basic.gender_options.other')}</SelectItem>
                <SelectItem value="Prefer not to say">{t('screening.basic.gender_options.prefer_not')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="location" className="text-slate-700">
            {t('screening.basic.location')} <span className="text-slate-400">({t('common.optional')})</span>
          </Label>
          <Input
            id="location"
            {...register('location')}
            className="mt-2"
            placeholder={t('screening.basic.location_placeholder')}
          />
        </div>

        <div>
          <Label htmlFor="contact" className="text-slate-700">
            {t('screening.basic.contact')} <span className="text-slate-400">({t('common.optional')})</span>
          </Label>
          <Input
            id="contact"
            type="tel"
            {...register('contact')}
            className="mt-2"
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" className="bg-slate-800 hover:bg-slate-700 px-8">
            {t('common.next')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BasicInfoForm;