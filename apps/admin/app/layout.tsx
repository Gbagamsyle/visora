import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Visora Admin",
  description: "Visora academic content administration",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
