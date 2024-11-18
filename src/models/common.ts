export type TTSService = 'cartesia' | 'aws_tts' | 'azure_tts' | 'deepgram_tts' | 'elevenlabs' | 'google_tts' | 'openai_tts' | 'playht';
export type STTService = 'deepgram' | 'assemblyai' | 'gladia';
export type LLMService = 'together' | 'anthropic' | 'openai' | 'gemini' | 'grok' | 'groq';

export const serviceModels: Record<LLMService, string[]> = {
  together: ['meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo'],
  anthropic: ['claude-3-5-sonnet-20240620'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro'],
  grok: ['grok-beta'],
  groq: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile'],
};
