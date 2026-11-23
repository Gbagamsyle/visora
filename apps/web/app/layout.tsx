import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "Visora — Learn, prepare, and grow",
  description: "An academic learning and student community platform for Optometry students.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={manrope.variable}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
