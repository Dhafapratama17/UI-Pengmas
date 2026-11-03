import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/ui/toast";
import {
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ReteMali — Taman Baca ReteMali",
    template: "%s — ReteMali",
  },
  description:
    "Temukan buku, ikuti kegiatan komunitas, dan tumbuh bersama Taman Baca ReteMali.",
  icons: {
    icon: "/images/retemali-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialSession = await decodeSessionCookie(
    cookieStore.get(SESSION_COOKIE)?.value,
  );

  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body>
        <SessionProvider initialSession={initialSession}>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
