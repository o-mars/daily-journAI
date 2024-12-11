import { defaultUser } from "@/src/models/user";
import { generateSystemMessageForBotType, LLM_SYSTEM_PROMPT_DISCONNECT_DIALIN_INSTRUCTIONS, LLM_SYSTEM_PROMPT_DISCONNECT_WITH_FUNCTION_INSTRUCTIONS } from "@/src/models/prompts";
import { getLlmConfig, getServices, getTtsConfig } from "@/src/models/user.preferences";
import { defaultBranding } from "@/src/models/brand";
import { addTelephonyEvent } from "@/app/lib/firebase.admin.metrics";
import { TelephonyEvent } from "@/src/models/common";

// [POST] /api
export async function POST(request: Request) {
  const requestBody = await request.json();
  console.log('requestBody', requestBody);
  const { test, callId, callDomain } = requestBody;

  if (test) {
    // Webhook creation test response
    return new Response(JSON.stringify({ test: true }), { status: 200 });
  }

  if (!callId || !callDomain || !process.env.DAILY_BOTS_API_KEY) {
    return Response.json(`callId and/or callDomain not found on request body`, {
      status: 400,
    });
  }

  const telephonyEvent: TelephonyEvent = {
    phoneNumber: callId,
    eventType: 'call_initiated',
    data: {
      callId,
      callDomain,
    },
  };
  addTelephonyEvent(telephonyEvent);
  /* TODO: do an auth with firebase so that you can save journal entry..
  The problem is that we need to be able to proceed once the call is done but retain the information.
  Need to watch for the events to track transcript so we can do the summary, and either do that post convo or
  configure the bot to function call it as part of the completion flow, which would also only happen sometimes?
  i.e. this isn't a simple problem.. you need to do function calling / know what happens when the call ends / do RTVI Event watching server side
  */

  const prompt = generateSystemMessageForBotType(defaultUser, defaultBranding.botType);
  const finalPrompt = [...prompt, LLM_SYSTEM_PROMPT_DISCONNECT_DIALIN_INSTRUCTIONS]
    .filter(instruction => instruction !== LLM_SYSTEM_PROMPT_DISCONNECT_WITH_FUNCTION_INSTRUCTIONS)
    .join(' ');

  const ttsConfig = getTtsConfig(defaultUser.preferences, defaultBranding.botType);
  const llmConfig = getLlmConfig(defaultUser.preferences, finalPrompt);
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
    addTelephonyEvent({ ...telephonyEvent, eventType: 'call_start_failed', data: { error: JSON.stringify(res) } });
    return Response.json(res, { status: req.status });
  }
  addTelephonyEvent({ ...telephonyEvent, eventType: 'call_started' });
  return Response.json(res);
}
