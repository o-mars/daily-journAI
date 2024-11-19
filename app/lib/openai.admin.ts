import { JournalConversationEntry } from "@/src/models/journal.entry";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateSummary(conversation: JournalConversationEntry[]) {
  const systemPromptChunks = [
    "You are going to receive a journalling entry transcript between a user and an assistant.",
    "Analyze the transcript and give me a rich but concise one sentence summary of the conversation.",
    "This summary will be fed back to you later to give you context about a past session.",
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
  return summary;
}