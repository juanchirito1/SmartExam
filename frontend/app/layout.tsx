import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SmartExam",
  description: "Sistema de gestión de evaluaciones académicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
