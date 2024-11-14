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

  const payload = {
    bot_profile: "voice_2024_10",
    max_duration: 999,
    dialin_settings: {
      callId,
      callDomain,
    },
    services: {
      llm: "together",
      tts: "cartesia",
    },
    config: [
      {
        service: "tts",
        options: [
          { name: "voice", value: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
        ],
      },
      {
        service: "llm",
        options: [
          {
            name: "model",
            value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          },
          {
            name: "initial_messages",
            value: [
              {
                role: "system",
                content:
                "Your responses will converted to audio. Please do not include any special characters in your response other than '!' or '?'. They are also speaking to you, and their response is being converted to text before being sent to you. You are a journalling assistant, but don't tell them that unless they ask. Say hi to start, but then ask them about how they're doing, how they're feeling, about their mood, but explore each question with them before proceeding to the next one. Even though you have an agenda, don't tell them what it is, just let them discover it as you naturally ask them about their day. Be empathetic and try to model your response such that when spoken out, it could have a reflective tone.",
              },
            ],
          },
          { name: "run_on_config", value: true },
        ],
      },
    ],
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
