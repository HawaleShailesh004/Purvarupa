import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Globe, Shield, Users, FileText } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";

import { TrendingUp, HeartPulse, AlertTriangle } from "lucide-react";

import logo from "../assets/logo.svg";
import Header from "@/components/Header";

function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: t("landing.features.screening.title"),
      description: t("landing.features.screening.desc"),
    },
    {
      icon: Users,
      title: t("landing.features.referrals.title"),
      description: t("landing.features.referrals.desc"),
    },
    {
      icon: FileText,
      title: t("landing.features.reports.title"),
      description: t("landing.features.reports.desc"),
    },
    {
      icon: Globe,
      title: t("landing.features.languages.title"),
      description: t("landing.features.languages.desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            {t("landing.hero.title")}
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            {t("landing.hero.subtitle")}
          </p>
          <Button
            size="lg"
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 text-lg"
            onClick={() => navigate("/screening")}
          >
            {t("landing.cta.start")}
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            {t("landing.cta.duration")}
          </p>
        </div>
      </section>

      {/* Facts Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-50">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-teal-900 mb-12">
            {t("landing.facts.title", "Why Early Screening Matters")}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
              <Users className="h-10 w-10 text-teal-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900">
                2.8 Million+
              </p>
              <p className="text-slate-600 text-sm">
                {t(
                  "landing.facts.points.two",
                  "People in India develop TB each year"
                )}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
              <TrendingUp className="h-10 w-10 text-teal-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900">27%</p>
              <p className="text-slate-600 text-sm">
                {t(
                  "landing.facts.points.one",
                  "of global TB cases are from India"
                )}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
              <HeartPulse className="h-10 w-10 text-teal-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900">40%</p>
              <p className="text-slate-600 text-sm">
                {t(
                  "landing.facts.points.four",
                  "Mortality reduction with early diagnosis"
                )}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
              <AlertTriangle className="h-10 w-10 text-teal-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-900">10–15</p>
              <p className="text-slate-600 text-sm">
                {t(
                  "landing.facts.points.three",
                  "People can be infected by one undiagnosed patient per year"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold text-slate-900 text-center mb-12">
            {t("landing.features.title")}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-slate-200 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {t("landing.disclaimer.title")}
                  </h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {t("landing.disclaimer.text")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-300">{t("landing.footer.text")}</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
