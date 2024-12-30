import { HumeClient } from "hume";
import { PostedConfig } from "hume/api/resources/empathicVoice/resources/configs/client";

export const hume = new HumeClient({
  apiKey: process.env.HUME_API_KEY!,
  secretKey: process.env.HUME_SECRET_KEY!,
});

export const publishConfig = async (config: PostedConfig) => {
  const publishedConfig = await hume.empathicVoice.configs.createConfig(config);
  return publishedConfig;
}

export const updatePublishedConfig = async (configId: string, config: PostedConfig) => {
  const publishedConfig = await hume.empathicVoice.configs.createConfigVersion(configId, config);
  return publishedConfig;
}

export const getConfigForUser = async (configId: string, version: number) => {
  const config = await hume.empathicVoice.configs.getConfigVersion(configId, version);
  return config;
}

export const getChatDetailsForUser = async (chatId: string) => {
  const chat = await hume.empathicVoice.chats.listChatEvents(chatId);
  return chat;
}
