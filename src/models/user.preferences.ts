import { LLMService, STTService, TTSService } from "@/src/models/common";
import { DocumentData } from "firebase/firestore";

export type ConversationStyle = "empathetic" | "reflective" | "Neutral" | "inquisitive" | "Motivational" | "Playful";
export type ConversationTone = "reflective" | "professional" | "inquisitive";
export type ResponseDepth = "brief" | "regular" | "elaborate";
export type VocabularyType = "simple" | "regular" | "formal" | "slang";

export class UserPreferences {
  languageId: string = 'en';
  voiceId: string = '79a125e8-cd45-4c13-8a67-188112f4dd22';
  
  vadStopSecs: number = 1.0;
  
  ttsService: TTSService = 'cartesia';
  ttsModel = 'sonic-english';

  llmModel = 'gpt-4o-mini';
  llmService: LLMService = 'openai';

  sttModel = 'nova-2-general';
  sttService: STTService = 'deepgram';

  style: ConversationStyle = 'reflective';
  tone: ConversationTone = 'reflective';
  responseDepth: ResponseDepth = 'regular';
  vocabulary: VocabularyType = 'slang';

  quirks: string[] = [];

  getServices() {
    const services = {
      stt: this.sttService,
      llm: this.llmService,
      tts: this.ttsService,
    };
    return services;
  }

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
        { name: 'speed', value: -0.1 },
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
        { name: 'frequency_penalty', value: -0.3 },
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
        // { name: 'tools', 
        //   value: [
        //     {
        //       name: "record_answer",
        //       description:
        //         "Records the user's answer for a form field.",
        //       input_schema: {
        //         type: "object",
        //         properties: {
        //           form_id: {
        //             type: "string",
        //             description: "The id of the form being filled. You should already know this from the initial prompt.",
        //           },
        //           field_id: {
        //             type: "string",
        //             description:
        //               "The field id to fill. You should already have the context to know this.",
        //           },
        //           value: {
        //             type: "string",
        //             description:
        //               "The value given by the user for this particular field.",
        //           },
        //         },
        //         required: ["form_id", "field_id", "value"], // todo: can we know form/field outside this bot, so it just sends value and "we" know form/field.
        //       },
        //     },
        //     {
        //       name: "update_bot_config",
        //       description:
        //         "Updates your configuration settings.",
        //       input_schema: {
        //         type: "object",
        //         properties: {
        //           key: {
        //             type: "string",
        //             enum: ["response-speed", "response-length", "response-style"],
        //             description:
        //               "THe configuration key that we want changed.",
        //           },
        //           value: {
        //             type: "string",
        //             description: "The value for the config. E.g. 'slower' or 'faster' for response-speed, or 'shorter' or 'longer' for response-length.",
        //           },
        //         },
        //         required: ["key", "value"],
        //       },
        //     },
        //   ] 
        // },
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