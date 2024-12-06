import { BotType } from "@/src/models/user";

export interface Branding {
  appName: string;
  appIcon: string;
  appWelcomeMessage: string;
  botType: BotType;
}

export const innerEchoBranding: Branding = {
  appName: 'Inner Echo',
  appIcon: '/inner-echo-logo.jpg',
  appWelcomeMessage: 'Explore and reflect on your experiences, emotions, or anything else on your mind.',
  botType: 'inner-echo',
};

export const ventingMachineBranding: Branding = {
  appName: 'Venting Machine',
  appIcon: '/venting-machine-logo.jpg',
  appWelcomeMessage: 'Need to get something off your chest? This is a judgment-free space to vent out all your thoughts.',
  botType: 'venting-machine',
};

export const cloudCompanionBranding: Branding = {
  appName: 'Cloud Companion',
  appIcon: '/cloud-companion-logo.jpg',
  appWelcomeMessage: 'Explore and reflect on your experiences, emotions, or anything else on your mind.',
  botType: 'inner-echo',
};

export const journalBotBranding: Branding = {
  appName: 'Journal Bot',
  appIcon: '/journal-bot-logo.jpg',
  appWelcomeMessage: 'Explore and reflect on your experiences, emotions, or anything else on your mind.',
  botType: 'inner-echo',
};

export const defaultBranding: Branding = innerEchoBranding;

export const brands: Record<string, Branding> = {
  'inner-echo.onrender.com': innerEchoBranding,
  'ventingmachine.xyz': ventingMachineBranding,
  'venting-machine.onrender.com': ventingMachineBranding,
  'cloudcompanion.xyz': cloudCompanionBranding,
  'journalbot.xyz': journalBotBranding,
  'localhost': cloudCompanionBranding,
  '127.0.0.1': journalBotBranding,
};
