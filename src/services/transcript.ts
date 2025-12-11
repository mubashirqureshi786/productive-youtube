/**
 * Transcript Service
 * Handles fetching and parsing YouTube transcripts
 */

import { getVideoId, extractApiKey, extractTranscriptUrl } from "./youtube";
import { decodeHtmlEntities, cleanTranscriptText } from "../utils/helpers";
import type { TranscriptEntry } from "../types";

/**
 * Parse XML transcript data
 */
export function parseTranscript(xml: string): TranscriptEntry[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const textElements = xmlDoc.getElementsByTagName("text");

  const transcript: TranscriptEntry[] = [];

  for (let i = 0; i < textElements.length; i++) {
    const textElement = textElements[i];
    const start = parseFloat(textElement.getAttribute("start") || "0");
    let text = textElement.textContent || "";

    // Decode and clean text
    text = decodeHtmlEntities(text);
    text = cleanTranscriptText(text);

    if (text) {
      transcript.push({ text, start });
    }
  }

  return transcript;
}

/**
 * Fetch transcript for current video
 */
export async function fetchTranscript(): Promise<TranscriptEntry[]> {
  const videoId = getVideoId();
  if (!videoId) {
    throw new Error("No video ID found");
  }

  // Get API key
  const response = await fetch(window.location.href);
  const html = await response.text();
  const apiKey = extractApiKey(html);

  if (!apiKey) {
    throw new Error("Could not extract API key");
  }

  // Fetch player API data
  const playerApiUrl = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`;
  const playerResponse = await fetch(playerApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20231219.04.00",
        },
      },
      videoId: videoId,
    }),
  });

  if (!playerResponse.ok) {
    throw new Error(`Player API error: ${playerResponse.status}`);
  }

  const playerData = await playerResponse.json();
  const transcriptUrl = extractTranscriptUrl(playerData);

  if (!transcriptUrl) {
    throw new Error("No transcript available for this video");
  }

  // Fetch transcript XML
  const transcriptResponse = await fetch(transcriptUrl);
  if (!transcriptResponse.ok) {
    throw new Error(`Transcript fetch error: ${transcriptResponse.status}`);
  }

  const transcriptXml = await transcriptResponse.text();
  return parseTranscript(transcriptXml);
}
