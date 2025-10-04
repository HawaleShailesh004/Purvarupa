import React from "react";
import { useTranslation } from "react-i18next";
import { useScreening } from "../context/ScreeningContext";
import { Button } from "./ui/button";
import { CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, ArrowRight } from "lucide-react";

function SymptomsForm({ onNext, onPrevious }) {
  const { t } = useTranslation();
  const { symptoms, dispatch } = useScreening();

  const symptomOptions = [
    { key: "cough_gt_2_weeks", label: t("screening.symptoms.cough_gt_2_weeks") },
    { key: "cough_with_sputum", label: t("screening.symptoms.cough_with_sputum") },
    { key: "cough_with_blood", label: t("screening.symptoms.cough_with_blood") },
    { key: "fever_evening", label: t("screening.symptoms.fever_evening") },
    { key: "weight_loss", label: t("screening.symptoms.weight_loss") },
    { key: "night_sweats", label: t("screening.symptoms.night_sweats") },
    { key: "chest_pain", label: t("screening.symptoms.chest_pain") },
    { key: "loss_of_appetite", label: t("screening.symptoms.loss_of_appetite") },
  ];

  const handleSymptomChange = (key, checked) => {
    let newSymptoms = { ...symptoms };

    if (key === "none_of_the_above") {
      // Clear all other symptoms
      newSymptoms = Object.keys(newSymptoms).reduce((acc, k) => ({ ...acc, [k]: false }), {});
      newSymptoms.none_of_the_above = checked;
    } else {
      // If any symptom is selected, clear "none_of_the_above"
      if (checked && symptoms.none_of_the_above) newSymptoms.none_of_the_above = false;
      newSymptoms[key] = checked;
    }

    dispatch({ type: "SET_SYMPTOMS", payload: newSymptoms });
  };

  const hasAnySymptom = Object.keys(symptoms).some(
    (key) => key !== "none_of_the_above" && symptoms[key]
  );
  const canProceed = symptoms.none_of_the_above || hasAnySymptom;

  return (
    <div className="p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl text-slate-900">
          {t("screening.symptoms.title")}
        </CardTitle>
        <p className="text-slate-600">{t("screening.symptoms.subtitle")}</p>
      </CardHeader>

      <div className="space-y-4 mb-8">
        {symptomOptions.map((symptom) => (
          <div
            key={symptom.key}
            className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Checkbox
              id={symptom.key}
              checked={symptoms[symptom.key] || false}
              onCheckedChange={(checked) => handleSymptomChange(symptom.key, checked)}
              className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
            />
            <label
              htmlFor={symptom.key}
              className="text-slate-700 cursor-pointer flex-1 leading-relaxed"
            >
              {symptom.label}
            </label>
          </div>
        ))}

        {/* None of the above */}
        <div className="border-t border-slate-200 pt-4 mt-6">
          <div className="flex items-center space-x-3 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Checkbox
              id="none_of_the_above"
              checked={symptoms.none_of_the_above || false}
              onCheckedChange={(checked) => handleSymptomChange("none_of_the_above", checked)}
              className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
            />
            <label
              htmlFor="none_of_the_above"
              className="text-slate-700 cursor-pointer flex-1 font-medium"
            >
              {t("screening.symptoms.none_of_the_above")}
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.previous")}
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-slate-800 hover:bg-slate-700 px-8">
          {t("common.next")}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default SymptomsForm;
