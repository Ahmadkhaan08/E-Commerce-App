import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/Header";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Babyshop | Online shopping places",
  description: "Babyshop for onlne shopping",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {/* Header */}
        <Header/>
        {children}
        {/* Footer */}
        <Toaster position="top-center" toastOptions={{
          className:"rounded-lg shadow-lg border",
          duration:4000
        }}/>
        </body>
    </html>
  );
}
