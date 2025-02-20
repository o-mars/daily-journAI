export interface SystemPrompt {
  [key: string]: string[];
}

export function systemPromptAsString(config: SystemPrompt): string {
  return Object.entries(config)
    .map(([key, value]) => `<${key}>${value.join(' ')}</${key}>`)
    .join('\n');
}

export interface SystemPromptWithInitialMessage {
  firstTimePrompts: string[];
  returningPrompts: string[];
  systemPrompt: string;
}