import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Spline_Sans } from "next/font/google";
import { shadcn } from "@clerk/ui/themes";

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Void Whisper - AI System Architect",
  description: "Void Whisper is an AI system architect that can help you design and build your system architecture for your application with ease.",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        }
      }}
    >
      <html
        lang="en"
        className={`${splineSans.className} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}