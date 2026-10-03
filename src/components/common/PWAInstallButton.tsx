import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Apple } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string; isMobile?: boolean }> = ({
  className = '',
  isMobile = false
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed (standalone mode / TWA), do not render
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (isMobile) {
      return (
        <button
          onClick={install}
          className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-md hover:from-orange-600 hover:to-amber-600 transition ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Install Android / PWA App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-500/30 font-medium text-xs transition duration-200 shadow-sm ${className}`}
        title="Install Illusion App on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {isMobile ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-800 text-white font-semibold text-sm border border-slate-700 hover:bg-slate-750 transition ${className}`}
          >
            <Apple className="w-4 h-4 text-slate-300" />
            <span>Install on iOS</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 font-medium text-xs transition ${className}`}
            title="Install Illusion on iPhone / iPad"
          >
            <Apple className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                    <p className="text-xs text-slate-400">Add Illusion to your Home Screen</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold shrink-0">1</span>
                  <p>Tap the <strong className="text-white">Share</strong> icon at the bottom of Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold shrink-0">2</span>
                  <p>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold shrink-0">3</span>
                  <p>Tap <strong className="text-white">Add</strong> in the top-right corner.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Provide fallback download / Android APK & PWA guide modal
  return (
    <button
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-pwa-guide'));
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/60 font-medium text-xs transition ${className}`}
      title="Play Store & PWA Information"
    >
      <Smartphone className="w-3.5 h-3.5 text-orange-400" />
      <span>Android App</span>
    </button>
  );
};
