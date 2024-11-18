import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Authentication check (implement your own auth logic)
    const isAuthenticated = await checkAuthentication(request);
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { services, config } = await request.json();

    if (!services || !config || !process.env.DAILY_BOTS_API_KEY) {
      return NextResponse.json({ error: "Services or config not found on request body" }, { status: 400 });
    }

    const payload = {
      bot_profile: "voice_2024_10",
      max_duration: 600,
      services,
      config,
      api_keys: {
        openai: process.env.OPENAI_API_KEY
      }
    };

    const response = await fetch("https://api.daily.co/v1/bots/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_BOTS_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const botData = await response.json();
    return NextResponse.json(botData);
  } catch (error) {
    console.error("Error starting bot:", error);
    return NextResponse.json(
      { error: "Failed to start bot" },
      { status: 500 }
    );
  }
}

async function checkAuthentication(request: NextRequest): Promise<boolean> {
  return true;
}