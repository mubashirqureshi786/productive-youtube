import React, { useState, useEffect } from "react";

interface Settings {
  // Algorithm Blockers
  removeShorts: boolean;
  removeShortsButton: boolean;
  removeHomepageVideos: boolean;
  removeWatchPageSuggestions: boolean;
  showTranscript: boolean;
  huggingfaceApiKey?: string;
}

const ToggleSwitch: React.FC<{
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}> = ({ id, label, checked, onChange, description }) => {
  return (
    <div className="flex items-start justify-between py-3 group">
      <div className="flex-1 pr-3">
        <span className="text-sm font-medium text-slate-900 block">
          {label}
        </span>
        {description && (
          <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
            {description}
          </span>
        )}
      </div>
      <label
        htmlFor={id}
        className="relative inline-flex items-center cursor-pointer mt-0.5 flex-shrink-0"
      >
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-400 after:border-2 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 shadow-sm"></div>
      </label>
    </div>
  );
};

const PopupApp: React.FC = () => {
  const defaultSettings: Settings = {
    removeShorts: true,
    removeShortsButton: true,
    removeHomepageVideos: true,
    removeWatchPageSuggestions: true,
    showTranscript: false,
    huggingfaceApiKey: "",
  };

  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from Chrome storage
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const keys = Object.keys(defaultSettings);
      chrome.storage.local.get(keys, (result) => {
        const loadedSettings = { ...defaultSettings };
        keys.forEach((key) => {
          if (result[key] !== undefined) {
            (loadedSettings as any)[key] = result[key];
          }
        });
        setSettings(loadedSettings);
      });
    }
  }, []);

  // Generic toggle handler
  const handleToggle = (key: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ [key]: value }, () => {
        console.log(`Setting ${key} saved:`, value);
      });
    }
  };

  return (
    <div className="w-96 max-h-[600px] pb-5 overflow-y-auto font-sans text-sm bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 px-4 py-3.5 shadow-md">
        <h1 className="text-sm font-bold text-white">Productive YouTube</h1>
        <p className="text-xs text-blue-100 mt-1">
          Enhance your focus and productivity
        </p>
      </div>

      <div className="p-4">
        <ToggleSwitch
          id="shorts-toggle"
          label="Remove Shorts Shelves"
          description="Hide all Shorts sections from YouTube"
          checked={settings.removeShorts}
          onChange={(val) => handleToggle("removeShorts", val)}
        />
        <ToggleSwitch
          id="shorts-button-toggle"
          label="Remove Shorts Button"
          description="Hide Shorts button from sidebar"
          checked={settings.removeShortsButton}
          onChange={(val) => handleToggle("removeShortsButton", val)}
        />
        <ToggleSwitch
          id="homepage-toggle"
          label="Remove Homepage Videos"
          description="Clean homepage - no suggested videos"
          checked={settings.removeHomepageVideos}
          onChange={(val) => handleToggle("removeHomepageVideos", val)}
        />
        <ToggleSwitch
          id="suggestions-toggle"
          label="Remove Watch Page Suggestions"
          description="Hide sidebar recommendations"
          checked={settings.removeWatchPageSuggestions}
          onChange={(val) => handleToggle("removeWatchPageSuggestions", val)}
        />
        <ToggleSwitch
          id="transcript-toggle"
          label="Show Video Transcript"
          description="Display video transcript on the watch page"
          checked={settings.showTranscript}
          onChange={(val) => handleToggle("showTranscript", val)}
        />

        {/* AI Translation Info */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              AI Translation Feature
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Select any transcript text to instantly get Urdu translation,
              vocabulary, and context
            </p>
          </div>

          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-900">
                  Free Instant Translations
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  No API key required • 100% Free Service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center mt-4 pt-3 border-t border-slate-200">
        Version 2.0.1 • Built for focus 💙
      </div>
    </div>
  );
};

export default PopupApp;
