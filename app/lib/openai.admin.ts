import { SUMMARY_NONE } from "@/src/models/constants";
import { JournalConversationEntry } from "@/src/models/journal.entry";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateTitle(conversation: JournalConversationEntry[]) {
  const transcript = conversation.map(entry => `${entry.from}: ${entry.text}.`).join(' ');
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "Create a concise 1-10 word title that captures the essence of this journal entry. Respond with only the title text."
          },
        ],
      },
      {
        role: "user",
        content: [{ type: "text", text: transcript }],
      },
    ],
  });

  return response.choices[0].message.content;
}

export async function generateTransformedEntry(conversation: JournalConversationEntry[]) {
  const transcript = conversation.map(entry => `${entry.from}: ${entry.text}.`).join(' ');
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: [
              "Transform this conversation transcript following these rules:",
              "1. Fix minor spelling errors and remove filler words (umm, uh, etc)",
              "2. Keep the user's content mostly intact",
              "3. Only include assistant responses that provide necessary context for understanding the user's responses",
              "4. Remove assistant responses that merely echo or elaborate on user statements",
              "5. The goal is to preserve the user's authentic journal entry while maintaining coherence",
              "Respond with only the transformed text."
            ].join("\n")
          },
        ],
      },
      {
        role: "user",
        content: [{ type: "text", text: transcript }],
      },
    ],
  });

  return response.choices[0].message.content;
}

export async function generateSummary(conversation: JournalConversationEntry[]) {
  const systemPromptChunks = [
    "You are going to receive a journalling entry transcript between a user and an assistant.",
    "Analyze the transcript and give me a rich but concise one sentence summary of the conversation.",
    "This summary will be fed back to you later to give you context about a past session.",
    "Focus on what the user said, not what the assistant said, unless directly relevant to the user's statement.",
    `If nothing substantive was said by the user, output '${SUMMARY_NONE}'`
  ];
  const systemPrompt = systemPromptChunks.join(' ');

  const transcript = conversation.map(entry => `${entry.from}: ${entry.text}.`).join(' ');

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: systemPrompt
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: transcript
          }
        ],
      },
    ],
  });

  const summary = response.choices[0].message.content;
  if (summary && summary.indexOf(SUMMARY_NONE) !== -1 && summary.length < 6) return SUMMARY_NONE;
  return summary;
}