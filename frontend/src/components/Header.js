import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "../assets/logo.svg";

function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo + Title */}
          <div className="flex items-center space-x-4">
            <img
              src={logo}
              alt="Purvarupa Logo"
              className="w-14 h-14"
            />
            <h1 className="text-xl font-semibold text-slate-900">
              {t("landing.title")}
            </h1>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

export default Header;
