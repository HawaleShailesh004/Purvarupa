import React from "react";
import { useTranslation } from "react-i18next";
import { useScreening } from "../context/ScreeningContext";
import { Button } from "./ui/button";
import { CardHeader, CardTitle, Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, FileText, User, Stethoscope, Upload, CheckCircle, RotateCw } from "lucide-react";

const formatKey = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

function ReviewStep({ onSubmit, onPrevious, isSubmitting }) {
  const { t } = useTranslation();
  const { basicInfo, symptoms, deepAnswers, uploads, dispatch } = useScreening();

  const selectedSymptoms = Object.keys(symptoms).filter((key) => symptoms[key]);
  const hasDeepQuestions = Object.keys(deepAnswers).some(
    (key) => Object.keys(deepAnswers[key] || {}).length > 0
  );

  const prepareSummary = () => {
    const summary = {
      basicInfo: {
        Name: basicInfo.fullName,
        Age: basicInfo.age,
        Gender: basicInfo.gender,
        Location: basicInfo.location,
      },
      symptoms: selectedSymptoms.map((s) =>
        s === "none_of_the_above" ? "None of the above" : formatKey(s)
      ),
      deepQuestions: {},
      uploads: uploads.map((u) => u.filename),
    };

    Object.keys(deepAnswers).forEach((symptomKey) => {
      const questions = deepAnswers[symptomKey];
      if (Object.keys(questions).length > 0) {
        summary.deepQuestions[formatKey(symptomKey)] = {};
        Object.keys(questions).forEach((questionKey) => {
          summary.deepQuestions[formatKey(symptomKey)][formatKey(questionKey)] =
            questions[questionKey].replace(/_/g, " ");
        });
      }
    });

    return summary;
  };

  const handleSubmit = () => {
    const summary = prepareSummary();
    console.log("Human-readable summary:", summary);
    console.log("LLM-friendly summary:", JSON.stringify(summary, null, 2));
    onSubmit();
  };

  const handleRestart = () => {
    dispatch({ type: "RESET_SCREENING" });
  };

  return (
    <div className="p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl text-slate-900">{t("screening.review.title")}</CardTitle>
        <p className="text-slate-600">{t("screening.review.subtitle")}</p>
      </CardHeader>

      <div className="space-y-6 mb-8">
        {/* Basic Info */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center text-slate-900">
              <User className="h-5 w-5 mr-2 text-slate-600" />
              {t("screening.review.basic_info")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {basicInfo.fullName && (
              <div className="flex justify-between">
                <span className="text-slate-600">{t("screening.basic.name")}:</span>
                <span className="font-medium text-slate-900">{basicInfo.fullName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">{t("screening.basic.age")}:</span>
              <span className="font-medium text-slate-900">{basicInfo.age} {t("common.years")}</span>
            </div>
            {basicInfo.gender && (
              <div className="flex justify-between">
                <span className="text-slate-600">{t("screening.basic.gender")}:</span>
                <span className="font-medium text-slate-900">{basicInfo.gender}</span>
              </div>
            )}
            {basicInfo.location && (
              <div className="flex justify-between">
                <span className="text-slate-600">{t("screening.basic.location")}:</span>
                <span className="font-medium text-slate-900">{basicInfo.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center text-slate-900">
              <Stethoscope className="h-5 w-5 mr-2 text-slate-600" />
              {t("screening.review.symptoms")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSymptoms.length === 0 ? (
              <p className="text-slate-600">{t("screening.review.no_symptoms")}</p>
            ) : symptoms.none_of_the_above ? (
              <Badge variant="outline" className="text-green-700 border-green-300">
                {t("screening.symptoms.none_of_the_above")}
              </Badge>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map(
                  (symptom) =>
                    symptom !== "none_of_the_above" && (
                      <Badge key={symptom} variant="outline" className="text-slate-700">
                        {formatKey(symptom)}
                      </Badge>
                    )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deep Questions */}
        {hasDeepQuestions && (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-slate-900">
                <FileText className="h-5 w-5 mr-2 text-slate-600" />
                {t("screening.review.detailed_questions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.keys(deepAnswers).map((symptomKey) => {
                const questions = deepAnswers[symptomKey];
                return Object.keys(questions).map((questionKey) => (
                  <div key={`${symptomKey}-${questionKey}`} className="flex justify-between">
                    <span className="text-slate-600">{formatKey(questionKey)}:</span>
                    <span className="font-medium text-slate-900">{questions[questionKey].replace(/_/g, " ")}</span>
                  </div>
                ));
              })}
            </CardContent>
          </Card>
        )}

        {/* Uploaded Files */}
        {uploads.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-slate-900">
                <Upload className="h-5 w-5 mr-2 text-slate-600" />
                {t("screening.review.uploaded_files")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploads.map((upload, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-700">{upload.filename}</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Consent */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm leading-relaxed">{t("screening.review.consent_text")}</p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 gap-4">
        <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.previous")}
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 px-8">
            {isSubmitting ? t("screening.review.analyzing") : t("screening.review.submit")}
          </Button>

          <Button variant="secondary" onClick={handleRestart} disabled={isSubmitting}>
            <RotateCw className="h-4 w-4 mr-2" />
            {t("screening.review.restart")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReviewStep;
