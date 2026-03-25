import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TurnStay Sales HQ",
  description: "Where deals get done.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
