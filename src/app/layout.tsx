import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Inbox — Jamie & Torti",
  description: "A central control panel for Jamie and Torti to collaborate",
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
