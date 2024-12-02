"use client";

import "./globals.css";
import { UserProvider } from "@/src/contexts/UserContext";
import { VoiceClientProvider } from "@/src/contexts/VoiceClientContext";
import { HeaderProvider } from "@/src/contexts/HeaderContext";
import { APP_TITLE } from "@/src/models/constants";
import { JournalEntryProvider } from "@/src/contexts/JournalEntryContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{APP_TITLE}</title>
      </head>
      <body>
        <UserProvider>
          <VoiceClientProvider>
            <JournalEntryProvider>
              <HeaderProvider>
                {children}
              </HeaderProvider>
            </JournalEntryProvider>
          </VoiceClientProvider>
        </UserProvider>
      </body>
    </html>
  );
}
