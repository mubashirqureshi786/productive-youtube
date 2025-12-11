/**
 * Custom React Hooks for Extension Features
 */

import { useState, useEffect, useCallback } from "react";
import type { Settings } from "../types";
import { loadSettings, onSettingsChange } from "../services/settings";

/**
 * Hook to manage extension settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((loadedSettings) => {
      console.log("useSettings: Initial settings loaded:", loadedSettings);
      setSettings(loadedSettings);
      setLoading(false);
    });

    const cleanup = onSettingsChange((changes) => {
      console.log("useSettings: Settings changed:", changes);
      setSettings((prev) => (prev ? { ...prev, ...changes } : null));
    });

    return cleanup;
  }, []);

  return { settings, loading };
}

/**
 * Hook to detect YouTube dark mode
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const htmlElement = document.documentElement;
      const isDarkMode =
        htmlElement.hasAttribute("dark") ||
        htmlElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dark", "class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", checkDarkMode);
    };
  }, []);

  return isDark;
}

/**
 * Hook to get current video element
 */
export function useVideoElement() {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    const findVideo = () => {
      const videoElement = document.querySelector("video");
      setVideo(videoElement);
    };

    findVideo();

    const observer = new MutationObserver(findVideo);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return video;
}

/**
 * Hook for video time updates
 */
export function useVideoTime(video: HTMLVideoElement | null) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);

    // Set initial values
    setCurrentTime(video.currentTime);
    setDuration(video.duration);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
    };
  }, [video]);

  return { currentTime, duration };
}

/**
 * Hook to detect page navigation
 */
export function usePageNavigation() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [videoId, setVideoId] = useState(
    new URLSearchParams(window.location.search).get("v")
  );

  useEffect(() => {
    const handleNavigation = () => {
      setPathname(window.location.pathname);
      setVideoId(new URLSearchParams(window.location.search).get("v"));
    };

    // YouTube is a SPA, listen for history changes
    window.addEventListener("yt-navigate-finish", handleNavigation);
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("yt-navigate-finish", handleNavigation);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  return { pathname, videoId };
}
