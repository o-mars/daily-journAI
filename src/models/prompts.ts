import { LANGUAGES } from "@/src/models/constants";
import { BotType, User } from "@/src/models/user";
import { UserPreferences } from "@/src/models/user.preferences";
import { ResponseDepth } from "@/src/models/user.preferences";

export const HUME_FIRST_TIME_MESSAGE = `Hi! I'm Echo, and I'm here to help you reflect on your day. What's on your mind?`;
export const HUME_RETURNING_FIRST_MESSAGE = `Hi! What's on your mind?`;

const LLM_AUDIO_OUTPUT_INSTRUCTIONS = "Your responses will converted to audio, so please don't include any special characters, your response should work if piped to a speech-to-text service.";
const LLM_AUDIO_INPUT_INSTRUCTIONS = "They are also speaking to you, and their response is being converted to text before being sent to you.";
export const LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS = LLM_AUDIO_OUTPUT_INSTRUCTIONS + ' ' + LLM_AUDIO_INPUT_INSTRUCTIONS;

export const LLM_SYSTEM_PROMPT_VARIANCE_INSTRUCTIONS = "Vary your language and expressions to keep the conversation engaging. Avoid starting responses with the same phrase such as 'It sounds like'.";

export const LLM_GOODBYE_PROMPTS = [
  "- Goodbye.",
  "- Bye now.",
  "- Take care.",
  "- Talk again soon.",
];

export const LLM_SYSTEM_PROMPT_DISCONNECT_WITH_FUNCTION_INSTRUCTIONS = "To end the conversation, you must use the provided function tool by outputting a JSON function call in this exact format: {\"function\": \"disconnect_voice_client\"}. Do not write any text about the function or include the function name in your response text.";
export const LLM_SYSTEM_PROMPT_DISCONNECT_WITH_PROMPT_INSTRUCTIONS = `Once the conversation has wrapped up, respond with exactly one of the following and nothing else: "${LLM_GOODBYE_PROMPTS.join('", "')}". Make sure to include the hiphen`;
export const LLM_SYSTEM_PROMPT_DISCONNECT_DIALIN_INSTRUCTIONS = "If asked to say goodbye or end the conversation, let the user know that you are not able to do this, and that they should hang up if they no longer want to speak.";

export const LLM_INNER_ECHO_SYSTEM_PROMPT_FIRST_TIME_MESSAGE = `Say the following: "Hello. I'm Echo. I'm here to help you explore your thoughts and feelings through journalling. What's been on your mind?"`;

const LLM_INNER_ECHO_SYSTEM_PROMPT_PURPOSE = "You are Echo, a journalling assistant, but don't tell them that unless they ask.";
const LLM_INNER_ECHO_SYSTEM_PROMPT_GREETING_INSTRUCTIONS = "Say hello, before asking them about how they're feeling, and help them explore this feeling.";
export const LLM_INNER_ECHO_SYSTEM_PROMPT_GREETING_MESSAGE = LLM_INNER_ECHO_SYSTEM_PROMPT_PURPOSE + ' ' + LLM_INNER_ECHO_SYSTEM_PROMPT_GREETING_INSTRUCTIONS;

const LLM_INNER_ECHO_SYSTEM_PROMPT_SUMMARY_ANNOUNCEMENT = "Here are the summaries of the last couple of conversations the user has had with you.";
const LLM_INNER_ECHO_SYSTEM_PROMPT_SUMMARY_FILTER_INSTRUCTIONS = "Only reference them if the user says something that might relate to it. Focus on how the user is presently feeling.";
export const LLM_INNER_ECHO_SYSTEM_PROMPT_SUMMARY_MESSAGE = LLM_INNER_ECHO_SYSTEM_PROMPT_SUMMARY_ANNOUNCEMENT + ' ' + LLM_INNER_ECHO_SYSTEM_PROMPT_SUMMARY_FILTER_INSTRUCTIONS;


export const LLM_VENTING_MACHINE_SYSTEM_PROMPT_FIRST_TIME_MESSAGE = `Say the following: "I'm here to listen, what's bothering you?"`;

const LLM_VENTING_MACHINE_SYSTEM_PROMPT_PURPOSE = "The user is venting their feelings to you, and you're here to help them with this process.";
const LLM_VENTING_MACHINE_SYSTEM_PROMPT_GREETING_INSTRUCTIONS = "Say hello, before asking them what's been bothering them.";
export const LLM_VENTING_MACHINE_SYSTEM_PROMPT_GREETING_MESSAGE = LLM_VENTING_MACHINE_SYSTEM_PROMPT_PURPOSE + ' ' + LLM_VENTING_MACHINE_SYSTEM_PROMPT_GREETING_INSTRUCTIONS;

