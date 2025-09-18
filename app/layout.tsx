import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "HardWareHouse - API",
  description: "API to manage products and categories for a hardware store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
