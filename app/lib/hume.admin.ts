import { User } from "@/src/models/user";
import { baseHumeConfig } from "@/src/services/humeConfigService";
import { HumeClient } from "hume";
import { PostedConfig } from "hume/api/resources/empathicVoice/resources/configs/client";

export const hume = new HumeClient({
  apiKey: process.env.HUME_API_KEY!,
  secretKey: process.env.HUME_SECRET_KEY!,
});

export const createConfigForUser = async (userId: string) => {
  const config = await hume.empathicVoice.configs.createConfig(baseHumeConfig);
  return config;
}

export const publishConfig = async (config: PostedConfig) => {
  const publishedConfig = await hume.empathicVoice.configs.createConfig(config);
  return publishedConfig;
}

export const getConfigForUser = async (configId: string, version: number) => {
  const config = await hume.empathicVoice.configs.getConfigVersion(configId, version);
  return config;
}

export const updateConfigForUser = async (configId: string, user: User) => {
  const initialConfig: PostedConfig = {...baseHumeConfig};
  const configToUpdate: PostedConfig = {...initialConfig, name: `${user.userId} - ${initialConfig.name}`};
  const updatedConfig = await hume.empathicVoice.configs.createConfigVersion(configId, configToUpdate);
  return updatedConfig;
}

export const getChatDetailsForUser = async (chatId: string) => {
  const chat = await hume.empathicVoice.chats.listChatEvents(chatId);
  return chat;
}
