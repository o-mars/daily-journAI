import "./globals.css";
import { UserProvider } from "@/src/contexts/UserContext";
import { VoiceClientProvider } from "@/src/contexts/VoiceClientContext";
import { HeaderProvider } from "@/src/contexts/HeaderContext";
import { JournalEntryProvider } from "@/src/contexts/JournalEntryContext";
import { Metadata } from 'next';
import { headers } from "next/headers";
import { brands } from "@/src/models/brand";
import { defaultBranding } from "@/src/models/brand";
import { AmplitudeInitializer } from '@/src/components/AmplitudeInitializer';

export async function generateMetadata(): Promise<Metadata> {
  const hostname = (await headers()).get('host');
  const portlessHostname = hostname?.split(':')[0];
  const branding = portlessHostname ? brands[portlessHostname] || defaultBranding : defaultBranding;

  return {
    title: branding.appName,
    icons: {
      icon: branding.appIcon,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AmplitudeInitializer />
      <UserProvider>
        <HeaderProvider>
          <VoiceClientProvider>
            <JournalEntryProvider>
              <body>
                {children}
              </body>
            </JournalEntryProvider>
          </VoiceClientProvider>
        </HeaderProvider>
      </UserProvider>
    </html>
  );
}
