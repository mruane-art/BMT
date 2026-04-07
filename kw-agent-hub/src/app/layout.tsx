import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KW Agent Hub | Keller Williams Realty Group #275",
  description: "Agent resource portal for Keller Williams Realty Group #275, Collegeville, PA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
