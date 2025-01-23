
export interface HumeConfigId {
  id: string;
  version?: number;
}

export interface HumeSystemPrompt {
  [key: string]: string[];
}

export function humeSystemPromptAsString(config: HumeSystemPrompt): string {
  return Object.entries(config)
    .map(([key, value]) => `<${key}>${value.join(' ')}</${key}>`)
    .join('\n');
}
