import { LLMService, STTService, TTSService } from "@/src/models/common";
import { DocumentData } from "firebase/firestore";

export type ConversationStyle = "empathetic" | "reflective" | "Neutral" | "inquisitive" | "Motivational" | "Playful";
export type ConversationTone = "reflective" | "professional" | "inquisitive";
export type ResponseDepth = "brief" | "regular" | "elaborate";
export type VocabularyType = "simple" | "regular" | "formal" | "slang";

export interface UserPreferences {
  languageId: string;
  voiceId: string;
  vadStopSecs: number;
  ttsService: TTSService;
  ttsModel: string;
  llmModel: string;
  llmService: LLMService;
  sttModel: string;
  sttService: STTService;
  style: ConversationStyle;
  tone: ConversationTone;
  responseDepth: ResponseDepth;
  vocabulary: VocabularyType;
  quirks: string[];
}

export const defaultUserPreferences: UserPreferences = {
  languageId: 'en',
  voiceId: '79a125e8-cd45-4c13-8a67-188112f4dd22',
  vadStopSecs: 1.0,
  ttsService: 'cartesia',
  ttsModel: 'sonic-english',
  llmModel: 'gpt-4o-mini',
  llmService: 'openai',
  sttModel: 'nova-2-general',
  sttService: 'deepgram',
  style: 'reflective',
  tone: 'reflective',
  responseDepth: 'regular',
  vocabulary: 'slang',
  quirks: [],
};

export function generateSystemMessage(preferences: UserPreferences) {
  const chunks = [];
  chunks.push(`Try to model your response such that when spoken out, it has a ${preferences.style} style.`);
  if (preferences.responseDepth === 'shorter' as ResponseDepth) chunks.push(`Try keeping your responses relatively brief where possible`);
  return chunks;
}

export function generateConfig(preferences: UserPreferences) {
  const config = [
    getVadConfig(preferences),
    getTtsConfig(preferences),
    getLlmConfig(preferences, generateSystemMessage(preferences).join('')),
    getSttConfig(preferences),
  ];
  return config;
}

export function getServices(preferences: UserPreferences) {
  const services = {
    stt: preferences.sttService,
    llm: preferences.llmService,
    tts: preferences.ttsService,
  };
  return services;
}

export function getTtsConfig(preferences: UserPreferences) {
  return {
    service: "tts",
    options: [{ name: "model", value: preferences.ttsModel }, { name: "voice", value: preferences.voiceId }, { name: "language", value: preferences.languageId }],
  }
}

export function getVadConfig(preferences: UserPreferences) {
  return { service: "vad", options: [{ name: "params", value: { stop_secs: preferences.vadStopSecs } }] };
}


export function getSttConfig(preferences: UserPreferences) {
  return {
    service: "stt",
    options: [{ name: "model", value: preferences.sttModel }, { name: "language", value: preferences.languageId }],
  }
} 

export function getLlmConfig(preferences: UserPreferences, systemMessage: string) {
  return {
    service: "llm",
    options: [{ name: "model", value: preferences.llmModel }, { name: 'temperature', value: 0.7 }, { name: "initial_messages", value: [{ role: "system", content: systemMessage }] }],
  }
}

export function toUserPreferences(document: DocumentData): UserPreferences {
  const preferences: UserPreferences = {
    llmModel: !!document.llmModel ? document.llmModel : defaultUserPreferences.llmModel,
    llmService: !!document.llmService ? document.llmService : defaultUserPreferences.llmService,

    ttsModel: !!document.ttsModel ? document.ttsModel : defaultUserPreferences.ttsModel,
    ttsService: !!document.ttsService ? document.ttsService : defaultUserPreferences.ttsService,

    sttModel: !!document.sttModel ? document.sttModel : defaultUserPreferences.sttModel,
    sttService: !!document.sttService ? document.sttService : defaultUserPreferences.sttService,

    languageId: !!document.languageId ? document.languageId : defaultUserPreferences.languageId,
    voiceId: !!document.voiceId ? document.voiceId : defaultUserPreferences.voiceId,
    vadStopSecs: !!document.vadStopSecs ? document.vadStopSecs : defaultUserPreferences.vadStopSecs,
    style: !!document.style ? document.style : defaultUserPreferences.style,
    tone: !!document.tone ? document.tone : defaultUserPreferences.tone,
    responseDepth: !!document.responseDepth ? document.responseDepth : defaultUserPreferences.responseDepth,
    vocabulary: !!document.vocabulary ? document.vocabulary : defaultUserPreferences.vocabulary,
    quirks: !!document.quirks && Array.isArray(document.quirks) ? document.quirks : defaultUserPreferences.quirks,
  };

  return preferences;
}