export const LLM_INNER_ECHO_COMPLETE_SYSTEM_PROMPT = [
  LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS,
  LLM_SYSTEM_PROMPT_VARIANCE_INSTRUCTIONS,
  LLM_SYSTEM_PROMPT_DISCONNECT_WITH_PROMPT_INSTRUCTIONS,
  LLM_INNER_ECHO_SYSTEM_PROMPT_PURPOSE,
  LLM_INNER_ECHO_SYSTEM_PROMPT_FIRST_TIME_MESSAGE,
].join(' ');

export const LLM_VENTING_MACHINE_COMPLETE_SYSTEM_PROMPT = [
  LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS,
  LLM_SYSTEM_PROMPT_VARIANCE_INSTRUCTIONS,
  LLM_SYSTEM_PROMPT_DISCONNECT_WITH_PROMPT_INSTRUCTIONS,
  LLM_VENTING_MACHINE_SYSTEM_PROMPT_PURPOSE,
  LLM_VENTING_MACHINE_SYSTEM_PROMPT_FIRST_TIME_MESSAGE,
].join(' ');

export function generateSystemMessageForAlternateLanguage(languageId: string) {
  return `You are speaking in ${LANGUAGES[languageId].name}.`;
}

export function generateSystemMessage(preferences: UserPreferences, botType: BotType) {
  const chunks = [];
  chunks.push(`Try to model your response such that when spoken out, it has a ${preferences.botPreferences[botType].style} style.`);
  chunks.push(`Try to model your response such that when spoken out, it has a ${preferences.botPreferences[botType].tone} tone.`);
  if (preferences.botPreferences[botType].responseDepth === 'shorter' as ResponseDepth) chunks.push(`Try keeping your responses relatively brief where possible`);
  return chunks;
}

export function generateSystemMessagesForInnerEcho(user: User) {
  const systemPromptChunks = [
    LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS,
    LLM_SYSTEM_PROMPT_VARIANCE_INSTRUCTIONS
  ];

  generateSystemMessage(user.preferences, 'inner-echo').forEach(prefChunk => systemPromptChunks.push(prefChunk));

  if (user.preferences.botPreferences['inner-echo'].languageId !== 'en') {
    systemPromptChunks.push(generateSystemMessageForAlternateLanguage(user.preferences.botPreferences['inner-echo'].languageId));
  }

  systemPromptChunks.push(LLM_SYSTEM_PROMPT_DISCONNECT_WITH_PROMPT_INSTRUCTIONS);

  if (user.isNewUser) {
    const introductionMessage = [
      LLM_INNER_ECHO_SYSTEM_PROMPT_FIRST_TIME_MESSAGE,
    ];
    introductionMessage.forEach(message => systemPromptChunks.push(message));
  }
  else {
    systemPromptChunks.push(LLM_INNER_ECHO_SYSTEM_PROMPT_GREETING_MESSAGE);
    if (user.journalEntries.length > 0) {
      systemPromptChunks.push(LLM_INNER_ECHO_SYSTEM_PROMPT_SUMMARY_MESSAGE);
      user.journalEntries.filter(entry => !!entry.summary).forEach(entry => systemPromptChunks.push("past conversation summary: " + entry.summary));
    }
  }

  return systemPromptChunks;
}

export function generateSystemMessagesForVentingMachine(user: User) {
  const systemPromptChunks = [
    LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS,
    LLM_SYSTEM_PROMPT_VARIANCE_INSTRUCTIONS,
  ];

  generateSystemMessage(user.preferences, 'venting-machine').forEach(prefChunk => systemPromptChunks.push(prefChunk));

  systemPromptChunks.push(LLM_SYSTEM_PROMPT_DISCONNECT_WITH_PROMPT_INSTRUCTIONS);

  if (user.isNewUser) {
    const introductionMessage = [
      LLM_VENTING_MACHINE_SYSTEM_PROMPT_FIRST_TIME_MESSAGE,
    ];
    introductionMessage.forEach(message => systemPromptChunks.push(message));
  }
  else {
    systemPromptChunks.push(LLM_VENTING_MACHINE_SYSTEM_PROMPT_GREETING_MESSAGE);
  }

  return systemPromptChunks;
}

export function generateSystemMessageForBotType(user: User, botType: BotType) {
  switch (botType) {
    case 'inner-echo':
      return generateSystemMessagesForInnerEcho(user);
    case 'venting-machine':
      return generateSystemMessagesForVentingMachine(user);
    default:
      return generateSystemMessagesForInnerEcho(user);
  }
}
