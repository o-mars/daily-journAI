"use client";

import { MessageProvider } from "@/src/contexts/MessageContext";
import "./globals.css";
import { UserProvider } from "@/src/contexts/UserContext";
import { VoiceClientProvider } from "@/src/contexts/VoiceClientContext";
import { HeaderProvider } from "@/src/contexts/HeaderContext";
import { APP_TITLE } from "@/src/models/constants";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <head>
          <title>{APP_TITLE}</title>
        </head>
        <UserProvider>
          <VoiceClientProvider>
            <MessageProvider>
              <HeaderProvider>
                {children}
              </HeaderProvider>
            </MessageProvider>
          </VoiceClientProvider>
        </UserProvider>
      </body>
    </html>
  );
}
