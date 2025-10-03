import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScreening } from '../context/ScreeningContext';
import { Button } from './ui/button';
import { CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, ArrowRight, Upload, X, FileText, Image } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

function FileUpload({ onNext, onPrevious }) {
  const { t } = useTranslation();
  const { uploads, dispatch } = useScreening();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const uploadTypes = [
    { key: 'chest_xray', label: t('screening.upload.chest_xray'), accept: '.jpg,.jpeg,.png,.pdf' },
    { key: 'sputum_test', label: t('screening.upload.sputum_test'), accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'blood_test', label: t('screening.upload.blood_test'), accept: '.pdf,.jpg,.jpeg,.png' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: t('screening.upload.error'),
          description: t('screening.upload.file_too_large'),
          variant: 'destructive'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newUpload = {
          type: 'general',
          filename: file.name,
          content_base64: e.target.result,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        dispatch({ type: 'ADD_UPLOAD', payload: newUpload });
        toast({
          title: t('screening.upload.success'),
          description: `${file.name} ${t('screening.upload.uploaded_successfully')}`
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeUpload = (index) => {
    dispatch({ type: 'REMOVE_UPLOAD', index });
  };

  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-red-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl text-slate-900">
          {t('screening.upload.title')}
        </CardTitle>
        <p className="text-slate-600">
          {t('screening.upload.subtitle')}
        </p>
      </CardHeader>

      {/* Upload Types Info */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {uploadTypes.map((type) => (
          <div key={type.key} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-medium text-slate-800 text-sm">{type.label}</p>
            <p className="text-xs text-slate-500 mt-1">{type.accept}</p>
          </div>
        ))}
      </div>

      {/* Drag and Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-slate-400 bg-slate-50' 
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {t('screening.upload.drop_files')}
        </h3>
        <p className="text-slate-600 mb-4">
          {t('screening.upload.or_click')}
        </p>
        <p className="text-sm text-slate-500">
          {t('screening.upload.file_limit')}
        </p>
      </div>

      {/* Uploaded Files */}
      {uploads.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-slate-900 mb-4">
            {t('screening.upload.uploaded_files')} ({uploads.length})
          </h4>
          <div className="space-y-3">
            {uploads.map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  {getFileIcon(upload.filename)}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{upload.filename}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(upload.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUpload(index)}
                  className="text-slate-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-8">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.previous')}
        </Button>
        <Button className="bg-slate-800 hover:bg-slate-700 px-8" onClick={onNext}>
          {t('common.next')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default FileUpload;