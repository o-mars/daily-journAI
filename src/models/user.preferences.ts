import { LLMService, STTService, TTSService } from "@/src/models/common";
import { DocumentData } from "firebase/firestore";
import { DEFAULT_VOICE_ID } from "@/src/models/constants";
import { BotType } from "@/src/models/user";
export type ConversationStyle = "empathetic" | "reflective" | "conversational" | "inquisitive" | "neutral" | "Playful";
export type ConversationTone = "reflective" | "professional" | "inquisitive";
export type ResponseDepth = "brief" | "regular" | "elaborate";
export type VocabularyType = "simple" | "regular" | "formal" | "slang";

export interface BotPreferences {
  style: ConversationStyle;
  tone: ConversationTone;
  responseDepth: ResponseDepth;
  vocabulary: VocabularyType;
  voiceId: string;
  vadStopSecs: number;
  languageId: string;
}

export interface UserPreferences {
  ttsService: TTSService;
  ttsModel: string;
  llmModel: string;
  llmService: LLMService;
  sttModel: string;
  sttService: STTService;
  
  botPreferences: Record<BotType, BotPreferences>;
  quirks: string[];
}

export const innerEchoBotPreferences: BotPreferences = {
  languageId: 'en',
  style: 'empathetic',
  tone: 'reflective',
  responseDepth: 'regular',
  vocabulary: 'regular',
  voiceId: DEFAULT_VOICE_ID,
  vadStopSecs: 1.1,
};

export const ventingMachineBotPreferences: BotPreferences = {
  languageId: 'en',
  style: 'conversational',
  tone: 'inquisitive',
  responseDepth: 'regular',
  vocabulary: 'regular',
  voiceId: DEFAULT_VOICE_ID,
  vadStopSecs: 0.9,
};

export const defaultInnerEchoUserPreferences: UserPreferences = {
  ttsService: 'cartesia',
  ttsModel: 'sonic-english',
  llmModel: 'gpt-4o-mini',
  llmService: 'openai',
  sttModel: 'nova-2-general',
  sttService: 'deepgram',
  botPreferences: {
    'inner-echo': innerEchoBotPreferences,
    'venting-machine': ventingMachineBotPreferences,
  },
  quirks: [],
};

export const defaultVentingMachineUserPreferences: UserPreferences = {
  ttsService: 'cartesia',
  ttsModel: 'sonic-english',
  llmModel: 'gpt-4o-mini',
  llmService: 'openai',
  sttModel: 'nova-2-general',
  sttService: 'deepgram',
  botPreferences: {
    'inner-echo': innerEchoBotPreferences,
    'venting-machine': ventingMachineBotPreferences,
  },
  quirks: [],
};

export const defaultUserPreferences = defaultVentingMachineUserPreferences;

export function generateSystemMessage(preferences: UserPreferences, botType: BotType) {
  const chunks = [];
  chunks.push(`Try to model your response such that when spoken out, it has a ${preferences.botPreferences[botType].style} style.`);
  chunks.push(`Try to model your response such that when spoken out, it has a ${preferences.botPreferences[botType].tone} tone.`);
  if (preferences.botPreferences[botType].responseDepth === 'shorter' as ResponseDepth) chunks.push(`Try keeping your responses relatively brief where possible`);
  return chunks;
}

export function generateConfig(preferences: UserPreferences, botType: BotType) {
  const config = [
    getVadConfig(preferences, botType),
    getTtsConfig(preferences, botType),
    getLlmConfig(preferences, generateSystemMessage(preferences, botType).join('')),
    getSttConfig(preferences, botType),
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

export function getTtsConfig(preferences: UserPreferences, botType: BotType) {
  return {
    service: "tts",
    options: [{ name: "model", value: preferences.ttsModel }, { name: "voice", value: preferences.botPreferences[botType].voiceId }, { name: "language", value: preferences.botPreferences[botType].languageId }],
  }
}

export function getVadConfig(preferences: UserPreferences, botType: BotType) {
  return { service: "vad", options: [{ name: "params", value: { stop_secs: preferences.botPreferences[botType].vadStopSecs } }] };
}


export function getSttConfig(preferences: UserPreferences, botType: BotType) {
  return {
    service: "stt",
    options: [{ name: "model", value: preferences.sttModel }, { name: "language", value: preferences.botPreferences[botType].languageId }],
  }
} 

export function getLlmConfig(preferences: UserPreferences, systemMessage: string) {
  return {
    service: "llm",
    options: [
      { name: "model", value: preferences.llmModel },
      { name: 'temperature', value: 0.7 },
      { name: "initial_messages", value: [{ role: "system", content: systemMessage }]},
      { name: "tools", value: [
        {
          type: "function",
          function: {
            name: "disconnect_voice_client",
            description: "Disconnects the voice client after the conversation ends.",
            parameters: {
              type: "object",
              properties: {},
              required: [],
            },
          },
        },
      ]},
      { name: "run_on_config", value: true }
    ],
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

    botPreferences: {
      'inner-echo': document.botPreferences?.['inner-echo'] ?? defaultUserPreferences.botPreferences['inner-echo'],
      'venting-machine': document.botPreferences?.['venting-machine'] ?? defaultUserPreferences.botPreferences['venting-machine'],
    },
    quirks: !!document.quirks && Array.isArray(document.quirks) ? document.quirks : defaultUserPreferences.quirks,
  };

  return preferences;
}