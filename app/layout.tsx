"use client";

import { MessageProvider } from "@/src/contexts/MessageContext";
import "./globals.css";
import { UserProvider } from "@/src/contexts/UserContext";
import { VoiceClientProvider } from "@/src/contexts/VoiceClientContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <VoiceClientProvider>
            <MessageProvider>
              {children}
            </MessageProvider>
          </VoiceClientProvider>
        </UserProvider>
      </body>
    </html>
  );
}
