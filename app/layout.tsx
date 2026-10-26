import type { Metadata, Viewport } from "next";
import "./globals.css";
import PhoneFrame from "@/components/PhoneFrame";
import GuardianStateProvider from "@/components/GuardianStateProvider";

export const metadata: Metadata = {
  title: "OCBC Financial Guardian",
  description:
    "OCBC Financial Guardian — your proactive AI-powered Personal CFO. A hackathon prototype.",
};

export const viewport: Viewport = {
  themeColor: "#EC0000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GuardianStateProvider>
          <PhoneFrame>{children}</PhoneFrame>
        </GuardianStateProvider>
      </body>
    </html>
  );
}
