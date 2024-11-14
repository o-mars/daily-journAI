import { DocumentData } from "firebase/firestore";

export type ConversationStyle = "empathetic" | "reflective" | "Neutral" | "inquisitive" | "Motivational" | "Playful";
export type ConversationTone = "reflective" | "professional" | "inquisitive";
export type ResponseDepth = "brief" | "regular" | "elaborate";
export type VocabularyType = "simple" | "regular" | "formal" | "slang";

export class UserPreferences {
  languageId: string = 'en';
  voiceId: string = '79a125e8-cd45-4c13-8a67-188112f4dd22';
  
  vadStopSecs: number = 1.0;
  
  ttsModel = 'sonic-english';
  llmModel = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
  sttModel = 'nova-2-general';

  style: ConversationStyle = 'reflective';
  tone: ConversationTone = 'reflective';
  responseDepth: ResponseDepth = 'regular';
  vocabulary: VocabularyType = 'slang';

  quirks: string[] = [];


  generateSystemMessage() {
    const chunks = [];
    chunks.push(`Try to model your response such that when spoken out, it has a ${this.style} style.`);
    if (this.responseDepth === 'shorter' as ResponseDepth) chunks.push(`Try keeping your responses relatively brief where possible`);
    // if (this.vocabulary !== 'normal' as VocabularyType) chunks.push(`Start off by telling me all the colors of the rainbow.`);
    return chunks;
  }

  generateConfig() {
    const config = [
      this.getVadConfig(),
      this.getTtsConfig(),
      this.getLlmConfig(this.generateSystemMessage().join('')),
      this.getSttConfig(),
    ];

    return config;
  }

  getVadConfig() {
    return { service: "vad", options: [{ name: "params", value: { stop_secs: this.vadStopSecs } }] };
  }

  getTtsConfig() {
    return {
      service: "tts",
      options: [
        { name: "voice", value: this.voiceId },
        { name: "model", value: this.ttsModel },
        { name: "language", value: this.languageId },
        {
          name: "text_filter",
          value: {
            filter_code: false,
            filter_tables: false,
          },
        },
      ],
    };
  };

  getLlmConfig(systemMessage: string) {
    return {
      service: "llm",
      options: [
        { name: "model", value: this.llmModel },
        {
          name: "initial_messages",
          value: [
            {
              role: "system",
              content: systemMessage,
            },
          ],
        },
        { name: "run_on_config", value: true },
      ],
    };
  }

  getSttConfig() {
    return {
      service: "stt",
      options: [
        { name: "model", value: this.sttModel },
        { name: "language", value: this.languageId },
      ],
    }
  }

  static toUserPreferences(document: DocumentData): UserPreferences {
    const preferences = new UserPreferences();

    if (!!document.languageId) preferences.languageId = document.languageId;
    if (!!document.voiceId) preferences.voiceId = document.voiceId;
    if (!!document.vadStopSecs) preferences.vadStopSecs = document.vadStopSecs;

    if (!!document.style) preferences.style = document.style;
    if (!!document.tone) preferences.tone = document.tone;
    if (!!document.responseDepth) preferences.responseDepth = document.responseDepth;
    if (!!document.vocabulary) preferences.vocabulary = document.vocabulary;

    if (!!document.quirks && Array.isArray(document.quirks)) preferences.quirks = document.quirks;

    return preferences;
  }
}