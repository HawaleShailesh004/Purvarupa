import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useScreening } from "../context/ScreeningContext";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import BasicInfoForm from "../components/BasicInfoForm";
import SymptomsForm from "../components/SymptomsForm";
import DeepQuestion from "../components/DeepQuestion";
import FileUpload from "../components/FileUpload";
import ReviewStep from "../components/ReviewStep";
import { mockApiCall } from "../utils/mockApi";
import Header from "@/components/Header";

function Screening() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStep, totalSteps, symptoms, dispatch } = useScreening();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic deep question config from translation
  const deepQuestionConfig = {
    cough_gt_2_weeks: t("screening.deep.cough_gt_2_weeks", { returnObjects: true }),
    cough_with_sputum: t("screening.deep.cough_with_sputum", { returnObjects: true }),
    cough_with_blood: t("screening.deep.cough_with_blood", { returnObjects: true }),
    fever_evening: t("screening.deep.fever_evening", { returnObjects: true }),
    weight_loss: t("screening.deep.weight_loss", { returnObjects: true }),
    night_sweats: t("screening.deep.night_sweats", { returnObjects: true }),
    chest_pain: t("screening.deep.chest_pain", { returnObjects: true }),
    loss_of_appetite: t("screening.deep.loss_of_appetite", { returnObjects: true }),
    tb_contact: t("screening.deep.tb_contact", { returnObjects: true }),
  };

  // Compute deep steps based on selected symptoms
  const deepSteps = Object.keys(symptoms)
    .filter((key) => key !== "none_of_the_above" && symptoms[key])
    .flatMap((symptomKey) =>
      (deepQuestionConfig[symptomKey] || []).map((q) => ({
        symptomKey,
        questionKey: q.questionKey,
        title: q.title,
        options: q.options.map((opt) => ({ value: opt.value, label: opt.label })),
      }))
    );

  // Update total steps dynamically
  useEffect(() => {
    const steps = 1 /*Basic Info*/ + 1 /*Symptoms*/ + deepSteps.length + 1 /*FileUpload*/ + 1 /*Review*/;
    dispatch({ type: "SET_TOTAL_STEPS", payload: steps });
  }, [symptoms]);

  const handleNext = () => {
    const skipDeepQuestions = symptoms.none_of_the_above && currentStep === 2;
    if (skipDeepQuestions) {
      dispatch({ type: "SET_STEP", payload: 3 + deepSteps.length }); // Skip to FileUpload
    } else {
      dispatch({ type: "SET_STEP", payload: Math.min(currentStep + 1, totalSteps) });
    }
  };

  const handlePrevious = () => {
    if (currentStep === 3 + deepSteps.length && symptoms.none_of_the_above) {
      dispatch({ type: "SET_STEP", payload: 2 }); // Go back to Symptoms
    } else {
      dispatch({ type: "SET_STEP", payload: Math.max(currentStep - 1, 1) });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    dispatch({ type: "CALCULATE_SCORE" });

    try {
      const result = await mockApiCall();
      dispatch({ type: "SET_RESULT", payload: result });
      navigate("/result");
    } catch (error) {
      console.error("Failed to analyze screening:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const renderStepContent = () => {
    if (currentStep === 1) return <BasicInfoForm onNext={handleNext} />;
    if (currentStep === 2) return <SymptomsForm onNext={handleNext} onPrevious={handlePrevious} />;
    if (currentStep >= 3 && currentStep < 3 + deepSteps.length) {
      const stepIndex = currentStep - 3;
      const step = deepSteps[stepIndex];
      return (
        <DeepQuestion
          symptomKey={step.symptomKey}
          questionKey={step.questionKey}
          title={step.title}
          options={step.options}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      );
    }
    if (currentStep === 3 + deepSteps.length) return <FileUpload onNext={handleNext} onPrevious={handlePrevious} />;
    if (currentStep === 4 + deepSteps.length)
      return <ReviewStep onSubmit={handleSubmit} onPrevious={handlePrevious} isSubmitting={isSubmitting} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <section className="bg-white border-b mt-5 border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>
            <span className="text-sm text-slate-500">
              {t("screening.step")} {currentStep} {t("common.of")} {totalSteps}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-slate-200">
          <CardContent className="p-0">{renderStepContent()}</CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Screening;
