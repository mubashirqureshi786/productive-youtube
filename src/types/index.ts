/**
 * Shared TypeScript interfaces for the Productive YouTube extension
 */

export interface VideoInfo {
  title: string;
  channel: string;
}

export interface Settings {
  removeShorts: boolean;
  removeShortsButton: boolean;
  removeHomepageVideos: boolean;
  removeWatchPageSuggestions: boolean;
  showTranscript: boolean;
}

export interface TranscriptLine {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptChunk {
  start: number;
  lines: TranscriptLine[];
}

export interface TranscriptEntry {
  text: string;
  start: number;
}
