"use client";

import { useEffect, useState } from "react";
import { RTVIClient, LLMHelper, FunctionCallParams } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { RTVIClientAudio, RTVIClientProvider } from "realtime-ai-react";

import VoiceControls from "../../src/components/VoiceControls";

import Conversation from "@/src/components/Conversation";
import { getServices } from "@/src/models/user.preferences";
import { defaultUser, generateConfig } from "@/src/models/user";
import { useUser } from "@/src/contexts/UserContext";
import { MessageProvider } from "@/src/contexts/MessageContext";
import Header from "@/src/components/Header";

export default function Dashboard() {
  const { user } = useUser();

  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);

  const [lastJournalEntryId, setLastJournalEntryId] = useState<string>('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.journalEntries.length === 0) return;
    const latestEntry = user.journalEntries[0];
    if (latestEntry.id === lastJournalEntryId || !latestEntry.endTime) return;
    const entryAge = new Date().getTime() - new Date(latestEntry.endTime).getTime();
    if (entryAge > 1000 * 60 * 60) return; // Older than 1 hour
    setLastJournalEntryId(latestEntry.id);
    if (entryAge < 1000 * 60 * 2) setIsFeedbackOpen(true); // Less than 2 minutes old
  }, [user, lastJournalEntryId]);

  useEffect(() => {
    if (!user) return;

    const services = getServices(user.preferences) ?? getServices(defaultUser.preferences);
    const config = generateConfig(user) ?? generateConfig(defaultUser);

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
          onLLMFunctionCall(func) {
            if (func.function_name === "disconnect_voice_client") {
              return { success: true, message: "Voice client should disconnect soon." };
            }
          },
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
      else {
        return { error: `unknown function call: ${fn.functionName}` };
      }
    });  

    setVoiceClient(newVoiceClient);

    return () => {
      if (newVoiceClient && newVoiceClient.connected) {
        newVoiceClient.disconnect();
      }
    };
  }, [user]);

  const handleFeedback = () => {
    setIsFeedbackOpen(prev => !prev);
  };

  return (
    <RTVIClientProvider client={voiceClient!}>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header
          onMenuClick={() => console.log('profile')}
          onFeedbackClick={handleFeedback}
          isFeedbackOpen={isFeedbackOpen}
          onCloseFeedback={() => setIsFeedbackOpen(false)}
          lastJournalEntryId={lastJournalEntryId}
        />

        <MessageProvider>
          <main className="flex-grow overflow-auto p-2">
            {!isFeedbackOpen && <Conversation />}
          </main>

          <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
            <VoiceControls />
          </footer>
        </MessageProvider>

        <RTVIClientAudio />
      </div>
    </RTVIClientProvider>
  );
}
