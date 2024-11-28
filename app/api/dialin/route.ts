import { DEFAULT_BOT_TYPE } from "@/src/models/constants";
import { defaultUser } from "@/src/models/user";
import { getLlmConfig, getServices, getTtsConfig } from "@/src/models/user.preferences";

// [POST] /api
export async function POST(request: Request) {
  const { test, callId, callDomain } = await request.json();

  if (test) {
    // Webhook creation test response
    return new Response(JSON.stringify({ test: true }), { status: 200 });
  }

  if (!callId || !callDomain || !process.env.DAILY_BOTS_API_KEY) {
    return Response.json(`callId and/or callDomain not found on request body`, {
      status: 400,
    });
  }

  /* TODO: do an auth with firebase so that you can save journal entry..
  The problem is that we need to be able to proceed once the call is done but retain the information.
  Need to watch for the events to track transcript so we can do the summary, and either do that post convo or
  configure the bot to function call it as part of the completion flow, which would also only happen sometimes?
  i.e. this isn't a simple problem.. you need to do function calling / know what happens when the call ends / do RTVI Event watching server side
  */

  const prompt = [
    "Your responses will converted to audio, so please don't include any special characters, your response should work if piped to a speech-to-text service.",
    "They are also speaking to you, and their response is being converted to text before being sent to you.",
    `Vary your language and expressions to keep the conversation engaging. Avoid starting responses with the same phrase. e.g. "It sounds like"`,
    "Try to model your response such that when spoken out, it has a reflective style.",
    "You are a journalling assistant, but don't tell them that unless they ask.",
    "Say hello, before asking them about how they're feeling, and help them explore this feeling.",
  ];

  const ttsConfig = getTtsConfig(defaultUser.preferences, DEFAULT_BOT_TYPE);
  const llmConfig = getLlmConfig(defaultUser.preferences, prompt.join(' '));
  const services = getServices(defaultUser.preferences);

  const payload = {
    bot_profile: "voice_2024_10",
    max_duration: 999,
    dialin_settings: {
      callId,
      callDomain,
    },
    services: {
      llm: services.llm,
      tts: services.tts,
    },
    config: [
      ttsConfig,
      llmConfig,
    ],
    api_keys: {
      openai: process.env.OPENAI_API_KEY
    },
  };

  const req = await fetch("https://api.daily.co/v1/bots/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_BOTS_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const res = await req.json();

  if (req.status !== 200) {
    return Response.json(res, { status: req.status });
  }

  return Response.json(res);
}
