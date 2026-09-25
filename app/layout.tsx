import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "playwright_sample",
  description: "Playwrightを理解するためのsample application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
