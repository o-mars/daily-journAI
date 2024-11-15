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
        { name: "model", value: this.ttsModel },
        { name: "voice", value: this.voiceId },
        { name: "language", value: this.languageId },
        { name: 'speed', value: -0.2 },
        { name: 'emotion', value: ['positivity:lowest'] },
        // { name: 'engine', type: 'string' },
        // { name: 'pitch', type: 'string' },
        // { name: 'rate', value: 'fast' },
        // { name: 'volume', type: 'string' },
        // { name: 'emphasis', type: 'string' },
        { name: 'style', value: 'empathetic' },
        // { name: 'style_degree', type: 'string' },
        // { name: 'role', type: 'string' },
        // { name: 'optimize_streaming_latency', type: 'string' },
        // { name: 'stability', type: 'number' },
        // { name: 'similarity_boost', type: 'number' },
        // { name: 'use_speaker_boost', type: 'bool' },
        {
          name: "text_filter",
          value: {
            filter_code: false,
            filter_tables: false,
          },
        },
        // {name: 'seed', type: 'number'},
      ],
    };
  };

  getLlmConfig(systemMessage: string) {
    return {
      service: "llm",
      options: [
        { name: "model", value: this.llmModel },
        { name: 'temperature', value: 0.7 },
        // {name: 'top_p', type: 'number'},
        // {name: 'top_k', type: 'number'},
        { name: 'frequency_penalty', value: -0.2 },
        // {name: 'presence_penalty', type: 'number'},
        // {name: 'max_tokens', type: 'number'},
        // {name: 'max_completion_tokens', type: 'number'},
        // {name: 'max_response_output_tokens', type: 'number'},
        // {name: 'seed', type: 'number'},
        // {name: 'extra', type: 'object'},
        {
          name: "initial_messages",
          value: [
            {
              role: "system",
              content: systemMessage,
            },
          ],
        },
        // {name: 'enable_prompt_caching', type: 'bool'},
        // {name: 'tools', type: 'array'},
        { name: "run_on_config", value: true },
        // {name: 'turn_detection', type: 'object'},
        // {name: 'voice', type: 'string'},
        // {name: 'modalities', type: 'array'},
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