import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './App.css';
import { Toaster } from './components/ui/toaster';
import Landing from './pages/Landing';
import Screening from './pages/Screening';
import Result from './pages/Result';
import Profile from './pages/Profile';
import DemoData from './pages/DemoData';
import { ScreeningProvider } from './context/ScreeningContext';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ScreeningProvider>
        <div className="App">
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/screening" element={<Screening />} />
                <Route path="/result" element={<Result />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/demo-data" element={<DemoData />} />
              </Routes>
            </Suspense>
            <Toaster />
          </BrowserRouter>
        </div>
      </ScreeningProvider>
    </I18nextProvider>
  );
}

export default App;