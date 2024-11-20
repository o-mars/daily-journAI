"use client";

import { useEffect, useState } from "react";
import { RTVIClient, LLMHelper, FunctionCallParams } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { RTVIClientAudio, RTVIClientProvider } from "realtime-ai-react";

import VoiceControls from "../../src/components/VoiceControls";

import { defaultConfig, defaultServices } from "../../rtvi.config";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { useRouter } from "next/navigation";
import Conversation from "@/src/components/Conversation";
import { generateConfig, getServices } from "@/src/models/user.preferences";
import { useUser } from "@/src/contexts/UserContext";

export default function Dashboard() {
  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('updated voice or user', user, voiceClient);
    if (!user || voiceClient) {
      return;
    }

    const services = getServices(user.preferences) ?? defaultServices;
    const config = generateConfig(user.preferences) ?? defaultConfig;
    
    const newVoiceClient = new RTVIClient({
      transport: new DailyTransport(),
      params: {
        baseUrl: `/api`,
        requestData: {
          services,
        },
        endpoints: {
          connect: "/connect",
          action: "/actions",
        },
        config,
      },
      callbacks: {
        onGenericMessage: (data) => console.log('generic rtvi: ', data),
        onConfig: (config) => console.log('config: ', config),
      }
    });

    const llmHelper = newVoiceClient.registerHelper(
      "llm",
      new LLMHelper({
        callbacks: {
          // Put function calls with no/static params, dynamic params go in handleFunctionCall
        },
      })
    ) as LLMHelper;
  
    llmHelper.handleFunctionCall(async (fn: FunctionCallParams) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const args = fn.arguments as any;
      if (fn.functionName === "get_weather" && args.location) {
        
        // newVoiceClient.updateConfig() // todo: try this, for experimental features
      
        const response = await fetch(
          `/api/weather?location=${encodeURIComponent(args.location)}`
        );
        const json = await response.json();
        return json;
      }
      // This seems potentially strange: a) compute and pass partial mood in payload? b) why not at end
      if (fn.functionName === "save_mood" && args.label) {
        // const moodPartial: Partial<Mood> = { label: encodeURIComponent(args.label) };
        // const response = await saveMoodEntries(moodPartial);
        // const json = await response.json();
        // return json;
      }
      else {
        return { error: "couldn't fetch weather" };
      }
    });  

    setVoiceClient(newVoiceClient);

    return () => {
      // if (newVoiceClient) {
      //   newVoiceClient.disconnect();
      // }
    };
  }, [user, voiceClient]);

  async function handleLogout() {
    await signOut(auth);
    router.push('/login');
  }

  return (
    <RTVIClientProvider client={voiceClient!}>
      <>
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900">
          <h1 className="text-4xl font-bold">JournAI</h1>
          <button style={{ position: 'absolute', right: '8px', top: '8px', width: '28px' }} onClick={() => handleLogout()}><img src="/icons/feather-log-out.svg" alt="Logout"/></button>
          <Conversation />
          <VoiceControls />
        </main>
        <RTVIClientAudio />
      </>
    </RTVIClientProvider>
  );
}
