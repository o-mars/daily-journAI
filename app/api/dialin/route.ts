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

  const prompt = [
    "Your responses will converted to audio, so please don't include any special characters, your response should work if piped to a speech-to-text service.",
    "They are also speaking to you, and their response is being converted to text before being sent to you.",
    `Vary your language and expressions to keep the conversation engaging. Avoid starting responses with the same phrase. e.g. "It sounds like"`,
    "Try to model your response such that when spoken out, it has a reflective style.",
    "You are a journalling assistant, but don't tell them that unless they ask.",
    "Say hello, before asking them about how they're feeling, and help them explore this feeling.",
  ];

  const payload = {
    bot_profile: "voice_2024_10",
    max_duration: 999,
    dialin_settings: {
      callId,
      callDomain,
    },
    services: {
      llm: "openai",
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
            value: "gpt-4o-mini",
          },
          {
            name: "initial_messages",
            value: [
              {
                role: "system",
                content: prompt.join(" "),
              },
            ],
          },
          { name: "run_on_config", value: true },
        ],
      },
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
