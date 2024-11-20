"use client";

import { useEffect, useState } from "react";
import { RTVIClient, LLMHelper, FunctionCallParams } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { RTVIClientAudio, RTVIClientProvider } from "realtime-ai-react";
import Image from "next/image";

import VoiceControls from "../../src/components/VoiceControls";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { useRouter } from "next/navigation";
import Conversation from "@/src/components/Conversation";
import { getServices } from "@/src/models/user.preferences";
import { defaultUser, generateConfig } from "@/src/models/user";
import { useUser } from "@/src/contexts/UserContext";
import FeedbackModal from "@/src/components/FeedbackModal";
import { submitFeedback } from "@/src/client/firebase.service.client";
import { MessageProvider } from "@/src/contexts/MessageContext";

export default function Dashboard() {
  const router = useRouter();
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
      if (newVoiceClient && newVoiceClient.connected) {
        newVoiceClient.disconnect();
      }
    };
  }, [user]);

  async function handleLogout() {
    await signOut(auth);
    router.push('/login');
  }

  async function handleFeedback() {
    setIsFeedbackOpen(prev => !prev);
  }

  async function handleProfile() {
    console.log('profile');
  }

  const handleSubmitFeedback = async (rating: number, comment: string) => {
    try {
      const response = await submitFeedback(lastJournalEntryId, rating, comment);
      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFeedbackOpen(false);
    }
  };

  return (
    <RTVIClientProvider client={voiceClient!}>
      <>
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900">
          <h1 className="text-4xl font-bold">JournAI</h1>
          <button style={{ position: 'absolute', left: '8px', top: '8px', width: '32px' }} onClick={() => handleProfile()}><Image width={32} height={32} src="/icons/menu.svg" alt="Profile"/></button>
          <button style={{ position: 'absolute', right: '48px', top: '8px', width: '28px' }} onClick={() => handleFeedback()}><Image width={28} height={28} src="/icons/feather-mail.svg" alt="Feedback"/></button>
          <button style={{ position: 'absolute', right: '8px', top: '8px', width: '28px' }} onClick={() => handleLogout()}><Image width={28} height={28} src="/icons/feather-log-out.svg" alt="Logout"/></button>
          <MessageProvider>
            {isFeedbackOpen && <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} onSubmit={handleSubmitFeedback} />}
            {!isFeedbackOpen && <Conversation />}
          </MessageProvider>
          <VoiceControls />
        </main>
        <RTVIClientAudio />
      </>
    </RTVIClientProvider>
  );
}
