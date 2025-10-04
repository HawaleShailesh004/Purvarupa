import React, { createContext, useContext, useReducer, useEffect } from "react";
import { calculateLocalScore } from "../utils/scoring";

const ScreeningContext = createContext();

const initialState = {
  currentStep: 1,
  totalSteps: 1, // will update dynamically
  basicInfo: {
    fullName: "",
    age: "",
    gender: "",
    location: "",
    contact: "",
  },
  symptoms: {
    cough_gt_2_weeks: false,
    cough_with_sputum: false,
    cough_with_blood: false,
    fever_evening: false,
    weight_loss: false,
    night_sweats: false,
    chest_pain: false,
    loss_of_appetite: false,
    tb_contact: false,
    none_of_the_above: false,
  },
  deepAnswers: {},
  uploads: [],
  localScore: 0,
  isCompleted: false,
  result: null,
};

function screeningReducer(state, action) {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "SET_TOTAL_STEPS":
      return { ...state, totalSteps: action.payload };

    case "SET_BASIC_INFO":
      return { ...state, basicInfo: { ...state.basicInfo, ...action.payload } };

    case "SET_SYMPTOMS":
      return { ...state, symptoms: { ...state.symptoms, ...action.payload } };

    case "SET_DEEP_ANSWER":
      const { symptomKey, questionKey, value } = action.payload;
      return {
        ...state,
        deepAnswers: {
          ...state.deepAnswers,
          [symptomKey]: { ...(state.deepAnswers[symptomKey] || {}), [questionKey]: value },
        },
      };

    case "ADD_UPLOAD":
      return { ...state, uploads: [...state.uploads, action.payload] };

    case "REMOVE_UPLOAD":
      return {
        ...state,
        uploads: state.uploads.filter((_, index) => index !== action.index),
      };

    case "CALCULATE_SCORE":
      const score = calculateLocalScore(state.symptoms, state.deepAnswers);
      return { ...state, localScore: score };

    case "SET_RESULT":
      return { ...state, result: action.payload, isCompleted: true };

    case "RESET_SCREENING":
      return initialState;

    case "LOAD_FROM_STORAGE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function ScreeningProvider({ children }) {
  const [state, dispatch] = useReducer(screeningReducer, initialState);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tb_screening_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD_FROM_STORAGE", payload: parsed });
      } catch (error) {
        console.error("Failed to load saved screening data:", error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("tb_screening_draft", JSON.stringify(state));
  }, [state]);

  return <ScreeningContext.Provider value={{ ...state, dispatch }}>{children}</ScreeningContext.Provider>;
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (!context) throw new Error("useScreening must be used within a ScreeningProvider");
  return context;
}
